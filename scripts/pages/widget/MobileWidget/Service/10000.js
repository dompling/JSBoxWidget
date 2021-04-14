class Service {
  constructor(setting) {
    this.setting = setting;
    this.cookie = setting.get('cookie') || {};

    this.dataKey = `10000_${this.cookie}`;
    this.options = {
      header: {
        cookie: this.cookie,
      },
    };
  }

  fetchUrl = {
    detail: 'https://e.189.cn/store/user/package_detail.do',
    balance: 'https://e.189.cn/store/user/balance_new.do',
  };

  flowColorHex = '#FF6620';
  voiceColorHex = '#78C100';

  dataSource = {
    fee: {
      title: '话费剩余',
      number: 0,
      unit: '元',
      en: '¥',
    },

    flow: {
      percent: 0,
      title: '剩余流量',
      number: 0,
      unit: 'MB',
      en: 'MB',
      icon: 'antenna.radiowaves.left.and.right',
      iconColor: $color('#1ab6f8'),
      FGColor: $color(this.flowColorHex),
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
      FGColor: $color(this.voiceColorHex),
      colors: [],
    },

    point: {
      title: '更新时间',
      number: 0,
      unit: '',
      icon: 'tag.fill',
      iconColor: $color('#fc6d6d'),
    },
  };

  fetch = async () => {
    try {
      const netStatus = { 0: '网络中断', 1: 'WI-FI', 2: '蜂窝' };
      console.log(`当前网络状况：${netStatus[$device.networkType]}`);
      if ($cache.get(this.dataKey)) {
        this.dataSource = $cache.get(this.dataKey);
      } else {
        await this.init();
      }
      this.init();
    } catch (error) {
      console.log(error);
    }
  };

  init = async () => {
    await this.getData();
    if (this.dataSource.fee.number !== 0)
      $cache.set(this.dataKey, this.dataSource);
  };

  formatFlow(number) {
    const n = number / 1024;
    if (n < 1024) {
      return { count: n.toFixed(2), unit: 'MB' };
    }
    return { count: (n / 1024).toFixed(2), unit: 'GB' };
  }

  unlimitUser(flow) {
    const usedFlow = this.formatFlow(flow);
    this.dataSource.flow.title = '已用流量';
    this.dataSource.flow.number = usedFlow.count;
    this.dataSource.flow.unit = usedFlow.unit;
    this.dataSource.flow.en = usedFlow.unit;
    if (this.dataSource.flow.unit === 'GB') {
      this.dataSource.flow.percent = (
        100 -
        (this.dataSource.flow.number / (this.dataSource.flow.max || 40)) * 100
      ).toFixed(2);
    } else {
      this.dataSource.flow.percent = (
        100 -
        (this.dataSource.flow.number /
          ((this.dataSource.flow.max || 40) * 1024)) *
          100
      ).toFixed(2);
    }
  }

  getData = async () => {
    const detail = (
      await $http.post({
        url: this.fetchUrl.detail,
        ...this.options,
      })
    ).data;

    const balance = (
      await $http.post({
        url: this.fetchUrl.balance,
        ...this.options,
      })
    ).data;

    if (detail.result === 0) {
      // 套餐分钟数
      if (detail.voiceBalance && detail.voiceAmount) {
        this.dataSource.voice.percent = (
          (Number(detail.voiceBalance) / Number(detail.voiceAmount)) *
          100
        ).toFixed(2);
        this.dataSource.voice.number = detail.voiceBalance;
      } else {
        detail.items.forEach((data) => {
          if (data.offerType == 21) {
            data.items.forEach((item) => {
              if (item.unitTypeId === '1') {
                if (item.ratableAmount !== '0' && item.balanceAmount !== '0') {
                  this.dataSource.voice.percent = (
                    (Number(item.balanceAmount) / Number(item.ratableAmount)) *
                    100
                  ).toFixed(2);
                  this.dataSource.voice.number = item.balanceAmount;
                }
              }
            });
          }
        });
      }
      if (!detail.number && !detail.total) {
        detail.items.forEach((data) => {
          if (data.offerType !== 19) {
            data.items.forEach((item) => {
              if (item.unitTypeId === '3') {
                if (item.usageAmount !== '0' && item.balanceAmount !== '0') {
                  this.dataSource.flow.percent = (
                    (item.balanceAmount / (item.ratableAmount || 1)) *
                    100
                  ).toFixed(2);
                  const flow = this.formatFlow(item.balanceAmount);
                  this.dataSource.flow.number = flow.count;
                  this.dataSource.flow.unit = flow.unit;
                  this.dataSource.flow.en = flow.unit;
                }
                if (data.offerType == 21 && item.ratableAmount == '0') {
                  this.unlimitUser(item.usageAmount);
                }
              }
            });
          }
        });
      } else {
        if (this.usedFlow) {
          this.unlimitUser(detail.used);
        } else {
          this.dataSource.flow.percent = (
            (detail.balance / (detail.total || 1)) *
            100
          ).toFixed(2);
          const flow = this.formatFlow(detail.balance);
          this.dataSource.flow.number = flow.count;
          this.dataSource.flow.unit = flow.unit;
          this.dataSource.flow.en = flow.unit;
        }
      }
    }
    if (balance.result === 0) {
      // 余额
      this.dataSource.fee.number = parseFloat(
        parseInt(balance.totalBalanceAvailable) / 100,
      ).toFixed(2);
    }
  };
}

module.exports = Service;
