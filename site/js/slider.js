// slider.js — більш стійка версія (працює тільки після завантаження DOM)
(function(){
  // ініціалізувати після DOMContentLoaded для надійності
  function init() {
    try {
      const slidesEl = document.getElementById('slides');
      const dotsEl = document.getElementById('dots');
      const prevBtn = document.getElementById('prev');
      const nextBtn = document.getElementById('next');
      // елементи лайтбоксу
      const lightbox = document.getElementById('lightbox');
      const lbBody = document.getElementById('lb-body');
      const lbClose = document.getElementById('lb-close');
      const lbFull = document.getElementById('lb-full');
      const lbPrev = document.getElementById('lb-prev');
      const lbNext = document.getElementById('lb-next');

      // Якщо обов'язкові елементи не знайдено — припиняємо ініціалізацію
      if(!slidesEl || !dotsEl || !prevBtn || !nextBtn) {
        // console.warn('Slider init aborted: required DOM nodes missing.');
        return;
      }

      // --- Слайди (залишив твій контент) ---
      const SLIDES = [
        { type: 'image', src: 'images/main.png', alt: 'Rick Owens' },
        { type: 'text', content:
`Rick Owens — американський дизайнер, народився 1962 року в Портервілі, Каліфорнія. Починав із навчання живопису, але кинув і перейшов до курсу з крою. У 1994 році заснував власний бренд у Лос-Анджелесі, з 2003 року переїхав до Парижа, де базується й досі. Його перше велике шоу відбулося у 2002 році на підтримку Vogue America і Анни Вінтур.

Стиль — брутальний авангард, деконструкція, монохром, архітектурний крій, шкіра, драпірування, силуети, які часто деформують тіло. Тематика — тіло, сексуальність, смерть, трансцендентність, апокаліпсис, антигламур. Часто працює з образами, що межують з релігією, філософією, міфом. Його естетика — це "гламур зі смітника" (trash glamour) або "постапокаліптична елегантність".

Rick Owens створює як чоловічі, так і жіночі колекції. Також має окремі лінії взуття (найвідоміші — геобаскети), меблів, парфумів. Бренд включає лінії DRKSHDW (більш доступна, денімова), Rick Owens Lilies (жіноча), а також спільні колаборації з Adidas, Veja, Moncler, Birkenstock, Champion, Aesop.` },
        { type: 'video', videoId: 'zrqqrQmeQS4', caption: 'Щоб пізнати дизайнера краще, пропоную ознайомитись із його житлом.' }
      ];

      // побудова DOM слайдеру
      SLIDES.forEach((s,i) => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.dataset.index = i;
        slide.setAttribute('role', 'group');

        if(s.type === 'image') {
          const img = document.createElement('img');
          img.className = 'img';
          img.src = s.src;
          img.alt = s.alt || '';
          img.addEventListener('click', ()=> openLightbox(i));
          slide.appendChild(img);
        } else if(s.type === 'text') {
          const wrap = document.createElement('div');
          wrap.className = 'text';
          const paragraphs = s.content.split(/\n\s*\n/);
          paragraphs.forEach(par => {
            const p = document.createElement('p');
            p.textContent = par.trim();
            wrap.appendChild(p);
          });
          slide.appendChild(wrap);
          slide.addEventListener('click', ()=> openLightbox(i));
        } else if(s.type === 'video') {
          const wrap = document.createElement('div');
          wrap.className = 'video-wrap';
          const iframe = document.createElement('iframe');
          iframe.src = 'https://www.youtube.com/embed/' + s.videoId + '?rel=0&showinfo=0';
          iframe.title = 'Rick Owens video';
          iframe.setAttribute('allow', 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
          iframe.setAttribute('frameborder', '0');
          iframe.allowFullscreen = true;
          wrap.appendChild(iframe);
          const caption = document.createElement('div');
          caption.className = 'video-caption';
          caption.textContent = s.caption;
          wrap.appendChild(caption);
          slide.appendChild(wrap);

          slide.addEventListener('click', (e)=> {
            if(e.target.tagName && e.target.tagName.toLowerCase() === 'iframe') return;
            openLightbox(i);
          });
        }

        slidesEl.appendChild(slide);

        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'dot';
        dot.setAttribute('aria-label', `Перейти до слайда ${i+1}`);
        dot.addEventListener('click', ()=> goTo(i));
        dotsEl.appendChild(dot);
      });

      const slides = Array.from(slidesEl.children);
      const dots = Array.from(dotsEl.children);

      let current = 0;
      const AUTOPLAY = true;
      const INTERVAL = 15000;
      let timer = null;
      let paused = false;

      function update(){
        slides.forEach((sl,i) => {
          sl.classList.toggle('active', i === current);
          sl.setAttribute('aria-hidden', i === current ? 'false' : 'true');
        });
        dots.forEach((d,i) => d.classList.toggle('active', i === current));
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

      function startAuto(){
        stopAuto();
        if(!AUTOPLAY) return;
        timer = setInterval(()=> {
          if(!paused && (!lightbox || lightbox.getAttribute('aria-hidden') === 'true')) next();
        }, INTERVAL);
      }
      function stopAuto(){ if(timer){ clearInterval(timer); timer = null; } }
      function resetTimer(){ stopAuto(); startAuto(); }

      // touch
      let startX = 0;
      slidesEl.addEventListener('touchstart', (e)=> { startX = e.touches[0].clientX; paused = true; });
      slidesEl.addEventListener('touchend', (e)=> {
        const dx = e.changedTouches[0].clientX - startX;
        if(dx > 50) prev();
        if(dx < -50) next();
        paused = false;
      });

      slidesEl.addEventListener('mouseenter', ()=> paused = true );
      slidesEl.addEventListener('mouseleave', ()=> paused = false );

      goTo(0);
      startAuto();

      /* ---------- Lightbox (якщо є елементи) ---------- */
      let modalIndex = 0;

      function openLightbox(idx){
        if(!lightbox || !lbBody) return;
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
          textWrap.style.fontFamily = '"Times New Roman", Times, serif';
          textWrap.style.fontWeight = '700';
          textWrap.style.fontSize = '18px';
          textWrap.style.lineHeight = '1.36';
          textWrap.style.color = '#222';
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
          const iframe = document.createElement('iframe');
          iframe.src = 'https://www.youtube.com/embed/' + slide.videoId + '?rel=0&autoplay=1';
          iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
          iframe.allowFullscreen = true;
          iframe.style.width = '80%';
          iframe.style.height = '60vh';
          iframe.style.border = '0';
          container.appendChild(iframe);
          const caption = document.createElement('div');
          caption.className = 'video-caption';
          caption.textContent = slide.caption;
          container.appendChild(caption);
          lbBody.appendChild(container);
        }
        lightbox.setAttribute('aria-hidden', 'false');
        paused = true;
        modalIndex = idx;
        if(lbClose) lbClose.focus();
      }

      if(lbClose) lbClose.addEventListener('click', closeLightbox);
      if(lbPrev) lbPrev.addEventListener('click', ()=> { modalIndex = (modalIndex - 1 + SLIDES.length) % SLIDES.length; openLightbox(modalIndex); });
      if(lbNext) lbNext.addEventListener('click', ()=> { modalIndex = (modalIndex + 1) % SLIDES.length; openLightbox(modalIndex); });

      function closeLightbox(){
        if(!lightbox || !lbBody) return;
        lightbox.setAttribute('aria-hidden', 'true');
        lbBody.innerHTML = '';
        paused = false;
        resetTimer();
        if(document.fullscreenElement) document.exitFullscreen().catch(()=>{});
      }

      if(lbFull) lbFull.addEventListener('click', ()=> {
        const target = lbBody;
        if(!document.fullscreenElement){
          if(target.requestFullscreen) target.requestFullscreen().catch(()=>{});
        } else {
          if(document.exitFullscreen) document.exitFullscreen().catch(()=>{});
        }
      });

      document.addEventListener('fullscreenchange', ()=> {
        if(!lbFull) return;
        if(document.fullscreenElement) lbFull.textContent = '⤡';
        else lbFull.textContent = '⤢';
      });

      document.addEventListener('keydown', (e)=> {
        if(lightbox && lightbox.getAttribute('aria-hidden') === 'false') {
          if(e.key === 'Escape') closeLightbox();
          if(e.key === 'ArrowLeft') { modalIndex = (modalIndex - 1 + SLIDES.length) % SLIDES.length; openLightbox(modalIndex); }
          if(e.key === 'ArrowRight') { modalIndex = (modalIndex + 1) % SLIDES.length; openLightbox(modalIndex); }
        } else {
          if(e.key === 'ArrowLeft') prev();
          if(e.key === 'ArrowRight') next();
        }
      });

      if(lightbox) {
        lightbox.addEventListener('click', (e) => { if(e.target === lightbox) closeLightbox(); });
      }

    } catch(err) {
      // щоб помилка не зупиняла інші скрипти
      console.error('Slider init error:', err);
    }
  }

  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();