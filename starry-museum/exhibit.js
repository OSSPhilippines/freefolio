const data=globalThis.MUSEUM_CONTENT;
const app=document.querySelector('main');
const section=new URLSearchParams(location.search).get('section')||document.body.dataset.section||'0';
const el=(tag,text,className)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;};
const eyebrow=text=>app.append(el('p',text,'eyebrow'));
const heading=text=>app.append(el('h1',text));
const paragraph=text=>app.append(el('p',text,'intro'));
eyebrow('STARRY MUSEUM / FICTIONAL DEMO');
if(section==='0'){
 heading('A little curiosity.\nA world of possibilities.');paragraph(data.introduction);
 const sky=el('div',null,'sky');sky.setAttribute('aria-hidden','true');sky.append(el('span','✦','star'),el('span','✧','orbit'));app.append(sky);
 const b=el('button','Light a little idea ✧');b.onclick=()=>{sky.classList.toggle('lit');b.textContent=sky.classList.contains('lit')?'An idea is taking shape ✦':'Light a little idea ✧';};app.append(b);
}else if(section==='1'){
 heading('Small things,\nmade with intention.');paragraph('A fictional collection. Select a cover to read the thinking behind it.');
 const covers=el('div',null,'covers');const detail=el('section',null,'detail');detail.setAttribute('aria-live','polite');
 const pick=i=>{covers.querySelectorAll('button').forEach((b,k)=>b.setAttribute('aria-pressed',String(k===i)));detail.replaceChildren(el('small',data.projects[i].type),el('h2',data.projects[i].name),el('p',data.projects[i].description),el('p',data.projects[i].tags.join(' · '),'tags'));};
 data.projects.forEach((p,i)=>{const b=el('button',null,'cover');b.style.setProperty('--cover',p.color);b.append(el('span',p.symbol),el('strong',p.name));b.setAttribute('aria-label','Read about '+p.name);b.onclick=()=>pick(i);covers.append(b);});
 app.append(covers,detail);pick(0);
 if(document.body.classList.contains('catalog')){const a=el('a','Return to the museum ↗');a.href='index.html#frame-1';app.append(a);}
}else if(section==='2'){
 heading('Notes from\nthe workbench.');paragraph('Small observations from a fictional creative process.');
 const book=el('article',null,'book');const left=el('div'),right=el('div');book.append(left,right);app.append(book);let page=0;
 const turn=()=>{left.replaceChildren(el('small',String(page+1).padStart(2,'0')+' / FIELD NOTES'),el('h2',data.notes[page].title));right.replaceChildren(el('p',data.notes[page].text),el('span','✦','note-star'));};
 const b=el('button','Turn the page →');b.onclick=()=>{page=(page+1)%data.notes.length;turn();};app.append(b);turn();
}else{
 heading('The person\nbehind the ideas.');paragraph('Replace this sample profile with your own story.');
 const card=el('section',null,'profile');card.append(el('small','CREATOR / DEMO PROFILE'),el('span','✦','seal'),el('h2',data.name),el('p',data.role));
 const list=el('ul');data.skills.forEach(s=>list.append(el('li',s)));card.append(list,el('small','EXAMPLE CONTENT · NO REAL BIOGRAPHY'));app.append(card);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');card.addEventListener('pointermove',e=>{if(reduced.matches)return;const r=card.getBoundingClientRect();card.style.transform=`perspective(900px) rotateX(${-(e.clientY-r.top-r.height/2)/35}deg) rotateY(${(e.clientX-r.left-r.width/2)/35}deg)`;});card.addEventListener('pointerleave',()=>card.style.transform='');
}
app.append(el('footer','Anonymous template · All projects and profile details are fictional.'));
