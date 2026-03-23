<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Ticket;
use App\Models\SupplierSyncLog;
use App\Models\SupplierConnection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        // 1. KPI Stats
        $stats = [
            'totalProducts'    => Product::count(),
            'activeProducts'   => Product::where('status', 'active')->count(),
            'inactiveProducts' => Product::where('status', '!=', 'active')->count(),
            'totalOrders'      => Order::count(),
            'ordersToday'      => Order::whereDate('created_at', Carbon::today())->count(),
            'revenue'          => '$' . number_format(Order::where('status', 'completed')
                                    ->where('created_at', '>=', Carbon::now()->subDays(30))
                                    ->sum('total'), 2),
            'totalCustomers'   => User::where('role', 'customer')->count(),
            'newCustomersWeek' => User::where('role', 'customer')
                                    ->where('created_at', '>=', Carbon::now()->subWeeks(1))
                                    ->count(),
            'openTickets'      => Ticket::where('status', '!=', 'closed')->count(),
            'pendingImports'   => 0, // Placeholder if no bridge table exists yet
            'syncSuccessRate'  => $this->getSyncSuccessRate(),
            'failedJobs24h'    => SupplierSyncLog::where('status', 'failed')
                                    ->where('created_at', '>=', Carbon::now()->subDay())
                                    ->count(),
        ];

        // 2. Recent Data for Tables/Lists
        $recentOrders = Order::with('user')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function($o) {
                return [
                    'id'       => $o->order_number,
                    'customer' => $o->user->name ?? 'Guest',
                    'product'  => $o->items->first()->product->name ?? 'Unknown',
                    'status'   => $o->status,
                    'total'    => '$' . number_format($o->total, 2),
                    'date'     => $o->created_at->diffForHumans(),
                ];
            });

        $openTickets = Ticket::with('user')
            ->where('status', '!=', 'closed')
            ->latest()
            ->limit(3)
            ->get()
            ->map(function($t) {
                return [
                    'id'       => 'TKT-' . str_pad($t->id, 4, '0', STR_PAD_LEFT),
                    'subject'  => $t->subject,
                    'customer' => $t->user->name ?? 'Guest',
                    'priority' => $t->priority ?? 'medium',
                    'created'  => $t->created_at->diffForHumans(),
                    'notified' => ['discord'], // Placeholder
                ];
            });

        // 3. Alerts (Dynamic)
        $alerts = $this->getAlerts();

        return response()->json([
            'data' => [
                'stats'        => $stats,
                'recentOrders' => $recentOrders,
                'openTickets'  => $openTickets,
                'alerts'       => $alerts,
                'channelHealth' => [], // To be implemented with Integration/Sync Health services
                'recentPriceChanges' => [],
                'automationModules' => [],
            ]
        ]);
    }

    private function getSyncSuccessRate(): int
    {
        $last24h = SupplierSyncLog::where('created_at', '>=', Carbon::now()->subDay())->get();
        if ($last24h->isEmpty()) return 100;

        $total = $last24h->count();
        $success = $last24h->where('status', 'success')->count();

        return (int) (($success / $total) * 100);
    }

    private function getAlerts(): array
    {
        $alerts = [];
        
        // Low Balance Alerts
        $suppliers = SupplierConnection::where('is_active', true)->get();
        // Since we don't have a balance history yet, we'd normally check current balance here
        // but for now we look at logs or current state if possible.
        
        // Sync Failures
        $failedSyncs = SupplierSyncLog::where('status', 'failed')
            ->latest()
            ->limit(2)
            ->get();
            
        foreach ($failedSyncs as $log) {
            $alerts[] = [
                'title'       => 'Sync failed: ' . ($log->supplier->name ?? 'Unknown'),
                'description' => 'Check supplier logs for details.',
                'severity'    => 'critical',
                'timestamp'   => $log->created_at->diffForHumans(),
            ];
        }

        // Open Ticket Alert
        $highPriority = Ticket::where('priority', 'high')->where('status', '!=', 'closed')->count();
        if ($highPriority > 0) {
            $alerts[] = [
                'title'       => "$highPriority high-priority tickets",
                'description' => 'Awaiting urgent admin response.',
                'severity'    => 'warning',
                'timestamp'   => 'Just now',
            ];
        }

        if (empty($alerts)) {
            $alerts[] = [
                'title'       => 'All systems healthy',
                'description' => 'No critical issues detected in the last 24h.',
                'severity'    => 'success',
                'timestamp'   => 'Now',
            ];
        }

        return $alerts;
    }
}
