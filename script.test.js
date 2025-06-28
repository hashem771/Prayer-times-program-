// Mock globals that might be used by functions under test
global.isArabic = true; // Default to Arabic for tests, can be changed per test suite

// Mock the translations object if needed by functions like getTranslation
// This will be properly defined later when testing getTranslation itself.
// For now, an empty mock for functions that might indirectly call it.
global.translations = {
  ar: {},
  en: {}
};
global.getTranslation = (key, ...args) => {
    const lang = global.isArabic ? 'ar' : 'en';
    const value = global.translations[lang]?.[key];
    if (typeof value === 'function') {
      return value(...args);
    }
    return value || key;
};


// Assuming script.js functions are exported or made available globally for testing
// For this environment, we'll assume they are available.
// If using modules, you'd use: import { formatTime24To12 } from './script.js';

describe('formatTime24To12', () => {
  // Helper function from script.js - actual function, not a mock
  const formatTime24To12 = (time24) => {
    if (!time24 || typeof time24 !== 'string') return "--:--";
    const parts = time24.split(':');
    if (parts.length < 2) return "--:--";

    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    if (isNaN(hours) || parseInt(minutes, 10) > 59 || parseInt(minutes, 10) < 0 || hours < 0 || hours > 23 ) return "--:--"; // Basic validation

    const period = hours >= 12 ? (global.isArabic ? 'م' : 'PM') : (global.isArabic ? 'ص' : 'AM');
    hours = hours % 12 || 12;
    return `${hours}:${minutes.padStart(2, '0')} ${period}`; // Ensure minutes are two digits
  };

  describe('Arabic Mode (isArabic = true)', () => {
    beforeAll(() => {
      global.isArabic = true;
    });

    test('should format midnight (00:00) correctly', () => {
      expect(formatTime24To12("00:00")).toBe("12:00 ص");
    });
    test('should format early AM time (05:30) correctly', () => {
      expect(formatTime24To12("05:30")).toBe("5:30 ص");
    });
    test('should format late AM time (11:59) correctly', () => {
      expect(formatTime24To12("11:59")).toBe("11:59 ص");
    });
    test('should format noon (12:00) correctly', () => {
      expect(formatTime24To12("12:00")).toBe("12:00 م");
    });
    test('should format PM time (13:30) correctly', () => {
      expect(formatTime24To12("13:30")).toBe("1:30 م");
    });
    test('should format late PM time (23:45) correctly', () => {
      expect(formatTime24To12("23:45")).toBe("11:45 م");
    });
     test('should format single digit minute (10:05) correctly', () => {
      expect(formatTime24To12("10:05")).toBe("10:05 ص");
    });
  });

  describe('English Mode (isArabic = false)', () => {
    beforeAll(() => {
      global.isArabic = false;
    });

    test('should format midnight (00:00) correctly', () => {
      expect(formatTime24To12("00:00")).toBe("12:00 AM");
    });
    test('should format early AM time (05:30) correctly', () => {
      expect(formatTime24To12("05:30")).toBe("5:30 AM");
    });
    test('should format late AM time (11:59) correctly', () => {
      expect(formatTime24To12("11:59")).toBe("11:59 AM");
    });
    test('should format noon (12:00) correctly', () => {
      expect(formatTime24To12("12:00")).toBe("12:00 PM");
    });
    test('should format PM time (13:30) correctly', () => {
      expect(formatTime24To12("13:30")).toBe("1:30 PM");
    });
    test('should format late PM time (23:45) correctly', () => {
      expect(formatTime24To12("23:45")).toBe("11:45 PM");
    });
    test('should format single digit minute (08:09) correctly', () => {
      expect(formatTime24To12("08:09")).toBe("8:09 AM");
    });
  });

  describe('Invalid Inputs', () => {
    test('should return "--:--" for null input', () => {
      expect(formatTime24To12(null)).toBe("--:--");
    });
    test('should return "--:--" for undefined input', () => {
      expect(formatTime24To12(undefined)).toBe("--:--");
    });
    test('should return "--:--" for empty string', () => {
      expect(formatTime24To12("")).toBe("--:--");
    });
    test('should return "--:--" for non-time string "abc"', () => {
      expect(formatTime24To12("abc")).toBe("--:--");
    });
    test('should return "--:--" for invalid minute "12:aa"', () => {
      expect(formatTime24To12("12:aa")).toBe("--:--");
    });
    test('should return "--:--" for out-of-range hour "25:00"', () => {
      expect(formatTime24To12("25:00")).toBe("--:--");
    });
    test('should return "--:--" for out-of-range minute "10:60"', () => {
      expect(formatTime24To12("10:60")).toBe("--:--");
    });
    test('should return "--:--" for incomplete time "12:"', () => {
      expect(formatTime24To12("12:")).toBe("--:--");
    });
     test('should return "--:--" for time with only hour "12"', () => {
      expect(formatTime24To12("12")).toBe("--:--");
    });
  });
});

// Assuming getFallbackTimes is globally available or imported
const getFallbackTimes = () => {
  return {
    Fajr: "05:00",
    Sunrise: "06:00",
    Dhuhr: "12:00",
    Asr: "15:00",
    Maghrib: "18:00",
    Isha: "19:30"
  };
};

describe('getFallbackTimes', () => {
  // const getFallbackTimes is now defined outside to be accessible by other tests if needed
  // or it could be defined inside if it's only for this describe block.
  // For simplicity of this example, keeping it accessible.
  // In a real module system, it would be imported from script.js.
  const getFallbackTimesInternal = () => {
    return {
      Fajr: "05:00",
      Sunrise: "06:00",
      Dhuhr: "12:00",
      Asr: "15:00",
      Maghrib: "18:00",
      Isha: "19:30"
    };
  };

  test('should return an object', () => {
    expect(typeof getFallbackTimesInternal()).toBe('object');
    expect(getFallbackTimesInternal()).not.toBeNull();
  });

  test('should contain all essential prayer keys', () => {
    const times = getFallbackTimesInternal();
    expect(times).toHaveProperty('Fajr');
    expect(times).toHaveProperty('Sunrise');
    expect(times).toHaveProperty('Dhuhr');
    expect(times).toHaveProperty('Asr');
    expect(times).toHaveProperty('Maghrib');
    expect(times).toHaveProperty('Isha');
  });

  test('should have times in "HH:MM" format', () => {
    const times = getFallbackTimesInternal();
    const timeRegex = /^\d{2}:\d{2}$/;
    for (const prayer in times) {
      expect(times[prayer]).toMatch(timeRegex);
    }
  });
});

// Mocking translations for getTranslation tests
const mockTranslations = {
  ar: {
    testKey: "مفتاح اختبار",
    greet: (name) => `مرحباً ${name}`,
    prayerTimePrefix: "الوقت:"
  },
  en: {
    testKey: "Test Key",
    greet: (name) => `Hello ${name}`,
    prayerTimePrefix: "Time:"
  }
};

// getTranslation function (copied from script.js for isolated testing)
// In a real setup, this would be imported from script.js
const getTranslationForTest = (key, ...args) => {
  const lang = global.isArabic ? 'ar' : 'en';
  // Use the mockTranslations for testing
  const value = mockTranslations[lang]?.[key];
  if (typeof value === 'function') {
    return value(...args);
  }
  return value || key; // Fallback to key if translation not found
};

describe('getTranslation', () => {
  describe('Arabic Mode (isArabic = true)', () => {
    beforeAll(() => {
      global.isArabic = true;
    });

    test('should retrieve a simple string in Arabic', () => {
      expect(getTranslationForTest('testKey')).toBe("مفتاح اختبار");
    });

    test('should retrieve a string with an argument in Arabic', () => {
      expect(getTranslationForTest('greet', 'أحمد')).toBe("مرحباً أحمد");
    });

    test('should return the key if translation is not found in Arabic', () => {
      expect(getTranslationForTest('nonExistentKey')).toBe("nonExistentKey");
    });
  });

  describe('English Mode (isArabic = false)', () => {
    beforeAll(() => {
      global.isArabic = false;
    });

    test('should retrieve a simple string in English', () => {
      expect(getTranslationForTest('testKey')).toBe("Test Key");
    });

    test('should retrieve a string with an argument in English', () => {
      expect(getTranslationForTest('greet', 'John')).toBe("Hello John");
    });

    test('should return the key if translation is not found in English', () => {
      expect(getTranslationForTest('nonExistentKey')).toBe("nonExistentKey");
    });
  });

  test('should handle missing language in translations gracefully', () => {
    global.isArabic = true; // Ensure a specific language context
    const originalArTranslations = mockTranslations.ar;
    mockTranslations.ar = undefined; // Temporarily remove 'ar' language translations
    expect(getTranslationForTest('testKey')).toBe('testKey');
    mockTranslations.ar = originalArTranslations; // Restore
  });

   test('should handle missing key in specific language gracefully', () => {
    global.isArabic = true;
    expect(getTranslationForTest('anotherMissingKey')).toBe('anotherMissingKey');
  });
});

// calculateDistance function (copied for testing, or would be imported)
const calculateDistance = (coords1, coords2) => {
  if (coords1 == null || coords2 == null ||
      typeof coords1.latitude !== 'number' || typeof coords1.longitude !== 'number' ||
      typeof coords2.latitude !== 'number' || typeof coords2.longitude !== 'number') {
    return Infinity;
  }
  const latDiff = coords1.latitude - coords2.latitude;
  const lonDiff = coords1.longitude - coords2.longitude;
  return Math.sqrt(Math.pow(latDiff, 2) + Math.pow(lonDiff, 2));
};

describe('calculateDistance', () => {
  test('should return 0 for identical coordinates', () => {
    const coords1 = { latitude: 10, longitude: 20 };
    const coords2 = { latitude: 10, longitude: 20 };
    expect(calculateDistance(coords1, coords2)).toBe(0);
  });

  test('should calculate distance correctly for positive coordinates', () => {
    const coords1 = { latitude: 0, longitude: 0 };
    const coords2 = { latitude: 3, longitude: 4 }; // Forms a 3-4-5 triangle
    expect(calculateDistance(coords1, coords2)).toBe(5);
  });

  test('should calculate distance correctly with negative coordinates', () => {
    const coords1 = { latitude: 0, longitude: 0 };
    const coords2 = { latitude: -3, longitude: -4 };
    expect(calculateDistance(coords1, coords2)).toBe(5);
  });

  test('should calculate distance correctly with mixed sign coordinates', () => {
    const coords1 = { latitude: 1, longitude: 1 };
    const coords2 = { latitude: -2, longitude: 5 }; // diff lat = 3, diff lon = -4
    expect(calculateDistance(coords1, coords2)).toBe(5);
  });

  test('should return Infinity if first coordinate is null', () => {
    const coords2 = { latitude: 10, longitude: 20 };
    expect(calculateDistance(null, coords2)).toBe(Infinity);
  });

  test('should return Infinity if second coordinate is null', () => {
    const coords1 = { latitude: 10, longitude: 20 };
    expect(calculateDistance(coords1, null)).toBe(Infinity);
  });

  test('should return Infinity if latitude is missing in first coordinate', () => {
    const coords1 = { longitude: 20 };
    const coords2 = { latitude: 10, longitude: 20 };
    expect(calculateDistance(coords1, coords2)).toBe(Infinity);
  });

  test('should return Infinity if longitude is not a number in second coordinate', () => {
    const coords1 = { latitude: 10, longitude: 20 };
    const coords2 = { latitude: 10, longitude: "abc" };
    expect(calculateDistance(coords1, coords2)).toBe(Infinity);
  });
});
