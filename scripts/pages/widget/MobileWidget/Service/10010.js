class Service {
  constructor(setting) {
    this.setting = setting;
    this.cookie = setting.get('cookie') || {};
    this.dataKey = `10010_${this.cookie}`;
  }

  dataSource = {
    fee: {
      title: '话费剩余',
      number: 0,
      unit: '元',
      en: '¥',
    },

    flow: {
      percent: 0,
      title: '已用流量',
      number: 0,
      unit: 'MB',
      en: 'MB',
      icon: 'antenna.radiowaves.left.and.right',
      iconColor: $color('#1ab6f8'),
      FGColor: '',
      colors: [],
    },

    voice: {
      percent: 0,
      title: '语音剩余',
      number: 0,
      unit: '分钟',
      en: 'MIN',
      icon: 'phone.fill',
      iconColor: $color('#30d15b'),
      FGColor: '',
      colors: [],
    },

    point: {
      title: '剩余积分',
      number: 0,
      unit: '',
      icon: 'tag.fill',
      iconColor: $color('#fc6d6d'),
    },
  };

  fetch = async () => {
    const netStatus = { 0: '网络中断', 1: 'WI-FI', 2: '蜂窝' };
    console.log(`当前网络状况：${netStatus[$device.networkType]}`);
    if ($cache.get(this.dataKey)) {
      this.dataSource = $cache.get(this.dataKey);
    } else {
      await this.init();
    }
    this.init();
  };

  init = async () => {
    await this.getData();
    $cache.set(this.dataKey, this.dataSource);
  };

  async login() {
    const url =
      'https://m.client.10010.com/dailylottery/static/textdl/userLogin?version=iphone_c@8.0200&desmobile=';
    try {
      const sign = await $http.get({ url, header: { cookie: this.cookie } });
      const signInfo = sign.data;
      if (
        signInfo.indexOf('天天抽奖') >= 0 &&
        signInfo.indexOf('请稍后重试') < 0
      ) {
        console.log('用户登录成功');
      } else {
        console.log('用户登录失败');
      }
    } catch (e) {
      console.log('用户登录失败' + e);
    }
  }

  async getData() {
    await this.login();
    const url =
      'https://m.client.10010.com/mobileserviceimportant/home/queryUserInfoSeven?version=iphone_c@8.0200&desmobiel=&showType=0';

    try {
      const req = await $http.get({ url, header: { cookie: this.cookie } });
      const userInfo = req.data;
      if (userInfo.code === 'Y') {
        console.log('获取信息成功');
        userInfo.data.dataList.forEach((item) => {
          if (item.type === 'fee') {
            if (item.unit === '万元') {
              this.dataSource.fee.number = item.number * 10000;
            } else {
              this.dataSource.fee.number = item.number;
              this.dataSource.fee.unit = item.unit;
            }
            this.dataSource.fee.title = item.remainTitle;
          }
          if (item.type === 'flow') {
            this.dataSource.flow.number = item.number;
            this.dataSource.flow.unit = item.unit;
            this.dataSource.flow.en = item.unit;
            this.dataSource.flow.percent = (100 - item.persent).toFixed(2);
            this.dataSource.flow.title = item.remainTitle;
          }
          if (item.type === 'voice') {
            this.dataSource.voice.number = item.number;
            this.dataSource.voice.unit = item.unit;
            this.dataSource.voice.percent = (100 - item.persent).toFixed(2);
            this.dataSource.voice.title = item.remainTitle;
          }
          if (item.type === 'point') {
            this.dataSource.point.number = item.number;
            this.dataSource.point.title = item.remainTitle;
          }
        });
      } else {
        throw 'cookie错误/服务器维护';
      }
    } catch (e) {
      console.log('获取信息失败：' + e);
    }
  }
}

module.exports = Service;
