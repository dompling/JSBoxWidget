const { getChartConfig, getDaysInMonth } = require('./func');
const { cacheRequest } = require('../../../../utils/index');
class Service {
  constructor(account) {
    this.account = account;
    this.dataKey = `v2_${this.account.url}_${this.account.email}`;
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

  label = {
    restData: '剩余',
    usedData: '已用',
    totalData: '总量',
    todayData: '重置',
  };

  account = {
    url: '',
    logo: '',
    title: '机场名',
    email: '',
    password: '',
  };

  fetch = async () => {
    if ($cache.get(this.dataKey)) {
      this.dataSource = $cache.get(this.dataKey);
    } else {
      await this.init();
    }
    this.init();

    const image1 = $cache.get(this.account.url + this.account.email + '_' + 1);
    const image2 = $cache.get(this.account.url + this.account.email + '_' + 2);
    const image3 = $cache.get(this.account.url + this.account.email + '_' + 3);

    if (image1 && image2 && image3) {
      this.chart1 = image1.data.image;
      this.chart2 = image2.data.image;
      this.chart3 = image3.data.image;
    }
  };

  init = () => {
    this.login(`${this.account.url}/api/v1/passport/auth/login`).then(
      async () => {
        await this.getSubscribe(`${this.account.url}/api/v1/user/getSubscribe`);
        await this.createChart(360);
        $cache.set(this.dataKey, this.dataSource);
        console.log('接口数据调用');
      },
    );
  };

  login = async (url) => {
    const data = {
      email: this.account.email,
      password: this.account.password,
    };
    let res = await $http.post({ url, form: data, timeout: 2 });
    res = cacheRequest(`${this.account.url}_cookie_${this.account.email}`, res);
    if (!res.data.errors) this.cookies = res.response.headers['Set-Cookie'];
  };

  getSubscribe = async (url) => {
    let res = await $http.get({
      url,
      timeout: 2,
      header: {
        cookie: this.cookies,
        referer: `${this.account.url}/`,
        'accept-language': 'zh-CN,zh;q=0.9',
      },
    });
    res = cacheRequest(
      `${this.account.url}_subscribe_${this.account.email}`,
      res,
    );
    if (!res.data.errors) {
      this.cookies = res.response.headers['Set-Cookie'];
      const subscribe = res.data.data;
      this.dataSource.totalData = `${subscribe.transfer_enable}`;
      this.dataSource.usedData = `${subscribe.d + subscribe.u}`;
      this.dataSource.restData = `${
        subscribe.transfer_enable - (subscribe.d + subscribe.u)
      }`;
      this.dataSource.todayData = `${subscribe.reset_day}`;
    }
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

    this.dataSource.todayData = `${todayData} D`;
    this.dataSource.usedData = this.formatFileSize(parseInt(usedData));
    this.dataSource.restData = this.formatFileSize(parseInt(restData));

    const { template1, template2, template3 } = getChartConfig(
      data,
      [this.color1, this.color2, this.color3],
      this.dataSource.restData,
      this.fontColor,
    );

    const getUrl = async (chart, key) => {
      const cacheKey = this.account.url + this.account.email + '_' + key;
      const parmas = encodeURIComponent(chart);
      const url = `https://quickchart.io/chart?w=${size}&h=${size}&f=png&c=${parmas}`;
      let file;
      if (!$device.networkType) file = cacheRequest(cacheKey, file);
      if (!file) {
        file = await $http.download({ url });
        file = cacheRequest(cacheKey, file);
      }
      return file.data.image;
    };

    await getUrl(template1, 1);
    await getUrl(template2, 2);
    await getUrl(template3, 3);
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
