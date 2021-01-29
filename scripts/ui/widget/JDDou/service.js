const { requestFailed } = require('../../../utils/index');

class Service {
  constructor(cookie) {
    this.cookie = cookie || {};
    this.timerKeys = this.getDay(0);
  }
  headImageUrl =
    'https://img11.360buyimg.com/jdphoto/s120x120_jfs/t21160/90/706848746/2813/d1060df5/5b163ef9N4a3d7aa6.png';
  state = {
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
    if (!this.cookie) {
      $ui.toast('请填写京东 CK 信息');
      return;
    }
    await this.TotalBean();
    await this.getMainData();
    await this.getAmountData();
  };

  async getAmountData() {
    let i = 0,
      page = 1;
    do {
      const response = await this.getJingBeanBalanceDetail(page);
      console.log(
        `第${page}页：${response.code === '0' ? '请求成功' : '请求失败'}`,
      );
      if (response.code === '3') {
        i = 1;
        console.log(response);
      }
      if (response && response.code === '0') {
        page++;
        let detailList = response.jingDetailList;
        if (detailList && detailList.length > 0) {
          for (let item of detailList) {
            const dates = item.date.split(' ');
            if (this.timerKeys.indexOf(dates[0]) > -1) {
              if (this.timerKeys[0] === dates[0]) {
                const amount = Number(item.amount);
                if (amount > 0)
                  this.set('incomeBean', this.get('incomeBean') + amount);
                if (amount < 0)
                  this.set('expenseBean', this.get('expenseBean') + amount);
              }
            } else {
              i = 1;
              break;
            }
          }
        }
      }
    } while (i === 0);
  }

  getDay(dayNumber) {
    let data = [];
    let i = dayNumber;
    do {
      const today = new Date();
      const year = today.getFullYear();
      const targetday_milliseconds = today.getTime() - 1000 * 60 * 60 * 24 * i;
      today.setTime(targetday_milliseconds); //注意，这行是关键代码
      let month = today.getMonth() + 1;
      month = month >= 10 ? month : `0${month}`;
      let day = today.getDate();
      day = day >= 10 ? day : `0${day}`;
      data.push(`${year}-${month}-${day}`);
      i--;
    } while (i >= 0);
    return data;
  }

  async TotalBean() {
    const options = {
      url: 'https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2',
      header: {
        Accept: 'application/json,text/plain, */*',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-cn',
        Connection: 'keep-alive',
        Cookie: this.cookie,
        Referer: 'https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      },
    };

    const key = `${this.cookie}_total`;
    let response = await $http.post(options);
    if (requestFailed(response) || !response.data.base) {
      response = $cache.get(key);
    } else {
      $cache.set(key, response);
    }
    this.set('beanCount', response.data.base.jdNum);
    this.set('userInfo', response.data.base);
    this.set('isPlusVip', response.data.isPlusVip);
    const avatar = response.data.base.headImageUrl || this.headImageUrl;
    let file = await $http.download({ url: avatar });
    if (requestFailed(file)) {
      file = $cache.get(avatar);
    } else {
      $cache.set(avatar, file);
    }
    this.state.userInfo.headImageUrl = file.data.image;
    return response.data;
  }

  async getJingBeanBalanceDetail(page) {
    const options = {
      url: `https://bean.m.jd.com/beanDetail/detail.json`,
      body: `page=${page}`,
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
    const response = await $http.post(options);
    return response.data;
  }

  async getMainData() {
    //津贴查询
    const JTReq_opt = {
      url: 'https://ms.jr.jd.com/gw/generic/uc/h5/m/mySubsidyBalance',
      header: {
        cookie: this.cookie,
        Referer: 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
      },
    };
    const JTData = await $http.post(JTReq_opt);
    //钢镚查询
    const gb_opt = {
      url: 'https://coin.jd.com/m/gb/getBaseInfo.html',
      header: {
        cookie: this.cookie,
        Referer: 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
      },
    };
    const GBData = await $http.post(gb_opt);
    if (JTData.data) {
      this.set('jt_and_gb', {
        jintie: JTData.data.resultData.data['balance'],
        gangbeng: GBData.data.gbBalance,
      });
    }
  }
}

module.exports = Service;
