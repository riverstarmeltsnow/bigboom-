/**
 * 本地缓存管理
 * 用于存储用户设置、城市信息等
 */

const STORAGE_KEYS = {
  CITY: 'user_city',
  SETTINGS: 'user_settings',
  CACHE_NOW: 'cache_now',
  CACHE_3D: 'cache_3d',
  TODAY_QUOTE: 'today_quote',
};

/**
 * 保存用户选择的城市
 */
function saveCity(city) {
  wx.setStorageSync(STORAGE_KEYS.CITY, {
    name: city.name,
    lat: city.lat,
    lon: city.lon,
    adm: city.adm || '',    // 行政区划
    time: Date.now()
  });
}

/**
 * 读取缓存的用户城市
 */
function loadCity() {
  try {
    const data = wx.getStorageSync(STORAGE_KEYS.CITY);
    return data && data.name ? data : null;
  } catch {
    return null;
  }
}

/**
 * 保存用户设置
 */
function saveSettings(settings) {
  wx.setStorageSync(STORAGE_KEYS.SETTINGS, settings);
}

/**
 * 读取用户设置
 */
function loadSettings() {
  try {
    const data = wx.getStorageSync(STORAGE_KEYS.SETTINGS);
    if (data) return data;
  } catch {
    // 忽略
  }
  // 默认设置
  return {
    autoLocation: true,
    tempUnit: 'c',     // c = 摄氏度, f = 华氏度
    reminderEnabled: true,
    quoteEnabled: true,
  };
}

module.exports = {
  STORAGE_KEYS,
  saveCity,
  loadCity,
  saveSettings,
  loadSettings,
};
