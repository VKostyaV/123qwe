// slider.js
(function(){

  // ----------------------------
  // Масив слайдів
  // ----------------------------
  const SLIDES = [
    { type: 'image', src: 'images/main.png', alt: 'Rick Owens' },
    { type: 'text', content:
`Rick Owens — американський дизайнер, народився 1962 року в Портервілі, Каліфорнія. Починав із навчання живопису, але кинув і перейшов до курсу з крою. У 1994 році заснував власний бренд у Лос-Анджелесі, з 2003 року переїхав до Парижа, де базується й досі. Його перше велике шоу відбулося у 2002 році на підтримку Vogue America і Анни Вінтур.

Стиль — брутальний авангард, деконструкція, монохром, архітектурний крій, шкіра, драпірування, силуети, які часто деформують тіло. Тематика — тіло, сексуальність, смерть, трансцендентність, апокаліпсис, антигламур. Часто працює з образами, що межують з релігією, філософією, міфом. Його естетика — це "гламур зі смітника" (trash glamour) або "постапокаліптична елегантність".

Rick Owens створює як чоловічі, так і жіночі колекції. Також має окремі лінії взуття (найвідоміші — геобаскети), меблів, парфумів. Бренд включає лінії DRKSHDW (більш доступна, денімова), Rick Owens Lilies (жіноча), а також спільні колаборації з Adidas, Veja, Moncler, Birkenstock, Champion, Aesop.` },
    { type: 'video', videoId: 'zrqqrQmeQS4', caption: 'Щоб пізнати дизайнера краще, пропоную ознайомитись із його житлом.' }
  ];

  // ----------------------------
  // Отримуємо DOM елементи
  // ----------------------------
  const slidesEl = document.getElementById('slides');
  const dotsEl = document.getElementById('dots');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const controls = document.querySelector('#slider .controls');

  if(!slidesEl || !dotsEl || !prevBtn || !nextBtn || !controls){
    console.error('Slider: required DOM elements missing');
    return;
  }

  // ----------------------------
  // Створюємо слайди і точки
  // ----------------------------
  SLIDES.forEach((s, i) => {
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.dataset.index = i;
    slide.setAttribute('role','group');
    slide.setAttribute('aria-roledescription','slide');

    // --- Картинка ---
    if(s.type==='image'){
      const img = document.createElement('img');
      img.className='img';
      img.src=s.src;
      img.alt=s.alt||'';
      img.loading='lazy';
      slide.appendChild(img);
      img.addEventListener('click',()=>openLightbox(i));

    // --- Текст ---
    } else if(s.type==='text'){
      const wrap=document.createElement('div');
      wrap.className='text';
      const ps = s.content.split(/\n\s*\n/);
      ps.forEach(p=>{
        const pEl=document.createElement('p');
        pEl.textContent=p.trim();
        wrap.appendChild(pEl);
      });
      slide.appendChild(wrap);
      slide.addEventListener('click',()=>openLightbox(i));

    // --- Відео ---
    } else if(s.type==='video'){
      const vwrap=document.createElement('div');
      vwrap.className='video-wrap';
      const iframe=document.createElement('iframe');
      iframe.src='https://www.youtube.com/embed/'+s.videoId+'?rel=0&showinfo=0';
      iframe.title='Rick Owens video';
      iframe.setAttribute('allow','accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('loading','lazy');
      iframe.setAttribute('frameborder','0');
      iframe.setAttribute('allowfullscreen','');
      vwrap.appendChild(iframe);

      const cap=document.createElement('div');
      cap.className='video-caption';
      cap.textContent=s.caption;
      vwrap.appendChild(cap);

      slide.appendChild(vwrap);

      slide.addEventListener('click',(e)=>{
        if(e.target.tagName.toLowerCase()==='iframe') return;
        openLightbox(i);
      });
    }

    slidesEl.appendChild(slide);

    // --- Точки ---
    const dot=document.createElement('button');
    dot.className='dot';
    dot.type='button';
    dot.setAttribute('aria-label',`Перейти до слайда ${i+1}`);
    dot.addEventListener('click',()=>goTo(i));
    dotsEl.appendChild(dot);
  });

  const slides=Array.from(slidesEl.children);
  const dots=Array.from(dotsEl.children);

  let current=0;
  const AUTOPLAY=true;
  const INTERVAL=15000;
  let timer=null;
  let paused=false;
  let modalIndex=0;

  // ----------------------------
  // Оновлення слайдів
  // ----------------------------
  function update(){
    slides.forEach((sl,i)=>{
      const active=i===current;
      sl.classList.toggle('active',active);
      sl.setAttribute('aria-hidden',active?'false':'true');
      sl.tabIndex=active?0:-1;
    });
    dots.forEach((d,i)=>{
      d.classList.toggle('active',i===current);
      d.setAttribute('aria-selected',i===current?'true':'false');
    });
  }

  function goTo(i){ current=(i+slides.length)%slides.length; update(); resetTimer(); }
  function next(){ goTo(current+1); }
  function prev(){ goTo(current-1); }

  prevBtn.addEventListener('click',prev);
  nextBtn.addEventListener('click',next);

  function startAuto(){
    stopAuto();
    if(!AUTOPLAY) return;
    timer=setInterval(()=>{
      if(!paused && document.getElementById('lightbox').getAttribute('aria-hidden')==='true') next();
    },INTERVAL);
  }
  function stopAuto(){ if(timer){ clearInterval(timer); timer=null; } }
  function resetTimer(){ stopAuto(); startAuto(); }

  // ----------------------------
  // Свайпи мобільні
  // ----------------------------
  let startX=0;
  slidesEl.addEventListener('touchstart',(e)=>{ startX=e.touches[0].clientX; paused=true; },{passive:true});
  slidesEl.addEventListener('touchend',(e)=>{
    const dx=e.changedTouches[0].clientX-startX;
    if(dx>50) prev();
    if(dx<-50) next();
    paused=false;
  });

  slidesEl.addEventListener('mouseenter',()=>paused=true);
  slidesEl.addEventListener('mouseleave',()=>paused=false);
  slidesEl.addEventListener('focusin',()=>paused=true);
  slidesEl.addEventListener('focusout',()=>paused=false);

  // ----------------------------
  // Додаткові стилі через JS
  // ----------------------------

  // 1️⃣ Зсунути текст другого слайду вниз
  const secondSlide = slidesEl.children[1];
  if(secondSlide){
    const textEl=secondSlide.querySelector('.text');
    if(textEl) textEl.style.marginTop='50px';
  }

  // 2️⃣ Фіксація блоку .controls поверх слайдів
  controls.style.position='absolute';
  controls.style.top='50%';
  controls.style.left='0';
  controls.style.width='100%';
  controls.style.transform='translateY(-50%)';
  controls.style.display='flex';
  controls.style.justifyContent='space-between';
  controls.style.pointerEvents='none';  // дозволяє клікати тільки по кнопках

  // Робимо кнопки клікабельними
  const arrows = controls.querySelectorAll('button');
  arrows.forEach(btn=>{
    btn.style.pointerEvents='auto';
    btn.style.zIndex='20';
  });

  // ----------------------------
  // Ініціалізація
  // ----------------------------
  goTo(0);
  startAuto();

  // ----------------------------
  // Lightbox
  // ----------------------------
  const lightbox=document.getElementById('lightbox');
  const lbBody=document.getElementById('lb-body');
  const lbClose=document.getElementById('lb-close');
  const lbFull=document.getElementById('lb-full');
  const lbPrev=document.getElementById('lb-prev');
  const lbNext=document.getElementById('lb-next');

  function openLightbox(idx){
    const slide=SLIDES[idx];
    lbBody.innerHTML='';

    if(slide.type==='image'){
      const img=document.createElement('img'); img.src=slide.src; img.alt=slide.alt||''; lbBody.appendChild(img);
    } else if(slide.type==='text'){
      const wrap=document.createElement('div'); wrap.className='lb-text-wrap';
      slide.content.split(/\n\s*\n/).forEach(p=>{ const pEl=document.createElement('p'); pEl.textContent=p.trim(); wrap.appendChild(pEl); });
      lbBody.appendChild(wrap);
    } else if(slide.type==='video'){
      const container=document.createElement('div'); container.className='lb-video-wrap';
      const iframe=document.createElement('iframe');
      iframe.src='https://www.youtube.com/embed/'+slide.videoId+'?rel=0&autoplay=1';
      iframe.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('frameborder','0'); iframe.setAttribute('allowfullscreen','');
      container.appendChild(iframe);
      const cap=document.createElement('div'); cap.className='video-caption'; cap.textContent=slide.caption;
      container.appendChild(cap); lbBody.appendChild(container);
    }

    lightbox.setAttribute('aria-hidden','false'); paused=true; modalIndex=idx; lbClose&&lbClose.focus();
  }

  lbClose&&lbClose.addEventListener('click',()=>closeLightbox());
  lbPrev&&lbPrev.addEventListener('click',()=>{ modalIndex=(modalIndex-1+SLIDES.length)%SLIDES.length; openLightbox(modalIndex); });
  lbNext&&lbNext.addEventListener('click',()=>{ modalIndex=(modalIndex+1)%SLIDES.length; openLightbox(modalIndex); });

  function closeLightbox(){
    lightbox.setAttribute('aria-hidden','true'); lbBody.innerHTML=''; paused=false; resetTimer();
    if(document.fullscreenElement) document.exitFullscreen().catch(()=>{});
  }

  lbFull&&lbFull.addEventListener('click',()=>{
    if(!document.fullscreenElement){ lightbox.requestFullscreen?.().catch(()=>{}); }
    else { document.exitFullscreen?.().catch(()=>{}); }
  });

  document.addEventListener('fullscreenchange',()=>{
    if(document.fullscreenElement) lbFull.textContent='⤡';
    else lbFull.textContent='⤢';
  });

  document.addEventListener('keydown',(e)=>{
    if(lightbox.getAttribute('aria-hidden')==='false'){
      if(e.key==='Escape') closeLightbox();
      if(e.key==='ArrowLeft'){ modalIndex=(modalIndex-1+SLIDES.length)%SLIDES.length; openLightbox(modalIndex); }
      if(e.key==='ArrowRight'){ modalIndex=(modalIndex+1)%SLIDES.length; openLightbox(modalIndex); }
    } else {
      if(e.key==='ArrowLeft') prev();
      if(e.key==='ArrowRight') next();
    }
  });

  lightbox.addEventListener('click',(e)=>{ if(e.target===lightbox) closeLightbox(); });

})(); // Кінець слайдера
