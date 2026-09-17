(function(){
  document.addEventListener('DOMContentLoaded', function(){

    /* header solid-on-scroll */
    var header = document.querySelector('.site-header');
    if(header){
      var onScroll = function(){
        header.classList.toggle('solid', window.scrollY > 24);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, {passive:true});
    }

    /* mobile menu */
    var burger = document.querySelector('.burger');
    var menu = document.querySelector('.mobile-menu');
    if(burger && menu){
      var toggle = function(open){
        var isOpen = open !== undefined ? open : !menu.classList.contains('is-open');
        menu.classList.toggle('is-open', isOpen);
        burger.classList.toggle('is-open', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
      };
      burger.addEventListener('click', function(){ toggle(); });
      menu.querySelectorAll('a').forEach(function(a){
        a.addEventListener('click', function(){ toggle(false); });
      });
    }

    /* scroll reveal */
    var revealEls = document.querySelectorAll('.reveal');
    if('IntersectionObserver' in window && revealEls.length){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, {threshold:.15, rootMargin:'0px 0px -40px 0px'});
      revealEls.forEach(function(el){ io.observe(el); });
    }else{
      revealEls.forEach(function(el){ el.classList.add('is-visible'); });
    }

    /* tips accordion */
    document.querySelectorAll('.tip-head').forEach(function(head){
      head.addEventListener('click', function(){
        var card = head.closest('.tip-card');
        var body = card.querySelector('.tip-body');
        var isOpen = card.classList.contains('open');
        document.querySelectorAll('.tip-card.open').forEach(function(openCard){
          if(openCard !== card){
            openCard.classList.remove('open');
            openCard.querySelector('.tip-body').style.maxHeight = null;
          }
        });
        card.classList.toggle('open', !isOpen);
        body.style.maxHeight = !isOpen ? body.scrollHeight + 'px' : null;
      });
    });

    /* active nav link by current page */
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-desktop a, .mobile-menu nav a').forEach(function(a){
      var href = a.getAttribute('href');
      if(href && href.split('#')[0] === path){ a.classList.add('active'); }
    });
  });
})();
