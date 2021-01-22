const Widget = require('../widget');
const Setting = require('./setting');

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
  }

  view2x2(family) {
    return {};
  }

  render() {
    const expireDate = new Date(this.data.date + this.switchInterval);
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
      render: (ctx) => {
        let view = this.view2x2(ctx.family);
        this.printTimeConsuming();
        return view;
      },
    });
  }
}
module.exports = { Widget: Index };
