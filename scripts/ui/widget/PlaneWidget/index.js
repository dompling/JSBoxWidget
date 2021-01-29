const Widget = require('../widget');
const { Setting } = require('./setting');
const Actions = require('./Actions');
const Service = require('./service/service');
const V2Service = require('./service/v2Service');
const BaseService = require('./service/baseService');

class Index extends Widget {
  constructor(kernel) {
    super(kernel, new Setting(kernel));
    this.switchInterval =
      1000 * 60 * Number(this.setting.get('switchInterval'));
    this.data = $cache.get('switch.data');
    if (!this.data) {
      // 首次写入缓存
      this.data = { date: new Date().getTime() };
      $cache.set('switch.data', this.data);
    }
    const isDarkMode = $widget.isDarkMode;
    this.fontColor = isDarkMode
      ? this.setting.get('nightFont')
      : this.setting.get('lightFont');
    this.run();
  }

  service = {
    fetch: async () => null,
  };

  run = () => {
    const planeType = this.setting.get('planeType');
    const account = {
      url: this.setting.get('url'),
      logo: this.setting.get('logo'),
      title: this.setting.get('title'),
      email: this.setting.get('email'),
      password: this.setting.get('password'),
    };
    switch (planeType) {
      case 0:
        this.service = new V2Service(account);
      case 1:
        this.service = new BaseService(account);
      case 2:
        this.service = new Service(account);
        break;
      default:
        break;
    }
    this.service.fontColor = this.fontColor;
  };

  getActions = (config) => {
    const render = new Actions(this.setting, config, this.service);
    render.init();
    return render;
  };

  view2x2(config) {
    return this.getActions(config).small();
  }

  view2x4(config) {
    return this.getActions(config).medium();
  }

  async render() {
    const expireDate = new Date(this.data.date + this.switchInterval);
    await this.service.fetch();
    $widget.setTimeline({
      entries: [
        {
          date: new Date(),
          info: {},
        },
      ],
      policy: {
        afterDate: expireDate,
      },
      render: (config) => {
        this.printTimeConsuming();
        switch (config.family) {
          case 0:
            return this.view2x2(config);
          case 1:
            return this.view2x4(config);
          default:
            return this.errorView;
        }
      },
    });
  }
}
module.exports = { Widget: Index };
