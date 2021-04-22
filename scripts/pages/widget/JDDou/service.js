const { cacheRequest } = require('../../../utils/index');

class Service {
  constructor(setting) {
    this.setting = setting;
    this.cookie = setting.get('cookie') || {};
    this.ctType = setting.get('ctType');
    this.timerKeys = this.getDay(this.ctType ? 4 : 0);
    this.now = this.format(new Date());
    this.dataKey = `jddou_datas_${this.cookie}`;
    this.chartKey = `jddou_${this.cookie}_chart_ks`;
  }

  headImageUrl =
    'https://img11.360buyimg.com/jdphoto/s120x120_jfs/t21160/90/706848746/2813/d1060df5/5b163ef9N4a3d7aa6.png';

  state = {
    charts: {},
    chart: null,
    incomeBean: 0,
    expenseBean: 0,
    beanCount: 0,
    userInfo: { headImageUrl: this.headImageUrl },
    isPlusVip: false,
    jt_and_gb: {
      jintie: 0,
      gangbeng: 0,
    },
  };

  set = (key, value) => {
    this.state[key] = value;
  };

  get = (key) => {
    return this.state[key];
  };

  fetch = async () => {
    const netStatus = { 0: '网络中断', 1: 'WI-FI', 2: '蜂窝' };
    console.log(`当前网络状况：${netStatus[$device.networkType]}`);
    if ($cache.get(this.dataKey)) {
      this.state = $cache.get(this.dataKey);
    } else {
      await this.init();
    }
    this.init();
  };

  init = async () => {
    try {
      await this.TotalBean();
      const charts = $cache.get(this.chartKey) || {};
      const timerData = [...this.timerKeys];
      this.state.charts = {};
      timerData.map((date) => {
        if (charts[date] !== undefined && date !== this.now) {
          this.state.charts[date] = charts[date];
          const index = this.timerKeys.indexOf(date);
          this.timerKeys.splice(index, 1);
        } else {
          this.state.charts[date] = 0;
        }
      });
      this.state.incomeBean = 0;
      this.state.expenseBean = 0;
      await this.getAmountData();
      await this.getMainData();
      if (this.ctType) await this.createChart();
      $cache.set(this.dataKey, this.state);
      $cache.set(this.chartKey, this.state.charts);
      console.log('接口数据调用');
    } catch (e) {
      console.log(e);
    }
  };

  async getAmountData() {
    let i = 0,
      page = 1;
    do {
      const response = await this.getJingBeanBalanceDetail(page);
      console.log(`超时：${page} 页`);
      if (response.code === '3') i = 1;
      if (response && response.code === '0') {
        page++;
        let detailList = response.jingDetailList;
        if (detailList && detailList.length > 0) {
          for (let item of detailList) {
            const dates = item.date.split(' ');
            if (this.timerKeys.indexOf(dates[0]) > -1) {
              if (this.now === dates[0]) {
                const amount = Number(item.amount);
                if (amount > 0)
                  this.set('incomeBean', this.get('incomeBean') + amount);
                if (amount < 0)
                  this.set('expenseBean', this.get('expenseBean') + amount);
              }
              this.state.charts[dates[0]] += Number(item.amount);
            } else {
              i = 1;
              break;
            }
          }
        }
      }
    } while (i === 0);
  }

  format = (date) => {
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = month >= 10 ? month : `0${month}`;
    let day = date.getDate();
    day = day >= 10 ? day : `0${day}`;
    return `${year}-${month}-${day}`;
  };

  getDay(dayNumber) {
    let data = [];
    let i = dayNumber;
    do {
      const today = new Date();
      const targetday_milliseconds = today.getTime() - 1000 * 60 * 60 * 24 * i;
      today.setTime(targetday_milliseconds); //注意，这行是关键代码
      const key = this.format(today);
      data.push(key);
      i--;
    } while (i >= 0);
    return data;
  }

  async TotalBean() {
    const headers = {
      Cookie: this.cookie,
    };
    const options = {
      url: 'https://me-api.jd.com/user_new/info/GetJDUserInfoUnion',
      timeout: 2,
      header: headers,
    };

    const key = `${this.cookie}_new_total`;
    let response;
    if ($device.networkType) response = await $http.get(options);
    response = cacheRequest(key, response);
    try {
      const JDData = response.data.data;
      const baseInfo = JDData.userInfo.baseInfo;
      baseInfo.xbScore = JDData.userInfo.xbScore;
      const beanCount = JDData.assetInfo.beanNum;
      const isPlusVip = JDData.userInfo.isPlusVip === '1';
      this.set('beanCount', beanCount);
      this.set('userInfo', baseInfo);
      this.set('isPlusVip', isPlusVip);
      const avatar = baseInfo.headImageUrl || this.headImageUrl;
      let file;
      if ($cache.get(avatar)) file = $cache.get(avatar);
      if (!file) {
        file = await $http.download({ url: avatar, timeout: 2 });
        file = cacheRequest(avatar, file);
      }
      this.state.userInfo.headImageUrl = file.data.image;
    } catch (e) {
      console.log(e);
    }
  }

  async getJingBeanBalanceDetail(page) {
    const options = {
      url: `https://bean.m.jd.com/beanDetail/detail.json`,
      body: `page=${page}`,
      timeout: 2,
      header: {
        'X-Requested-With': `XMLHttpRequest`,
        Connection: `keep-alive`,
        'Accept-Encoding': `gzip, deflate, br`,
        'Content-Type': `application/x-www-form-urlencoded; charset=UTF-8`,
        Origin: `https://bean.m.jd.com`,
        'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15`,
        Cookie: this.cookie,
        Host: `bean.m.jd.com`,
        Referer: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`,
        'Accept-Language': `zh-cn`,
        Accept: `application/json, text/javascript, */*; q=0.01`,
      },
    };
    let response = null;
    if ($device.networkType) response = await $http.post(options);
    response = cacheRequest(`jddou_${this.cookie}_pages-${page}`, response);
    return response.data;
  }

  async getMainData() {
    //津贴查询
    const JTReq_opt = {
      url: 'https://ms.jr.jd.com/gw/generic/uc/h5/m/mySubsidyBalance',
      timeout: 2,
      header: {
        cookie: this.cookie,
        Referer: 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
      },
    };
    let JTData;
    if ($device.networkType) JTData = await $http.post(JTReq_opt);
    JTData = cacheRequest(`JTData_${this.cookie}`, JTData);
    //钢镚查询
    const gb_opt = {
      url: 'https://coin.jd.com/m/gb/getBaseInfo.html',
      timeout: 2,
      header: {
        cookie: this.cookie,
        Referer: 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
      },
    };
    let GBData;
    if ($device.networkType) GBData = await $http.post(gb_opt);
    GBData = cacheRequest(`GBData_${this.cookie}`, GBData);
    if (JTData.data) {
      this.set('jt_and_gb', {
        jintie: JTData.data.resultData.data['balance'],
        gangbeng: GBData.data.gbBalance,
      });
    }
  }

  chartConfig = (labels = [], datas = []) => {
    const chart_color = this.setting.get('chartColor');
    let template = `
{
  'type': 'bar',
  'data': {
    'labels': __LABELS__,
    'datasets': [
      {
        type: 'line',
        backgroundColor: '#fff',
        borderColor: getGradientFillHelper('vertical', ['#c8e3fa', '${chart_color}']),
        'borderWidth': 6,
        pointRadius: 10,
        'fill': false,
        'data': __DATAS__,
      },
    ],
  },
  'options': {
      plugins: {
        datalabels: {
          display: true,
          align: 'top',
          color: __COLOR__,
          font: {
             size: '32'
          }
        },
      },
      layout: {
          padding: {
              left: 0,
              right: 0,
              top: 50,
              bottom: 0
          }
      },
      responsive: true,
      maintainAspectRatio: true,
      'legend': {
        'display': false,
      },
      'title': {
        'display': false,
      },
      scales: {
        xAxes: [ // X 轴线
          {
            gridLines: {
              display: false,
              color: __COLOR__,
            },
            ticks: {
              display: true, 
              fontColor: __COLOR__,
              fontSize: '28',
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              display: false,
              beginAtZero: true,
              fontColor: __COLOR__,
            },
            gridLines: {
              borderDash: [7, 5],
              display: false,
              color: __COLOR__,
            },
          },
        ],
      },
    },
 }`;
    const color = !$widget.isDarkMode
      ? this.setting.get('lightFont')
      : this.setting.get('nightFont');
    template = template.replaceAll('__COLOR__', `'${color}'`);
    template = template.replace('__LABELS__', `${JSON.stringify(labels)}`);
    template = template.replace('__DATAS__', `${JSON.stringify(datas)}`);
    return template;
  };

  createChart = async () => {
    let labels = [],
      data = [];
    Object.keys(this.state.charts).forEach((month) => {
      const value = this.state.charts[month];
      const arrMonth = month.split('-');
      labels.push(`${arrMonth[1]}.${arrMonth[2]}`);
      data.push(value);
    });
    const chartStr = this.chartConfig(labels, data);
    const url = `https://quickchart.io/chart?w=580&h=190&f=png&c=${encodeURIComponent(
      chartStr,
    )}`;
    const file = await $http.download({ url });
    this.state.chart = file.data.image;
  };
}

module.exports = Service;
