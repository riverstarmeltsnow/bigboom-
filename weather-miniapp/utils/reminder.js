/**
 * 天气提醒 + 每日励志句子库
 */

/**
 * 根据天气数据生成提醒文案
 * @param {Object} now - 实时天气数据（和风天气返回的 now 字段）
 * @returns {string} 提醒文案
 */
function getReminder(now) {
  const temp = parseInt(now.temp);
  const text = now.text;           // 天气现象文字（如"晴""雨"）
  const icon = now.icon;           // 天气代码
  const windSpeed = parseFloat(now.windSpeed); // 风速 km/h
  const windDir = now.windDir;     // 风向
  const humidity = parseInt(now.humidity);     // 湿度 %
  const feelsLike = parseInt(now.feelsLike);   // 体感温度
  const pressure = parseInt(now.pressure);     // 气压 hPa
  const messages = [];

  // === 下雨/雪判断 ===
  if (text.includes('雨') || text.includes('雪') || text.includes('雹')) {
    messages.push('🌂 今天有降水，出门记得带伞');
  } else if (text.includes('阴') && humidity > 80) {
    messages.push('☁️ 阴天湿度大，可能下雨，建议带伞备着');
  }

  // === 温度提醒 ===
  if (temp <= -10) {
    messages.push('🧊 极寒天气！尽量减少外出，注意防冻');
  } else if (temp <= 0) {
    messages.push('🧣 气温零下，出门戴好手套围巾，小心路面结冰');
  } else if (temp <= 5) {
    messages.push('🧥 气温偏低，注意添衣保暖，别着凉了');
  } else if (temp <= 12) {
    messages.push('🍂 天气微凉，建议穿一件外套出门');
  } else if (temp >= 40) {
    messages.push('🔥 极端高温！尽量避免午后外出，小心中暑');
  } else if (temp >= 37) {
    messages.push('🥵 非常热！注意防暑降温，多喝水');
  } else if (temp >= 35) {
    messages.push('🧊 高温预警，减少户外活动，注意防晒补水');
  } else if (temp >= 30) {
    messages.push('🧂 天气较热，注意防晒，多补充水分');
  }

  // === 体感温差提醒 ===
  const diff = Math.abs(temp - feelsLike);
  if (diff >= 5 && feelsLike < temp) {
    messages.push('🌡 体感温度比实际低，实际感觉更冷一些');
  } else if (diff >= 5 && feelsLike > temp) {
    messages.push('🌡 体感温度比实际高，实际感觉更热一些');
  }

  // === 大风提醒 ===
  if (windSpeed >= 50) {
    messages.push('🌪 狂风预警！尽量避免外出，注意安全');
  } else if (windSpeed >= 30) {
    messages.push('🌬 风力较大，走路注意高空坠物');
  } else if (windSpeed >= 20) {
    messages.push('🍃 风不小，骑车的朋友注意安全');
  }

  // === 湿度提醒 ===
  if (humidity > 85 && temp > 25) {
    messages.push('💦 湿度高，体感闷热，注意通风');
  } else if (humidity > 85 && temp < 10) {
    messages.push('💧 湿冷天气，注意关节保暖');
  } else if (humidity < 20) {
    messages.push('🏜 空气非常干燥，多喝水，注意保湿');
  }

  // === 气压提醒（骤降可能变天） ===
  if (pressure < 990) {
    messages.push('🌧 气压较低，天气可能转差，提前做好准备');
  }

  // === 紫外线判断（基于天气代码粗略估计） ===
  const iconNum = parseInt(icon);
  if (iconNum === 100 || iconNum === 101 || iconNum === 102) {
    messages.push('🕶 紫外线较强，出门做好防晒');
  }

  // 没有特殊提醒 → 报平安
  if (messages.length === 0) {
    if (text.includes('晴')) {
      messages.push('☀️ 天气晴朗，心情也要放晴哦');
    } else if (text.includes('多云')) {
      messages.push('⛅ 多云天气，不晒也不雨，适合出门走走');
    } else if (text.includes('阴')) {
      messages.push('☁️ 阴天，希望你的心情依然阳光灿烂');
    } else {
      messages.push('🌤 今天天气还不错，祝你有好心情');
    }
  }

  return messages.join('\n');
}

/**
 * 每日励志句子库
 * 每天随机选一条，缓存到本地，一天内不重复
 */
const quotes = [
  '每一天都是一个新的开始。',
  '不要等待机会，而是创造机会。',
  '你的坚持，终将美好。',
  '世界很大，你值得去看看。',
  '今天是你余生中最年轻的一天。',
  '行动是治愈恐惧的良药。',
  '不要因为走得太远，忘了为什么出发。',
  '生活不止眼前的苟且，还有诗和远方的田野。',
  '成功不是终点，失败也不是终结。',
  '当你觉得为时已晚的时候，恰恰是最早的时候。',
  '每一个不起舞的日子，都是对生命的辜负。',
  '所谓梦想，就是永不停息的疯狂。',
  '既然选择了远方，便只顾风雨兼程。',
  '人生没有白走的路，每一步都算数。',
  '你若盛开，蝴蝶自来。',
  '只有极其努力，才能看起来毫不费力。',
  '将来的你，一定会感谢现在拼命的自己。',
  '别让明天的你，讨厌今天的自己。',
  '你只管努力，剩下的交给时间。',
  '耐心和持久，胜过激烈和狂热。',
  '勿以恶小而为之，勿以善小而不为。',
  '学而不思则罔，思而不学则殆。',
  '温故而知新，可以为师矣。',
  '三人行，必有我师焉。',
  '千里之行，始于足下。',
  '不积跬步，无以至千里。',
  '宝剑锋从磨砺出，梅花香自苦寒来。',
  '业精于勤，荒于嬉；行成于思，毁于随。',
  '书山有路勤为径，学海无涯苦作舟。',
  '路漫漫其修远兮，吾将上下而求索。',
  '天生我材必有用，千金散尽还复来。',
  '长风破浪会有时，直挂云帆济沧海。',
  '会当凌绝顶，一览众山小。',
  '沉舟侧畔千帆过，病树前头万木春。',
  '山重水复疑无路，柳暗花明又一村。',
  '不畏浮云遮望眼，自缘身在最高层。',
  '天行健，君子以自强不息。',
  '地势坤，君子以厚德载物。',
  '人生如梦，一樽还酹江月。',
  '海内存知己，天涯若比邻。',
  '莫愁前路无知己，天下谁人不识君。',
  '大鹏一日同风起，扶摇直上九万里。',
  '自信人生二百年，会当水击三千里。',
  '过去属于死神，未来属于你自己。',
  '生活就像一盒巧克力，你永远不知道下一颗是什么味道。',
  '保持微笑，因为生活很美好。',
  '用微笑面对生活，用真诚对待他人。',
  '做一个温暖的人，不卑不亢，清澈善良。',
  '生活明朗，万物可爱。',
  '愿你眼里有光，心中有爱。',
  '只要心中有光，哪里都是晴天。',
  '未来可期，人间值得。',
  '万物皆有裂痕，那是光照进来的地方。',
  '好好生活，慢慢相遇。',
  '与其互为人间，不如自成宇宙。',
  '随遇而安，无往不利。',
  '心之所向，素履以往。',
  '生如逆旅，一苇以航。',
  '凡心所向，素履所往。',
  '道阻且长，行则将至。',
  '行而不辍，未来可期。',
  '岁月不居，时节如流。',
  '功不唐捐，玉汝于成。',
  '念念不忘，必有回响。',
  '但行好事，莫问前程。',
  '知足且上进，温柔且坚定。',
  '既然上了生活的贼船，那就做一个快乐的海盗。',
  '今天的不开心就到此为止，明天依然光芒万丈。',
  '你有多努力，就有多特殊。',
  '半山腰太挤，我们要一起去山顶看看。',
  '可以失败，不可以放弃。',
  '越努力，越幸运。',
  '宁愿跑起来被绊倒无数次，也不愿规规矩矩走一辈子。',
  '别在最好的年纪，辜负最好的自己。',
  '只要路是对的，就不怕路远。',
  '用尽全力，做好每一件小事。',
  '愿你历经山河，仍觉人间值得。',
  '你所做的事情，也许暂时看不到成果，但不要灰心。',
  '你不是没有成长，而是在扎根。',
  '想要得到世上最好的东西，得先让世界看到最好的你。',
  '所有的美好，都在来的路上。',
  '生活从不会辜负一个一直在努力的人。',
  '把身体照顾好，把喜欢的事做好，把重要的人待好。',
  '任何值得到达的地方，都没有捷径。',
  '熬过无人问津的日子，才能拥抱诗和远方。',
  '永远年轻，永远热泪盈眶。',
  '对未来的真正慷慨，是把一切都献给现在。',
  '今天是一个让明天怀念的日子。',
  '最好的投资就是投资自己。',
  '自律即自由。',
  '所有的不期而遇，都在路上。',
  '满怀希望就会所向披靡。',
  '永远热爱，永远期待。',
  '认真生活，就能找到生活藏起来的糖果。',
  '做自己的太阳，无需凭借谁的光。',
  '慢慢来，会好的。',
  '别慌，月亮也未必每晚都发光。',
  '花开不是为了花落，而是为了开得更加灿烂。',
  '只有流过血的手指，才能弹出世间绝唱。',
  '世界上只有一种真正的英雄主义，那就是认清生活的真相后依然热爱生活。',
  '生活总是让我们遍体鳞伤，但到后来，那些受伤的地方会变成最强壮的地方。',
  '努力的意义就是，当好运来临的时候，我觉得我值得。',
];

function getTodayQuote() {
  const today = new Date().toDateString();
  try {
    const cached = wx.getStorageSync('today_quote');
    if (cached && cached.date === today && cached.text) {
      return cached.text;
    }
  } catch (e) {
    // 存储读取失败，忽略
  }
  const idx = Math.floor(Math.random() * quotes.length);
  const text = quotes[idx];
  try {
    wx.setStorageSync('today_quote', { date: today, text });
  } catch (e) {
    // 存储写入失败，忽略
  }
  return text;
}

module.exports = { getReminder, getTodayQuote };
