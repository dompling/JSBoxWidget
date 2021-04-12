const { getChartConfig } = require('./func');
const { cacheRequest } = require('../../../../utils/index');
class Service {
  constructor(account) {
    this.account = account;
  }

  dataSource = {
    restData: '0',
    usedData: '0',
    totalData: '0',
    todayData: '0',
    isCheckIn: false,
  };

  label = {
    restData: '剩余',
    usedData: '已用',
    totalData: '总量',
    todayData: '上传',
  };

  account = { logo: '', title: '', url: '' };

  chart1 = '';
  chart2 = '';
  chart3 = '';
  fontColor = '';
  color1 = ['#ef0a6a', '#b6359c'];
  color2 = ['#ff54fa', '#fad126'];
  color3 = ['#28cfb3', '#72d7cc'];

  dataKey = `dataSource_${this.account.url}`;

  fetch = async () => {
    try {
      if ($cache.get(this.dataKey)) {
        this.dataSource = $cache.get(this.dataKey);
      } else {
        await this.init();
      }
      this.init();

      const image1 = $cache.get(this.account.url + '_' + 1);
      const image2 = $cache.get(this.account.url + '_' + 2);
      const image3 = $cache.get(this.account.url + '_' + 3);
      if (image1 && image2 && image3) {
        this.chart1 = image1.data.image;
        this.chart2 = image2.data.image;
        this.chart3 = image3.data.image;
      }
    } catch (e) {
      console.log(e);
    }
  };

  init = async () => {
    const data = await this.getdata(this.account.url);
    const total = data[2];
    const today = data[0];
    const remain = data[2] - data[0] - data[1];
    const use = total - remain;
    this.dataSource.restData = remain;
    this.dataSource.totalData = total;
    this.dataSource.usedData = use;
    this.dataSource.todayData = today;
    $cache.set(this.dataKey, this.dataSource);
    await this.createChart(360);
    console.log('接口数据调用');
  };

  async getdata(url) {
    let req;
    if ($device.networkType) req = await $http.get({ url, timeout: 2 });
    req = cacheRequest(this.account.url, req);
    console.log(req);
    let resp = req.response.headers['subscription-userinfo'];
    resp = [
      parseInt(resp.match(/upload=([0-9]+);?/)[1]).toFixed(2),
      parseInt(resp.match(/download=([0-9]+);?/)[1]).toFixed(2),
      parseInt(resp.match(/total=([0-9]+);?/)[1]).toFixed(2),
    ];
    return resp;
  }

  formatFileSize(fileSize) {
    if (fileSize < 1024 * 1024) {
      let temp = fileSize / 1024;
      temp = temp.toFixed(2);
      return temp + 'KB';
    } else if (fileSize < 1024 * 1024 * 1024) {
      let temp = fileSize / (1024 * 1024);
      temp = temp.toFixed(2);
      return temp + 'MB';
    } else if (fileSize < 1024 * 1024 * 1024 * 1024) {
      let temp = fileSize / (1024 * 1024 * 1024);
      temp = temp.toFixed(2);
      return temp + 'GB';
    } else {
      let temp = fileSize / (1024 * 1024 * 1024 * 1024);
      temp = temp.toFixed(2);
      return temp + 'TB';
    }
  }

  createChart = async (size) => {
    const { restData, usedData, todayData, totalData } = this.dataSource;
    const total = parseFloat(totalData) || 1;
    const data3 = Math.floor((parseInt(todayData) / total) * 100);
    const data2 = Math.floor((parseInt(usedData) / total) * 100);
    const data1 = Math.floor((parseInt(restData) / total) * 100);
    const data = [data1 || 0, data2 || 0, data3 || 0];

    this.dataSource.todayData = this.formatFileSize(parseInt(todayData));
    this.dataSource.usedData = this.formatFileSize(parseInt(usedData));
    this.dataSource.restData = this.formatFileSize(parseInt(restData));

    const { template1, template2, template3 } = getChartConfig(
      data,
      [this.color1, this.color2, this.color3],
      this.dataSource.restData,
      this.fontColor,
    );

    const getUrl = async (chart, key) => {
      const cacheKey = this.account.url + '_' + key;
      const parmas = encodeURIComponent(chart);
      const url = `https://quickchart.io/chart?w=${size}&h=${size}&f=png&c=${parmas}`;
      let file;
      if (!$device.networkType) file = cacheRequest(cacheKey, file);
      if (!file) {
        file = await $http.download({ url, timeout: 2 });
        file = cacheRequest(cacheKey, file);
      }
      return file.data.image;
    };

    await getUrl(template1, 1);
    await getUrl(template2, 2);
    await getUrl(template3, 3);
  };
}

module.exports = Service;
