/**
 * 天气与提醒 - 小程序入口
 */
App({
  globalData: {
    // 全局数据（后续扩展用）
  },

  onLaunch() {
    // 检查定位权限
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation'] === false) {
          // 用户拒绝过定位，后续由页面处理默认城市
          console.log('定位权限已被拒绝');
        }
      }
    });
  },
});
