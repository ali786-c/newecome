import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  LifeBuoy,
  Users,
  Bell,
  Settings,
  Package,
  Tags,
  DollarSign,
  FileText,
  Bot,
  Plug,
  RefreshCw,
  Shield,
  ClipboardList,
  Download,
  CreditCard,
  BarChart2,
  Share2,
  Search,
  ArrowUpDown,
  Key,
  Tag,
  Heart,
  Star,
  Gift,
} from 'lucide-react';
import type { NavItem } from '@/types';

/* ── Public storefront navigation ── */
export const publicNav = [
  { title: 'Products', href: '/products' },
  { title: 'Contact', href: '/contact' },
  { title: 'F.A.Q', href: '/faq' },
  { title: 'Feedback', href: '/feedback' },
  { title: 'Terms', href: '/terms' },
  { title: 'Trusted Advisor', href: '/trust' },
];

/* ── Customer dashboard navigation ── */
export const customerNav: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Orders', href: '/orders', icon: ShoppingCart },
  { title: 'Wallet', href: '/wallet', icon: Wallet },
  { title: 'Wishlist', href: '/wishlist', icon: Heart },
  { title: 'Rewards', href: '/rewards', icon: Gift },
  { title: 'Support', href: '/tickets', icon: LifeBuoy },
  { title: 'Referrals', href: '/referrals', icon: Users },
  { title: 'Notifications', href: '/notifications', icon: Bell },
  { title: 'Settings', href: '/settings', icon: Settings },
];

/* ── Admin navigation — grouped sections ── */
export const adminNav: NavItem[] = [
  { title: 'Overview', href: '/admin', icon: LayoutDashboard },

  // Catalog & Sales
  { title: 'Products', href: '/admin/products', icon: Package },
  { title: 'Product Vault', href: '/admin/product-vault', icon: Key },
  { title: 'Categories', href: '/admin/categories', icon: Tags },
  { title: 'Pricing', href: '/admin/pricing', icon: DollarSign },
  { title: 'Coupons', href: '/admin/coupons', icon: Tag },
  { title: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { title: 'Customers', href: '/admin/customers', icon: Users },
  { title: 'Tickets', href: '/admin/tickets', icon: LifeBuoy },

  // Payments & Providers
  { title: 'Payments', href: '/admin/payments', icon: CreditCard },
  { title: 'Supplier Import', href: '/admin/supplier-import', icon: Download },
  { title: 'Supplier Price Sync', href: '/admin/supplier-sync', icon: ArrowUpDown },

  // Growth & Marketing
  { title: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  { title: 'Social Media', href: '/admin/social-media', icon: Share2 },
  { title: 'SEO & Backlinks', href: '/admin/seo', icon: Search },
  { title: 'Blog', href: '/admin/blog', icon: FileText },

  // Automation & Integrations
  { title: 'Automation', href: '/admin/automation', icon: Bot },
  { title: 'Integrations', href: '/admin/integrations', icon: Plug },
  { title: 'Sync Logs', href: '/admin/sync-logs', icon: RefreshCw },

  // System
  { title: 'Audit Logs', href: '/admin/audit-logs', icon: ClipboardList },
  { title: 'Compliance', href: '/admin/compliance', icon: Shield },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
];

/* ── Footer navigation ── */
export const footerNav = {
  product: [
    { title: 'Products', href: '/products' },
    { title: 'Pricing', href: '/pricing' },
    { title: 'Feedback', href: '/feedback' },
    { title: 'Status', href: '/status' },
    { title: 'Affiliates', href: '/affiliates' },
  ],
  company: [
    { title: 'About', href: '/about' },
    { title: 'Blog', href: '/blog' },
    { title: 'Contact', href: '/contact' },
    { title: 'FAQ', href: '/faq' },
    { title: 'Trusted Advisor', href: '/trust' },
  ],
  legal: [
    { title: 'Privacy Policy', href: '/privacy' },
    { title: 'Terms of Service', href: '/terms' },
    { title: 'Refund Policy', href: '/refund-policy' },
    { title: 'Acceptable Use', href: '/acceptable-use' },
    { title: 'Is This Legal?', href: '/legal-info' },
  ],
};
