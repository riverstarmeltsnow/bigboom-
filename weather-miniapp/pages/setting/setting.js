/**
 * 设置页面
 * 城市搜索、定位开关、提醒开关
 */
const storage = require('../../utils/storage');
const weather = require('../../utils/weather');

Page({
  data: {
    settings: {},
    citySearch: '',
    searchResults: [],
    showResults: false,
    searching: false,
  },

  onLoad() {
    const settings = storage.loadSettings();
    this.setData({ settings });
  },

  // 切换自动定位
  toggleAutoLocation(e) {
    const settings = { ...this.data.settings, autoLocation: e.detail.value };
    this.setData({ settings });
    storage.saveSettings(settings);
  },

  // 切换提醒开关
  toggleReminder(e) {
    const settings = { ...this.data.settings, reminderEnabled: e.detail.value };
    this.setData({ settings });
    storage.saveSettings(settings);
  },

  // 切换励志开关
  toggleQuote(e) {
    const settings = { ...this.data.settings, quoteEnabled: e.detail.value };
    this.setData({ settings });
    storage.saveSettings(settings);
  },

  // 城市搜索输入
  onCityInput(e) {
    const keyword = e.detail.value.trim();
    this.setData({ citySearch: keyword });
    if (!keyword) {
      this.setData({ searchResults: [], showResults: false });
      return;
    }
    // 防抖：输入长度 >= 1 就开始搜索
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.searchCity(keyword);
    }, 400);
  },

  searchCity(keyword) {
    if (this.data.searching) return;
    this.setData({ searching: true });
    weather.searchCity(keyword)
      .then(results => {
        // 只保留中国的城市
        const filtered = (results || []).filter(r => r.country === '中国');
        this.setData({ searchResults: filtered, showResults: true });
      })
      .catch(() => {
        wx.showToast({ title: '搜索失败', icon: 'none' });
      })
      .finally(() => {
        this.setData({ searching: false });
      });
  },

  // 选择城市
  selectCity(e) {
    const { name, lat, lon, adm1 } = e.currentTarget.dataset;
    const city = {
      name: name,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      adm: adm1 || '',
    };
    storage.saveCity(city);
    this.setData({
      citySearch: name,
      showResults: false,
      searchResults: [],
    });
    wx.showToast({ title: '已选择 ' + name, icon: 'success' });

    // 通知首页刷新
    const pages = getCurrentPages();
    const homePage = pages.find(p => p.route === 'pages/index/index');
    if (homePage) {
      homePage.loadData();
    }
  },

  // 清除搜索
  clearSearch() {
    this.setData({
      citySearch: '',
      searchResults: [],
      showResults: false,
    });
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '将清除所有本地数据和缓存，确定吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.showToast({ title: '已清除', icon: 'success' });
        }
      }
    });
  },
});
