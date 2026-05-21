# 天气预报与温馨提醒

微信小程序 - 实时天气查询 + 智能出行提醒 + 每日励志语录

## 功能

- **实时天气**：温度、体感温度、湿度、风力、气压
- **三日预报**：未来三天的天气趋势
- **智能提醒**：根据天气条件自动生成出行建议（雨雪、温差、大风、雾霾等）
- **每日励志**：每天一条正能量句子
- **城市切换**：自动定位 + 手动搜索切换城市

## 开发准备

1. **注册小程序**：到 [mp.weixin.qq.com](https://mp.weixin.qq.com) 注册，获取 AppID
2. **注册和风天气**：到 [dev.qweather.com](https://dev.qweather.com) 注册，免费版即可
3. **安装开发者工具**：[微信开发者工具下载](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

## 配置步骤

### 1. 填入和风天气 Key

打开 `utils/weather.js`，将第 6 行的 `YOUR_QWEATHER_KEY` 替换为你在和风天气申请的 API Key：

```js
const API_KEY = '你的和风天气Key';
```

### 2. 填入小程序 AppID

打开 `project.config.json`，将 `appid` 字段替换为你在微信公众平台获取的 AppID：

```json
"appid": "你的小程序AppID"
```

### 3. 导入并预览

1. 打开微信开发者工具
2. 选择「导入项目」-> 选择 `weather-miniapp` 目录
3. 填入 AppID
4. 点击「预览」扫码在手机上查看

## 项目目录

```
weather-miniapp/
├── app.js               # 入口文件
├── app.json             # 全局配置
├── app.wxss             # 全局样式
├── project.config.json  # 项目配置
├── pages/
│   ├── index/           # 主页 - 天气 + 提醒 + 励志
│   └── setting/         # 设置页 - 城市选择、功能开关
├── utils/
│   ├── weather.js       # 和风天气 API 封装
│   ├── reminder.js      # 提醒规则 + 励志句子库（100+条）
│   └── storage.js       # 本地缓存管理
└── README.md
```

## 和风天气 API 说明

- 实时天气：`/v7/weather/now`
- 三日预报：`/v7/weather/3d`
- 城市搜索：`/v2/city/lookup`
- 免费版：1000 次/天，个人使用完全够

代码中已做 5 分钟缓存，避免同城市重复请求。

## 天气提醒规则

| 条件 | 提醒 |
|------|------|
| 雨/雪 | 带伞 |
| 体感温差 ≥5°C | 体感温度提醒 |
| 高温 ≥35°C | 防暑提醒 |
| 低温 ≤5°C | 保暖提醒 |
| 大风 ≥30km/h | 防风提醒 |
| 湿度 >85% | 闷热/湿冷提醒 |
| 紫外线强 | 防晒提醒 |
| 气压 <990hPa | 天气变化预警 |
