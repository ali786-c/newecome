import{a5 as a,Q as e}from"./index-DGUvSun2.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=e("WifiOff",[["path",{d:"M12 20h.01",key:"zekei9"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0",key:"1bycff"}],["path",{d:"M5 12.859a10 10 0 0 1 5.17-2.69",key:"1dl1wf"}],["path",{d:"M19 12.859a10 10 0 0 0-2.007-1.523",key:"4k23kn"}],["path",{d:"M2 8.82a15 15 0 0 1 4.177-2.643",key:"1grhjp"}],["path",{d:"M22 8.82a15 15 0 0 0-11.288-3.764",key:"z3jwby"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const i=e("Wifi",[["path",{d:"M12 20h.01",key:"zekei9"}],["path",{d:"M2 8.82a15 15 0 0 1 20 0",key:"dnpr2z"}],["path",{d:"M5 12.859a10 10 0 0 1 14 0",key:"1x1e6c"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0",key:"1bycff"}]]);new Date(Date.now()-18e5).toISOString(),new Date().toISOString();new Date(Date.now()-72e5).toISOString(),new Date(Date.now()-71e5).toISOString(),new Date(Date.now()-72e5).toISOString(),new Date(Date.now()-864e5).toISOString(),new Date(Date.now()-864e5).toISOString(),new Date(Date.now()-1728e5).toISOString(),new Date(Date.now()-1728e5).toISOString();const o={async getSuppliers(){return(await a.get("/admin/suppliers")).data},async syncSupplier(t){return(await a.post(`/admin/suppliers/${t}/sync`)).data},async getSupplierProducts(t,n){return(await a.get(`/admin/suppliers/${t}/products`,{params:n})).data},async getDuplicates(t){return(await a.get(`/admin/suppliers/${t}/duplicates`)).data},async importProducts(t){return(await a.post("/admin/suppliers/import",t)).data},async getImportJobs(t){return(await a.get("/admin/suppliers/import-jobs",{params:t})).data},async retryJob(t){return(await a.post(`/admin/suppliers/import-jobs/${t}/retry`)).data}};export{i as d,p as i,o};
