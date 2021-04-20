const { cacheRequest } = require('../../../../utils/index');

class Service {
  constructor() {
    this.dataKey = '_historyToday_';
  }

  dataSource = [];
  imgUri = 'http://img.lssdjt.com';

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
    await this.getHistoryList();
    if (this.dataSource && this.dataSource.length) {
      $cache.set(this.dataKey, this.dataSource);
    } else {
      console.log('接口数据异常');
    }
  };

  getHistoryList = async () => {
    const url = `http://api.sodion.net/api_v1/grap/todayinhistory`;
    const response = await $http.get({ url, timeout: 2 });
    this.dataSource = response.data;
  };
}

module.exports = Service;
