let localDB = null;
let isManualMode = false;
let alarmTimer = null;
let nextPrayerTimer = null;
let isArabic = true;
let prayerDetails = {
  Fajr: "صلاة الفجر هي أول الصلوات الخمس المفروضة، ووقتها من طلوع الفجر الصادق إلى شروق الشمس. عدد ركعاتها ركعتان.",
  Sunrise: "وقت الشروق هو بداية طلوع الشمس، وفيه ينتهي وقت صلاة الفجر ويبدأ وقت النهي عن الصلاة حتى ترتفع الشمس.",
  Dhuhr: "صلاة الظهر هي الصلاة الثانية، ووقتها يبدأ عندما تزول الشمس عن كبد السماء (منتصف النهار) وينتهي عندما يصير ظل كل شيء مثله. عدد ركعاتها أربع ركعات.",
  Asr: "صلاة العصر هي الصلاة الثالثة، ووقتها يبدأ عندما يصير ظل الشيء مثله وينتهي بغروب الشمس. عدد ركعاتها أربع ركعات.",
  Maghrib: "صلاة المغرب هي الصلاة الرابعة، ووقتها يبدأ بعد غروب الشمس مباشرة وينتهي باختفاء الشفق الأحمر. عدد ركعاتها ثلاث ركعات.",
  Isha: "صلاة العشاء هي الصلاة الخامسة، ووقتها يبدأ بعد مغيب الشفق الأحمر وينتهي بمنتصف الليل. عدد ركعاتها أربع ركعات."
};

// دالة لتحميل قاعدة البيانات المحلية
async function loadLocalDB() {
  if (localDB) return;
  
  try {
    const response = await fetch('l0.json');
    if (!response.ok) throw new Error(`فشل تحميل الملف: ${response.status}`);
    
    localDB = await response.json();
    populateCountries();
    if (isManualMode) updateCityDropdown();
  } catch (error) {
    console.error('فشل تحميل قاعدة البيانات المحلية:', error);
    handleError('فشل تحميل البيانات المحلية. الرجاء التحقق من اتصال الإنترنت ثم إعادة التحميل.');
    localDB = { locations: [], countries: [] };
  }
}

// دالة لتعبئة قائمة الدول
function populateCountries() {
  if (!localDB?.countries) return;
  
  const countrySelector = document.getElementById('countrySelect');
  countrySelector.innerHTML = '<option value="">-- اختر الدولة --</option>';
  
  try {
    const uniqueCountries = {};
    localDB.locations.forEach(location => {
      if (!uniqueCountries[location.country_code]) {
        const country = localDB.countries.find(c => c.code1 === location.country_code);
        if (country) uniqueCountries[location.country_code] = isArabic ? country.ar_country : country.en_country;
      }
    });
    
    Object.keys(uniqueCountries).forEach(code => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = uniqueCountries[code];
      countrySelector.appendChild(option);
    });
  } catch (error) {
    console.error('خطأ في تعبئة الدول:', error);
    handleError('حدث خطأ أثناء تحميل قائمة الدول');
  }
}

// دالة لتحديث قائمة المدن بناءً على الدولة
function updateCityDropdown() {
  const countryCode = document.getElementById('countrySelect').value;
  const citySelector = document.getElementById('citySelect');
  citySelector.innerHTML = '<option value="">-- اختر المدينة --</option>';

  if (!localDB?.locations) return;

  try {
    if (countryCode) {
      const cities = localDB.locations.filter(loc => loc.country_code === countryCode);
      cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.id;
        option.textContent = isArabic ? city.ar_city : city.en_city;
        citySelector.appendChild(option);
      });
    }
  } catch (error) {
    console.error('خطأ في تعبئة المدن:', error);
    handleError('حدث خطأ أثناء تحميل قائمة المدن');
  }
}

// دالة لتحويل الوقت من 24 إلى 12 ساعة
function formatTime24To12(time24) {
  if (!time24 || typeof time24 !== 'string') return "--:--";
  const parts = time24.split(':');
  if (parts.length < 2) return "--:--";
  
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return "--:--";
  
  const period = hours >= 12 ? (isArabic ? 'م' : 'PM') : (isArabic ? 'ص' : 'AM');
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}

// دالة لحفظ واسترجاع طريقة الحساب
function saveMethodToLocalStorage(method) {
  localStorage.setItem('selectedMethod', method);
}
function getSavedMethod() {
  return localStorage.getItem('selectedMethod') || '0';
}

// دالة للحصول على أوقات الصلاة الافتراضية
function getFallbackTimes() {
  return {
    Fajr: "05:00",
    Sunrise: "06:00",
    Dhuhr: "12:00",
    Asr: "15:00",
    Maghrib: "18:00",
    Isha: "19:30"
  };
}

// دالة للحصول على الموقع الجغرافي
function getLocation() {
  if (!navigator.geolocation) {
    handleError(isArabic ? '🚫 المتصفح لا يدعم خدمة الموقع' : '🚫 Browser does not support geolocation');
    fetchPrayerTimes({ latitude: 24.7136, longitude: 46.6753 });
    return;
  }

  document.getElementById('error').innerHTML = '';

  if (isManualMode) {
    const selectedId = document.getElementById('citySelect').value;
    if (selectedId) {
      const city = localDB.locations.find(loc => loc.id == selectedId);
      if (city) {
        updateUI(city.prayerTimes || getFallbackTimes(), isArabic ? city.ar_city : city.en_city);
        return;
      }
    }
  }

  document.getElementById('loading').style.display = 'flex';
  navigator.geolocation.getCurrentPosition(
    position => fetchPrayerTimes(position.coords),
    error => {
      handleError(isArabic ? '❗ الرجاء تفعيل خدمة الموقع' : '❗ Please enable location services');
      fetchPrayerTimes({ latitude: 24.7136, longitude: 46.6753 });
    }
  );
}

// دالة لجلب أوقات الصلاة
async function fetchPrayerTimes(coords) {
  const method = document.getElementById('calculationMethod').value;
  saveMethodToLocalStorage(method);

  try {
    if (!navigator.onLine) {
      document.getElementById('offlineNotice').style.display = 'flex';
      if (!localDB) throw new Error(isArabic ? 'لا توجد بيانات محلية متاحة' : 'No local data available');

      if (isManualMode && document.getElementById('citySelect').value) {
        const selectedId = document.getElementById('citySelect').value;
        const city = localDB.locations.find(loc => loc.id == selectedId);
        if (city) {
          updateUI(city.prayerTimes || getFallbackTimes(), isArabic ? city.ar_city : city.en_city);
          return;
        }
      }

      let nearestCity = null;
      if (localDB.locations) {
        let minDistance = Infinity;
        localDB.locations.forEach(location => {
          const distance = Math.sqrt(
            Math.pow(location.lat - coords.latitude, 2) +
            Math.pow(location.loong - coords.longitude, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestCity = location;
          }
        });
      }

      if (nearestCity) {
        updateUI(nearestCity.prayerTimes || getFallbackTimes(), isArabic ? nearestCity.ar_city : nearestCity.en_city);
      } else {
        throw new Error(isArabic ? 'لا توجد بيانات للمدينة الحالية' : 'No data for current location');
      }
      return;
    }

    document.getElementById('offlineNotice').style.display = 'none';
    const locationRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`);
    if (!locationRes.ok) throw new Error(isArabic ? 'فشل في الحصول على اسم الموقع' : 'Failed to get location name');
    
    const locationData = await locationRes.json();
    const city = encodeURIComponent(locationData.address.city || locationData.address.town || 'Sanaa');
    const country = encodeURIComponent(locationData.address.country || 'Yemen');
    const cacheKey = `${city}-${country}-method${method}`;

    const stored = JSON.parse(localStorage.getItem(cacheKey));
    if (stored) {
      updateUI(stored.data, city);
      return;
    }

    const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=${method}`);
    if (!response.ok) throw new Error(isArabic ? 'فشل في جلب أوقات الصلاة' : 'Failed to fetch prayer times');
    
    const data = await response.json();
    if (data.code === 200) {
      const prayerData = data.data.timings;
      localStorage.setItem(cacheKey, JSON.stringify({ data: prayerData, timestamp: Date.now() }));
      
      // إضافة وقت الشروق إذا لم يكن موجوداً
      if (!prayerData.Sunrise) {
        prayerData.Sunrise = data.data.meta.sunrise || "06:00";
      }
      
      updateUI(prayerData, city);
    } else {
      throw new Error(isArabic ? 'حدث خطأ في جلب البيانات من الخادم' : 'Server error while fetching data');
    }
  } catch (error) {
    console.error('Error:', error);
    if (error.message.includes('Could not establish connection')) return;
    
    if (navigator.onLine) {
      handleError((isArabic ? '❌ خطأ في الاتصال بالخادم: ' : '❌ Server connection error: ') + error.message);
    } else {
      handleError(isArabic ? '📡 تم التبديل للوضع دون اتصال' : '📡 Switched to offline mode');
      updateUI(getFallbackTimes(), isArabic ? 'الموقع الحالي' : 'Current Location');
    }
  }
}

// دالة لتحديث واجهة المستخدم بأوقات الصلاة
function updateUI(timings, locationName = '') {
  try {
    const prayerTimesDiv = document.getElementById('prayerTimes');
    prayerTimesDiv.innerHTML = '';

    // إزالة أي عنصر موقع سابق
    const container = document.querySelector('.container');
    const oldLocationDisplay = container.querySelector('.location-display');
    if (oldLocationDisplay) oldLocationDisplay.remove();

    const prayerOrder = [
      { key: 'Fajr', name: isArabic ? 'الفجر 🌅' : 'Fajr 🌅' },
      { key: 'Sunrise', name: isArabic ? 'الشروق ☀️' : 'Sunrise ☀️' },
      { key: 'Dhuhr', name: isArabic ? 'الظهر ☀️' : 'Dhuhr ☀️' },
      { key: 'Asr', name: isArabic ? 'العصر ⛅' : 'Asr ⛅' },
      { key: 'Maghrib', name: isArabic ? 'المغرب 🌇' : 'Maghrib 🌇' },
      { key: 'Isha', name: isArabic ? 'العشاء 🌙' : 'Isha 🌙' }
    ];

    // البحث عن الصلاة التالية
    const now = new Date();
    let nextPrayer = null;
    let minDiff = Infinity;

    prayerOrder.forEach(prayer => {
      const timeStr = timings[prayer.key];
      const [hours, minutes] = timeStr.split(':').map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(hours, minutes, 0, 0);
      
      // إذا كانت الصلاة بعد الوقت الحالي
      if (prayerTime > now) {
        const diff = prayerTime - now;
        if (diff < minDiff) {
          minDiff = diff;
          nextPrayer = prayer;
        }
      }
    });

    // تحديث عنوان الصلاة التالية
    if (nextPrayer) {
      document.getElementById('nextPrayerName').textContent = nextPrayer.name;
    } else {
      // إذا لم توجد صلاة قادمة، نعتبر الفجر هو التالي
      document.getElementById('nextPrayerName').textContent = prayerOrder[0].name;
      nextPrayer = prayerOrder[0];
    }

    // تحديث الوقت المتبقي للصلاة التالية
    updateNextPrayerCountdown(timings[nextPrayer.key]);

    prayerOrder.forEach(prayer => {
      const timeValue = timings[prayer.key] ? formatTime24To12(timings[prayer.key]) : '--:--';
      
      const card = document.createElement('div');
      card.className = 'prayer-card';
      if (prayer.key === nextPrayer.key) {
        card.classList.add('next');
      }
      
      card.innerHTML = `
        <h3>${prayer.name}</h3>
        <div class="prayer-time">${timeValue}</div>
      `;
      
      // إضافة حدث النقر لعرض معلومات الصلاة
      card.addEventListener('click', () => {
        // إزالة الفعالية من جميع البطاقات
        document.querySelectorAll('.prayer-card').forEach(c => c.classList.remove('active'));
        // إضافة الفعالية للبطاقة المختارة
        card.classList.add('active');
        // عرض معلومات الصلاة
        document.getElementById('prayerDetails').innerHTML = `
          <h4>${prayer.name}</h4>
          <p>${isArabic ? prayerDetails[prayer.key] : getEnglishPrayerDetails(prayer.key)}</p>
          <p><strong>${isArabic ? 'الوقت:' : 'Time:'}</strong> ${timeValue}</p>
        `;
      });
      
      prayerTimesDiv.appendChild(card);
    });

    // إذا لم يتم تحديد أي بطاقة، نحدد بطاقة الصلاة التالية
    if (nextPrayer) {
      setTimeout(() => {
        const nextCard = prayerTimesDiv.querySelector('.next');
        if (nextCard) {
          nextCard.click();
        }
      }, 100);
    }

    // إضافة اسم الموقع
    if (locationName) {
      const locationElement = document.createElement('div');
      locationElement.className = 'location-display';
      locationElement.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${isArabic ? 'موقعك: ' : 'Your location: '}${locationName}`;
      prayerTimesDiv.parentNode.insertBefore(locationElement, prayerTimesDiv);
    }

    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').innerHTML = '';
    
    // إعداد التنبيهات
    setupAlarms(timings);
  } catch (error) {
    console.error('خطأ في تحديث الواجهة:', error);
    handleError(isArabic ? 'حدث خطأ أثناء عرض أوقات الصلاة' : 'Error displaying prayer times');
  }
}

// دالة لتحديث الوقت المتبقي للصلاة التالية
function updateNextPrayerCountdown(prayerTime) {
  clearInterval(nextPrayerTimer);
  
  function updateCountdown() {
    const now = new Date();
    const [hours, minutes] = prayerTime.split(':').map(Number);
    const prayerDate = new Date();
    prayerDate.setHours(hours, minutes, 0, 0);
    
    // إذا كان وقت الصلاة قد مضى، نضيف يوم كامل
    if (prayerDate < now) {
      prayerDate.setDate(prayerDate.getDate() + 1);
    }
    
    const diff = prayerDate - now;
    const hoursRemaining = Math.floor(diff / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secondsRemaining = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('timeRemaining').textContent = 
      `${hoursRemaining.toString().padStart(2, '0')}:${minutesRemaining.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`;
  }
  
  updateCountdown();
  nextPrayerTimer = setInterval(updateCountdown, 1000);
}

// دالة لإعداد التنبيهات
function setupAlarms(timings) {
  // إلغاء أي تنبيهات سابقة
  if (alarmTimer) clearTimeout(alarmTimer);

  // التحقق من تفعيل التنبيه
  const alarmToggle = document.getElementById('alarmToggle');
  if (!alarmToggle || !alarmToggle.checked) return;

  const alarmMinutes = parseInt(document.getElementById('alarmMinutes').value) || 15;
  
  // الحصول على الأوقات الحالية
  const now = new Date();
  
  // البحث عن الصلاة التالية
  const prayerTimes = [
    { key: 'Fajr', time: timings.Fajr },
    { key: 'Dhuhr', time: timings.Dhuhr },
    { key: 'Asr', time: timings.Asr },
    { key: 'Maghrib', time: timings.Maghrib },
    { key: 'Isha', time: timings.Isha }
  ].map(prayer => {
    const [hours, minutes] = prayer.time.split(':').map(Number);
    const timeDate = new Date();
    timeDate.setHours(hours, minutes, 0, 0);
    return { name: prayer.key, time: timeDate };
  });

  // تصفية الأوقات التي لم تمر بعد
  const upcomingPrayers = prayerTimes.filter(prayer => prayer.time > now);
  
  if (upcomingPrayers.length > 0) {
    // نأخذ أقرب صلاة
    const nextPrayer = upcomingPrayers.sort((a, b) => a.time - b.time)[0];
    
    // حساب الوقت المتبقي حتى التنبيه (قبل الصلاة بـ alarmMinutes دقيقة)
    const alarmTime = new Date(nextPrayer.time.getTime() - alarmMinutes * 60000);
    const timeUntilAlarm = alarmTime - now;
    
    if (timeUntilAlarm > 0) {
      alarmTimer = setTimeout(() => {
        showAlarmNotification(nextPrayer.name);
      }, timeUntilAlarm);
    }
  }
}

// دالة لعرض تنبيه
function showAlarmNotification(prayerName) {
  const prayerNames = {
    Fajr: isArabic ? 'الفجر' : 'Fajr',
    Dhuhr: isArabic ? 'الظهر' : 'Dhuhr',
    Asr: isArabic ? 'العصر' : 'Asr',
    Maghrib: isArabic ? 'المغرب' : 'Maghrib',
    Isha: isArabic ? 'العشاء' : 'Isha'
  };
  
  const message = isArabic ? 
    `تبقى 15 دقيقة لصلاة ${prayerNames[prayerName]}` : 
    `15 minutes until ${prayerNames[prayerName]} prayer`;
  
  // يمكن استخدام Notification API إذا كان مدعوماً
  if (!("Notification" in window)) {
    alert(message);
  } else if (Notification.permission === "granted") {
    new Notification(isArabic ? 'موعد الصلاة' : 'Prayer Time', { body: message });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(isArabic ? 'موعد الصلاة' : 'Prayer Time', { body: message });
      }
    });
  }
}

// دالة لعرض الأخطاء
function handleError(message) {
  document.getElementById('loading').style.display = 'none';
  const errorDiv = document.getElementById('error');
  if (errorDiv) errorDiv.innerHTML = `🚨 ${message}`;
}

// دالة لتحديث التاريخ والوقت الحالي
function updateDateTime() {
  const now = new Date();
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  
  const dateTimeStr = isArabic ? 
    now.toLocaleDateString('ar-SA', options) :
    now.toLocaleDateString('en-US', { ...options, weekday: 'long' });
  
  document.getElementById('currentDateTime').textContent = dateTimeStr;
}

// دالة لتحديث التاريخ الهجري
function updateHijriDate() {
  const today = new Date();
  const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(today);
  
  document.getElementById('hijriDate').textContent = hijri;
}

// دالة للحصول على تفاصيل الصلاة بالإنجليزية
function getEnglishPrayerDetails(prayerKey) {
  const details = {
    Fajr: "Fajr is the first of the five daily prayers. Its time begins at true dawn and ends at sunrise. It consists of 2 rak'ahs.",
    Sunrise: "Sunrise marks the end of Fajr prayer time and the beginning of the time when voluntary prayers are prohibited until the sun has risen.",
    Dhuhr: "Dhuhr is the second prayer. Its time begins when the sun has passed its zenith and ends when the shadow of an object becomes equal to its length. It consists of 4 rak'ahs.",
    Asr: "Asr is the third prayer. Its time begins when the shadow of an object becomes equal to its length and ends at sunset. It consists of 4 rak'ahs.",
    Maghrib: "Maghrib is the fourth prayer. Its time begins immediately after sunset and ends when the red twilight disappears. It consists of 3 rak'ahs.",
    Isha: "Isha is the fifth prayer. Its time begins after the disappearance of the red twilight and ends at midnight. It consists of 4 rak'ahs."
  };
  
  return details[prayerKey] || "Prayer information not available.";
}

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
  // تحديث التاريخ والوقت
  updateDateTime();
  setInterval(updateDateTime, 1000);
  
  // تحديث التاريخ الهجري
  updateHijriDate();
  setInterval(updateHijriDate, 24 * 60 * 60 * 1000);
  
  // معالجة تغيير اللغة
  document.getElementById('langAr').addEventListener('click', () => {
    isArabic = true;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('langAr').classList.add('active');
    // إعادة تحميل الواجهة
    getLocation();
    translateUI();
  });
  
  document.getElementById('langEn').addEventListener('click', () => {
    isArabic = false;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('langEn').classList.add('active');
    // إعادة تحميل الواجهة
    getLocation();
    translateUI();
  });
  
  // ترجمة الواجهة عند التحميل
  translateUI();
  
  const modeSelector = document.getElementById('modeSelect');
  if (!modeSelector) return;
  
  const savedMode = localStorage.getItem('selectedMode') || 'auto';
  modeSelector.value = savedMode;
  isManualMode = savedMode === 'manual';
  
  const manualControls = document.getElementById('manualControls');
  if (manualControls) manualControls.style.display = isManualMode ? 'block' : 'none';
  
  const calcMethod = document.getElementById('calculationMethod');
  if (calcMethod) calcMethod.value = getSavedMethod();
  
  await loadLocalDB();
  getLocation();
});

// دالة لترجمة واجهة المستخدم
function translateUI() {
  document.getElementById('modeSelect').options[0].text = isArabic ? 'تلقائي' : 'Automatic';
  document.getElementById('modeSelect').options[1].text = isArabic ? 'يدوي' : 'Manual';
  
  document.querySelector('.mode-selector label').innerHTML = 
    isArabic ? '<i class="fas fa-cog"></i> اختر الوضع:' : '<i class="fas fa-cog"></i> Select Mode:';
  
  document.querySelector('.method-selector label').innerHTML = 
    isArabic ? '<i class="fas fa-calculator"></i> طريقة الحساب:' : '<i class="fas fa-calculator"></i> Calculation Method:';
  
  document.getElementById('calculationMethod').options[0].text = isArabic ? 'رابطة العالم الإسلامي' : 'Muslim World League';
  document.getElementById('calculationMethod').options[1].text = isArabic ? 'الهيئة المصرية العامة للمساحة' : 'Egyptian General Authority';
  document.getElementById('calculationMethod').options[2].text = isArabic ? 'الجامعة الإسلامية في كراتشي' : 'University of Islamic Sciences, Karachi';
  document.getElementById('calculationMethod').options[3].text = isArabic ? 'مجلس الإفتاء الأوروبي' : 'European Council for Fatwa and Research';
  document.getElementById('calculationMethod').options[4].text = isArabic ? 'مجلس الفقه بأمريكا الشمالية' : 'North American Fiqh Council';
  
  document.querySelectorAll('.method-selector label')[1].innerHTML = 
    isArabic ? '<i class="fas fa-globe-asia"></i> اختر الدولة:' : '<i class="fas fa-globe-asia"></i> Select Country:';
  
  document.querySelectorAll('.method-selector label')[2].innerHTML = 
    isArabic ? '<i class="fas fa-city"></i> اختر المدينة:' : '<i class="fas fa-city"></i> Select City:';
  
  document.getElementById('countrySelect').options[0].text = isArabic ? '-- اختر الدولة --' : '-- Select Country --';
  document.getElementById('citySelect').options[0].text = isArabic ? '-- اختر المدينة --' : '-- Select City --';
  
  document.querySelector('.alarm-settings h3').innerHTML = 
    isArabic ? '<i class="fas fa-bell"></i> إعدادات التنبيه' : '<i class="fas fa-bell"></i> Alarm Settings';
  
  document.querySelector('.alarm-controls label[for="alarmToggle"]').textContent = 
    isArabic ? 'تفعيل التنبيه:' : 'Enable Alarm:';
  
  document.querySelector('.alarm-controls label[for="alarmMinutes"]').textContent = 
    isArabic ? 'دقائق قبل الصلاة:' : 'Minutes before prayer:';
  
  document.querySelector('.prayer-info h3').innerHTML = 
    isArabic ? '<i class="fas fa-info-circle"></i> معلومات عن الصلاة' : '<i class="fas fa-info-circle"></i> Prayer Information';
  
  document.getElementById('nextPrayerTitle').innerHTML = 
    isArabic ? 'الصلاة التالية: <span id="nextPrayerName">--</span>' : 'Next Prayer: <span id="nextPrayerName">--</span>';
  
  document.getElementById('appVersion').textContent = 
    isArabic ? 'الإصدار 2.0' : 'Version 2.0';
}

// معالجات الأحداث
document.getElementById('calculationMethod')?.addEventListener('change', () => getLocation());
document.getElementById('countrySelect')?.addEventListener('change', () => {
  updateCityDropdown();
  const citySelector = document.getElementById('citySelect');
  if (citySelector?.options.length > 1) {
    citySelector.value = citySelector.options[1].value;
    getLocation();
  }
});
document.getElementById('citySelect')?.addEventListener('change', () => getLocation());

document.getElementById('modeSelect')?.addEventListener('change', (e) => {
  isManualMode = e.target.value === 'manual';
  localStorage.setItem('selectedMode', e.target.value);
  
  const manualControls = document.getElementById('manualControls');
  if (manualControls) manualControls.style.display = isManualMode ? 'block' : 'none';
  
  if (isManualMode) {
    loadLocalDB().then(() => {
      const countrySelector = document.getElementById('countrySelect');
      if (countrySelector?.options.length > 1) {
        countrySelector.value = countrySelector.options[1].value;
        updateCityDropdown();
      }
    });
  } else {
    getLocation();
  }
});

// معالجة تغيير إعدادات التنبيه
document.getElementById('alarmToggle')?.addEventListener('change', () => {
  // عند تفعيل/إلغاء التنبيه، نعيد تحميل الأوقات لإعادة حساب التنبيهات
  getLocation();
});
document.getElementById('alarmMinutes')?.addEventListener('change', () => {
  getLocation();
});

// مراقبة حالة الاتصال
window.addEventListener('online', () => {
  document.getElementById('offlineNotice').style.display = 'none';
  getLocation();
});
window.addEventListener('offline', () => {
  document.getElementById('offlineNotice').style.display = 'flex';
  getLocation();
});