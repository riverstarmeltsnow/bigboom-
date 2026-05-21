/**
 * 和风天气 API 封装
 * 文档：https://dev.qweather.com/docs/api/
 */

// API Key — 和风天气身份认证（简单API密钥）
const API_KEY = '7762292823f949009455cdc614177413';
const BASE_URL = 'https://mj3tehy45d.re.qweatherapi.com/v7';
const GEO_URL = 'https://mj3tehy45d.re.qweatherapi.com/geo/v2';

/**
 * 发起请求并处理结果（API Key 认证）
 */
function request(url, params = {}) {
  return new Promise((resolve, reject) => {
    params.key = API_KEY;
    wx.request({
      url,
      data: params,
      enableHttp2: true,
      success: (res) => {
        console.log('QWeather 响应:', res.statusCode, JSON.stringify(res.data));
        if (res.data && res.data.code === '200') {
          resolve(res.data);
        } else {
          const msg = res.data ? `code=${res.data.code}` : `HTTP ${res.statusCode}`;
          reject(new Error('请求失败: ' + msg));
        }
      },
      fail: (err) => reject(err)
    });
  });
}

/**
 * 获取实时天气
 * @param {number} lat - 纬度
 * @param {number} lon - 经度
 * @returns {Promise<Object>} 实时天气数据
 */
function getNow(lat, lon) {
  // 检查缓存，5分钟内不重复请求
  const cache = wx.getStorageSync('cache_now');
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  if (cache && cache.key === cacheKey && Date.now() - cache.time < 300000) {
    return Promise.resolve(cache.data);
  }
  return request(`${BASE_URL}/weather/now`, { location: `${lon},${lat}` })
    .then(data => {
      wx.setStorageSync('cache_now', {
        key: cacheKey, data: data.now, time: Date.now()
      });
      return data.now;
    });
}

/**
 * 获取 3 天预报
 * @param {number} lat - 纬度
 * @param {number} lon - 经度
 * @returns {Promise<Array>} 预报数组
 */
function get3d(lat, lon) {
  const cache = wx.getStorageSync('cache_3d');
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  if (cache && cache.key === cacheKey && Date.now() - cache.time < 300000) {
    return Promise.resolve(cache.data);
  }
  return request(`${BASE_URL}/weather/3d`, { location: `${lon},${lat}` })
    .then(data => {
      wx.setStorageSync('cache_3d', {
        key: cacheKey, data: data.daily, time: Date.now()
      });
      return data.daily;
    });
}

/**
 * 城市搜索
 * @param {string} keyword - 城市名
 * @returns {Promise<Array>} 城市列表
 */
function searchCity(keyword) {
  return request(`${GEO_URL}/city/lookup`, { location: keyword })
    .then(data => data.location || []);
}

/**
 * 逆地理编码：根据坐标获取城市名
 * 先用和风天气 geo API，失败后用 BigDataCloud 免费 API 做备用
 * @param {number} lat - 纬度
 * @param {number} lon - 经度
 * @returns {Promise<string>} 城市名
 */
function reverseGeocode(lat, lon) {
  // 先试和风天气的 geo API
  return searchCity(`${lon},${lat}`)
    .then(results => {
      if (results && results.length > 0) {
        return results[0].name;
      }
      throw new Error('no result');
    })
    .catch(() => {
      // 备用：用 BigDataCloud 免费逆地理编码（无需 Key）
      return new Promise((resolve) => {
        wx.request({
          url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`,
          success: (res) => {
            if (res.data && res.data.city) {
              resolve(res.data.city);
            } else {
              resolve('当前位置');
            }
          },
          fail: () => resolve('当前位置'),
        });
      });
    });
}

/**
 * 根据天气代码返回对应图标路径
 * 和风天气 icon 编号: https://dev.qweather.com/docs/resource/icons/
 */
function getWeatherIcon(code) {
  const iconMap = {
    '100': '☀️', '101': '🌤', '102': '⛅', '103': '🌥',
    '104': '☁️', '150': '🌙', '151': '🌤', '152': '☁️', '153': '☁️',
    '300': '🌦', '301': '🌦', '302': '🌧', '303': '🌧', '304': '🌧',
    '305': '🌧', '306': '🌧', '307': '🌧', '308': '🌧', '309': '🌧',
    '310': '🌦', '311': '🌧', '312': '🌧', '313': '🌧', '314': '🌧',
    '315': '🌧', '316': '🌧', '317': '🌧', '318': '🌧', '399': '🌧',
    '400': '🌨', '401': '🌨', '402': '🌨', '403': '🌨', '404': '🌨',
    '405': '🌨', '406': '🌨', '407': '🌨', '408': '🌨', '409': '🌨',
    '410': '🌨', '499': '🌨',
    '500': '🌫', '501': '🌫', '502': '🌫', '509': '🌫', '510': '🌫',
    '511': '🌫', '512': '🌫', '513': '🌫', '514': '🌫', '515': '🌫',
    '900': '🌪',
  };
  return iconMap[code] || '🌤';
}

/**
 * 根据天气代码返回背景渐变建议（未来可扩展 UI 主题）
 */
function getWeatherBg(code) {
  const clear = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
  const cloudy = 'linear-gradient(135deg, #a8c0ff 0%, #8ec5fc 100%)';
  const rain = 'linear-gradient(135deg, #7f8c8d 0%, #5d6d7e 100%)';
  const snow = 'linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)';
  const night = 'linear-gradient(135deg, #2c3e50 0%, #1a1a2e 100%)';
  const fog = 'linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%)';

  const codeNum = parseInt(code);
  if (codeNum === 100 || codeNum === 150) return clear;
  if (codeNum >= 101 && codeNum <= 104) return cloudy;
  if (codeNum >= 151 && codeNum <= 153) return cloudy;
  if (codeNum >= 300 && codeNum <= 399) return rain;
  if (codeNum >= 400 && codeNum <= 499) return snow;
  if (codeNum >= 500 && codeNum <= 515) return fog;
  if (codeNum === 900) return night;
  return clear;
}

module.exports = { getNow, get3d, searchCity, reverseGeocode, getWeatherIcon, getWeatherBg };
