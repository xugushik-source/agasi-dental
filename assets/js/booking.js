/*
  Front-end only booking demo.
  No backend is wired up yet. `submitBooking()` is the single seam where a real
  API call (STAFF / Google Sheets / CRM) will be plugged in during stage 2 —
  everything above it (UI, validation, slot state) stays the same.
*/
(function(){
  var T = {
    ka:{
      pickDate:'აირჩიეთ ვიზიტის სასურველი თარიღი', noSlots:'ამ დღეს თავისუფალი დრო არ არის — სცადეთ სხვა თარიღი.',
      fillRequired:'გთხოვთ მიუთითოთ სახელი და ტელეფონი.', invalidPhone:'გთხოვთ შეიყვანოთ სწორი ტელეფონის ნომერი.',
      sending:'იგზავნება…', confirmTitle:'თქვენი მოთხოვნა მიღებულია', confirmText:'ჩვენ დაგირეკავთ უახლოეს დროს ვიზიტის დასადასტურებლად.',
      summaryService:'სერვისი', summaryDate:'თარიღი', summaryTime:'დრო', summaryName:'სახელი', summaryPhone:'ტელეფონი', notChosen:'არ არის მითითებული',
      back:'უკან'
    },
    ru:{
      pickDate:'Выберите удобную дату визита', noSlots:'На эту дату свободного времени нет — попробуйте другой день.',
      fillRequired:'Пожалуйста, укажите имя и телефон.', invalidPhone:'Пожалуйста, введите корректный номер телефона.',
      sending:'Отправляем…', confirmTitle:'Заявка принята', confirmText:'Мы позвоним вам в ближайшее время, чтобы подтвердить визит.',
      summaryService:'Услуга', summaryDate:'Дата', summaryTime:'Время', summaryName:'Имя', summaryPhone:'Телефон', notChosen:'не указано',
      back:'Назад'
    }
  };

  function lang(){ return (window.EMG_I18N && window.EMG_I18N.getLang()) || 'ka'; }

  /* deterministic pseudo-random slot availability, seeded by date string */
  function seedFromString(str){
    var h = 0;
    for(var i=0;i<str.length;i++){ h = (h * 31 + str.charCodeAt(i)) >>> 0; }
    return h;
  }
  function mulberry32(a){
    return function(){
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var HOURS = ['10:00','10:40','11:20','12:00','12:40','14:00','14:40','15:20','16:00','16:40','17:20','18:00'];

  function slotsForDate(dateStr){
    var rnd = mulberry32(seedFromString(dateStr));
    return HOURS.map(function(h){ return { time:h, taken: rnd() < .32 }; });
  }

  document.addEventListener('DOMContentLoaded', function(){
    var root = document.getElementById('booking');
    if(!root) return;

    var chips = root.querySelectorAll('.chip');
    var dateInput = root.querySelector('#bk-date');
    var slotsBox = root.querySelector('#bk-slots');
    var stepDate = root.querySelector('#bk-step-date');
    var stepForm = root.querySelector('#bk-step-form');
    var stepConfirm = root.querySelector('#bk-step-confirm');
    var chosenSlotEl = root.querySelector('#bk-chosen-slot');
    var nameInput = root.querySelector('#bk-name');
    var phoneInput = root.querySelector('#bk-phone');
    var errorEl = root.querySelector('#bk-error');
    var submitBtn = root.querySelector('#bk-submit');
    var backBtn = root.querySelector('#bk-back');
    var progressSteps = root.querySelectorAll('.booking-steps .st');
    var summaryEl = root.querySelector('#bk-summary');

    var state = { service:null, date:null, time:null };

    function setProgress(step){
      progressSteps.forEach(function(el, i){ el.classList.toggle('active', i <= step); });
    }

    function chipLabel(chip){
      var active = chip.querySelector('[data-i18n="' + lang() + '"]');
      return (active || chip).textContent.trim();
    }

    chips.forEach(function(chip){
      chip.addEventListener('click', function(){
        chips.forEach(function(c){ c.classList.remove('selected'); });
        chip.classList.add('selected');
        state.serviceChip = chip;
        state.service = chipLabel(chip);
      });
    });

    if(dateInput){
      var today = new Date();
      var minD = new Date(today.getTime() + 24*3600*1000);
      var maxD = new Date(today.getTime() + 45*24*3600*1000);
      dateInput.min = minD.toISOString().slice(0,10);
      dateInput.max = maxD.toISOString().slice(0,10);

      dateInput.addEventListener('change', function(){
        state.date = dateInput.value;
        state.time = null;
        renderSlots();
      });
    }

    function renderSlots(){
      if(!state.date){ slotsBox.innerHTML = ''; return; }
      var day = new Date(state.date + 'T00:00:00').getDay();
      var t = T[lang()];
      if(day === 0){
        slotsBox.innerHTML = '<div class="empty-note">' + t.noSlots + '</div>';
        return;
      }
      var slots = slotsForDate(state.date);
      var html = '<div class="slots">' + slots.map(function(s){
        var cls = 'slot' + (s.taken ? ' taken' : '');
        return '<button type="button" class="' + cls + '" data-time="' + s.time + '"' + (s.taken ? ' disabled' : '') + '>' + s.time + '</button>';
      }).join('') + '</div>';
      slotsBox.innerHTML = html;
      slotsBox.querySelectorAll('.slot:not(.taken)').forEach(function(btn){
        btn.addEventListener('click', function(){
          slotsBox.querySelectorAll('.slot').forEach(function(s){ s.classList.remove('selected'); });
          btn.classList.add('selected');
          state.time = btn.getAttribute('data-time');
          goToForm();
        });
      });
    }

    function goToForm(){
      chosenSlotEl.textContent = formatDate(state.date) + ' · ' + state.time;
      stepDate.classList.add('hidden');
      stepForm.classList.remove('hidden');
      setProgress(1);
      stepForm.scrollIntoView({behavior:'smooth', block:'center'});
    }

    if(backBtn){
      backBtn.addEventListener('click', function(){
        stepForm.classList.add('hidden');
        stepDate.classList.remove('hidden');
        setProgress(0);
      });
    }

    var MONTHS = {
      ka:['იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი','ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'],
      ru:['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
    };
    function formatDate(iso){
      var d = new Date(iso + 'T00:00:00');
      var months = MONTHS[lang()] || MONTHS.ka;
      return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    }

    function validPhone(v){
      var digits = v.replace(/[^\d+]/g,'');
      return digits.replace(/\D/g,'').length >= 9;
    }

    if(submitBtn){
      submitBtn.addEventListener('click', function(e){
        e.preventDefault();
        var t = T[lang()];
        var name = nameInput.value.trim();
        var phone = phoneInput.value.trim();
        errorEl.style.display = 'none';

        if(!name || !phone){
          errorEl.textContent = t.fillRequired;
          errorEl.style.display = 'block';
          return;
        }
        if(!validPhone(phone)){
          errorEl.textContent = t.invalidPhone;
          errorEl.style.display = 'block';
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = t.sending;

        submitBooking({ service:state.service, date:state.date, time:state.time, name:name, phone:phone })
          .then(function(){ showConfirm(name, phone); })
          .catch(function(){
            errorEl.textContent = t.invalidPhone;
            errorEl.style.display = 'block';
          })
          .finally(function(){
            submitBtn.disabled = false;
          });
      });
    }

    function showConfirm(name, phone){
      var t = T[lang()];
      summaryEl.innerHTML =
        '<div><b>' + t.summaryService + ':</b> ' + (state.service || t.notChosen) + '</div>' +
        '<div><b>' + t.summaryDate + ':</b> ' + formatDate(state.date) + '</div>' +
        '<div><b>' + t.summaryTime + ':</b> ' + state.time + '</div>' +
        '<div><b>' + t.summaryName + ':</b> ' + name + '</div>' +
        '<div><b>' + t.summaryPhone + ':</b> ' + phone + '</div>';
      stepForm.classList.add('hidden');
      stepConfirm.classList.remove('hidden');
      setProgress(2);
      stepConfirm.scrollIntoView({behavior:'smooth', block:'center'});
    }

    /* Stage-2 hook: replace this stub with a real request to STAFF / Sheets / CRM. */
    function submitBooking(payload){
      return new Promise(function(resolve){
        setTimeout(resolve, 700);
      });
    }

    document.addEventListener('emg:langchange', function(){
      if(state.date) renderSlots();
      if(state.serviceChip) state.service = chipLabel(state.serviceChip);
      if(!stepForm.classList.contains('hidden') && state.date && state.time){
        chosenSlotEl.textContent = formatDate(state.date) + ' · ' + state.time;
      }
    });
  });
})();
