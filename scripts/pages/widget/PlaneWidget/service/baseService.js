const { getChartConfig } = require('./func');
const { cacheRequest } = require('../../../../utils/index');
class Service {
  constructor(account) {
    this.account = account;
    this.dataKey = `base_${this.account.url}_${this.account.email}`;
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
    isCheckIn: false,
  };

  label = {
    restData: '剩余',
    usedData: '已用',
    totalData: '总量',
    todayData: '今日',
  };

  account = {
    url: '',
    logo: '',
    title: '',
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

  init = async () => {
    await this.login();
    await this.checkin();
    await this.dataResults();
    await this.createChart(360);
    console.log('接口数据调用');
  };

  async login() {
    const url = this.account.url;
    const loginPath =
      url.indexOf('auth/login') != -1 ? 'auth/login' : 'user/_login.php';
    const table = {
      url:
        url.replace(/(auth|user)\/login(.php)*/g, '') +
        loginPath +
        `?email=${this.account.email}&passwd=${this.account.password}&rumber-me=week`,
    };
    const data = (await $http.post(table)).data;
    try {
      if (typeof data === 'object') {
        this.loginok = false;
        $ui.toast('邮箱或者密码错误');
        console.log('登陆失败');
      } else {
        this.loginok = true;
        console.log('登陆成功');
      }
    } catch (e) {
      console.log(e);
    }
  }

  async checkin() {
    const url = this.account.url;
    let checkinPath =
      url.indexOf('auth/login') != -1 ? 'user/checkin' : 'user/_checkin.php';
    const checkinreqest = {
      url: url.replace(/(auth|user)\/login(.php)*/g, '') + checkinPath,
    };
    return await $http.post(checkinreqest);
  }

  async dataResults() {
    try {
      const url = this.account.url;
      const userPath =
        url.indexOf('auth/login') != -1 ? 'user' : 'user/index.php';
      const datarequest = {
        url: url.replace(/(auth|user)\/login(.php)*/g, '') + userPath,
      };
      const data = (await $http.get(datarequest)).data;
      if (data.match(/login|请填写邮箱|登陆/)) {
        this.loginok = false;
      } else {
        let resultData = '';
        let result = [];
        if (data.match(/theme\/malio/)) {
          let flowInfo = data.match(/trafficDountChat\s*\(([^\)]+)/);
          if (flowInfo) {
            let flowData = flowInfo[1].match(/\d[^\']+/g);
            let usedData = flowData[0];
            let todatUsed = flowData[1];
            let restData = flowData[2];
            this.dataSource.todayUsed = todatUsed;
            this.dataSource.usedData = usedData;
            this.dataSource.restData = restData;
            result.push(
              `今日：${todatUsed}\n已用：${usedData}\n剩余：${restData}`,
            );
          }
          let userInfo = data.match(/ChatraIntegration\s*=\s*({[^}]+)/);
          if (userInfo) {
            let user_name = userInfo[1].match(/name.+'(.+)'/)[1];
            let user_class = userInfo[1].match(/Class.+'(.+)'/)[1];
            let class_expire = userInfo[1].match(/Class_Expire.+'(.+)'/)[1];
            let money = userInfo[1].match(/Money.+'(.+)'/)[1];
            result.push(
              `用户名：${user_name}\n用户等级：lv${user_class}\n余额：${money}\n到期时间：${class_expire}`,
            );
          }
          if (result.length != 0) {
            resultData = result.join('\n\n');
          }
        } else {
          let todayUsed = data.match(/>*\s*今日(已用|使用)*[^B]+/);
          if (todayUsed) {
            todayUsed = this.flowFormat(todayUsed[0]);
            result.push(`今日：${todayUsed}`);
            this.dataSource.todayUsed = `${todayUsed}`;
          } else {
            this.dataSource.todayUsed = `0`;
            result.push(`今日已用获取失败`);
          }
          let usedData = data.match(
            /(Used Transfer|>过去已用|>已用|>总已用|\"已用)[^B]+/,
          );
          if (usedData) {
            usedData = this.flowFormat(usedData[0]);
            result.push(`已用：${usedData}`);
            this.dataSource.usedData = `${usedData}`;
          } else {
            this.dataSource.usedData = `0`;
            result.push(`累计使用获取失败`);
          }
          let restData = data.match(
            /(Remaining Transfer|>剩余流量|>流量剩余|>可用|\"剩余)[^B]+/,
          );
          if (restData) {
            restData = this.flowFormat(restData[0]);
            result.push(`剩余：${restData}`);
            this.dataSource.restData = `${restData}`;
          } else {
            this.dataSource.restData = `0`;
            result.push(`剩余流量获取失败`);
          }
          resultData = result.join('\n');
        }
        console.log(resultData);
      }
    } catch (e) {
      console.log(e);
    }
  }

  flowFormat(data) {
    data = data.replace(/\d+(\.\d+)*%/, '');
    let flow = data.match(/\d+(\.\d+)*\w*/);
    return flow[0];
  }

  translateFlow(value) {
    const unit = [
      { unit: 'T', value: 1024 * 1024 },
      { unit: 'G', value: 1024 },
      { unit: 'M', value: 1 },
      { unit: 'K', value: 1 / 1024 },
    ];
    const data = { unit: '', value: parseFloat(value) };
    unit.forEach((item) => {
      if (value.indexOf(item.unit) > -1) {
        data.unit = item.unit;
        data.value = Math.floor(parseFloat(value) * item.value * 100) / 100;
      }
    });
    return data.value;
  }

  createChart = async (size) => {
    const restData = this.translateFlow(this.dataSource.restData);
    const usedData = this.translateFlow(this.dataSource.usedData);
    const todayData = this.translateFlow(this.dataSource.todayData);
    const totalData = restData + usedData;

    const total = parseFloat(totalData) || 1;
    const data3 = Math.floor((parseInt(todayData) / total) * 100);
    const data2 = Math.floor((parseInt(usedData) / total) * 100);
    const data1 = Math.floor((parseInt(restData) / total) * 100);
    const data = [data1 || 0, data2 || 0, data3 || 0];

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
}

module.exports = Service;
