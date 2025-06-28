const CONSTANTS = {
  LOCAL_DB_URL: 'l0.json',
  STORAGE_KEY_SELECTED_METHOD: 'selectedMethod',
  STORAGE_KEY_SELECTED_MODE: 'selectedMode',
  DEFAULT_CALCULATION_METHOD: '0',
  DEFAULT_MODE: 'auto',
  DOM_IDS: {
    PRAYER_TIMES: 'prayerTimes',
    LOADING: 'loading',
    ERROR: 'error',
    COUNTRY_SELECT: 'countrySelect',
    CITY_SELECT: 'citySelect',
    CALCULATION_METHOD: 'calculationMethod',
    OFFLINE_NOTICE: 'offlineNotice',
    NEXT_PRAYER_NAME: 'nextPrayerName',
    TIME_REMAINING: 'timeRemaining',
    PRAYER_DETAILS: 'prayerDetails',
    CURRENT_DATE_TIME: 'currentDateTime',
    HIJRI_DATE: 'hijriDate',
    LANG_AR: 'langAr',
    LANG_EN: 'langEn',
    MODE_SELECT: 'modeSelect',
    MANUAL_CONTROLS: 'manualControls',
    ALARM_TOGGLE: 'alarmToggle',
    ALARM_MINUTES: 'alarmMinutes',
    NEXT_PRAYER_TITLE: 'nextPrayerTitle',
    APP_VERSION: 'appVersion'
  },
  CLASSES: {
    PRAYER_CARD: 'prayer-card',
    NEXT_PRAYER_CARD: 'next',
    ACTIVE_CARD: 'active',
    LOCATION_DISPLAY: 'location-display',
    LANG_BUTTON: 'lang-btn',
    PRAYER_TIME_CLASS: 'prayer-time', // Added
    CONTAINER_CLASS: 'container' // Added
  },
  CACHE_DURATION_MS: 24 * 60 * 60 * 1000, // 24 hours
  PRAYER_ORDER: [
    { key: 'Fajr', nameKey: 'Fajr' }, // nameKey will be used with getTranslation
    { key: 'Sunrise', nameKey: 'Sunrise' },
    { key: 'Dhuhr', nameKey: 'Dhuhr' },
    { key: 'Asr', nameKey: 'Asr' },
    { key: 'Maghrib', nameKey: 'Maghrib' },
    { key: 'Isha', nameKey: 'Isha' }
  ],
  MODES: {
    AUTO: 'auto',
    MANUAL: 'manual'
  },
  API_URLS: {
    NOMINATIM_REVERSE: 'https://nominatim.openstreetmap.org/reverse',
    ALADHAN_TIMINGS_BY_CITY: 'https://api.aladhan.com/v1/timingsByCity'
  },
  DEFAULTS: {
    API_FALLBACK_CITY_AR: 'صنعاء',
    API_FALLBACK_CITY_EN: 'Sanaa',
    API_FALLBACK_COUNTRY_AR: 'اليمن',
    API_FALLBACK_COUNTRY_EN: 'Yemen',
    SUNRISE_FALLBACK: '06:00'
  },
  UI_STRINGS: {
    INVALID_TIME: '--:--',
    INITIAL_COUNTDOWN: '--:--:--'
  },
  API_PARAMS: { // Added
    FORMAT_JSON: 'format=json'
  },
  ATTRIBUTES: { // Added
    TABINDEX: 'tabindex',
    ROLE: 'role',
    ARIA_LABEL: 'aria-label',
    ARIA_CURRENT: 'aria-current',
    ARIA_PRESSED: 'aria-pressed'
  },
  EVENTS: { // Added
    DOM_CONTENT_LOADED: 'DOMContentLoaded',
    CLICK: 'click',
    KEYDOWN: 'keydown',
    CHANGE: 'change',
    ONLINE: 'online',
    OFFLINE: 'offline'
  },
  KEYS: { // Added
    ENTER: 'Enter',
    SPACE: ' '
  },
  DOCUMENT_DIRECTIONS: { // Added
    RTL: 'rtl',
    LTR: 'ltr'
  },
  LOCALES: { // Added
    AR_SA: 'ar-SA',
    EN_US: 'en-US',
    AR_SA_ISLAMIC: 'ar-SA-u-ca-islamic'
  }
};

let localDB = null;
let isManualMode = false;
let alarmTimer = null;
let nextPrayerTimer = null;
let isArabic = true;

const translations = {
  ar: {
    // Prayer Names & Details
    Fajr: "الفجر 🌅",
    Fajr_details: "صلاة الفجر هي أول الصلوات الخمس المفروضة، ووقتها من طلوع الفجر الصادق إلى شروق الشمس. عدد ركعاتها ركعتان.",
    Sunrise: "الشروق ☀️",
    Sunrise_details: "وقت الشروق هو بداية طلوع الشمس، وفيه ينتهي وقت صلاة الفجر ويبدأ وقت النهي عن الصلاة حتى ترتفع الشمس.",
    Dhuhr: "الظهر ☀️",
    Dhuhr_details: "صلاة الظهر هي الصلاة الثانية، ووقتها يبدأ عندما تزول الشمس عن كبد السماء (منتصف النهار) وينتهي عندما يصير ظل كل شيء مثله. عدد ركعاتها أربع ركعات.",
    Asr: "العصر ⛅",
    Asr_details: "صلاة العصر هي الصلاة الثالثة، ووقتها يبدأ عندما يصير ظل الشيء مثله وينتهي بغروب الشمس. عدد ركعاتها أربع ركعات.",
    Maghrib: "المغرب 🌇",
    Maghrib_details: "صلاة المغرب هي الصلاة الرابعة، ووقتها يبدأ بعد غروب الشمس مباشرة وينتهي باختفاء الشفق الأحمر. عدد ركعاتها ثلاث ركعات.",
    Isha: "العشاء 🌙",
    Isha_details: "صلاة العشاء هي الصلاة الخامسة، ووقتها يبدأ بعد مغيب الشفق الأحمر وينتهي بمنتصف الليل. عدد ركعاتها أربع ركعات.",
    // UI Elements
    autoMode: 'تلقائي',
    manualMode: 'يدوي',
    selectMode: '<i class="fas fa-cog"></i> اختر الوضع:',
    calculationMethod: '<i class="fas fa-calculator"></i> طريقة الحساب:',
    selectCountry: '<i class="fas fa-globe-asia"></i> اختر الدولة:',
    selectCity: '<i class="fas fa-city"></i> اختر المدينة:',
    countryOptionDefault: '-- اختر الدولة --',
    cityOptionDefault: '-- اختر المدينة --',
    alarmSettingsTitle: '<i class="fas fa-bell"></i> إعدادات التنبيه',
    enableAlarm: 'تفعيل التنبيه:',
    minutesBeforePrayer: 'دقائق قبل الصلاة:',
    prayerInfoTitle: '<i class="fas fa-info-circle"></i> معلومات عن الصلاة',
    nextPrayerIs: 'الصلاة التالية:',
    appVersion: 'الإصدار 2.0',
    prayerNotificationTitle: 'موعد الصلاة',
    alarmMessage: (prayerName) => `تبقى 15 دقيقة لصلاة ${prayerName}`,
    method0: 'رابطة العالم الإسلامي',
    method1: 'الهيئة المصرية العامة للمساحة',
    method2: 'الجامعة الإسلامية في كراتشي',
    method3: 'مجلس الإفتاء الأوروبي',
    method4: 'مجلس الفقه بأمريكا الشمالية',
    noNextPrayer: 'لا يوجد',
    yourLocation: 'موقعك: ',
    prayerTimePrefix: 'الوقت:',
    // Error Messages & Generic UI Text
    localDBLoadError: 'فشل تحميل قاعدة البيانات المحلية. الرجاء التأكد من وجود ملف l0.json أو إعادة تحميل الصفحة.',
    countryLoadError: 'حدث خطأ أثناء تحميل قائمة الدول.',
    cityLoadError: 'حدث خطأ أثناء تحميل قائمة المدن.',
    geolocationNotSupported: '🚫 المتصفح لا يدعم خدمة الموقع',
    enableLocationServices: '❗ الرجاء تفعيل خدمة الموقع',
    genericFetchError: (message) => `حدث خطأ غير متوقع أثناء جلب أوقات الصلاة ${message ? `(${message})` : ''}`,
    networkError: 'خطأ في الشبكة. الرجاء التحقق من اتصالك بالإنترنت.',
    errorFetchingOnlineData: (message) => `❌ خطأ في جلب البيانات عبر الإنترنت ${message ? ` (${message})` : ''}`,
    aladhanAPIErrorMsg: (message) => `خطأ من واجهة برمجة تطبيقات الأذان: ${message}`,
    aladhanFetchError: (status) => `فشل في جلب أوقات الصلاة من الخادم (رمز الخطأ: ${status})`,
    incompletePrayerData: 'بيانات أوقات الصلاة غير كاملة من الخادم. عرض الأوقات الافتراضية.',
    invalidAladhanData: 'بيانات غير صالحة من خادم أوقات الصلاة.',
    aladhanServerError: (status) => `خطأ من خادم أوقات الصلاة: ${status}`,
    displayUIError: 'حدث خطأ أثناء عرض أوقات الصلاة.',
    corruptedLocalData: (filename) => `ملف البيانات المحلي ${filename ? `(${filename})` : ''} تالف.`,
    noDataForCurrentLocationOffline: 'لا توجد بيانات للموقع الحالي في الوضع الأوفلاين.',
    currentLocation: 'الموقع الحالي',
    unknownName: 'اسم غير معروف',
    noNearbyCityOffline: 'لا توجد بيانات لمدينة قريبة في الوضع الأوفلاين',
    generalDefaultLocationName: 'الموقع الافتراضي',
  },
  en: {
    // Prayer Names & Details
    Fajr: "Fajr 🌅",
    Fajr_details: "Fajr is the first of the five daily prayers. Its time begins at true dawn and ends at sunrise. It consists of 2 rak'ahs.",
    Sunrise: "Sunrise ☀️",
    Sunrise_details: "Sunrise marks the end of Fajr prayer time and the beginning of the time when voluntary prayers are prohibited until the sun has risen.",
    Dhuhr: "Dhuhr ☀️",
    Dhuhr_details: "Dhuhr is the second prayer. Its time begins when the sun has passed its zenith and ends when the shadow of an object becomes equal to its length. It consists of 4 rak'ahs.",
    Asr: "Asr ⛅",
    Asr_details: "Asr is the third prayer. Its time begins when the shadow of an object becomes equal to its length and ends at sunset. It consists of 4 rak'ahs.",
    Maghrib: "Maghrib 🌇",
    Maghrib_details: "Maghrib is the fourth prayer. Its time begins immediately after sunset and ends when the red twilight disappears. It consists of 3 rak'ahs.",
    Isha: "Isha 🌙",
    Isha_details: "Isha is the fifth prayer. Its time begins after the disappearance of the red twilight and ends at midnight. It consists of 4 rak'ahs.",
    // UI Elements
    autoMode: 'Automatic',
    manualMode: 'Manual',
    selectMode: '<i class="fas fa-cog"></i> Select Mode:',
    calculationMethod: '<i class="fas fa-calculator"></i> Calculation Method:',
    selectCountry: '<i class="fas fa-globe-asia"></i> Select Country:',
    selectCity: '<i class="fas fa-city"></i> Select City:',
    countryOptionDefault: '-- Select Country --',
    cityOptionDefault: '-- Select City --',
    alarmSettingsTitle: '<i class="fas fa-bell"></i> Alarm Settings',
    enableAlarm: 'Enable Alarm:',
    minutesBeforePrayer: 'Minutes before prayer:',
    prayerInfoTitle: '<i class="fas fa-info-circle"></i> Prayer Information',
    nextPrayerIs: 'Next Prayer:',
    appVersion: 'Version 2.0',
    prayerNotificationTitle: 'Prayer Time',
    alarmMessage: (prayerName) => `15 minutes until ${prayerName} prayer`,
    method0: 'Muslim World League',
    method1: 'Egyptian General Authority',
    method2: 'University of Islamic Sciences, Karachi',
    method3: 'European Council for Fatwa and Research',
    method4: 'North American Fiqh Council',
    noNextPrayer: 'N/A',
    yourLocation: 'Your location: ',
    prayerTimePrefix: 'Time:',
    // Error Messages & Generic UI Text
    localDBLoadError: 'Failed to load local data. Please ensure l0.json is present or reload the page.',
    countryLoadError: 'Error loading country list.',
    cityLoadError: 'Error loading city list.',
    geolocationNotSupported: '🚫 Browser does not support geolocation.',
    enableLocationServices: '❗ Please enable location services.',
    genericFetchError: (message) => `An unexpected error occurred while fetching prayer times ${message ? `(${message})` : ''}`,
    networkError: 'Network error. Please check your internet connection.',
    errorFetchingOnlineData: (message) => `❌ Error fetching online data ${message ? ` (${message})` : ''}`,
    aladhanAPIErrorMsg: (message) => `Aladhan API Error: ${message}`,
    aladhanFetchError: (status) => `Failed to fetch prayer times from server (Error Code: ${status})`,
    incompletePrayerData: 'Incomplete prayer times data from server. Displaying fallback times.',
    invalidAladhanData: 'Invalid data from prayer times server.',
    aladhanServerError: (status) => `Prayer times server error: ${status}`,
    displayUIError: 'Error displaying prayer times.',
    corruptedLocalData: (filename) => `Local data file ${filename ? `(${filename})` : ''} is corrupted.`,
    noDataForCurrentLocationOffline: 'No data for the current location in offline mode.',
    currentLocation: 'Current Location',
    unknownName: 'Unknown Name',
    noNearbyCityOffline: 'No data for a nearby city in offline mode',
    generalDefaultLocationName: 'Default Location',
  }
};

/**
 * Retrieves a translated string based on the current language.
 * @param {string} key - The key of the translation string.
 * @param  {...any} args - Optional arguments to be passed to the translation function if it's a function.
 * @returns {string} The translated string, or the key itself if not found.
 */
function getTranslation(key, ...args) {
  const lang = isArabic ? 'ar' : 'en';
  const value = translations[lang][key];
  if (typeof value === 'function') {
    return value(...args);
  }
  return value || key; // Fallback to key if translation not found
}


// دالة لتحميل قاعدة البيانات المحلية

/**
 * Asynchronously loads the local city and country database from `CONSTANTS.LOCAL_DB_URL`.
 * The database is expected to be a JSON file containing locations and country information.
 * Once loaded, the data is stored in the global `localDB` variable.
 * Includes basic validation for the loaded data structure.
 *
 * @async
 * @returns {Promise<boolean>} A promise that resolves to `true` if the database is
 *                             successfully loaded and parsed, and `false` otherwise.
 *                             Displays an error message via `displayError` on failure.
 */
async function loadLocalDB() {
  if (localDB) return true; // Already loaded
  
  try {
    const response = await fetch(CONSTANTS.LOCAL_DB_URL);
    if (!response.ok) {
      // This error message will be caught by the try-catch in this function.
      // The displayError call below will then use the 'localDBLoadError' key.
      throw new Error(getTranslation('localDBLoadError'));
    }
    localDB = await response.json();
    if (!localDB || !localDB.locations || !localDB.countries) {
        throw new Error(getTranslation('corruptedLocalData', CONSTANTS.LOCAL_DB_URL));
    }
    return true;
  } catch (error) {
    console.error('Error loading local database:', error.message);
    // Display a generic message, but the error thrown might have a more specific one.
    displayError('localDBLoadError');
    localDB = null; // Ensure localDB is null on failure
    return false;
  }
}

// دالة لتعبئة قائمة الدول
/**
 * Populates the country selection dropdown (identified by `CONSTANTS.DOM_IDS.COUNTRY_SELECT`)
 * with countries from the `localDB`.
 * It ensures that each country is listed only once (based on presence in `localDB.locations`)
 * and uses the appropriate language (Arabic or English) based on the `isArabic` global variable.
 * If `localDB`, `localDB.countries`, or `localDB.locations` is not available, the function logs a warning
 * and does not proceed with populating the dropdown.
 *
 * @uses Global `localDB` for country and location data.
 * @uses Global `isArabic` for language selection.
 */
function populateCountries() {
  if (!localDB?.countries || !localDB?.locations) {
    console.warn("Cannot populate countries: localDB not fully loaded or missing data (countries/locations).");
    return;
  }
  
  const countrySelector = document.getElementById(CONSTANTS.DOM_IDS.COUNTRY_SELECT);
  countrySelector.innerHTML = `<option value="">${getTranslation('countryOptionDefault')}</option>`;
  
  try {
    const uniqueCountries = {};
    // Iterate over locations to find unique country codes that actually have cities
    localDB.locations.forEach(location => {
      if (location.country_code && !uniqueCountries[location.country_code]) {
        const countryData = localDB.countries.find(c => c.code1 === location.country_code);
        if (countryData) {
          uniqueCountries[location.country_code] = isArabic ? countryData.ar_country : countryData.en_country;
        }
      }
    });
    
    Object.entries(uniqueCountries).forEach(([code, name]) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = name;
      countrySelector.appendChild(option);
    });
  } catch (error) {
    console.error('Error populating countries:', error);
    displayError('countryLoadError');
  }
}

// دالة لتحديث قائمة المدن بناءً على الدولة
/**
 * Populates the city selection dropdown (identified by `CONSTANTS.DOM_IDS.CITY_SELECT`)
 * with cities belonging to the currently selected country in the country dropdown.
 * City names are displayed in Arabic or English based on the `isArabic` global variable.
 * If `localDB` or `localDB.locations` is not available, or if no country is selected,
 * the city dropdown will only contain a default option and a warning may be logged.
 *
 * @uses Global `localDB` for city data.
 * @uses Global `isArabic` for language selection.
 * @reads DOM element `CONSTANTS.DOM_IDS.COUNTRY_SELECT` to get the selected country code.
 */
function updateCityDropdown() {
  const countryCode = document.getElementById(CONSTANTS.DOM_IDS.COUNTRY_SELECT).value;
  const citySelector = document.getElementById(CONSTANTS.DOM_IDS.CITY_SELECT);
  citySelector.innerHTML = `<option value="">${getTranslation('cityOptionDefault')}</option>`;

  if (!localDB?.locations) {
     console.warn("Cannot update city dropdown: localDB.locations not available.");
     return;
  }

  try {
    if (countryCode) {
      const cities = localDB.locations.filter(loc => loc.country_code === countryCode);
      cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.id; // Assuming city.id is the unique identifier
        option.textContent = isArabic ? city.ar_city : city.en_city;
        citySelector.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error populating cities:', error);
    displayError('cityLoadError');
  }
}

// دالة لتحويل الوقت من 24 إلى 12 ساعة
/**
 * Formats a 24-hour time string to a 12-hour format with AM/PM.
 * Uses global `isArabic` to determine AM/PM symbols.
 * @param {string} time24 - The time in "HH:MM" format.
 * @returns {string} The formatted time string (e.g., "1:00 PM") or "--:--" if input is invalid.
 */
function formatTime24To12(time24) {
  if (!time24 || typeof time24 !== 'string') return CONSTANTS.UI_STRINGS.INVALID_TIME;
  const parts = time24.split(':');
  if (parts.length < 2) return CONSTANTS.UI_STRINGS.INVALID_TIME;
  
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return CONSTANTS.UI_STRINGS.INVALID_TIME;
  
  const period = hours >= 12 ? (isArabic ? 'م' : 'PM') : (isArabic ? 'ص' : 'AM');
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}

// دالة لحفظ واسترجاع طريقة الحساب
/**
 * Saves the selected calculation method to localStorage.
 * @param {string} method - The calculation method value (e.g., '0', '1').
 */
function saveMethodToLocalStorage(method) {
  localStorage.setItem(CONSTANTS.STORAGE_KEY_SELECTED_METHOD, method);
}

/**
 * Retrieves the saved calculation method from localStorage.
 * @returns {string} The saved method string or `CONSTANTS.DEFAULT_CALCULATION_METHOD` if none is saved.
 */
function getSavedMethod() {
  return localStorage.getItem(CONSTANTS.STORAGE_KEY_SELECTED_METHOD) || CONSTANTS.DEFAULT_CALCULATION_METHOD;
}

// دالة للحصول على أوقات الصلاة الافتراضية
/**
 * Provides a default set of prayer times for fallback purposes.
 * These times are used when API calls fail or no offline data is available.
 * @returns {object} An object where keys are prayer names (e.g., 'Fajr')
 *                   and values are their times in "HH:MM" format.
 */
function getFallbackTimes() {
  return {
    Fajr: "05:00",
    Sunrise: CONSTANTS.DEFAULTS.SUNRISE_FALLBACK,
    Dhuhr: "12:00",
    Asr: "15:00",
    Maghrib: "18:00",
    Isha: "19:30"
  };
}

// دالة للحصول على الموقع الجغرافي
/**
 * Initiates the process of getting the user's location (either geo or manual)
 * and then fetches prayer times.
 */
function getLocation() {
  if (!navigator.geolocation) {
    displayError('geolocationNotSupported');
    fetchPrayerTimes({ latitude: 24.7136, longitude: 46.6753 }); // Default location
    return;
  }

  document.getElementById(CONSTANTS.DOM_IDS.ERROR).innerHTML = '';

  if (isManualMode) {
    const selectedCityId = document.getElementById(CONSTANTS.DOM_IDS.CITY_SELECT).value;
    if (selectedCityId) {
      const city = localDB.locations.find(loc => loc.id == selectedCityId);
      if (city) {
        updateUI(city.prayerTimes || getFallbackTimes(), isArabic ? city.ar_city : city.en_city);
        return;
      }
    }
  }

  document.getElementById(CONSTANTS.DOM_IDS.LOADING).style.display = 'flex';
  navigator.geolocation.getCurrentPosition(
    position => fetchPrayerTimes(position.coords),
    error => {
      displayError('enableLocationServices');
      fetchPrayerTimes({ latitude: 24.7136, longitude: 46.6753 }); // Default location
    }
  );
}

// دالة لجلب أوقات الصلاة

/**
 * Fetches prayer times based on the user's coordinates and selected calculation method.
 * It determines whether to fetch data from the online API or use offline data based on
 * the browser's online status and availability of local data.
 * It manages loading indicators and calls `updateUI` upon successful data retrieval
 * or `displayError` if issues occur.
 *
 * @param {object} coords - An object containing `latitude` and `longitude` of the user.
 *                          Example: `{ latitude: 30.0444, longitude: 31.2357 }`.
 */
async function fetchPrayerTimes(coords) {
  const method = document.getElementById(CONSTANTS.DOM_IDS.CALCULATION_METHOD).value;
  saveMethodToLocalStorage(method);
  document.getElementById(CONSTANTS.DOM_IDS.LOADING).style.display = 'flex';


  try {
    if (!navigator.onLine) {
      await handleOfflineData(coords);
    } else {
      await fetchOnlinePrayerTimes(coords, method);
    }
  } catch (error) {
    console.error('Error in fetchPrayerTimes:', error);
    // Generic error handling for issues not caught by sub-functions
    // This might be redundant if sub-functions handle all their errors,
    // but kept as a fallback.
    // Avoid duplicate generic error for this specific connection error, as it's often handled by offline logic.
    if (error.message.includes('Could not establish connection') || error.message.includes('Failed to fetch')) {
      // Rely on offline handling or subsequent specific errors if online fails.
      // displayError('networkError'); // This might be too noisy if offline mode handles it gracefully.
    } else {
      displayError('genericFetchError', error.message);
    }
    // Fallback to default times if everything else fails
    updateUI(getFallbackTimes(), getTranslation('generalDefaultLocationName'));
  } finally {
    document.getElementById(CONSTANTS.DOM_IDS.LOADING).style.display = 'none';
  }
}

/**
 * Handles the retrieval of prayer times when the application is offline.
 * It attempts to load data from a local JSON database (`localDB`).
 * If in manual mode, it uses the selected city's stored times.
 * Otherwise, it finds the nearest city to the given `coords` in the local database.
 * Updates the UI with these times or fallback times if data is unavailable or corrupted.
 *
 * @async
 * @param {object} coords - An object containing `latitude` and `longitude`.
 *                          Used to find the nearest city if not in manual mode.
 * @throws {Error} If localDB cannot be loaded, is missing essential data, or if no data is found for the current location in auto mode.
 */
async function handleOfflineData(coords) {
  document.getElementById(CONSTANTS.DOM_IDS.OFFLINE_NOTICE).style.display = 'flex';
  if (!localDB) {
    const loaded = await loadLocalDB();
    if (!loaded || !localDB) {
      // Error from loadLocalDB should be already translated. If it throws another error, it's an issue.
      throw new Error(getTranslation('localDBLoadError')); // This error is caught by fetchPrayerTimes
    }
    if (isManualMode) {
      populateCountries();
      updateCityDropdown();
    }
  }

  if (!localDB.locations || !Array.isArray(localDB.locations)) {
    console.error("localDB.locations is missing or not an array.");
    // This error is caught by fetchPrayerTimes
    throw new Error(getTranslation('corruptedLocalData', 'locations list'));
  }

  let cityPrayerData = null;
  if (isManualMode && document.getElementById(CONSTANTS.DOM_IDS.CITY_SELECT).value) {
    cityPrayerData = getOfflinePrayerTimesForSelectedCity();
  } else if (!isManualMode) { // Only find nearest if not in manual mode or no city selected in manual
    cityPrayerData = findNearestCityOffline(coords);
  }

  if (cityPrayerData) {
    updateUI(cityPrayerData.times, cityPrayerData.name);
  } else {
    // Fallback if no specific data found (e.g., manual mode with no city, or no nearest city)
    updateUI(getFallbackTimes(), getTranslation('noNearbyCityOffline'));
    // Consider re-throwing an error or handling it based on how fetchPrayerTimes expects it
    // For now, this matches the previous behavior of falling back.
    // If no city is selected in manual mode, it will also reach here.
    if (isManualMode && !document.getElementById(CONSTANTS.DOM_IDS.CITY_SELECT).value) {
        // Do not throw error if manual mode and no city selected, just use fallback.
    } else {
        // Throw error for other cases like no nearest city found in auto mode.
        // This error is caught by fetchPrayerTimes
        throw new Error(getTranslation('noDataForCurrentLocationOffline'));
    }
  }
}


/**
 * Retrieves prayer times for the currently selected city in manual mode from localDB.
 * @returns {object|null} An object with `times` and `name` of the city, or null if not found or data incomplete.
 */
function getOfflinePrayerTimesForSelectedCity() {
  const selectedCityId = document.getElementById(CONSTANTS.DOM_IDS.CITY_SELECT).value;
  if (!selectedCityId) return null;

  const city = localDB.locations.find(loc => loc.id == selectedCityId);
  if (!city) return null;

  const essentialPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const cityPrayerTimes = city.prayerTimes;
  const allEssentialPresent = cityPrayerTimes && typeof cityPrayerTimes === 'object' && essentialPrayers.every(p => cityPrayerTimes[p]);

  if (allEssentialPresent) {
    return { times: cityPrayerTimes, name: isArabic ? city.ar_city : city.en_city };
  } else {
    console.warn(`Offline data for city ${city.id} is incomplete. Using fallback.`);
    return { times: getFallbackTimes(), name: isArabic ? city.ar_city : city.en_city };
  }
}

/**
 * Finds the nearest city to the given coordinates from the localDB.
 * @param {object} coords - An object containing `latitude` and `longitude`.
 * @returns {object|null} An object with `times` and `name` of the nearest city, or null if not found or data incomplete.
 */
function findNearestCityOffline(coords) {
  if (!localDB.locations || localDB.locations.length === 0) return null;

  let nearestCity = null;
  let minDistance = Infinity;

  localDB.locations.forEach(location => {
    if (typeof location.lat === 'number' && typeof location.loong === 'number') {
      const distance = calculateDistance(
        { latitude: coords.latitude, longitude: coords.longitude },
        { latitude: location.lat, longitude: location.loong }
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = location;
      }
    }
  });

  if (nearestCity) {
    const essentialPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const nearestCityPrayerTimes = nearestCity.prayerTimes;
    const allEssentialPresent = nearestCityPrayerTimes && typeof nearestCityPrayerTimes === 'object' && essentialPrayers.every(p => nearestCityPrayerTimes[p]);

    if (allEssentialPresent) {
      return { times: nearestCityPrayerTimes, name: isArabic ? nearestCity.ar_city : nearestCity.en_city };
    } else {
      console.warn(`Offline data for nearest city ${nearestCity.id} is incomplete. Using fallback.`);
      return { times: getFallbackTimes(), name: isArabic ? nearestCity.ar_city : nearestCity.en_city };
    }
  }
  return null;
}


/**
 * Fetches prayer times from the Aladhan API when the application is online.
 * It first tries to get the city name using reverse geocoding (Nominatim API).
 * Then, it checks for cached prayer times in localStorage to avoid redundant API calls.
 * If no valid cache exists, it fetches new data from the Aladhan API,
 * updates the cache, and then updates the UI.
 * Handles API errors and fallbacks to default times if necessary.
 *
 * @async
 * @param {object} coords - An object containing `latitude` and `longitude`.
 * @param {string} method - The calculation method ID (e.g., '0', '1') for the Aladhan API.
 * @throws {Error} If fetching online data fails and no fallback is available (though it typically falls back to default times).
 */
/**
 * Fetches a user-friendly location name (city, town, or village) using Nominatim reverse geocoding.
 * @param {object} coords - Coordinates object with latitude and longitude.
 * @param {string} defaultLocationName - A default name to return if fetching fails or data is incomplete.
 * @returns {Promise<string>} The fetched location name or the default name.
 */
async function getUILocationName(coords, defaultLocationName) {
  try {
    const url = `${CONSTANTS.API_URLS.NOMINATIM_REVERSE}?lat=${coords.latitude}&lon=${coords.longitude}&${CONSTANTS.API_PARAMS.FORMAT_JSON}`;
    const nominatimResponse = await fetch(url);
    if (!nominatimResponse.ok) {
      console.warn('Failed to get location name from Nominatim, using default/previous name.');
      return defaultLocationName;
    }
    const nominatimData = await nominatimResponse.json();
    if (nominatimData && nominatimData.address) {
      return nominatimData.address.city ||
             nominatimData.address.town ||
             nominatimData.address.village ||
             defaultLocationName; // Fallback to default if no suitable part found
    } else {
      console.warn('Nominatim response missing address information, using default/previous name.');
      return defaultLocationName;
    }
  } catch (error) {
    console.error('Error fetching location name from Nominatim:', error);
    return defaultLocationName; // On error, return the default name
  }
}


/**
 * Retrieves prayer times from localStorage if a valid cache exists.
 * @param {string} method - The calculation method.
 * @param {string} locationName - The name of the location (city/town).
 * @returns {object|null} The cached prayer times data, or null if not found or invalid.
 */
function getCachedPrayerTimes(method, locationName) {
  const cityForCacheKey = encodeURIComponent(locationName === getTranslation('unknownName') ? (isArabic ? CONSTANTS.DEFAULTS.API_FALLBACK_CITY_AR : CONSTANTS.DEFAULTS.API_FALLBACK_CITY_EN) : locationName);
  // Assuming a default country for simplicity in cache key, as Nominatim might not always provide it.
  // This could be made more robust if country data is reliably available.
  const countryForCacheKey = encodeURIComponent(isArabic ? CONSTANTS.DEFAULTS.API_FALLBACK_COUNTRY_AR : CONSTANTS.DEFAULTS.API_FALLBACK_COUNTRY_EN);
  const cacheKey = `${cityForCacheKey}-${countryForCacheKey}-method${method}`;

  const storedData = localStorage.getItem(cacheKey);
  if (!storedData) return null;

  try {
    const parsedData = JSON.parse(storedData);
    const todayDateString = new Date().toISOString().split('T')[0];

    if (parsedData.data &&
        parsedData.timestamp &&
        (Date.now() - parsedData.timestamp < CONSTANTS.CACHE_DURATION_MS) &&
        parsedData.cacheDate === todayDateString) {
      return parsedData.data;
    }
  } catch (error) {
    console.error('Error parsing cached prayer times:', error);
    localStorage.removeItem(cacheKey); // Remove corrupted cache item
    return null;
  }
  return null; // Cache invalid or expired
}


async function fetchOnlinePrayerTimes(coords, method) {
  document.getElementById(CONSTANTS.DOM_IDS.OFFLINE_NOTICE).style.display = 'none';
  let locationNameForUI = getTranslation('currentLocation'); // Default/fallback from translations

  try {
    locationNameForUI = await getUILocationName(coords, locationNameForUI);
    
    const cachedTimes = getCachedPrayerTimes(method, locationNameForUI);
    if (cachedTimes) {
      updateUI(cachedTimes, locationNameForUI);
      return;
    }

    const newPrayerData = await fetchAndCacheNewPrayerTimes(method, locationNameForUI);
    updateUI(newPrayerData, locationNameForUI);

  } catch (error) {
    console.error('Error in fetchOnlinePrayerTimes:', error);
    // Specific error handling for online fetching
    // Error handling improved with translation keys
    if (error.name === 'AladhanAPIError') {
        // error.message here is already translated by fetchAndCacheNewPrayerTimes
        displayError('aladhanAPIErrorMsg', error.message);
    } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch') || error.message.includes('offline')) {
        displayError('networkError');
    } else {
        // For other errors, including those from getUILocationName if they occur
        displayError('errorFetchingOnlineData', error.message);
    }
    // Fallback to default times as a last resort
    updateUI(getFallbackTimes(), locationNameForUI);
  }
}


/**
 * Fetches new prayer times from the Aladhan API, processes, and caches them.
 * @param {string} method - The calculation method.
 * @param {string} locationName - The name of the location (city/town).
 * @returns {Promise<object>} The fetched and processed prayer times data.
 * @throws {Error} If API request fails or data is invalid. Specific error type AladhanAPIError for API issues.
 */
async function fetchAndCacheNewPrayerTimes(method, locationName) {
  const cityForAPI = encodeURIComponent(locationName === getTranslation('unknownName') ? (isArabic ? CONSTANTS.DEFAULTS.API_FALLBACK_CITY_AR : CONSTANTS.DEFAULTS.API_FALLBACK_CITY_EN) : locationName);
  const countryForAPI = encodeURIComponent(isArabic ? CONSTANTS.DEFAULTS.API_FALLBACK_COUNTRY_AR : CONSTANTS.DEFAULTS.API_FALLBACK_COUNTRY_EN); // Default country

  const apiUrl = `${CONSTANTS.API_URLS.ALADHAN_TIMINGS_BY_CITY}?city=${cityForAPI}&country=${countryForAPI}&method=${method}`;
  const aladhanResponse = await fetch(apiUrl);
  if (!aladhanResponse.ok) {
    const errorMsg = getTranslation('aladhanFetchError', aladhanResponse.status);
    const apiError = new Error(errorMsg);
    apiError.name = 'AladhanAPIError';
    throw apiError;
  }

  const aladhanData = await aladhanResponse.json();
  if (aladhanData.code === 200 && aladhanData.data && typeof aladhanData.data.timings === 'object') {
    const prayerData = aladhanData.data.timings;

    const essentialPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const allEssentialPresent = essentialPrayers.every(p => prayerData[p]);

    if (!allEssentialPresent) {
      const incompleteDataError = new Error(getTranslation('incompletePrayerData'));
      incompleteDataError.name = 'AladhanAPIError';
      // Don't throw, but log and return fallback. Or decide to throw.
      // For now, to keep similar behavior to original code (displayError then updateUI with fallback):
      console.error(incompleteDataError.message); // Log it, message is already translated.
      displayError('incompletePrayerData'); // Show to user via translation key.
      return getFallbackTimes(); // Return fallback, fetchOnlinePrayerTimes will call updateUI.
    }

    // Ensure Sunrise is present
    if (!prayerData.Sunrise && aladhanData.data.meta && aladhanData.data.meta.sunrise) {
      prayerData.Sunrise = aladhanData.data.meta.sunrise;
    } else if (!prayerData.Sunrise) {
      prayerData.Sunrise = CONSTANTS.DEFAULTS.SUNRISE_FALLBACK; // Ultimate fallback for Sunrise
    }

    // Cache the new data
    const cacheKey = `${cityForAPI}-${countryForAPI}-method${method}`; // Same key as getCachedPrayerTimes
    const todayDateString = new Date().toISOString().split('T')[0];
    localStorage.setItem(cacheKey, JSON.stringify({
      data: prayerData,
      timestamp: Date.now(),
      cacheDate: todayDateString
    }));

    return prayerData;
  } else {
    const errorStatus = aladhanData.status || getTranslation('invalidAladhanData');
    const invalidDataError = new Error(getTranslation('aladhanServerError', errorStatus));
    invalidDataError.name = 'AladhanAPIError';
    throw invalidDataError;
  }
}


// دالة لتحديث واجهة المستخدم بأوقات الصلاة

/**
 * Clears the prayer times display area.
 */
function clearPrayerTimesDisplay() {
  const prayerTimesDiv = document.getElementById(CONSTANTS.DOM_IDS.PRAYER_TIMES);
  if (prayerTimesDiv) {
    prayerTimesDiv.innerHTML = '';
  }
}

/**
 * Gets the prayer order with translated names.
 * @returns {Array<object>} An array of prayer objects with translated names.
 */
function getTranslatedPrayerOrder() {
  return CONSTANTS.PRAYER_ORDER.map(p => ({
    ...p,
    name: getTranslation(p.nameKey)
  }));
}

/**
 * Hides the loading indicator and clears any displayed error messages.
 */
function hideLoadingAndClearErrors() {
  const loadingElement = document.getElementById(CONSTANTS.DOM_IDS.LOADING);
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
  const errorElement = document.getElementById(CONSTANTS.DOM_IDS.ERROR);
  if (errorElement) {
    errorElement.innerHTML = '';
  }
}

/**
 * Orchestrates the update of the entire UI with new prayer times and location information.
 * It utilizes helper functions to clear previous data, get translations, update specific UI sections
 * (next prayer, prayer cards, location), hide loading indicators, and set up alarms.
 *
 * @param {object} timings - An object where keys are prayer names (e.g., 'Fajr', 'Dhuhr')
 *                           and values are their times in "HH:MM" format.
 * @param {string} [locationName=''] - The display name of the current location (city or area).
 *                                     Defaults to an empty string if not provided.
 */
function updateUI(timings, locationName = '') {
  try {
    clearPrayerTimesDisplay();
    const currentPrayerOrder = getTranslatedPrayerOrder();
    const prayerTimesDiv = document.getElementById(CONSTANTS.DOM_IDS.PRAYER_TIMES); // Needed for createPrayerCards and updateLocationDisplay

    const nextPrayer = updateNextPrayerDisplay(timings, currentPrayerOrder);
    createPrayerCards(timings, currentPrayerOrder, nextPrayer, prayerTimesDiv);
    updateLocationDisplay(locationName, prayerTimesDiv);
    hideLoadingAndClearErrors();
    setupAlarms(timings);

  } catch (error) {
    console.error('خطأ في تحديث الواجهة:', error);
    displayError('displayUIError');
  }
}

/**
 * Identifies the next upcoming prayer from the provided timings and updates
 * the UI elements that display the name of the next prayer and the countdown to it.
 *
 * @param {object} timings - An object containing prayer times (e.g., { Fajr: "05:00", ... }).
 * @param {Array<object>} currentPrayerOrder - An array of prayer objects, sorted in their daily order,
 *                                             each with `key` (e.g., 'Fajr') and translated `name`.
 * @returns {object | null} The prayer object (from `currentPrayerOrder`) for the next prayer,
 *                          or `null` if no next prayer can be determined.
 */
function updateNextPrayerDisplay(timings, currentPrayerOrder) {
  const now = new Date();
  let nextPrayer = null;
  let minDiff = Infinity;

  currentPrayerOrder.forEach(prayer => {
    const timeStr = timings[prayer.key];
    if (!timeStr) return; // Skip if timing is missing
    const [hours, minutes] = timeStr.split(':').map(Number);
    const prayerTime = new Date();
    prayerTime.setHours(hours, minutes, 0, 0);

    if (prayerTime > now) {
      const diff = prayerTime - now;
      if (diff < minDiff) {
        minDiff = diff;
        nextPrayer = prayer;
      }
    }
  });

  if (!nextPrayer && currentPrayerOrder.length > 0) {
    // If all prayers for today have passed, next prayer is Fajr of the next day
    nextPrayer = currentPrayerOrder[0];
  }

  if (nextPrayer) {
    document.getElementById(CONSTANTS.DOM_IDS.NEXT_PRAYER_NAME).textContent = nextPrayer.name; // Name is already translated
    updateNextPrayerCountdown(timings[nextPrayer.key]);
  } else {
    document.getElementById(CONSTANTS.DOM_IDS.NEXT_PRAYER_NAME).textContent = getTranslation('noNextPrayer');
    // Clear countdown if no next prayer
    clearInterval(nextPrayerTimer);
    document.getElementById(CONSTANTS.DOM_IDS.TIME_REMAINING).textContent = CONSTANTS.UI_STRINGS.INITIAL_COUNTDOWN;
  }
  return nextPrayer;
}

/**
 * Generates and populates prayer cards for each prayer time in the `currentPrayerOrder`.
 * Each card displays the prayer name and its formatted time.
 * The card for the `nextPrayer` is given a special class for highlighting.
 * Handles click and keyboard events for displaying prayer details.
 *
 * @param {object} timings - An object containing prayer times (e.g., { Fajr: "05:00", ... }).
 * @param {Array<object>} currentPrayerOrder - An array of prayer objects, sorted in their daily order,
 *                                             each with `key` (e.g., 'Fajr') and translated `name`.
 * @param {object | null} nextPrayer - The prayer object for the next prayer, used to highlight the active card.
 *                                     Can be `null` if no next prayer is determined.
 * @param {HTMLElement} prayerTimesDiv - The container DOM element where prayer cards will be appended.
 */
function createPrayerCards(timings, currentPrayerOrder, nextPrayer, prayerTimesDiv) {
  currentPrayerOrder.forEach(prayer => {
    const timeValue = timings[prayer.key] ? formatTime24To12(timings[prayer.key]) : CONSTANTS.UI_STRINGS.INVALID_TIME;
    const card = document.createElement('div');
    card.className = CONSTANTS.CLASSES.PRAYER_CARD;
    card.setAttribute(CONSTANTS.ATTRIBUTES.TABINDEX, '0'); // Make it focusable
    card.setAttribute(CONSTANTS.ATTRIBUTES.ROLE, 'button');
    card.setAttribute(CONSTANTS.ATTRIBUTES.ARIA_LABEL, `${prayer.name} ${getTranslation('prayerTimePrefix')} ${timeValue}`);


    if (nextPrayer && prayer.key === nextPrayer.key) {
      card.classList.add(CONSTANTS.CLASSES.NEXT_PRAYER_CARD);
      card.setAttribute(CONSTANTS.ATTRIBUTES.ARIA_CURRENT, 'true');
    } else {
      card.setAttribute(CONSTANTS.ATTRIBUTES.ARIA_CURRENT, 'false');
    }

    card.innerHTML = `
      <h3>${prayer.name}</h3>
      <div class="${CONSTANTS.CLASSES.PRAYER_TIME_CLASS}">${timeValue}</div>
    `;

    const cardClickHandler = () => {
      // Update ARIA states for all cards
      document.querySelectorAll('.' + CONSTANTS.CLASSES.PRAYER_CARD).forEach(c => {
        c.classList.remove(CONSTANTS.CLASSES.ACTIVE_CARD);
        c.setAttribute(CONSTANTS.ATTRIBUTES.ARIA_CURRENT, 'false');
      });
      card.classList.add(CONSTANTS.CLASSES.ACTIVE_CARD);
      card.setAttribute(CONSTANTS.ATTRIBUTES.ARIA_CURRENT, 'true');
      
      document.getElementById(CONSTANTS.DOM_IDS.PRAYER_DETAILS).innerHTML = `
        <h4>${prayer.name}</h4>
        <p>${getTranslation(prayer.key + '_details')}</p>
        <p><strong>${getTranslation('prayerTimePrefix')}</strong> ${timeValue}</p>
      `;
    };

    card.addEventListener(CONSTANTS.EVENTS.CLICK, cardClickHandler);
    card.addEventListener(CONSTANTS.EVENTS.KEYDOWN, (event) => {
      if (event.key === CONSTANTS.KEYS.ENTER || event.key === CONSTANTS.KEYS.SPACE) {
        event.preventDefault(); // Prevent space from scrolling
        cardClickHandler();
      }
    });

    prayerTimesDiv.appendChild(card);
  });

  if (nextPrayer) {
    setTimeout(() => {
      const nextCard = prayerTimesDiv.querySelector('.' + CONSTANTS.CLASSES.PRAYER_CARD + '.' + CONSTANTS.CLASSES.NEXT_PRAYER_CARD);
      if (nextCard) {
        nextCard.click(); // This is fine, programmatically clicking
      }
    }, 100);
  }
}

/**
 * Updates or creates the location display element in the UI.
 * If `locationName` is provided, it displays it; otherwise, it ensures no location is displayed.
 * The location element is typically inserted before the `prayerTimesDiv`.
 *
 * @param {string} locationName - The name of the location to display.
 * @param {HTMLElement} prayerTimesDiv - The DOM element representing the prayer times container,
 *                                     used as a reference point for inserting the location display.
 */
function updateLocationDisplay(locationName, prayerTimesDiv) {
  // Remove any existing location display
  const container = document.querySelector('.' + CONSTANTS.CLASSES.CONTAINER_CLASS);
  const oldLocationDisplay = container.querySelector('.' + CONSTANTS.CLASSES.LOCATION_DISPLAY);
  if (oldLocationDisplay) oldLocationDisplay.remove();

  if (locationName) {
    const locationElement = document.createElement('div');
    locationElement.className = CONSTANTS.CLASSES.LOCATION_DISPLAY;
    locationElement.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${getTranslation('yourLocation')}${locationName}`;
    // Insert before prayerTimesDiv
    if (prayerTimesDiv && prayerTimesDiv.parentNode) {
       prayerTimesDiv.parentNode.insertBefore(locationElement, prayerTimesDiv);
    } else {
      // Fallback if prayerTimesDiv is not in DOM or has no parent
      container.insertBefore(locationElement, container.firstChild);
    }
  }
}

// دالة لتحديث الوقت المتبقي للصلاة التالية
/**
 * Updates the countdown timer for the next prayer.
 * @param {string} prayerTime - The time of the next prayer in "HH:MM" format.
 */
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
    
    document.getElementById(CONSTANTS.DOM_IDS.TIME_REMAINING).textContent =
      `${hoursRemaining.toString().padStart(2, '0')}:${minutesRemaining.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`;
  }
  
  updateCountdown();
  nextPrayerTimer = setInterval(updateCountdown, 1000);
}

// دالة لإعداد التنبيهات
/**
 * Configures alarms for upcoming prayers based on user preferences.
 * It clears any existing alarm timer, checks if alarms are enabled,
 * and if so, calculates the time for the next prayer alarm and sets a timeout.
 *
 * @param {object} timings - An object containing prayer times for the day (e.g., { Fajr: "05:00", ... }).
 *                           These times are used to schedule the alarms.
 */
function setupAlarms(timings) {
  // إلغاء أي تنبيهات سابقة
  if (alarmTimer) clearTimeout(alarmTimer);

  // التحقق من تفعيل التنبيه
  const alarmToggle = document.getElementById(CONSTANTS.DOM_IDS.ALARM_TOGGLE);
  if (!alarmToggle || !alarmToggle.checked) return;

  const alarmMinutesInput = document.getElementById(CONSTANTS.DOM_IDS.ALARM_MINUTES);
  const alarmMinutes = parseInt(alarmMinutesInput.value) || 15;
  
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
/**
 * Shows a notification for the upcoming prayer.
 * @param {string} prayerName - The key of the prayer (e.g., 'Fajr', 'Dhuhr').
 */
function showAlarmNotification(prayerNameKey) {
  // prayerNameKey will be 'Fajr', 'Dhuhr' etc.
  const translatedPrayerName = getTranslation(prayerNameKey); // Get the display name like "الفجر 🌅" or "Fajr 🌅"
  
  // We might want a cleaner version of the name for the message, without emoji.
  // For simplicity, we'll use the (potentially emoji-laden) name for now.
  // Or, add another entry in translations for "clean" prayer names if needed.
  const message = getTranslation('alarmMessage', translatedPrayerName);
  const notificationTitle = getTranslation('prayerNotificationTitle');
  
  if (!("Notification" in window)) {
    alert(message);
  } else if (Notification.permission === "granted") {
    new Notification(notificationTitle, { body: message });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(notificationTitle, { body: message });
      }
    });
  }
}

// دالة لعرض الأخطاء
/**
 * Displays a translated error message in the UI.
 * Hides the loading indicator.
 * @param {string} translationKey - The key for the error message in the translations object.
 * @param {...any} args - Arguments to pass to the translation function if the message is a function.
 */
function displayError(translationKey, ...args) {
  const loadingElement = document.getElementById(CONSTANTS.DOM_IDS.LOADING);
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
  const errorDiv = document.getElementById(CONSTANTS.DOM_IDS.ERROR);
  if (errorDiv) {
    const message = getTranslation(translationKey, ...args);
    errorDiv.innerHTML = `🚨 ${message}`; // Keep the emoji for visual cue
  }
}

// دالة لتحديث التاريخ والوقت الحالي
/**
 * Updates the current date and time display on the page.
 * Uses global `isArabic`.
 */
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
    now.toLocaleDateString(CONSTANTS.LOCALES.AR_SA, options) :
    now.toLocaleDateString(CONSTANTS.LOCALES.EN_US, { ...options, weekday: 'long' });
  
  document.getElementById(CONSTANTS.DOM_IDS.CURRENT_DATE_TIME).textContent = dateTimeStr;
}

// دالة لتحديث التاريخ الهجري
/**
 * Updates the Hijri date display on the page.
 */
function updateHijriDate() {
  const today = new Date();
  const hijri = new Intl.DateTimeFormat(CONSTANTS.LOCALES.AR_SA_ISLAMIC, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(today);
  
  document.getElementById(CONSTANTS.DOM_IDS.HIJRI_DATE).textContent = hijri;
}

// عند تحميل الصفحة
/**
 * Main function executed when the DOM is fully loaded.
 * Sets up initial state, event listeners, and loads initial data.
 */
document.addEventListener(CONSTANTS.EVENTS.DOM_CONTENT_LOADED, async () => {
  // تحديث التاريخ والوقت
  updateDateTime();
  setInterval(updateDateTime, 1000);
  
  // تحديث التاريخ الهجري
  updateHijriDate();
  setInterval(updateHijriDate, 24 * 60 * 60 * 1000);
  
  // معالجة تغيير اللغة
  const langArButton = document.getElementById(CONSTANTS.DOM_IDS.LANG_AR);
  const langEnButton = document.getElementById(CONSTANTS.DOM_IDS.LANG_EN);

  langArButton.addEventListener(CONSTANTS.EVENTS.CLICK, () => {
    isArabic = true;
    document.querySelectorAll('.' + CONSTANTS.CLASSES.LANG_BUTTON).forEach(btn => {
      btn.classList.remove(CONSTANTS.CLASSES.ACTIVE_CARD);
      btn.setAttribute(CONSTANTS.ATTRIBUTES.ARIA_PRESSED, 'false');
    });
    langArButton.classList.add(CONSTANTS.CLASSES.ACTIVE_CARD);
    langArButton.setAttribute(CONSTANTS.ATTRIBUTES.ARIA_PRESSED, 'true');
    document.documentElement.lang = 'ar';
    document.documentElement.dir = CONSTANTS.DOCUMENT_DIRECTIONS.RTL;
    // إعادة تحميل الواجهة
    getLocation();
    translateUI();
    // populateCountries and updateCityDropdown are called within translateUI if localDB is loaded
  });
  
  langEnButton.addEventListener(CONSTANTS.EVENTS.CLICK, () => {
    isArabic = false;
    document.querySelectorAll('.' + CONSTANTS.CLASSES.LANG_BUTTON).forEach(btn => {
      btn.classList.remove(CONSTANTS.CLASSES.ACTIVE_CARD);
      btn.setAttribute(CONSTANTS.ATTRIBUTES.ARIA_PRESSED, 'false');
    });
    langEnButton.classList.add(CONSTANTS.CLASSES.ACTIVE_CARD);
    langEnButton.setAttribute(CONSTANTS.ATTRIBUTES.ARIA_PRESSED, 'true');
    document.documentElement.lang = 'en';
    document.documentElement.dir = CONSTANTS.DOCUMENT_DIRECTIONS.LTR;
    // إعادة تحميل الواجهة
    getLocation();
    translateUI();
    // populateCountries and updateCityDropdown are called within translateUI if localDB is loaded
  });
  
  // ترجمة الواجهة عند التحميل
  translateUI();
  
  const modeSelector = document.getElementById(CONSTANTS.DOM_IDS.MODE_SELECT);
  if (!modeSelector) return;
  
  const savedMode = localStorage.getItem(CONSTANTS.STORAGE_KEY_SELECTED_MODE) || CONSTANTS.MODES.AUTO;
  modeSelector.value = savedMode;
  isManualMode = savedMode === CONSTANTS.MODES.MANUAL;
  
  const manualControls = document.getElementById(CONSTANTS.DOM_IDS.MANUAL_CONTROLS);
  if (manualControls) manualControls.style.display = isManualMode ? 'block' : 'none';
  
  const calcMethod = document.getElementById(CONSTANTS.DOM_IDS.CALCULATION_METHOD);
  if (calcMethod) calcMethod.value = getSavedMethod();
  
  const dbLoaded = await loadLocalDB();
  if (dbLoaded) {
    populateCountries();
    if (isManualMode) {
      // If a country is already selected (e.g. from localStorage), update cities
      updateCityDropdown();
    }
  }
  getLocation();
});

// Structure for UI translations
const UI_TRANSLATION_MAP = [
  // Dropdown options
  { type: 'option', id: CONSTANTS.DOM_IDS.MODE_SELECT, index: 0, key: 'autoMode' },
  { type: 'option', id: CONSTANTS.DOM_IDS.MODE_SELECT, index: 1, key: 'manualMode' },
  { type: 'option', id: CONSTANTS.DOM_IDS.CALCULATION_METHOD, index: 0, key: 'method0' },
  { type: 'option', id: CONSTANTS.DOM_IDS.CALCULATION_METHOD, index: 1, key: 'method1' },
  { type: 'option', id: CONSTANTS.DOM_IDS.CALCULATION_METHOD, index: 2, key: 'method2' },
  { type: 'option', id: CONSTANTS.DOM_IDS.CALCULATION_METHOD, index: 3, key: 'method3' },
  { type: 'option', id: CONSTANTS.DOM_IDS.CALCULATION_METHOD, index: 4, key: 'method4' },
  { type: 'option', id: CONSTANTS.DOM_IDS.COUNTRY_SELECT, index: 0, key: 'countryOptionDefault', checkElement: true }, // Only if element exists
  { type: 'option', id: CONSTANTS.DOM_IDS.CITY_SELECT, index: 0, key: 'cityOptionDefault', checkElement: true },    // Only if element exists

  // Labels and titles by querySelector
  { type: 'html', query: '.mode-selector label', key: 'selectMode' },
  { type: 'html', query: '.method-selector .label-calc-method', key: 'calculationMethod' }, // Requires adding this class in HTML
  { type: 'html', query: '.method-selector .label-country', key: 'selectCountry' },       // Requires adding this class in HTML
  { type: 'html', query: '.method-selector .label-city', key: 'selectCity' },          // Requires adding this class in HTML
  { type: 'html', query: '.alarm-settings h3', key: 'alarmSettingsTitle' },
  { type: 'text', query: `label[for="${CONSTANTS.DOM_IDS.ALARM_TOGGLE}"]`, key: 'enableAlarm' },
  { type: 'text', query: `label[for="${CONSTANTS.DOM_IDS.ALARM_MINUTES}"]`, key: 'minutesBeforePrayer' },
  { type: 'html', query: '.prayer-info h3', key: 'prayerInfoTitle' },
  
  // Text content by ID
  { type: 'text', id: CONSTANTS.DOM_IDS.APP_VERSION, key: 'appVersion' },
  
  // Special case for next prayer title (handled separately for now but could be integrated)
  // { type: 'custom', key: 'nextPrayerIs', id: CONSTANTS.DOM_IDS.NEXT_PRAYER_TITLE }
];


// دالة لترجمة واجهة المستخدم
/**
 * Translates the UI elements based on the selected language (global `isArabic`)
 * using a data-driven approach from `UI_TRANSLATION_MAP`.
 */
function translateUI() {
  UI_TRANSLATION_MAP.forEach(item => {
    try {
      const translation = getTranslation(item.key);
      let element;

      if (item.id) {
        element = document.getElementById(item.id);
      } else if (item.query) {
        element = document.querySelector(item.query);
      }

      if (!element && item.checkElement) return; // Skip if element is optional and not found
      if (!element) {
        console.warn(`Element not found for translation key "${item.key}" (selector: ${item.id || item.query})`);
        return;
      }

      switch (item.type) {
        case 'text':
          element.textContent = translation;
          break;
        case 'html':
          element.innerHTML = translation;
          break;
        case 'option':
          if (element.options && element.options[item.index]) {
            element.options[item.index].text = translation;
          } else {
            console.warn(`Option index ${item.index} not found for select element "${item.id}"`);
          }
          break;
        // Potentially add 'placeholder', 'title', etc. if needed
        default:
          console.warn(`Unknown translation type: ${item.type}`);
      }
    } catch (e) {
      console.error(`Error translating item with key "${item.key}":`, e);
    }
  });

  // Handle the special case for next prayer title
  const nextPrayerTitleElement = document.getElementById(CONSTANTS.DOM_IDS.NEXT_PRAYER_TITLE);
  if (nextPrayerTitleElement) {
      const nextPrayerNameSpan = `<span id="${CONSTANTS.DOM_IDS.NEXT_PRAYER_NAME}">--</span>`; // Keep the span for dynamic updates
      nextPrayerTitleElement.innerHTML = `${getTranslation('nextPrayerIs')} ${nextPrayerNameSpan}`;
  }

  // Re-populate country and city names if localDB is loaded, as their names are language-dependent
  // This needs to happen after the default option texts are set.
  if (localDB) {
    populateCountries();
    updateCityDropdown();
  }
}

// معالجات الأحداث
document.getElementById(CONSTANTS.DOM_IDS.CALCULATION_METHOD)?.addEventListener(CONSTANTS.EVENTS.CHANGE, () => getLocation());
document.getElementById(CONSTANTS.DOM_IDS.COUNTRY_SELECT)?.addEventListener(CONSTANTS.EVENTS.CHANGE, () => {
  updateCityDropdown();
  const citySelector = document.getElementById(CONSTANTS.DOM_IDS.CITY_SELECT);
  if (citySelector?.options.length > 1) {
    citySelector.value = citySelector.options[1].value; // Auto-select first city
    getLocation();
  }
});
document.getElementById(CONSTANTS.DOM_IDS.CITY_SELECT)?.addEventListener(CONSTANTS.EVENTS.CHANGE, () => getLocation());

document.getElementById(CONSTANTS.DOM_IDS.MODE_SELECT)?.addEventListener(CONSTANTS.EVENTS.CHANGE, (e) => {
  isManualMode = e.target.value === CONSTANTS.MODES.MANUAL;
  localStorage.setItem(CONSTANTS.STORAGE_KEY_SELECTED_MODE, e.target.value);
  
  const manualControls = document.getElementById(CONSTANTS.DOM_IDS.MANUAL_CONTROLS);
  if (manualControls) manualControls.style.display = isManualMode ? 'block' : 'none';
  
  if (isManualMode) {
    if (!localDB) {
      loadLocalDB().then((loaded) => {
        if (loaded) {
          populateCountries();
          const countrySelector = document.getElementById(CONSTANTS.DOM_IDS.COUNTRY_SELECT);
          if (countrySelector && countrySelector.options.length > 1) {
            // countrySelector.value = countrySelector.options[1].value; // Optionally pre-select
          }
          updateCityDropdown();
        }
      });
    } else {
      populateCountries();
      updateCityDropdown();
    }
  } else {
    getLocation(); // Auto mode
  }
});

// معالجة تغيير إعدادات التنبيه
document.getElementById(CONSTANTS.DOM_IDS.ALARM_TOGGLE)?.addEventListener(CONSTANTS.EVENTS.CHANGE, () => {
  getLocation(); // Re-fetch to update alarm calculations
});
document.getElementById(CONSTANTS.DOM_IDS.ALARM_MINUTES)?.addEventListener(CONSTANTS.EVENTS.CHANGE, () => {
  getLocation(); // Re-fetch to update alarm calculations
});

// مراقبة حالة الاتصال
window.addEventListener(CONSTANTS.EVENTS.ONLINE, () => {
  document.getElementById(CONSTANTS.DOM_IDS.OFFLINE_NOTICE).style.display = 'none';
  getLocation();
});
window.addEventListener(CONSTANTS.EVENTS.OFFLINE, () => {
  document.getElementById(CONSTANTS.DOM_IDS.OFFLINE_NOTICE).style.display = 'flex';
  getLocation(); // Attempt to use offline data
});

/**
 * Calculates a simplified "distance" between two geographical coordinates.
 * This function uses the Pythagorean theorem on latitude and longitude differences,
 * which is a simplification and not the Haversine formula. It's intended for
 * relative comparisons (e.g., finding the "nearest" city from a predefined list)
 * rather than precise geodesic distance.
 *
 * @param {object} coords1 - The first coordinates object.
 * @param {number} coords1.latitude - The latitude of the first point.
 * @param {number} coords1.longitude - The longitude of the first point.
 * @param {object} coords2 - The second coordinates object.
 * @param {number} coords2.latitude - The latitude of the second point.
 * @param {number} coords2.longitude - The longitude of the second point.
 * @returns {number} The calculated "distance". Returns `Infinity` if
 *                   coordinate data is invalid or incomplete.
 */
function calculateDistance(coords1, coords2) {
  if (coords1 == null || coords2 == null ||
      typeof coords1.latitude !== 'number' || typeof coords1.longitude !== 'number' ||
      typeof coords2.latitude !== 'number' || typeof coords2.longitude !== 'number') {
    console.warn("Invalid coordinates provided to calculateDistance. Returning Infinity.");
    return Infinity; // Return a large number if coordinates are invalid
  }
  const latDiff = coords1.latitude - coords2.latitude;
  const lonDiff = coords1.longitude - coords2.longitude;
  return Math.sqrt(Math.pow(latDiff, 2) + Math.pow(lonDiff, 2));
}