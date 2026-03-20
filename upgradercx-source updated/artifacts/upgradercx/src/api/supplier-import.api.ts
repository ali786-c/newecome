/**
 * Supplier Import API — wholesale external product ingestion
 *
 * Laravel routes (suggested):
 *   GET      /api/suppliers                           → list supplier connections
 *   POST     /api/suppliers/{id}/sync                 → trigger fetch from supplier
 *   GET      /api/suppliers/{id}/products              → fetched products preview
 *   GET      /api/suppliers/{id}/duplicates            → duplicate detection
 *   POST     /api/suppliers/import                    → import selected products
 *   GET      /api/suppliers/import-jobs                → import job history
 *   POST     /api/suppliers/import-jobs/{id}/retry     → retry failed import
 */
import { client, USE_MOCK, mockDelay, mockPaginated } from './client';
import type {
  SupplierConnection, SupplierProduct, ImportAdjustment, SupplierImportJob, DuplicateMatch,
  ApiResponse, PaginatedResponse, ListParams,
} from '@/types';

const MOCK_SUPPLIERS: SupplierConnection[] = [
  { id: 1, name: 'Wholesale Supplier', provider: 'wholesale', status: 'connected', last_synced_at: new Date(Date.now() - 1800000).toISOString(), products_available: 142, api_url: 'https://supplier-api.internal/v2', created_at: '2025-01-01T00:00:00Z', updated_at: new Date().toISOString() },
  { id: 2, name: 'KeysForge', provider: 'keysforge', status: 'disconnected', products_available: 0, created_at: '2025-01-15T00:00:00Z', updated_at: '2025-01-15T00:00:00Z' },
  { id: 3, name: 'LicenseVault API', provider: 'licensevault', status: 'error', products_available: 0, error_message: 'API key expired — last valid 2025-03-01', created_at: '2025-02-01T00:00:00Z', updated_at: '2025-03-01T00:00:00Z' },
];

const MOCK_PRODUCTS: SupplierProduct[] = [
  { id: 'sp-1', supplier_id: 1, external_id: 'EXT-88201', name: 'Windows 11 Pro OEM Key', description: 'Genuine Windows 11 Professional OEM license key. Lifetime activation.', supplier_price: 8.50, supplier_currency: 'USD', category_name: 'Software Licenses', subcategory_name: 'Operating Systems', image_url: 'https://placehold.co/120x120/1a1a2e/e0e0ff?text=W11', stock_status: 'in_stock', attributes: { region: 'Global', delivery: 'Instant' } },
  { id: 'sp-2', supplier_id: 1, external_id: 'EXT-88305', name: 'Office 365 Business 1yr', description: 'Microsoft Office 365 Business subscription — 1 year.', supplier_price: 14.00, supplier_currency: 'USD', category_name: 'Software Licenses', subcategory_name: 'Productivity', stock_status: 'in_stock', attributes: { seats: '1', delivery: 'Email' }, duplicate_of: 1, duplicate_confidence: 92 },
  { id: 'sp-3', supplier_id: 1, external_id: 'EXT-91022', name: 'NordVPN 2yr Plan', description: 'NordVPN premium 2-year subscription.', supplier_price: 12.00, supplier_currency: 'USD', category_name: 'VPN & Security', stock_status: 'in_stock', attributes: { duration: '2 years' } },
  { id: 'sp-4', supplier_id: 1, external_id: 'EXT-91500', name: 'Adobe Creative Cloud 1yr', description: 'Full Adobe CC suite — all apps — 1 year subscription key.', supplier_price: 32.00, supplier_currency: 'USD', category_name: 'Software Licenses', subcategory_name: 'Creative', stock_status: 'limited', attributes: { apps: 'All', delivery: 'Account' }, duplicate_of: 2, duplicate_confidence: 85 },
  { id: 'sp-5', supplier_id: 1, external_id: 'EXT-92001', name: 'Spotify Premium 12mo', description: 'Spotify Premium individual plan — 12 months upgrade.', supplier_price: 6.50, supplier_currency: 'USD', category_name: 'Account Upgrades', stock_status: 'in_stock', attributes: { type: 'Upgrade', delivery: 'Credentials' } },
  { id: 'sp-6', supplier_id: 1, external_id: 'EXT-93010', name: 'ChatGPT Plus 1mo', description: 'OpenAI ChatGPT Plus subscription — 1 month access.', supplier_price: 18.00, supplier_currency: 'USD', category_name: 'Digital Tools', stock_status: 'in_stock', attributes: { delivery: 'Account' } },
  { id: 'sp-7', supplier_id: 1, external_id: 'EXT-93500', name: 'Canva Pro 1yr', description: 'Canva Pro annual subscription with all premium features.', supplier_price: 10.00, supplier_currency: 'USD', category_name: 'Digital Tools', subcategory_name: 'Design', stock_status: 'out_of_stock', attributes: { delivery: 'Invite' } },
];

const MOCK_DUPLICATES: DuplicateMatch[] = [
  { supplier_product: MOCK_PRODUCTS[1], existing_product_id: 1, existing_product_name: 'Office 365 Business', confidence: 92, match_type: 'similar_name' },
  { supplier_product: MOCK_PRODUCTS[3], existing_product_id: 2, existing_product_name: 'Adobe CC License', confidence: 85, match_type: 'similar_name' },
];

const MOCK_JOBS: SupplierImportJob[] = [
  { id: 1, supplier_id: 1, supplier_name: 'Wholesale Supplier', products_fetched: 142, products_imported: 12, products_skipped: 2, duplicates_found: 3, errors: 0, status: 'completed', started_at: new Date(Date.now() - 7200000).toISOString(), completed_at: new Date(Date.now() - 7100000).toISOString(), created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 2, supplier_id: 1, supplier_name: 'Wholesale Supplier', products_fetched: 0, products_imported: 0, products_skipped: 0, duplicates_found: 0, errors: 1, status: 'failed', error_details: ['Connection timeout after 30s'], started_at: new Date(Date.now() - 86400000).toISOString(), created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, supplier_id: 3, supplier_name: 'LicenseVault API', products_fetched: 0, products_imported: 0, products_skipped: 0, duplicates_found: 0, errors: 1, status: 'failed', error_details: ['401 Unauthorized — API key expired'], started_at: new Date(Date.now() - 172800000).toISOString(), created_at: new Date(Date.now() - 172800000).toISOString() },
];

export const supplierImportApi = {
  async getSuppliers(): Promise<ApiResponse<SupplierConnection[]>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_SUPPLIERS });
    const res = await client.get('/admin/suppliers');
    return res.data;
  },
  async syncSupplier(id: number): Promise<ApiResponse<{ products_fetched: number }>> {
    if (USE_MOCK) return mockDelay({ data: { products_fetched: MOCK_PRODUCTS.length } });
    const res = await client.post(`/admin/suppliers/${id}/sync`);
    return res.data;
  },
  async getSupplierProducts(id: number, params?: ListParams): Promise<PaginatedResponse<SupplierProduct>> {
    if (USE_MOCK) {
      let filtered = MOCK_PRODUCTS.filter((p) => p.supplier_id === id);
      if (params?.category) filtered = filtered.filter((p) => p.category_name === params.category);
      if (params?.search) {
        const q = (params.search as string).toLowerCase();
        filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
      }
      return mockDelay(mockPaginated(filtered, params));
    }
    const res = await client.get(`/admin/suppliers/${id}/products`, { params });
    return res.data;
  },
  async getDuplicates(id: number): Promise<ApiResponse<DuplicateMatch[]>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_DUPLICATES });
    const res = await client.get(`/admin/suppliers/${id}/duplicates`);
    return res.data;
  },
  async importProducts(adjustments: ImportAdjustment[]): Promise<ApiResponse<SupplierImportJob>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_JOBS[0], id: 99, products_imported: adjustments.length, status: 'queued' as const } });
    const res = await client.post('/admin/suppliers/import', { products: adjustments });
    return res.data;
  },
  async getImportJobs(params?: ListParams): Promise<PaginatedResponse<SupplierImportJob>> {
    if (USE_MOCK) return mockDelay(mockPaginated(MOCK_JOBS, params));
    const res = await client.get('/admin/suppliers/import-jobs', { params });
    return res.data;
  },
  async retryJob(id: number): Promise<ApiResponse<SupplierImportJob>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_JOBS[1], id, status: 'queued' as const } });
    const res = await client.post(`/admin/suppliers/import-jobs/${id}/retry`);
    return res.data;
  },
};
