(function(){
  var STORAGE_KEY = 'emg-lang';
  function getLang(){
    try{
      var saved = localStorage.getItem(STORAGE_KEY);
      if(saved === 'ka' || saved === 'ru') return saved;
    }catch(e){}
    return 'ka';
  }
  function setLang(lang){
    document.body.classList.remove('lang-ka','lang-ru');
    document.body.classList.add('lang-' + lang);
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('[data-setlang]').forEach(function(btn){
      btn.classList.toggle('active', btn.getAttribute('data-setlang') === lang);
    });
    try{ localStorage.setItem(STORAGE_KEY, lang); }catch(e){}
    document.dispatchEvent(new CustomEvent('emg:langchange', {detail:{lang:lang}}));
  }
  document.addEventListener('DOMContentLoaded', function(){
    var lang = getLang();
    setLang(lang);
    document.querySelectorAll('[data-setlang]').forEach(function(btn){
      btn.addEventListener('click', function(){ setLang(btn.getAttribute('data-setlang')); });
    });
  });
  window.EMG_I18N = { getLang: getLang, setLang: setLang };
})();
