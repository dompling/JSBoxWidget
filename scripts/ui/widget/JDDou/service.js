class Service {
  constructor(cookie) {
    this.account = cookie || {};
    this.timerKeys = this.getDay(1);
  }

  incomeBean = 0;
  expenseBean = 0;
  beanCount = 0;
  account = {};

  fetch = async () => {
    await this.TotalBean();
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
                if (amount > 0) this.incomeBean += amount;
                if (amount < 0) this.expenseBean += amount;
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
        Cookie: this.account.cookie,
        Referer: 'https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      },
    };
    const response = await $http.post(options);
    if (response.data.base.jdNum) this.beanCount = response.data.base.jdNum;
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
        Cookie: this.account.cookie,
        Host: `bean.m.jd.com`,
        Referer: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`,
        'Accept-Language': `zh-cn`,
        Accept: `application/json, text/javascript, */*; q=0.01`,
      },
    };
    const response = await $http.post(options);
    return response.data;
  }
}

module.exports = Service;
