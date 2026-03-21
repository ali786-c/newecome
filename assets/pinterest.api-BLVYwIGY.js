import{e as a,a4 as e}from"./index-Cer2554h.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const r=a("PanelsTopLeft",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M3 9h18",key:"1pudct"}],["path",{d:"M9 21V9",key:"1oto5p"}]]),i={async getConfig(){return(await e.get("/admin/pinterest/config")).data},async updateConfig(t){return(await e.put("/admin/pinterest/config",t)).data},async getAuthUrl(){return(await e.get("/admin/pinterest/auth-url")).data},async getBoards(){return(await e.get("/admin/pinterest/boards")).data},async testConnection(){return(await e.post("/admin/pinterest/test")).data}};export{r as P,i as p};
