import{e as s,a5 as e}from"./index-DWenj8xX.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n=s("Pencil",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]]),i={async list(a){return(await e.get("/admin/categories",{params:a})).data},async get(a){return(await e.get(`/admin/categories/${a}`)).data},async getBySlug(a){return(await e.get(`/admin/categories/slug/${a}`)).data},async create(a){return(await e.post("/admin/categories",a)).data},async update(a,t){return(await e.put(`/admin/categories/${a}`,t)).data},async delete(a){await e.delete(`/admin/categories/${a}`)}};export{n as P,i as c};
