import{e as s,a4 as a}from"./index-Wmozaj2o.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=s("WifiOff",[["path",{d:"M12 20h.01",key:"zekei9"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0",key:"1bycff"}],["path",{d:"M5 12.859a10 10 0 0 1 5.17-2.69",key:"1dl1wf"}],["path",{d:"M19 12.859a10 10 0 0 0-2.007-1.523",key:"4k23kn"}],["path",{d:"M2 8.82a15 15 0 0 1 4.177-2.643",key:"1grhjp"}],["path",{d:"M22 8.82a15 15 0 0 0-11.288-3.764",key:"z3jwby"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o=s("Wifi",[["path",{d:"M12 20h.01",key:"zekei9"}],["path",{d:"M2 8.82a15 15 0 0 1 20 0",key:"dnpr2z"}],["path",{d:"M5 12.859a10 10 0 0 1 14 0",key:"1x1e6c"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0",key:"1bycff"}]]);new Date(Date.now()-18e5).toISOString(),new Date().toISOString();new Date(Date.now()-72e5).toISOString(),new Date(Date.now()-71e5).toISOString(),new Date(Date.now()-72e5).toISOString(),new Date(Date.now()-864e5).toISOString(),new Date(Date.now()-864e5).toISOString(),new Date(Date.now()-1728e5).toISOString(),new Date(Date.now()-1728e5).toISOString();const n={async getSuppliers(){return(await a.get("/admin/suppliers")).data},async syncSupplier(e,t="incremental",r){return(await a.post(`/admin/suppliers/${e}/sync`,{mode:t,limit:r})).data},async getSupplierProducts(e,t){return(await a.get(`/admin/suppliers/${e}/products`,{params:t})).data},async getDuplicates(e){return(await a.get(`/admin/suppliers/${e}/duplicates`)).data},async importProducts(e){return(await a.post("/admin/suppliers/import",e)).data},async getImportJobs(e){return(await a.get("/admin/suppliers/import-jobs",{params:e})).data},async retryJob(e){return(await a.post(`/admin/suppliers/import-jobs/${e}/retry`)).data}};export{d as W,o as a,n as s};
