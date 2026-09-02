function v(r,c,a){const l=c.map(n=>n.header),i=a.map(n=>c.map(p=>{const s=p.accessor(n),e=s==null?"":String(s);return e.includes(",")||e.includes('"')||e.includes(`
`)?`"${e.replace(/"/g,'""')}"`:e}).join(",")),u=[l.join(","),...i].join(`
`),d=new Blob(["\uFEFF"+u],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(d),t=document.createElement("a");t.href=o,t.download=`${r}_${new Date().toISOString().slice(0,10)}.csv`,t.click(),URL.revokeObjectURL(o)}export{v as e};
