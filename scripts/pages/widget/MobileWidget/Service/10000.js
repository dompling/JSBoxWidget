class Service {
  constructor(setting) {
    this.setting = setting;
    this.china_telecom_url = setting.get("cookie") || {};
    const cacheKey = $text.MD5(this.china_telecom_url);
    if (cacheKey) {
      this.dataKey = `10000_${cacheKey}`;
    }
  }

  fetchUrl = {
    login: "https://e.dlife.cn/index.do",
    detail: "https://e.dlife.cn/user/package_detail.do",
    balance: "https://e.dlife.cn/user/balance.do",
    bill: "https://e.dlife.cn/user/bill.do",
  };

  flowColorHex = "#FF6620";
  voiceColorHex = "#78C100";

  dataSource = {
    fee: {
      title: "话费剩余",
      number: 0,
      unit: "元",
      en: "¥",
    },

    flow: {
      percent: 0,
      title: "剩余流量",
      number: 0,
      unit: "MB",
      en: "MB",
      icon: "antenna.radiowaves.left.and.right",
      iconColor: $color("#1ab6f8"),
      FGColor: $color(this.flowColorHex),
      colors: [],
    },

    voice: {
      percent: 0,
      title: "语音剩余",
      number: 0,
      unit: "分钟",
      en: "MIN",
      icon: "phone.fill",
      iconColor: $color("#30d15b"),
      FGColor: $color(this.voiceColorHex),
      colors: [],
    },

    point: {
      title: "更新时间",
      number: 0,
      unit: "",
      icon: "tag.fill",
      iconColor: $color("#fc6d6d"),
    },
  };

  fetch = async () => {
    try {
      const netStatus = { 0: "网络中断", 1: "WI-FI", 2: "蜂窝" };
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
    if (this.dataSource.fee.number !== 0 && this.dataSource.flow.number !== 0)
      $cache.set(this.dataKey, this.dataSource);
  };

  formatFlow(number) {
    const n = number / 1024;
    if (n < 1024) {
      return { count: n.toFixed(2), unit: "MB" };
    }
    return { count: (n / 1024).toFixed(2), unit: "GB" };
  }

  updateCookie = async (loginUrl) => {
    if (loginUrl) {
      const url = loginUrl.match(/(http.+)&sign/)?.[1] || loginUrl;
      const req = await $http.get({ url });
      const cookie = req.response.headers["Set-Cookie"];
      if (cookie) this.cookie = cookie;
    }
  };

  getData = async () => {
    if (!this.china_telecom_url) {
      return $push.schedule({
        title: "电信组件",
        body: "请配置登录地址",
      });
    }
    await this.updateCookie(this.china_telecom_url);
    const detail = await $http.get({
      url: this.fetchUrl.detail,
      headers: {
        Cookie: this.cookie,
      },
    });

    let flows = {
        balanceAmount: 0,
        usageAmount: 0,
        ratableAmount: 0,
      },
      voice = {
        balanceAmount: 0,
        usageAmount: 0,
        ratableAmount: 0,
      };
    console.log(detail);
    detail.data.items?.forEach((data) => {
      data.items.forEach((item) => {
        if (item.balanceAmount != "999999999999" && item.unitTypeId === "3") {
          Object.keys(flows).forEach((key) => {
            flows[key] += Number(item[key]);
          });
        }
        if (item.unitTypeId === "1") {
          Object.keys(voice).forEach((key) => {
            voice[key] += Number(item[key]);
          });
        }
      });
    });

    this.dataSource.flow.percent = (
      (flows.balanceAmount / flows.ratableAmount) *
      100
    ).toFixed(2);
    const flow = this.formatFlow(flows.balanceAmount);
    this.dataSource.flow.number = flow.count;
    this.dataSource.flow.unit = flow.unit;
    this.dataSource.flow.en = flow.unit;

    if (voice) {
      this.dataSource.voice.percent = (
        (Number(voice.balanceAmount) / Number(voice.ratableAmount)) *
        100
      ).toFixed(2);

      this.dataSource.voice.number = voice.balanceAmount;
    }

    const balance = await $http.get({
      url: this.fetchUrl.balance,
      headers: {
        Cookie: this.cookie,
      },
    });

    balance.data.totalBalanceAvailable = Number(
      balance.data.totalBalanceAvailable
    );
    this.dataSource.fee.number = balance.data.totalBalanceAvailable / 100;
  };
}

module.exports = Service;
