/**
 * Supplier Price Synchronization API
 */
import { client } from './client';
import type {
    ApiResponse,
    PaginatedResponse,
    ListParams
} from '@/types';

export interface SupplierMapping {
    id: number;
    name: string;
    price: number;
    cost_price: number;
    margin_percentage: number;
    auto_apply: boolean;
    last_sync_at: string | null;
    supplier_id: number;
    supplier_product_id: string;
    category?: {
        id: number;
        name: string;
    };
    supplier?: {
        id: number;
        name: string;
        type: string;
    };
}

export interface SyncLog {
    id: number;
    supplier_id: number;
    status: 'success' | 'failed' | 'partial';
    items_synced: number;
    items_failed: number;
    details: any;
    created_at: string;
    supplier?: {
        name: string;
    };
}

export const supplierSyncApi = {
    /**
     * Get paginated product mappings
     */
    async getMappings(params?: ListParams): Promise<PaginatedResponse<SupplierMapping>> {
        const res = await client.get('/admin/supplier-sync/mappings', { params });
        return res.data;
    },

    /**
     * Update sync settings for a product
     */
    async updateMapping(id: number, data: { margin_percentage?: number; auto_apply?: boolean }): Promise<ApiResponse<SupplierMapping>> {
        const res = await client.patch(`/admin/supplier-sync/mappings/${id}`, data);
        return res.data;
    },

    /**
     * Trigger sync for a specific product
     */
    async syncProduct(id: number): Promise<ApiResponse<{ old_price: number; new_price: number; cost: number }>> {
        const res = await client.post(`/admin/supplier-sync/mappings/${id}/sync`);
        return res.data;
    },

    /**
     * Trigger bulk sync for a supplier
     */
    async syncAll(supplierId: number): Promise<ApiResponse<{ message: string }>> {
        const res = await client.post('/admin/supplier-sync/sync-all', { supplier_id: supplierId });
        return res.data;
    },

    /**
     * Get recent sync logs
     */
    async getLogs(): Promise<ApiResponse<SyncLog[]>> {
        const res = await client.get('/admin/supplier-sync/logs');
        return res.data;
    },
};
