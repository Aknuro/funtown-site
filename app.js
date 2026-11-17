(function(){
  'use strict';
  var $=function(id){return document.getElementById(id)};
  var qa=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var NB=' ';
  var fmt=function(n){return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,NB)+NB+'₸'};
  var WA='https://wa.me/77028788919';
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var store={
    get:function(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},
    set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  };
  var mem={};

  /* ---------- header, progress, nav ---------- */
  var header=document.querySelector('.site-header'),bar=document.querySelector('.progress');
  function onScroll(){
    var y=window.pageYOffset||document.documentElement.scrollTop;
    if(header)header.classList.toggle('scrolled',y>10);
    if(bar){var h=document.documentElement.scrollHeight-window.innerHeight;bar.style.transform='scaleX('+(h>0?Math.min(1,y/h):0)+')'}
  }
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  var nav=$('nav'),tg=$('navToggle');
  if(nav&&tg){tg.addEventListener('click',function(){var o=nav.classList.toggle('open');tg.setAttribute('aria-expanded',o?'true':'false')})}

  /* ---------- open now ---------- */
  qa('[data-open]').forEach(function(el){
    var h;
    try{h=parseInt(new Date().toLocaleString('en-GB',{timeZone:'Asia/Almaty',hour:'numeric',hourCycle:'h23'}),10)}catch(e){h=12}
    var open=h>=11;
    el.classList.toggle('closed',!open);
    el.querySelector('span').textContent=open?'Открыто сейчас, до 00:00':'Сейчас закрыто, откроемся в 11:00';
  });

  /* ---------- counters ---------- */
  var counters=qa('[data-count]');
  function runCounter(el){
    var to=parseFloat(el.dataset.count),dec=+(el.dataset.dec||0),suf=el.dataset.suffix||'',t0=null,dur=1500;
    function f(ts){
      if(!t0)t0=ts;var p=Math.min(1,(ts-t0)/dur),e=1-Math.pow(1-p,4),v=to*e;
      el.textContent=(dec?v.toFixed(dec).replace('.',','):String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g,NB))+suf;
      if(p<1)requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }
  if(counters.length&&'IntersectionObserver' in window&&!reduce){
    var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){io.unobserve(x.target);runCounter(x.target)}})},{threshold:.4});
    counters.forEach(function(el){
      if(el.getBoundingClientRect().top>window.innerHeight){el.textContent='0'+(el.dataset.suffix||'');io.observe(el)}
    });
  }

  /* ---------- confetti (brand shapes) ---------- */
  var cv,cx,parts=[],raf=0,COL=['#D93A2B','#F7B500','#1558B0','#12804E','#FFFFFF'];
  function confetti(x,y,n){
    if(reduce)return;
    if(!cv){cv=document.createElement('canvas');cv.id='confetti';document.body.appendChild(cv);cx=cv.getContext('2d')}
    cv.width=window.innerWidth;cv.height=window.innerHeight;
    n=n||80;
    for(var i=0;i<n;i++){
      var a=-Math.PI/2+(Math.random()-.5)*2.4,s=5+Math.random()*10;
      parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:Math.random()*6,vr:(Math.random()-.5)*.4,sz:6+Math.random()*8,c:COL[i%COL.length],k:i%3,life:0});
    }
    if(!raf)raf=requestAnimationFrame(tick);
  }
  function tick(){
    cx.clearRect(0,0,cv.width,cv.height);
    parts=parts.filter(function(p){return p.life<110&&p.y<cv.height+40});
    parts.forEach(function(p){
      p.life++;p.vy+=.33;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;
      cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.globalAlpha=Math.max(0,1-p.life/110);cx.fillStyle=p.c;
      if(p.k===0){cx.beginPath();cx.arc(0,0,p.sz/2,0,6.283);cx.fill()}
      else if(p.k===1){cx.fillRect(-p.sz/2,-p.sz/2,p.sz,p.sz)}
      else{cx.beginPath();cx.moveTo(0,-p.sz/2);cx.lineTo(p.sz/2,p.sz/2);cx.lineTo(-p.sz/2,p.sz/2);cx.closePath();cx.fill()}
      cx.restore();
    });
    if(parts.length){raf=requestAnimationFrame(tick)}else{raf=0;cx.clearRect(0,0,cv.width,cv.height)}
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-confetti]');
    if(b){var r=b.getBoundingClientRect();confetti(r.left+r.width/2,r.top+r.height/2)}
  });

  /* ---------- hero tiles ---------- */
  var PAL=['#12804E','#1558B0','#F7B500','#D93A2B','#EDEFF3','#0F172A'];
  qa('.tiles .cell').forEach(function(c){
    c.dataset.c=c.dataset.c||'0';
    c.addEventListener('click',function(e){
      var n=((+c.dataset.c)+1)%PAL.length;c.dataset.c=n;
      var bg=c.querySelector('.bg'),fg=c.querySelector('.shape');
      if(bg)bg.setAttribute('fill',PAL[n]);
      if(fg)fg.setAttribute('fill',PAL[(n+3)%PAL.length]);
      confetti(e.clientX,e.clientY,14);
    });
  });

  /* ---------- calculator ---------- */
  var PACKS=window.FT_PACKS||[],BOUNDS=[5,7,9,12,17];
  function packIdx(k){var i=0;BOUNDS.forEach(function(b,j){if(k>=b)i=j});return i}
  function kidsWord(n){return (n%10===1&&n%100!==11)?'ребёнок':'детей'}
  var range=$('kidsRange');
  var cs={kids:6,prog:1,shown:0};
  function tween(el,from,to){
    if(reduce){el.textContent=fmt(to);return}
    var t0=null,d=450;
    function f(ts){if(!t0)t0=ts;var p=Math.min(1,(ts-t0)/d),e=1-Math.pow(1-p,3);el.textContent=fmt(from+(to-from)*e);if(p<1)requestAnimationFrame(f)}
    requestAnimationFrame(f);
  }
  function renderCalc(){
    var i=packIdx(cs.kids),pk=PACKS[i],two=cs.prog===2,price=two?pk.p2:pk.p1;
    $('kidsOut').textContent=cs.kids;$('kidsWord').textContent=kidsWord(cs.kids);
    range.value=cs.kids;range.style.setProperty('--p',((cs.kids-5)/16*100)+'%');
    $('pkTitle').textContent='Пакет на '+pk.kids+' детей';
    tween($('pkPrice'),cs.shown||price,price);cs.shown=price;
    $('pkChip').textContent=two?'Две программы':'Одна программа';
    $('pkPer').textContent='В среднем '+fmt(price/cs.kids)+' на ребёнка при '+cs.kids+' '+kidsWord(cs.kids);
    var hero=(i===0&&!two)?'Часовая программа с одним героем':'Часовая программа с двумя героями';
    var prog=[hero,'Коронация именинника','Сильвер-дискотека'];
    if(two)prog.push('Шоу на выбор: мыльные пузыри, неоновая дискотека, крио-шоу или Бамблби с ведущим');
    prog.push('Вход в игровой лабиринт','Приглашения для гостей','VIP-зал');
    var list=function(a){return a.map(function(t,k){return '<li style="--k:'+k+'">'+t+'</li>'}).join('')};
    if($('pkProg'))$('pkProg').innerHTML=list(prog);
    if($('pkMenu'))$('pkMenu').innerHTML=list(pk.menu);
    $('progNote').textContent=two?'Вторая программа добавляет шоу на выбор: мыльные пузыри, неоновая дискотека, крио-шоу или Бамблби с ведущим.':'Игры с героями, коронация и сильвер-дискотека.';
    qa('#pkChips button').forEach(function(b){b.setAttribute('aria-pressed',+b.dataset.i===i?'true':'false')});
    qa('#progSwitch button').forEach(function(b){b.setAttribute('aria-pressed',+b.dataset.p===cs.prog?'true':'false')});
    $('progSwitch').dataset.v=cs.prog;
    qa('#priceTable tr').forEach(function(tr,k){tr.classList.toggle('on',k===i)});
  }
  if(range&&PACKS.length){
    $('pkChips').innerHTML=PACKS.map(function(pk,i){return '<button type="button" data-i="'+i+'" aria-pressed="false">'+pk.kids+'</button>'}).join('');
    range.addEventListener('input',function(){cs.kids=+range.value;renderCalc()});
    $('pkChips').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;cs.kids=BOUNDS[+b.dataset.i];renderCalc()});
    $('progSwitch').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;cs.prog=+b.dataset.p;renderCalc()});
    $('pkBook').addEventListener('click',function(){store.set('ft_book',{kids:cs.kids,prog:cs.prog});mem.book={kids:cs.kids,prog:cs.prog}});
    renderCalc();
  }

  /* ---------- booking form ---------- */
  var fKids=$('fKids');
  if(fKids){
    var opts='';for(var k=5;k<=21;k++)opts+='<option value="'+k+'">'+k+' '+kidsWord(k)+'</option>';
    fKids.innerHTML=opts;fKids.value=6;
    var pre=store.get('ft_book')||mem.book;
    if(pre){fKids.value=pre.kids;$('fProg').value=String(pre.prog)}
    var today=new Date();try{today=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Almaty'}))}catch(e){}
    var iso=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
    $('fDate').min=iso;
    var ph=$('fPhone');
    ph.addEventListener('input',function(){
      var d=ph.value.replace(/\D/g,'');if(!d){ph.value='';return}
      if(d[0]==='8')d='7'+d.slice(1);if(d[0]!=='7')d='7'+d;d=d.slice(0,11);
      var o='+7';if(d.length>1)o+=' ('+d.slice(1,4);if(d.length>=4)o+=') '+d.slice(4,7);if(d.length>=7)o+='-'+d.slice(7,9);if(d.length>=9)o+='-'+d.slice(9,11);
      ph.value=o;
    });
    var msg='';
    var upd=function(){
      var n=+fKids.value,pk=PACKS[packIdx(n)],two=$('fProg').value==='2';
      var L=['Здравствуйте! Хочу забронировать день рождения в FUNTOWN.'];
      if($('fName').value.trim())L.push('Имя: '+$('fName').value.trim());
      if(ph.value.trim())L.push('Телефон: '+ph.value.trim());
      if($('fDate').value){var d=$('fDate').value.split('-');L.push('Дата: '+d[2]+'.'+d[1]+'.'+d[0])}
      if($('fAge').value.trim())L.push('Возраст именинника: '+$('fAge').value.trim());
      L.push('Детей: '+n);
      L.push('Пакет: на '+pk.kids+' детей, '+(two?'две программы':'одна программа')+', '+fmt(two?pk.p2:pk.p1).replace(/ /g,' '));
      msg=L.join('\n');
      var b=$('preview');b.textContent=msg;b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump');
      $('waSend').href=WA+'?text='+encodeURIComponent(msg);
    };
    ['fName','fPhone','fDate','fAge','fKids','fProg'].forEach(function(id){$(id).addEventListener('input',upd);$(id).addEventListener('change',upd)});
    $('bookForm').addEventListener('submit',function(e){e.preventDefault()});
    $('copyMsg').addEventListener('click',function(){
      var done=function(){$('copied').textContent='Текст скопирован'};
      try{navigator.clipboard.writeText(msg).then(done,function(){$('copied').textContent='Не удалось скопировать, выделите текст вручную'})}
      catch(e){$('copied').textContent='Не удалось скопировать, выделите текст вручную'}
    });
    upd();
  }

  /* ---------- menu ---------- */
  var tabs=qa('.tabs button');
  if(tabs.length){
    var panels={kitchen:$('p-kitchen'),bar:$('p-bar')},chipBox={kitchen:$('c-kitchen'),bar:$('c-bar')},current='kitchen',spy=null;
    var inp=$('menuSearch'),pf=$('priceFilter');
    var cart=store.get('ft_cart')||{};

    var filter=function(){
      var v=(inp.value||'').trim().toLowerCase(),pr=pf.value,shown=0;
      qa('.menu-cat',panels[current]).forEach(function(cat){
        var any=0;
        qa('.item',cat).forEach(function(it){
          var m=+it.dataset.min,ok=(!v||it.textContent.toLowerCase().indexOf(v)>-1)&&(pr==='all'||(pr==='lt2'&&m<2000)||(pr==='mid'&&m>=2000&&m<4000)||(pr==='gt4'&&m>=4000));
          it.style.display=ok?'':'none';if(ok)any++;
        });
        cat.style.display=any?'':'none';shown+=any;
      });
      $('empty').style.display=shown?'none':'block';
    };
    var observe=function(){
      if(spy)spy.disconnect();
      if(!('IntersectionObserver' in window))return;
      spy=new IntersectionObserver(function(en){
        en.forEach(function(x){
          if(x.isIntersecting){
            qa('button',chipBox[current]).forEach(function(b){
              var on=b.dataset.target===x.target.id;b.classList.toggle('on',on);
              if(on&&b.scrollIntoView){var box=chipBox[current];box.scrollTo({left:b.offsetLeft-box.clientWidth/3,behavior:'smooth'})}
            });
          }
        });
      },{rootMargin:'-230px 0px -65% 0px'});
      qa('.menu-cat',panels[current]).forEach(function(c){spy.observe(c)});
    };
    var show=function(name){
      current=name;
      qa('.tabs button').forEach(function(t){t.setAttribute('aria-selected',t.dataset.tab===name?'true':'false')});
      document.querySelector('.tabs').dataset.v=name;
      Object.keys(panels).forEach(function(k){panels[k].hidden=k!==name;chipBox[k].hidden=k!==name});
      filter();observe();
      try{history.replaceState(null,'',name==='bar'?'#bar':'#kitchen')}catch(e){}
    };
    tabs.forEach(function(t){t.addEventListener('click',function(){show(t.dataset.tab);window.scrollTo({top:$('menuTop').offsetTop-70,behavior:'smooth'})})});
    qa('.chips button').forEach(function(b){b.addEventListener('click',function(){var el=$(b.dataset.target);if(el)el.scrollIntoView({behavior:'smooth',block:'start'})})});
    inp.addEventListener('input',filter);pf.addEventListener('change',filter);

    /* cart */
    var bar2=$('cartBar'),drawer=$('drawer'),back=$('drawerBack');
    var keys=function(){return Object.keys(cart)};
    var totals=function(){var c=0,s=0;keys().forEach(function(k){c+=cart[k].qty;s+=cart[k].qty*cart[k].price});return {c:c,s:s}};
    var syncButtons=function(){
      qa('.add').forEach(function(b){
        var on=!!cart[b.dataset.key];b.classList.toggle('on',on);b.textContent=on?'✓':'+';
        b.setAttribute('aria-pressed',on?'true':'false');
        var it=b.closest('.item');if(it)it.classList.toggle('in-cart',qa('.add.on',it).length>0);
      });
    };
    var buildMsg=function(){
      var t=totals(),L=['Здравствуйте! Хочу заказать из меню FUNTOWN:'];
      keys().forEach(function(k){var c=cart[k];L.push('• '+c.name+(c.label?' ('+c.label+')':'')+' — '+c.qty+' × '+fmt(c.price).replace(/ /g,' '))});
      L.push('Итого: '+fmt(t.s).replace(/ /g,' '));
      return L.join('\n');
    };
    var renderCart=function(){
      var t=totals();
      $('cartCount').textContent=t.c+' '+(t.c%10===1&&t.c%100!==11?'блюдо':(t.c%10>=2&&t.c%10<=4&&(t.c%100<10||t.c%100>=20)?'блюда':'блюд'));
      $('cartSum').textContent=fmt(t.s);$('drawerSum').textContent=fmt(t.s);
      bar2.classList.toggle('show',t.c>0&&!drawer.classList.contains('show'));
      var ul=$('cartList');
      if(!t.c){ul.innerHTML='<li class="none" style="display:block;border:0">Список пуст. Нажмите «+» рядом с блюдом.</li>';$('cartSend').setAttribute('aria-disabled','true')}
      else{
        ul.innerHTML=keys().map(function(k){var c=cart[k];
          return '<li><div><b>'+c.name+'</b>'+(c.label?'<small>'+c.label+'</small>':'')+'<small>'+fmt(c.price)+'</small></div><div class="qty" data-k="'+k.replace(/"/g,'&quot;')+'"><button type="button" data-a="-" aria-label="Меньше">−</button><span>'+c.qty+'</span><button type="button" data-a="+" aria-label="Больше">+</button></div></li>'}).join('');
        $('cartSend').removeAttribute('aria-disabled');
        $('cartSend').href=WA+'?text='+encodeURIComponent(buildMsg());
      }
      syncButtons();store.set('ft_cart',cart);
    };
    var openDrawer=function(){drawer.classList.add('show');back.classList.add('show');renderCart();$('drawerClose').focus()};
    var closeDrawer=function(){drawer.classList.remove('show');back.classList.remove('show');renderCart()};
    qa('.add').forEach(function(b){
      b.addEventListener('click',function(){
        var k=b.dataset.key;
        if(cart[k])delete cart[k];else cart[k]={name:b.dataset.name,label:b.dataset.label||'',price:+b.dataset.price,qty:1};
        b.classList.remove('pulse');void b.offsetWidth;b.classList.add('pulse');
        renderCart();
      });
    });
    $('cartList').addEventListener('click',function(e){
      var b=e.target.closest('button');if(!b)return;var k=b.parentNode.dataset.k;if(!cart[k])return;
      cart[k].qty+=b.dataset.a==='+'?1:-1;if(cart[k].qty<1)delete cart[k];renderCart();
    });
    $('openCart').addEventListener('click',openDrawer);
    $('drawerClose').addEventListener('click',closeDrawer);back.addEventListener('click',closeDrawer);
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&drawer.classList.contains('show'))closeDrawer()});
    $('cartClear').addEventListener('click',function(){cart={};renderCart()});
    $('cartSend').addEventListener('click',function(e){if(this.getAttribute('aria-disabled')==='true'){e.preventDefault();return}var r=this.getBoundingClientRect();confetti(r.left+r.width/2,r.top)});

    show(location.hash==='#bar'?'bar':'kitchen');
    renderCart();
  }
})();
