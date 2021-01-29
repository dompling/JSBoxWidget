const { getChartConfig, getDaysInMonth } = require('./func');
const { requestFailed } = require('../../../../utils/index');
class Service {
  constructor(account) {
    this.account = account;
  }

  chart1 = '';
  chart2 = '';
  chart3 = '';
  fontColor = '';
  color1 = ['#ef0a6a', '#b6359c'];
  color2 = ['#ff54fa', '#fad126'];
  color3 = ['#28cfb3', '#72d7cc'];
  cookies = {};

  dataSource = {
    restData: '0',
    usedData: '0',
    totalData: '0',
    todayData: '0',
  };

  account = {
    url: '',
    logo: '',
    title: '机场名',
    email: '',
    password: '',
  };

  fetch = async () => {
    await this.login(`${this.account.url}/api/v1/passport/auth/login`);
    await this.getSubscribe(`${this.account.url}/api/v1/user/getSubscribe`);
    await this.createChart(360);
  };

  login = async (url) => {
    const data = {
      email: this.account.email,
      password: this.account.password,
    };
    const res = await $http.post({ url, form: data });
    if (res.data.errors) return console.log(JSON.stringify(res.data));
    this.cookies = res.response.headers['Set-Cookie'];
  };

  getSubscribe = async (url) => {
    const res = await $http.get({
      url,
      header: {
        cookie: this.cookies,
        referer: `${this.account.url}/`,
        'accept-language': 'zh-CN,zh;q=0.9',
      },
    });
    if (res.data.errors) return console.log(JSON.stringify(res.data));
    this.cookies = res.response.headers['Set-Cookie'];
    const subscribe = res.data.data;
    this.dataSource.totalData = `${subscribe.transfer_enable}`;
    this.dataSource.usedData = `${subscribe.d + subscribe.u}`;
    this.dataSource.restData = `${
      subscribe.transfer_enable - (subscribe.d + subscribe.u)
    }`;
    this.dataSource.todayData = `${subscribe.reset_day}`;
  };

  createChart = async (size) => {
    const { restData, usedData, todayData, totalData } = this.dataSource;
    const total = parseFloat(totalData) || 1;
    const now = new Date();
    const days = getDaysInMonth(now.getFullYear(), now.getMonth());
    const data3 = Math.floor((1 - parseInt(todayData) / days) * 100);
    const data2 = Math.floor((parseInt(usedData) / total) * 100);
    const data1 = Math.floor((parseInt(restData) / total) * 100);
    const data = [data1 || 0, data2 || 0, data3 || 0];

    this.dataSource.todayData = `${todayData}天后`;
    this.dataSource.usedData = this.formatFileSize(parseInt(usedData));
    this.dataSource.restData = this.formatFileSize(parseInt(restData));

    const { template1, template2, template3 } = getChartConfig(
      data,
      [this.color1, this.color2, this.color3],
      this.dataSource.restData,
      this.fontColor,
    );

    const getUrl = async (chart, key) => {
      const cacheKey = this.account.url + '_' + this.account.email + key;
      const parmas = encodeURIComponent(chart);
      const url = `https://quickchart.io/chart?w=${size}&h=${size}&f=png&c=${parmas}`;
      let file = await $http.download({ url });
      if (requestFailed(file)) {
        file = $cache.get(cacheKey);
      } else {
        $cache.set(cacheKey, file);
      }
      return file.data.image;
    };

    this.chart1 = await getUrl(template1, 1);
    this.chart2 = await getUrl(template2, 2);
    this.chart3 = await getUrl(template3, 3);
  };

  formatFileSize(fileSize) {
    let temp;
    if (fileSize < 1024 * 1024) {
      temp = fileSize / 1024;
      temp = temp.toFixed(2);
      return temp + 'KB';
    } else if (fileSize < 1024 * 1024 * 1024) {
      temp = fileSize / (1024 * 1024);
      temp = temp.toFixed(2);
      return temp + 'MB';
    } else if (fileSize < 1024 * 1024 * 1024 * 1024) {
      temp = fileSize / (1024 * 1024 * 1024);
      temp = temp.toFixed(2);
      return temp + 'GB';
    } else {
      temp = fileSize / (1024 * 1024 * 1024 * 1024);
      temp = temp.toFixed(2);
      return temp + 'TB';
    }
  }
}

module.exports = Service;
