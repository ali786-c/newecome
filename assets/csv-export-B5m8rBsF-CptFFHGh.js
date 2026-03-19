function j(a,n,i){const l=n.map(c=>c.header),s=i.map(c=>n.map(p=>{const r=p.accessor(c),e=r==null?"":String(r);return e.includes(",")||e.includes('"')||e.includes(`
`)?`"${e.replace(/"/g,'""')}"`:e}).join(",")),u=[l.join(","),...s].join(`
`),d=new Blob(["\uFEFF"+u],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(d),t=document.createElement("a");t.href=o,t.download=`${a}_${new Date().toISOString().slice(0,10)}.csv`,t.click(),URL.revokeObjectURL(o)}export{j as v};
