import{e as r,a4 as t}from"./index-B3f_e-QL.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=r("WifiOff",[["path",{d:"M12 20h.01",key:"zekei9"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0",key:"1bycff"}],["path",{d:"M5 12.859a10 10 0 0 1 5.17-2.69",key:"1dl1wf"}],["path",{d:"M19 12.859a10 10 0 0 0-2.007-1.523",key:"4k23kn"}],["path",{d:"M2 8.82a15 15 0 0 1 4.177-2.643",key:"1grhjp"}],["path",{d:"M22 8.82a15 15 0 0 0-11.288-3.764",key:"z3jwby"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=r("Wifi",[["path",{d:"M12 20h.01",key:"zekei9"}],["path",{d:"M2 8.82a15 15 0 0 1 20 0",key:"dnpr2z"}],["path",{d:"M5 12.859a10 10 0 0 1 14 0",key:"1x1e6c"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0",key:"1bycff"}]]);new Date(Date.now()-18e5).toISOString(),new Date().toISOString();new Date(Date.now()-72e5).toISOString(),new Date(Date.now()-71e5).toISOString(),new Date(Date.now()-72e5).toISOString(),new Date(Date.now()-864e5).toISOString(),new Date(Date.now()-864e5).toISOString(),new Date(Date.now()-1728e5).toISOString(),new Date(Date.now()-1728e5).toISOString();const o={async getSuppliers(){return(await t.get("/admin/suppliers")).data},async syncSupplier(e){return(await t.post(`/admin/suppliers/${e}/sync`)).data},async getSupplierProducts(e,a){return(await t.get(`/admin/suppliers/${e}/products`,{params:a})).data},async getDuplicates(e){return(await t.get(`/admin/suppliers/${e}/duplicates`)).data},async importProducts(e){return(await t.post("/admin/suppliers/import",e)).data},async getImportJobs(e){return(await t.get("/admin/suppliers/import-jobs",{params:e})).data},async retryJob(e){return(await t.post(`/admin/suppliers/import-jobs/${e}/retry`)).data}};export{i as W,d as a,o as s};
