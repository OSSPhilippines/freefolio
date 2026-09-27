(() => {
  const previews=[...document.querySelectorAll('[data-portal-preview]')];
  const width=760,height=960;
  let loadedChapter=-1;
  function loadNearby(index){
    index=Math.max(0,Math.min(previews.length-1,index));
    if(loadedChapter===index)return;
    loadedChapter=index;
    for(const next of [index,index+1]){
      const iframe=previews[next]?.querySelector('iframe');
      if(iframe&&!iframe.hasAttribute('src')){
        iframe.loading='eager';
        iframe.src=`portal-exhibit-${next}.html?v=portal-cloud-art-1`;
      }
    }
  }
  loadNearby(Number(location.hash.match(/^#frame-(\d+)$/)?.[1]||0));
  window.museumPortalContainsPoint=(x,y)=>previews.some(preview=>{
    if(preview.hidden||Number(preview.style.opacity||1)<.05)return false;
    const rect=preview.getBoundingClientRect();
    if(!rect.width||!rect.height)return false;
    const rim=Math.max(rect.width/4.46,rect.height/5.76)*.38+4;
    return x>=rect.left-rim&&x<=rect.right+rim&&y>=rect.top-rim&&y<=rect.bottom+rim;
  });

  const expand=document.querySelector('[data-frame-fullscreen]');
  let fullscreen=null;
  function leaveFullscreen(){
    if(!fullscreen)return;
    const session=fullscreen;fullscreen=null;
    session.preview.classList.remove('is-frame-fullscreen');
    session.preview.hidden=session.hidden;session.preview.inert=session.inert;
    session.bar.remove();
    document.body.classList.remove('portal-fullscreen');
    session.siblings.forEach(([node,inert])=>{node.inert=inert;});
    expand?.setAttribute('aria-expanded','false');
    if(session.native&&document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});
    dispatchEvent(new Event('resize'));
    session.focus?.focus({preventScroll:true});
  }
  expand?.addEventListener('click',()=>{
    if(fullscreen)return;
    const phase=Number(document.body.style.getPropertyValue('--story-phase')||document.body.dataset.chapter||0);
    const index=Math.min(previews.length-1,Math.max(0,Math.round(phase)));
    const preview=previews[index];if(!preview)return;
    const world=preview.closest('.story-world');
    const bar=document.createElement('div');bar.className='portal-fullscreen-bar';
    const title=document.createElement('span');title.textContent=preview.getAttribute('aria-label')||'当前画作';
    const close=document.createElement('button');close.type='button';close.textContent='退出全屏 ×';close.addEventListener('click',leaveFullscreen);
    bar.append(title,close);preview.prepend(bar);
    const siblings=[...document.body.children].filter(node=>!node.contains(world)&&node!==world).map(node=>[node,node.inert]);
    fullscreen={preview,bar,siblings,hidden:preview.hidden,inert:preview.inert,focus:document.activeElement,native:false};
    const session=fullscreen;
    siblings.forEach(([node])=>{node.inert=true;});
    preview.hidden=false;preview.inert=false;preview.classList.add('is-frame-fullscreen');
    document.body.classList.add('portal-fullscreen');expand.setAttribute('aria-expanded','true');close.focus({preventScroll:true});
    dispatchEvent(new Event('resize'));
    // Keep the existing iframe in place: notes, book pages and gallery state survive.
    // The viewport-sized mode also works when embedded browsers deny native fullscreen.
    if(!document.fullscreenElement&&document.documentElement.requestFullscreen){
      session.native=true;
      try{
        Promise.resolve(document.documentElement.requestFullscreen()).then(()=>{
          if(fullscreen!==session&&document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});
        }).catch(()=>{session.native=false;});
      }catch{session.native=false;}
    }
  });
  document.addEventListener('fullscreenchange',()=>{
    if(fullscreen?.native&&!document.fullscreenElement)leaveFullscreen();
  });
  const escape=event=>{if(event.key==='Escape'&&fullscreen){event.preventDefault();leaveFullscreen();}};
  document.addEventListener('keydown',escape);
  previews.forEach(preview=>preview.querySelector('iframe').addEventListener('load',()=>{
    // Same-origin HTTP previews can forward Escape from inside the artwork.
    // file:// isolation may deny access; the visible exit button always works.
    try{
      const child=preview.querySelector('iframe').contentDocument;
      child.addEventListener('keydown',escape);
      const manual=()=>dispatchEvent(new Event('portal-user-interaction'));
      child.addEventListener('click',manual,true);
      child.addEventListener('keydown',manual,true);
    }catch{}
  }));

  // Project a real webpage plane into the opening of each Three.js frame.
  // The four projected corners define a CSS homography; WebGL draws the rim in front.
  function homography(corners){
    const [a,b,c,d]=corners;
    const dx1=b.x-c.x,dx2=d.x-c.x,dx3=a.x-b.x+c.x-d.x;
    const dy1=b.y-c.y,dy2=d.y-c.y,dy3=a.y-b.y+c.y-d.y;
    const den=dx1*dy2-dx2*dy1;
    if(Math.abs(den)<.0001)return null;
    const g=(dx3*dy2-dx2*dy3)/den,h=(dx1*dy3-dx3*dy1)/den;
    const values=[(b.x-a.x+g*b.x)/width,(b.y-a.y+g*b.y)/width,0,g/width,(d.x-a.x+h*d.x)/height,(d.y-a.y+h*d.y)/height,0,h/height,0,0,1,0,a.x,a.y,0,1];
    return values.every(Number.isFinite)?`matrix3d(${values.map(n=>n.toFixed(9)).join(',')})`:null;
  }
  window.museumPortalProject=(frames,camera,viewportWidth,viewportHeight,surface={halfWidth:2.23,halfHeight:2.88,z:0})=>{
    if(fullscreen)return;
    const active=Number(document.body.dataset.chapter||0);
    loadNearby(active);
    previews.forEach((preview,index)=>{
      const frame=frames[index];
      if(!frame){preview.hidden=true;return;}
      const opacity=frame.userData.portalOpacity??(index<active?0:1);
      if(opacity<=0){preview.hidden=true;preview.inert=true;return;}
      const entrance=Number(document.body.style.getPropertyValue('--portal-exhibits-opacity')||1);
      preview.inert=opacity<.98||entrance<.98;
      const {halfWidth:x,halfHeight:y,z}=surface;
      const points=[[-x,y],[x,y],[x,-y],[-x,-y]].map(([x,y])=>{
        const point=frame.localToWorld(new camera.position.constructor(x,y,z));
        const view=camera.worldToLocal(point.clone());
        const ndc=point.project(camera);
        return {x:(ndc.x+1)*viewportWidth/2,y:(1-ndc.y)*viewportHeight/2,z:view.z};
      });
      const boxWidth=Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y);
      const matrix=homography(points);
      const visible=matrix&&points.every(point=>point.z<-.2)&&boxWidth>24&&boxWidth<viewportWidth*3;
      preview.hidden=!visible;
      if(!visible)return;
      preview.style.transform=matrix;
      preview.style.opacity=String(opacity);
      preview.style.zIndex=String(previews.length-index);
    });
  };
})();
