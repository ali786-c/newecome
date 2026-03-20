import { client } from './client';
import type { PaginatedResponse } from '@/types';

export interface SupplierConnection {
    id: number;
    name: string;
    type: string;
    is_active: boolean;
    balance: number | string;
    created_at: string;
}

export interface SupplierProduct {
    id: number;
    connection_id: number;
    external_id: string;
    name: string;
    description: string | null;
    price: string | number;
    category: string | null;
    data: any;
    status: string;
    connection?: SupplierConnection;
}

export const supplierApi = {
    async listConnections() {
        const res = await client.get('/admin/supplier-connections');
        return res.data;
    },

    async listProducts(params?: any): Promise<PaginatedResponse<SupplierProduct>> {
        const res = await client.get('/admin/supplier-products', { params });
        return res.data;
    },

    async importProduct(data: { supplier_product_id: number; margin_percentage?: number; category_id?: number }) {
        const res = await client.post('/admin/supplier-import', data);
        return res.data;
    },

    async syncSupplier(id: number) {
        const res = await client.post(`/admin/supplier-connections/${id}/fetch`);
        return res.data;
    }
};
