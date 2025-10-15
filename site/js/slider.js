// slider.js - slider with: 1=image(main.png), 2=text (Times New Roman bold justified), 3=video (YouTube).
(function(){
  const SLIDES = [
    { type: 'image', src: 'images/main.png', alt: 'Rick Owens' },
    { type: 'text', content:
`Rick Owens — американський дизайнер, народився 1962 року в Портервілі, Каліфорнія. Починав із навчання живопису, але кинув і перейшов до курсу з крою. У 1994 році заснував власний бренд у Лос-Анджелесі, з 2003 року переїхав до Парижа, де базується й досі. Його перше велике шоу відбулося у 2002 році на підтримку Vogue America і Анни Вінтур.

Стиль — брутальний авангард, деконструкція, монохром, архітектурний крій, шкіра, драпірування, силуети, які часто деформують тіло. Тематика — тіло, сексуальність, смерть, трансцендентність, апокаліпсис, антигламур. Часто працює з образами, що межують з релігією, філософією, міфом. Його естетика — це \"гламур зі смітника\" (trash glamour) або \"постапокаліптична елегантність\".

Rick Owens створює як чоловічі, так і жіночі колекції. Також має окремі лінії взуття (найвідоміші — геобаскети), меблів, парфумів. Бренд включає лінії DRKSHDW (більш доступна, денімова), Rick Owens Lilies (жіноча), а також спільні колаборації з Adidas, Veja, Moncler, Birkenstock, Champion, Aesop.` },
    { type: 'video', videoId: 'zrqqrQmeQS4', caption: 'Щоб пізнати дизайнера краще, пропоную ознайомитись із його житлом.' }
  ];

  const slidesEl = document.getElementById('slides');
  const dotsEl = document.getElementById('dots');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');

  // build slides & dots
  SLIDES.forEach((s,i)=>{
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.dataset.index = i;
    slide.setAttribute('role','group');

    if(s.type === 'image'){
      const img = document.createElement('img');
      img.className = 'img';
      img.src = s.src;
      img.alt = s.alt || '';
      slide.appendChild(img);
      // open lightbox on click on image
      img.addEventListener('click', ()=> openLightbox(i));
    } else if(s.type === 'text'){
      const p = document.createElement('div');
      p.className = 'text';
      // preserve paragraphs: convert newlines to <p>
      const paragraphs = s.content.split(/\n\s*\n/);
      paragraphs.forEach(par=>{
        const pEl = document.createElement('p');
        pEl.textContent = par.trim();
        p.appendChild(pEl);
      });
      slide.appendChild(p);
      // click opens lightbox
      slide.addEventListener('click', ()=> openLightbox(i));
    } else if(s.type === 'video'){
      const wrap = document.createElement('div');
      wrap.className = 'video-wrap';
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + s.videoId + '?rel=0&showinfo=0';
      iframe.title = 'Rick Owens video';
      iframe.setAttribute('allow','accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.allowFullscreen = true;
      wrap.appendChild(iframe);
      const caption = document.createElement('div');
      caption.className = 'video-caption';
      caption.textContent = s.caption;
      wrap.appendChild(caption);
      slide.appendChild(wrap);
      // if user clicks not on iframe, open lightbox
      slide.addEventListener('click', (e)=>{
        if(e.target.tagName.toLowerCase() === 'iframe') return;
        openLightbox(i);
      });
    }

    slidesEl.appendChild(slide);

    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Перейти до слайда ${i+1}`);
    dot.addEventListener('click', ()=> goTo(i));
    dotsEl.appendChild(dot);
  });

  const slides = Array.from(slidesEl.children);
  const dots = Array.from(dotsEl.children);

  let current = 0;
  const AUTOPLAY = true;
  const INTERVAL = 15000; // 15s
  let timer = null;
  let paused = false;

  function update(){
    slides.forEach((sl,i)=>{
      sl.classList.toggle('active', i === current);
      sl.setAttribute('aria-hidden', i === current ? 'false' : 'true');
    });
    dots.forEach((d,i)=> d.classList.toggle('active', i === current));
  }

  function goTo(i){
    current = (i + slides.length) % slides.length;
    update();
    resetTimer();
  }
  function next(){ goTo(current + 1); }
  function prev(){ goTo(current - 1); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // autoplay
  function startAuto(){
    stopAuto();
    if(!AUTOPLAY) return;
    timer = setInterval(()=> {
      if(!paused && document.getElementById('lightbox').getAttribute('aria-hidden') === 'true') next();
    }, INTERVAL);
  }
  function stopAuto(){ if(timer){ clearInterval(timer); timer = null; } }
  function resetTimer(){ stopAuto(); startAuto(); }

  // touch support
  let startX = 0;
  slidesEl.addEventListener('touchstart', (e)=> { startX = e.touches[0].clientX; paused = true; });
  slidesEl.addEventListener('touchend', (e)=> {
    const dx = e.changedTouches[0].clientX - startX;
    if(dx > 50) prev();
    if(dx < -50) next();
    paused = false;
  });

  // pause on hover
  slidesEl.addEventListener('mouseenter', ()=> paused = true );
  slidesEl.addEventListener('mouseleave', ()=> paused = false );

  // ensure first slide is shown on load
  goTo(0);
  startAuto();

  /* ---------- Lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lbBody = document.getElementById('lb-body');
  const lbClose = document.getElementById('lb-close');
  const lbFull = document.getElementById('lb-full');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');

  function openLightbox(idx){
    const slide = SLIDES[idx];
    lbBody.innerHTML = '';
    if(slide.type === 'image'){
      const img = document.createElement('img');
      img.src = slide.src;
      img.alt = slide.alt || '';
      lbBody.appendChild(img);
    } else if(slide.type === 'text'){
      const textWrap = document.createElement('div');
      textWrap.style.maxHeight = '90vh';
      textWrap.style.overflow = 'auto';
      textWrap.style.padding = '24px';
      textWrap.style.width = '90%';
      textWrap.style.background = 'transparent';
      textWrap.style.fontFamily = '"Times New Roman", Times, serif';
      textWrap.style.fontWeight = '700';
      textWrap.style.fontSize = '18px';
      textWrap.style.lineHeight = '1.36';
      textWrap.style.color = '#222';
      // build paragraphs
      const paras = slide.content.split(/\n\s*\n/);
      paras.forEach(p=>{
        const pEl = document.createElement('p');
        pEl.textContent = p.trim();
        pEl.style.textAlign = 'justify';
        pEl.style.marginBottom = '1em';
        textWrap.appendChild(pEl);
      });
      lbBody.appendChild(textWrap);
    } else if(slide.type === 'video'){
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.width = '100%';
      // iframe autoplay inside modal
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + slide.videoId + '?rel=0&autoplay=1';
      iframe.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.allowFullscreen = true;
      iframe.style.flex = '1 1 70%';
      iframe.style.border = '0';
      container.appendChild(iframe);
      const caption = document.createElement('div');
      caption.className = 'video-caption';
      caption.textContent = slide.caption;
      container.appendChild(caption);
      lbBody.appendChild(container);
    }
    lightbox.setAttribute('aria-hidden','false');
    paused = true;
    lbClose.focus();
    // store index for modal nav
    modalIndex = idx;
  }

  let modalIndex = 0;
  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', ()=> { modalIndex = (modalIndex - 1 + SLIDES.length) % SLIDES.length; openLightbox(modalIndex); });
  lbNext.addEventListener('click', ()=> { modalIndex = (modalIndex + 1) % SLIDES.length; openLightbox(modalIndex); });

  function closeLightbox(){
    lightbox.setAttribute('aria-hidden','true');
    lbBody.innerHTML = '';
    paused = false;
    resetTimer();
    if(document.fullscreenElement) document.exitFullscreen().catch(()=>{});
  }

  // fullscreen toggle
  lbFull.addEventListener('click', ()=>{
    const target = lbBody;
    if(!document.fullscreenElement){
      if(target.requestFullscreen) target.requestFullscreen().catch(()=>{});
    } else {
      if(document.exitFullscreen) document.exitFullscreen().catch(()=>{});
    }
  });
  document.addEventListener('fullscreenchange', ()=>{
    if(document.fullscreenElement) lbFull.textContent = '⤡';
    else lbFull.textContent = '⤢';
  });

  // keyboard nav
  document.addEventListener('keydown', (e)=>{
    if(lightbox.getAttribute('aria-hidden') === 'false'){
      if(e.key === 'Escape') closeLightbox();
      if(e.key === 'ArrowLeft') { modalIndex = (modalIndex - 1 + SLIDES.length) % SLIDES.length; openLightbox(modalIndex); }
      if(e.key === 'ArrowRight') { modalIndex = (modalIndex + 1) % SLIDES.length; openLightbox(modalIndex); }
    } else {
      if(e.key === 'ArrowLeft') prev();
      if(e.key === 'ArrowRight') next();
    }
  });

  // modal background click closes
  lightbox.addEventListener('click', (e)=>{
    if(e.target === lightbox) closeLightbox();
  });

})();

