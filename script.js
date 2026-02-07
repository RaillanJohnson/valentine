document.addEventListener('DOMContentLoaded',()=>{
  const overlay=document.getElementById('overlay');
  const startBtn=document.getElementById('startBtn');
  const main=document.getElementById('main');
  const annivText=document.getElementById('annivText');
  const choiceBox=document.getElementById('choice');
  const choiceYes=document.getElementById('choiceYes');
  const choiceNo=document.getElementById('choiceNo');
  const choiceButtons=document.getElementById('choiceButtons');
  const noResponseMsg=document.getElementById('noResponseMsg');
  const fallingHeartsLayer=document.getElementById('fallingHearts');
  const valText=document.getElementById('valText');
  const heartsContainer=document.getElementById('hearts');
  const birthdayAnim=document.getElementById('birthdayAnim');
  const loveBtn=document.getElementById('loveBtn');
  const loveMsg=document.getElementById('loveMsg');
  const replayBtn=document.getElementById('replayBtn');
  const annivPanel=document.getElementById('anniv');
  const valPanel=document.getElementById('valentine');
  const timeQuestion=document.getElementById('timeQuestion');
  const timeYes=document.getElementById('timeYes');
  const timeNo=document.getElementById('timeNo');
  const timeResp=document.getElementById('timeResp');

  startBtn.addEventListener('click',async ()=>{
    try{
      overlay.classList.add('hidden');
      main.classList.remove('hidden');
      playChime();
      await startSequence();
    }catch(e){console.error(e)}
  });

  loveBtn.addEventListener('click',()=>{
    const pressed = loveBtn.getAttribute('aria-pressed') === 'true';
    loveBtn.setAttribute('aria-pressed', String(!pressed));
    if(loveMsg.classList.contains('hidden')){
      playChime(880,120);
      loveMsg.classList.remove('hidden');
      loveMsg.classList.add('show');
    } else {
      loveMsg.classList.add('hidden');
      loveMsg.classList.remove('show');
    }
  });

  replayBtn && replayBtn.addEventListener('click',async ()=>{
    // reset
    annivText.textContent='';
    valText.textContent='';
    loveMsg.classList.add('hidden');
    loveMsg.classList.remove('show');
    annivPanel.classList.remove('show-panel');
    valPanel.classList.remove('show-panel');
    await new Promise(r=>setTimeout(r,160));
    playChime();
    await startSequence();
  });

  function typeText(el,text,delay=35){
    return new Promise(resolve=>{
      el.classList.add('typing');
      el.textContent='';
      let i=0;
      const timer=setInterval(()=>{
        el.textContent+=text.charAt(i);
        i++;
        if(i>=text.length){
          clearInterval(timer);
          el.classList.remove('typing');
          setTimeout(resolve,400);
        }
      },delay);
    });
  }

  async function startSequence(){
    await confettiBurst(18);
    // reveal anniversaire panel
    annivPanel.classList.add('show-panel');
    await typeText(annivText,"Kimora, aujourd'hui est un jour pour célébrer tout ce que tu es : ta douceur, ta force, tes rires, tes rêves. Que cette journée t'apporte autant de lumière que tu en apportes autour de toi. Je suis à tes côtés, fier·e de chaque pas que tu fais.");
    // start falling hearts and show choice
    startFallingHearts(600);
    showChoice();
    const answer = await waitForChoice();
    hideChoice();
    if(answer){
      // user said yes -> continue to Saint-Valentin
      createHearts(16);
      await new Promise(r=>setTimeout(r,520));
      valPanel.classList.add('show-panel');
      valPanel.scrollIntoView({behavior:'smooth',block:'center'});
      await typeText(valText,"Kimora, chaque instant avec toi transforme les petites choses en magnifiques souvenirs. Tes yeux, ton sourire, ta présence — tout me rappelle pourquoi je t'aime. Joyeuse Saint‑Valentin et joyeux anniversaire, mon amour. Je veux construire encore mille journées avec toi.");
      // after Valentine text, ask the time question
      await new Promise(r=>setTimeout(r,380));
      showTimeQuestion();
      await waitForTimeAnswer();
    } else {
      // user said no -> stop falling hearts and show message
      stopFallingHearts();
      noResponseMsg.classList.remove('hidden');
      noResponseMsg.scrollIntoView({behavior:'smooth',block:'center'});
    }
  }

  function showTimeQuestion(){
    if(!timeQuestion) return;
    timeQuestion.classList.remove('hidden');
    timeQuestion.classList.add('show-panel');
    // attach avoider to the 'Oui' of the time question so it flees
    attachAvoiderTo(timeYes);
  }
  function hideTimeQuestion(){
    if(!timeQuestion) return;
    timeQuestion.classList.add('hidden');
  }
  function waitForTimeAnswer(){
    return new Promise(resolve=>{
      if(!timeNo) return resolve(false);
      function onNo(){
        timeNo.removeEventListener('click',onNo);
        // detach avoider so it stops
        detachAvoiderFrom(timeYes);
        // reveal response
        timeResp.classList.remove('hidden');
        playChime(740,200);
        resolve(false);
      }
      timeNo.addEventListener('click',onNo);
    });
  }

  // Falling hearts generator
  let fallInterval = null;
  function startFallingHearts(rate=700){
    if(fallInterval) return;
    fallInterval = setInterval(()=>{
      const h = document.createElement('div');
      h.className = 'falling-heart';
      h.textContent = '❤';
      const size = 12 + Math.random()*30;
      h.style.fontSize = size + 'px';
      h.style.left = (Math.random()*100) + '%';
      // pink shades
      const pinks = ['#ff6fa3','#ff4d84','#ff9cb3','#ffb3c6'];
      h.style.color = pinks[Math.floor(Math.random()*pinks.length)];
      h.style.animationDuration = (3 + Math.random()*2.5) + 's';
      fallingHeartsLayer.appendChild(h);
      h.addEventListener('animationend',()=>{try{h.remove()}catch(e){}});
    }, rate);
  }
  function stopFallingHearts(){
    if(fallInterval){
      clearInterval(fallInterval);
      fallInterval = null;
    }
    // remove existing falling hearts
    const existing = fallingHeartsLayer.querySelectorAll('.falling-heart');
    existing.forEach(el=>el.remove());
  }

  // Choice UI helpers
  function showChoice(){
    choiceBox.classList.remove('hidden');
  }
  function hideChoice(){
    choiceBox.classList.add('hidden');
  }
  function waitForChoice(){
    return new Promise(resolve=>{
      function yes(){cleanup();resolve(true)}
      function no(){cleanup();resolve(false)}
      function cleanup(){
        choiceYes.removeEventListener('click',yes);
        choiceNo.removeEventListener('click',no);
      }
      choiceYes.addEventListener('click',yes);
      choiceNo.addEventListener('click',no);
    });
  }

  function createHearts(n){
    for(let i=0;i<n;i++){
      const h=document.createElement('div');
      h.className='heart';
      h.textContent='❤';
      h.style.left=(10+Math.random()*80)+'%';
      h.style.fontSize=(14+Math.random()*26)+'px';
      const dur = (2.2+Math.random()*1.8)+'s';
      h.style.animationDuration=dur;
      h.style.transform = `translateX(${(Math.random()*40-20)}px) rotate(${Math.random()*40-20}deg)`;
      h.style.opacity=1;
      heartsContainer.appendChild(h);
      h.addEventListener('animationend',()=>h.remove());
    }
  }

  function confettiBurst(n=12){
    return new Promise(resolve=>{
      const created=[];
      for(let i=0;i<n;i++){
        const c=document.createElement('div');
        c.className='confetti';
        c.style.background=['#ff6fa3','#ff9aa2','#ffd1dc','#ffb3c6'][i%4];
        c.style.left=(10+Math.random()*80)+'%';
        c.style.bottom='6px';
        c.style.width=(6+Math.random()*10)+'px';
        c.style.height=c.style.width;
        c.style.animationDelay=(Math.random()*0.2)+'s';
        birthdayAnim.appendChild(c);
        created.push(c);
        c.addEventListener('animationend',()=>{c.remove();});
      }
      setTimeout(resolve,800);
    });
  }

  // Helper to attach/detach avoider behaviour to a button (moves across viewport)
  function attachAvoiderTo(btn){
    if(!btn) return;
    const handlers = {};
    handlers.move = function(){
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
      const bRect = btn.getBoundingClientRect();
      const padding = 12;
      const maxLeft = Math.max(0, vw - bRect.width - padding);
      const maxTop = Math.max(0, vh - bRect.height - padding);
      const left = Math.random()*maxLeft;
      const top = Math.random()*maxTop;
      btn.style.left = left + 'px';
      btn.style.top = top + 'px';
      playChime(980 + Math.random()*400, 90);
    };
    handlers.clickBlock = function(e){ e.preventDefault(); handlers.move(); };
    btn._avoiderHandlers = handlers;
    btn.addEventListener('mouseenter', handlers.move);
    btn.addEventListener('touchstart', handlers.move);
    btn.addEventListener('click', handlers.clickBlock);
    btn.addEventListener('focus', handlers.move);
  }
  function detachAvoiderFrom(btn){
    if(!btn || !btn._avoiderHandlers) return;
    const h = btn._avoiderHandlers;
    btn.removeEventListener('mouseenter', h.move);
    btn.removeEventListener('touchstart', h.move);
    btn.removeEventListener('click', h.clickBlock);
    btn.removeEventListener('focus', h.move);
    delete btn._avoiderHandlers;
  }

  // small chime using WebAudio
  function playChime(freq=660,duration=220){
    try{
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.value = 0.001;
      o.connect(g);
      g.connect(ctx.destination);
      const now = ctx.currentTime;
      g.gain.linearRampToValueAtTime(0.12, now + 0.01);
      o.start(now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration/1000);
      o.stop(now + duration/1000 + 0.02);
      setTimeout(()=>{try{ctx.close()}catch(e){}}, duration+80);
    }catch(e){/* ignore */}
  }

});
