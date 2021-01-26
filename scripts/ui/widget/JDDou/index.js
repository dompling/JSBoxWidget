const Widget = require('../widget');
const { Setting } = require('./setting');
const Actions = require('./Actions');
const Service = require('./service');
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
    this.actions = new Actions(this.kernel, this.setting);
    console.log(this.setting.get('cookie'));
    this.service = new Service(this.setting.get('cookie'));
  }

  view2x4(config) {
    return this.actions.medium(config, this.service);
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
