const { requestFailed } = require('../../../../utils/index');

class Service {
  constructor() {}

  fetch = async () => {
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      this.today = `${month}.${day}`;
      await this.getHistoryList();
    } catch (e) {
      console.log(e);
    }
  };

  dataSource = {};
  imgUri = 'http://img.lssdjt.com';

  getHistoryList = async () => {
    const url = `http://code.lssdjt.com/jsondata/history.${this.today}.js`;
    let response = await $http.get({ url });
    if (requestFailed(response)) {
      response = $cache.get('historyDay');
    } else {
      $cache.set('historyDay', response);
    }
    response = response.data;
    if (response && response.d.length > 0) {
      const dataSource = response.d;
      this.dataSource = dataSource
        .filter((item) => item.j[0])
        .map((item) => ({ ...item, j: item.j[0] }));
    }
  };
}

module.exports = Service;
