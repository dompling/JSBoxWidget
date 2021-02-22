const Widget = require('../widget');
const { Setting } = require('./setting');
const Actions = require('./Actions');
const Service = require('./Service/service');

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
    this.service = new Service(this.setting.getContactInfo());
  }

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
