(() => {
 const track=document.querySelector('.carousel-track'),cards=[...document.querySelectorAll('.carousel-card')],jump=[...document.querySelectorAll('[data-slide]')];
 const prev=document.querySelector('.carousel-prev'),next=document.querySelector('.carousel-next'),counter=document.querySelector('.carousel-count');
 const dialog=document.querySelector('.project-dialog'),content=dialog.querySelector('.project-content'),viewer=document.getElementById('image-viewer');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let active=0,opened=0,opener=null,drag=null,dragged=false,frame=0,wheelTimer;
 const motion=()=>reduced.matches?'instant':'smooth';
 function update(){
  const middle=track.scrollLeft+track.clientWidth/2;
  active=cards.reduce((best,card,i)=>Math.abs(card.offsetLeft+card.offsetWidth/2-middle)<Math.abs(cards[best].offsetLeft+cards[best].offsetWidth/2-middle)?i:best,0);
  cards.forEach((card,i)=>card.classList.toggle('is-current',i===active));
  jump.forEach((button,i)=>{if(i===active)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current')});
  prev.disabled=active===0;next.disabled=active===cards.length-1;counter.textContent=String(active+1).padStart(2,'0')+' / 08';
 }
 function go(i){i=Math.max(0,Math.min(cards.length-1,i));track.scrollTo({left:cards[i].offsetLeft+(cards[i].offsetWidth-track.clientWidth)/2,behavior:motion()})}
 track.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update)},{passive:true});
 prev.addEventListener('click',()=>go(active-1));next.addEventListener('click',()=>go(active+1));jump.forEach((b,i)=>b.addEventListener('click',()=>go(i)));
 track.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();go(active+(e.key==='ArrowRight'?1:-1))}if(e.key==='Enter'&&e.target===track){e.preventDefault();open(active)}});
 track.addEventListener('wheel',e=>{
  if(Math.abs(e.deltaX)>=Math.abs(e.deltaY))return;
  if((e.deltaY<0&&track.scrollLeft<2)||(e.deltaY>0&&track.scrollLeft>=track.scrollWidth-track.clientWidth-2))return;
  e.preventDefault();track.classList.add('free-scroll');track.scrollLeft+=e.deltaY*(e.deltaMode===1?16:1.5);clearTimeout(wheelTimer);
  wheelTimer=setTimeout(()=>{track.classList.remove('free-scroll');update();go(active)},180);
 },{passive:false});
 track.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,left:track.scrollLeft,id:e.pointerId};dragged=false});
 track.addEventListener('pointermove',e=>{if(!drag)return;const delta=e.clientX-drag.x;if(Math.abs(delta)>6){dragged=true;track.classList.add('free-scroll');track.setPointerCapture(drag.id)}if(dragged){e.preventDefault();track.scrollLeft=drag.left-delta}});
 function stopDrag(){if(!drag)return;drag=null;track.classList.remove('free-scroll');if(dragged){update();go(active);setTimeout(()=>dragged=false,0)}}
 track.addEventListener('pointerup',stopDrag);track.addEventListener('pointercancel',stopDrag);track.addEventListener('dragstart',e=>e.preventDefault());
 function render(i){
  opened=(i+cards.length)%cards.length;const id=cards[opened].dataset.id;
  content.replaceChildren(document.getElementById('content-'+id).content.cloneNode(true));
  dialog.querySelector('.detail-count').textContent=String(opened+1).padStart(2,'0')+' / 08';dialog.scrollTo({top:0,behavior:'instant'});
  content.getAnimations().forEach(a=>a.cancel());if(!reduced.matches)content.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'ease-out'});
  history.replaceState(null,'','#'+id);
 }
 function open(i){opener=document.activeElement;render(i);if(!dialog.open)dialog.showModal();dialog.querySelector('[data-back]').focus({preventScroll:true})}
 function close(){dialog.close();history.replaceState(null,'',location.pathname+location.search);go(opened);cards[opened].querySelector('a').focus({preventScroll:true})}
 cards.forEach((card,i)=>card.querySelector('a').addEventListener('click',e=>{e.preventDefault();if(!dragged)open(i)}));
 dialog.addEventListener('click',e=>{
  if(e.target.closest('[data-back]'))close();
  else if(e.target.closest('[data-next]')){render(opened+1);dialog.querySelector('[data-next]').focus({preventScroll:true})}
  else if(e.target.closest('[data-prev]')){render(opened-1);dialog.querySelector('[data-prev]').focus({preventScroll:true})}
  const photo=e.target.closest('.photo-button');if(photo){const img=photo.querySelector('img');viewer.querySelector('img').src=img.currentSrc||img.src;viewer.querySelector('img').alt=img.alt;viewer.querySelector('p').textContent=photo.closest('figure').querySelector('figcaption').textContent;viewer.classList.remove("zoomed");viewer.querySelector(".viewer-zoom").textContent="Full size";viewer.showModal()}
 });
 dialog.addEventListener('cancel',e=>{e.preventDefault();close()});viewer.querySelector('.viewer-zoom').addEventListener('click',()=>{const full=viewer.classList.toggle('zoomed');viewer.querySelector('.viewer-zoom').textContent=full?'Fit to screen':'Full size'});viewer.querySelector('.viewer-close').addEventListener('click',()=>viewer.close());
 viewer.addEventListener('click',e=>{if(e.target===viewer){const b=viewer.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)viewer.close()}});
 window.addEventListener('resize',update);window.addEventListener('hashchange',()=>{const i=cards.findIndex(c=>c.dataset.id===location.hash.slice(1));if(i>=0)open(i);else if(dialog.open)dialog.close()});
 update();const initial=cards.findIndex(c=>c.dataset.id===location.hash.slice(1));if(initial>=0)open(initial);
})();
