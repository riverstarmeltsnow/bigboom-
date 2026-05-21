/**
 * 首页 - 天气展示 + 温馨提醒 + 每日励志
 */
const weatherUtil = require('../../utils/weather');
const reminderUtil = require('../../utils/reminder');
const storage = require('../../utils/storage');

// 星期映射
const WEEKDAY = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

Page({
  data: {
    weather: null,
    forecast: [],        // 预处理后的预报数据（含图标 emoji 和星期）
    weatherIcon: '',
    reminder: '',
    quote: '',
    cityName: '当前位置',
    locationError: false,
    loading: true,
    errorMsg: '',
    refreshed: false,
  },

  onLoad() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onShow() {
    if (!this.data.loading) {
      this.loadData();
    }
  },

  async loadData() {
    this.setData({ loading: true, errorMsg: '' });

    try {
      const savedCity = storage.loadCity();
      const settings = storage.loadSettings();

      if (savedCity && !settings.autoLocation) {
        await this.loadWeatherByCity(savedCity);
      } else {
        await this.loadWeatherByLocation();
      }
    } catch (err) {
      console.error('加载失败', err);
      this.setData({
        errorMsg: '获取天气信息失败\n请检查网络后下拉刷新',
        loading: false,
      });
    }
  },

  loadWeatherByLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        success: async (res) => {
          try {
            await this.fetchWeatherData(res.latitude, res.longitude);
            this.fetchCityName(res.latitude, res.longitude);
            resolve();
          } catch (e) {
            reject(e);
          }
        },
        fail: () => {
          this.setData({ locationError: true });
          this.fetchWeatherData(39.92, 116.41)
            .then(() => {
              this.setData({ cityName: '北京' });
              resolve();
            })
            .catch(reject);
        }
      });
    });
  },

  async loadWeatherByCity(city) {
    this.setData({ cityName: city.name });
    await this.fetchWeatherData(city.lat, city.lon);
  },

  async fetchWeatherData(lat, lon) {
    const [now, forecast] = await Promise.all([
      weatherUtil.getNow(lat, lon),
      weatherUtil.get3d(lat, lon),
    ]);

    const settings = storage.loadSettings();
    const icon = weatherUtil.getWeatherIcon(now.icon);
    const bg = weatherUtil.getWeatherBg(now.icon);

    // 预处理预报数据：添加 emoji 图标和星期
    const processedForecast = (forecast || []).map((day, index) => {
      const date = new Date(day.fxDate);
      // index === 0 显示"今天"，1 显示"明天"，2 显示"后天"
      let dayLabel = WEEKDAY[date.getDay()];
      if (index === 0) dayLabel = '今天';
      else if (index === 1) dayLabel = '明天';
      else if (index === 2) dayLabel = '后天';
      return {
        ...day,
        dayLabel,
        dateText: day.fxDate.slice(5),
        iconEmoji: weatherUtil.getWeatherIcon(day.iconDay),
      };
    });

    const reminder = settings.reminderEnabled
      ? reminderUtil.getReminder(now) : '';
    const quote = settings.quoteEnabled
      ? reminderUtil.getTodayQuote() : '';

    this.setData({
      weather: now,
      forecast: processedForecast,
      weatherIcon: icon,
      bgGradient: bg,
      reminder,
      quote,
      loading: false,
      errorMsg: '',
      refreshed: true,
    });

    setTimeout(() => {
      this.setData({ refreshed: false });
    }, 1500);
  },

  fetchCityName(lat, lon) {
    weatherUtil.reverseGeocode(lat, lon)
      .then(cityName => {
        if (cityName && cityName !== '当前位置') {
          this.setData({ cityName });
          storage.saveCity({ name: cityName, lat, lon, adm: '' });
        } else {
          this.setData({ cityName: '当前位置' });
        }
      })
      .catch(() => {
        this.setData({ cityName: '当前位置' });
      });
  },

  goSetting() {
    wx.navigateTo({ url: '/pages/setting/setting' });
  },

  onRefresh() {
    this.loadData();
  },
});
