const BaseView = require('../../Foundation/view');

class View extends BaseView {
  init() {
    this.titleSize = 35;
    this.titleSizeMax = 40;
    this.titleOffset = 50;
    this.topOffset = -10;
  }

  setInfo(info) {
    // 默认读取"/config.json"中的内容
    this.info = info ? info : JSON.parse($file.read('/config.json'))['info'];
  }

  updateSetting = (key, value) => {
    return this.controller.set(key, value);
  };

  createLineLabel(title, icon) {
    if (!icon[1]) icon[1] = '#00CC00';
    if (typeof icon[1] !== 'object') {
      icon[1] = [icon[1], icon[1]];
    }
    if (typeof icon[0] !== 'object') {
      icon[0] = [icon[0], icon[0]];
    }
    return {
      type: 'view',
      views: [
        {
          // icon
          type: 'view',
          props: {
            bgcolor: $color(icon[1][0], icon[1][1]),
            cornerRadius: 5,
            smoothCorners: true,
          },
          views: [
            {
              type: 'image',
              props: {
                tintColor: $color('white'),
                image: $image(icon[0][0], icon[0][1]),
              },
              layout: (make, view) => {
                make.center.equalTo(view.super);
                make.size.equalTo(20);
              },
            },
          ],
          layout: (make, view) => {
            make.centerY.equalTo(view.super);
            make.size.equalTo(30);
            make.left.inset(10);
          },
        },
        {
          // title
          type: 'label',
          props: {
            text: title,
            textColor: this.textColor,
            align: $align.left,
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.super);
            make.height.equalTo(view.super);
            make.left.equalTo(view.prev.right).offset(10);
          },
        },
      ],
      layout: (make, view) => {
        make.centerY.equalTo(view.super);
        make.height.equalTo(view.super);
        make.left.inset(0);
      },
    };
  }

  createInfo(icon, title, value) {
    let isArray = Array.isArray(value);
    let text = isArray ? value[0] : value;
    let moreInfo = isArray ? value[1] : value;
    return {
      type: 'view',
      views: [
        this.createLineLabel(title, icon),
        {
          type: 'label',
          props: {
            text: text,
            align: $align.right,
            textColor: $color('darkGray'),
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.prev);
            make.right.inset(15);
            make.width.equalTo(180);
          },
        },
        {
          // 监听点击动作
          type: 'view',
          events: {
            tapped: () => {
              $ui.alert({
                title: title,
                message: moreInfo,
                actions: [
                  {
                    title: $l10n('COPY'),
                    handler: () => {
                      $clipboard.text = moreInfo;
                      $ui.toast($l10n('COPY_SUCCESS'));
                    },
                  },
                  { title: $l10n('OK') },
                ],
              });
            },
          },
          layout: (make, view) => {
            make.right.inset(0);
            make.size.equalTo(view.super);
          },
        },
      ],
      layout: $layout.fill,
    };
  }

  createSwitch(key, icon, title, events) {
    return {
      type: 'view',
      views: [
        this.createLineLabel(title, icon),
        {
          type: 'switch',
          props: {
            on: this.controller.get(key),
            onColor: $color('#00CC00'),
          },
          events: {
            changed: (sender) => {
              if (!this.updateSetting(key, sender.on)) {
                sender.on = !sender.on;
              } else {
                if (events)
                  eval(
                    `(()=>{return ${events}(sender.on,this.updateSetting,key,this.dataCenter.get('name'))})()`,
                  );
              }
            },
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.prev);
            make.right.inset(15);
          },
        },
      ],
      layout: $layout.fill,
    };
  }

  createString(key, icon, title, events) {
    return {
      type: 'view',
      views: [
        this.createLineLabel(title, icon),
        {
          type: 'button',
          props: {
            symbol: 'square.and.pencil',
            bgcolor: $color('clear'),
            tintColor: $color('primaryText'),
          },
          events: {
            tapped: (sender) => {
              const popover = $ui.popover({
                sourceView: sender,
                sourceRect: sender.bounds,
                directions: $popoverDirection.down,
                size: $size(320, 150),
                views: [
                  {
                    type: 'text',
                    props: {
                      id: key,
                      align: $align.left,
                      text: this.controller.get(key),
                    },
                    layout: (make) => {
                      make.left.right.inset(10);
                      make.top.inset(20);
                      make.height.equalTo(90);
                    },
                  },
                  {
                    type: 'button',
                    props: {
                      symbol: 'checkmark',
                      bgcolor: $color('clear'),
                      titleEdgeInsets: 10,
                      contentEdgeInsets: 0,
                    },
                    layout: (make) => {
                      make.right.inset(10);
                      make.bottom.inset(25);
                      make.size.equalTo(30);
                    },
                    events: {
                      tapped: () => {
                        if (this.updateSetting(key, $(key).text)) {
                          popover.dismiss();
                          if (events)
                            eval(
                              `(()=>{return ${events}($(key).text,this.updateSetting,key,this.dataCenter.get('name'))})()`,
                            );
                        }
                      },
                    },
                  },
                ],
              });
            },
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.prev);
            make.right.inset(0);
            make.size.equalTo(50);
          },
        },
      ],
      layout: $layout.fill,
    };
  }

  createText(key, icon, title, events) {
    return {
      type: 'view',
      views: [
        this.createLineLabel(title, icon),
        {
          type: 'label',
          props: {
            id: `text_${key}`,
            align: $align.right,
            text: this.controller.get(key),
          },
          events: {
            tapped: () => {
              if (events)
                eval(
                  `(()=>{return ${events}(this.updateSetting,key,this.dataCenter.get('name'))})()`,
                );
            },
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.prev);
            make.right.inset(15);
            make.height.equalTo(50);
            make.width.equalTo(100);
          },
        },
      ],
      layout: $layout.fill,
    };
  }

  createNumber(key, icon, title, events) {
    return {
      type: 'view',
      views: [
        this.createLineLabel(title, icon),
        {
          type: 'label',
          props: {
            id: key,
            align: $align.right,
            text: this.controller.get(key),
          },
          events: {
            tapped: () => {
              $input.text({
                type: $kbType.number,
                text: this.controller.get(key),
                placeholder: title,
                handler: (text) => {
                  const isNumber = (str) => {
                    let reg = /^[0-9]+.?[0-9]*$/;
                    return reg.test(str);
                  };
                  if (text === '' || !isNumber(text)) {
                    $ui.toast($l10n('INVALID_VALUE'));
                    return;
                  }
                  if (this.updateSetting(key, text)) {
                    $(key).text = text;
                    if (events)
                      eval(
                        `(()=>{return ${events}(text,this.updateSetting,key,this.dataCenter.get('name'))})()`,
                      );
                  }
                },
              });
            },
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.prev);
            make.right.inset(15);
            make.height.equalTo(50);
            make.width.equalTo(100);
          },
        },
      ],
      layout: $layout.fill,
    };
  }

  createSlider(key, icon, title, events) {
    return {
      type: 'view',
      views: [
        this.createLineLabel(title, icon),
        {
          type: 'label',
          props: {
            id: key,
            text: this.controller.get(key),
            textColor: this.textColor,
            align: $align.left,
          },
          layout: (make, view) => {
            make.height.equalTo(view.super);
            make.right.inset(120);
          },
        },
        {
          type: 'slider',
          props: {
            value: this.controller.get(key),
            max: 1.0,
            min: 0.0,
          },
          events: {
            changed: (sender) => {
              const value = Math.ceil(sender.value * 10) / 10;
              $(key).text = value;
              if (!this.updateSetting(key, value)) {
                $(key).text = this.controller.get(key);
              } else {
                if (events)
                  eval(
                    `(()=>{return ${events}(value,this.updateSetting,key,this.dataCenter.get('name'))})()`,
                  );
              }
            },
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.prev);
            make.right.inset(15);
            make.width.equalTo(100);
          },
        },
      ],
      layout: $layout.fill,
    };
  }

  createStepper(key, icon, title, min, max, events) {
    return {
      type: 'view',
      views: [
        this.createLineLabel(title, icon),
        {
          type: 'label',
          props: {
            id: key,
            text: this.controller.get(key),
            textColor: this.textColor,
            align: $align.left,
          },
          layout: (make, view) => {
            make.height.equalTo(view.super);
            make.right.inset(120);
          },
        },
        {
          type: 'stepper',
          props: {
            min: min,
            max: max,
            value: this.controller.get(key),
          },
          events: {
            changed: (sender) => {
              $(key).text = sender.value;
              if (!this.updateSetting(key, sender.value)) {
                $(key).text = this.controller.get(key);
              } else {
                if (events)
                  eval(
                    `(()=>{return ${events}(sneder.value,this.updateSetting,key,this.dataCenter.get('name'))})()`,
                  );
              }
            },
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.prev);
            make.right.inset(15);
          },
        },
      ],
      layout: $layout.fill,
    };
  }

  createScript(key, icon, title, script) {
    let id = `script-${this.dataCenter.get('name')}-${key}`;
    let touchHighlightStart = () => {
      $(`${id}-line`).bgcolor = $color('insetGroupedBackground');
    };
    let touchHighlightEnd = (duration = 0.2) => {
      $ui.animate({
        duration: duration,
        animation: () => {
          $(`${id}-line`).bgcolor = $color('clear');
        },
      });
    };
    let touchHighlight = () => {
      touchHighlightStart();
      touchHighlightEnd(0.5);
    };
    let actionStart = () => {
      // 隐藏button，显示spinner
      $(id).alpha = 0;
      $(`${id}-spinner`).alpha = 1;
      touchHighlightStart();
    };
    let actionCancel = () => {
      $(id).alpha = 1;
      $(`${id}-spinner`).alpha = 0;
      touchHighlightEnd();
    };
    let actionDone = (status = true, message = $l10n('ERROR')) => {
      $(`${id}-spinner`).alpha = 0;
      touchHighlightEnd();
      let button = $(id);
      if (!status) {
        // 失败
        $ui.toast(message);
        button.alpha = 1;
        return;
      }
      // 成功动画
      button.symbol = 'checkmark';
      $ui.animate({
        duration: 0.6,
        animation: () => {
          button.alpha = 1;
        },
        completion: () => {
          setTimeout(() => {
            $ui.animate({
              duration: 0.4,
              animation: () => {
                button.alpha = 0;
              },
              completion: () => {
                button.symbol = 'chevron.right';
                $ui.animate({
                  duration: 0.4,
                  animation: () => {
                    button.alpha = 1;
                  },
                  completion: () => {
                    button.alpha = 1;
                  },
                });
              },
            });
          }, 600);
        },
      });
    };
    return {
      type: 'view',
      props: { id: `${id}-line` },
      views: [
        this.createLineLabel(title, icon),
        {
          type: 'view',
          views: [
            {
              // 仅用于显示图片
              type: 'image',
              props: {
                id: id,
                symbol: 'chevron.right',
                tintColor: $color('secondaryText'),
              },
              layout: (make, view) => {
                make.centerY.equalTo(view.super);
                make.right.inset(0);
                make.size.equalTo(15);
              },
            },
            {
              type: 'spinner',
              props: {
                id: `${id}-spinner`,
                loading: true,
                alpha: 0,
              },
              layout: (make, view) => {
                make.size.equalTo(view.prev);
                make.left.top.equalTo(view.prev);
              },
            },
            {
              // 覆盖在图片上监听点击动作
              type: 'view',
              events: {
                tapped: () => {
                  // 生成开始事件和结束事件动画，供函数调用
                  const animate = {
                    actionStart: actionStart,
                    actionCancel: actionCancel,
                    actionDone: actionDone,
                    touchHighlight: touchHighlight,
                    touchHighlightStart: touchHighlightStart,
                    touchHighlightEnd: touchHighlightEnd,
                  };
                  // 执行代码
                  eval(
                    `(()=>{return ${script}(animate,this.updateSetting,key,this.dataCenter.get('name'))})()`,
                  );
                },
              },
              layout: (make, view) => {
                make.right.inset(0);
                make.size.equalTo(view.super);
              },
            },
          ],
          layout: (make, view) => {
            make.right.inset(15);
            make.height.equalTo(50);
            make.width.equalTo(view.super);
          },
        },
      ],
      layout: $layout.fill,
    };
  }

  createTab(key, icon, title, items, events, withTitle) {
    return {
      type: 'view',
      views: [
        this.createLineLabel(title, icon),
        {
          type: 'tab',
          props: {
            items: items,
            index: this.controller.get(key),
            dynamicWidth: true,
          },
          layout: (make, view) => {
            make.right.inset(15);
            make.centerY.equalTo(view.prev);
          },
          events: {
            changed: (sender) => {
              let value = withTitle ? [sender.index, title] : sender.index;
              this.updateSetting(key, value);
              if (events)
                eval(
                  `(()=>{return ${events}(value,this.updateSetting,key,this.dataCenter.get('name'))})()`,
                );
            },
          },
        },
      ],
      layout: $layout.fill,
    };
  }

  createColor(key, icon, title, events) {
    return {
      type: 'view',
      views: [
        this.createLineLabel(title, icon),
        {
          type: 'view',
          views: [
            {
              // 颜色预览以及按钮功能
              type: 'view',
              props: {
                id: `setting-${this.dataCenter.get('name')}-color-${key}`,
                bgcolor: $color(this.controller.get(key)),
                borderWidth: 2,
                borderColor: $color('#e8e8e8'),
                circular: true,
              },
              events: {
                tapped: async () => {
                  if (typeof $picker.color === 'function') {
                    const newColor = await $picker.color({
                      color: $color(this.controller.get(key).trim()),
                    });
                    this.updateSetting(key, newColor.hexCode);
                    if (events)
                      eval(
                        `(()=>{return ${events}(newColor.hexCode,this.updateSetting,key,this.dataCenter.get('name'))})()`,
                      );
                    $(
                      `setting-${this.dataCenter.get('name')}-color-${key}`,
                    ).bgcolor = $color(newColor.hexCode);
                  } else {
                    const Palette = this.controller.kernel.getPlugin('palette')
                      .plugin;
                    let palette = new Palette();
                    let color = this.controller.get(key).trim();
                    if (typeof color === 'string' && color !== '') {
                      color = $color(color);
                    } else {
                      color = $(
                        `setting-${this.dataCenter.get('name')}-color-${key}`,
                      ).bgcolor;
                    }
                    let navButtons = [
                      {
                        type: 'button',
                        props: {
                          symbol: 'checkmark',
                          tintColor: this.textColor,
                          bgcolor: $color('clear'),
                        },
                        layout: (make) => {
                          make.right.inset(10);
                          make.size.equalTo(20);
                        },
                        events: {
                          tapped: () => {
                            let rgb = palette.rgb;
                            let newColor = Palette.RGB2HEX(
                              rgb[0],
                              rgb[1],
                              rgb[2],
                            );
                            this.updateSetting(key, newColor);
                            if (events)
                              eval(
                                `(()=>{return ${events}(newColor,this.updateSetting,key,this.dataCenter.get('name'))})()`,
                              );
                            $(
                              `setting-${this.dataCenter.get(
                                'name',
                              )}-color-${key}`,
                            ).bgcolor = $color(newColor);
                            $ui.pop();
                          },
                        },
                      },
                    ];
                    palette.setRGB(
                      color.components.red,
                      color.components.green,
                      color.components.blue,
                    );
                    let views = [palette.getView()];
                    this.push(views, $l10n('COLOR'), $l10n('BACK'), navButtons);
                  }
                },
              },
              layout: (make, view) => {
                make.centerY.equalTo(view.super);
                make.right.inset(0);
                make.size.equalTo(20);
              },
            },
          ],
          layout: (make, view) => {
            make.right.inset(15);
            make.height.equalTo(50);
            make.width.equalTo(view.super);
          },
        },
      ],
      layout: $layout.fill,
    };
  }

  createMenu(key, icon, title, items, events, withTitle) {
    let id = `setting-menu-${this.dataCenter.get('name')}-${key}`;
    return {
      type: 'view',
      props: { id: `${id}-line` },
      views: [
        this.createLineLabel(title, icon),
        {
          type: 'view',
          views: [
            {
              type: 'label',
              props: {
                text: withTitle
                  ? items[
                      (() => {
                        let value = this.controller.get(key);
                        if (typeof value === 'object') return value[0];
                        else return value;
                      })()
                    ]
                  : items[this.controller.get(key)],
                color: $color('secondaryText'),
                id: id,
              },
              layout: (make, view) => {
                make.right.inset(0);
                make.height.equalTo(view.super);
              },
            },
          ],
          layout: (make, view) => {
            make.right.inset(15);
            make.height.equalTo(50);
            make.width.equalTo(view.super);
          },
        },
      ],
      events: {
        tapped: () => {
          $(`${id}-line`).bgcolor = $color('insetGroupedBackground');
          $ui.menu({
            items: items,
            handler: (title, idx) => {
              let value = withTitle ? [idx, title] : idx;
              this.updateSetting(key, value);
              if (events)
                eval(
                  `(()=>{return ${events}(value,this.updateSetting,key,this.dataCenter.get('name'))})()`,
                );
              $(id).text = $l10n(title);
            },
            finished: () => {
              $ui.animate({
                duration: 0.2,
                animation: () => {
                  $(`${id}-line`).bgcolor = $color('clear');
                },
              });
            },
          });
        },
      },
      layout: $layout.fill,
    };
  }

  createDate(key, icon, title, mode = 2, events) {
    let id = `setting-date-${this.dataCenter.get('name')}-${key}`;
    const getFormatDate = (date) => {
      let str = '';
      if (typeof date === 'number') date = new Date(date);
      switch (mode) {
        case 0:
          str = date.toLocaleTimeString();
          break;
        case 1:
          str = date.toLocaleDateString();
          break;
        case 2:
          str = date.toLocaleString();
          break;
      }
      return str;
    };
    return {
      type: 'view',
      views: [
        this.createLineLabel(title, icon),
        {
          type: 'view',
          views: [
            {
              type: 'label',
              props: {
                id: `${id}-label`,
                color: $color('secondaryText'),
                text: this.controller.get(key)
                  ? getFormatDate(this.controller.get(key))
                  : 'None',
              },
              layout: (make, view) => {
                make.right.inset(0);
                make.height.equalTo(view.super);
              },
            },
          ],
          events: {
            tapped: async () => {
              const settingData = this.controller.get(key);
              const date = await $picker.date({
                props: {
                  mode: mode,
                  date: settingData ? settingData : new Date(),
                },
              });
              const value = date.getTime();
              this.updateSetting(key, value);
              $(`${id}-label`).text = getFormatDate(date);
              if (events)
                eval(
                  `(()=>{return ${events}(value,this.updateSetting,key,this.dataCenter.get('name'))})()`,
                );
            },
          },
          layout: (make, view) => {
            make.right.inset(15);
            make.height.equalTo(50);
            make.width.equalTo(view.super);
          },
        },
      ],
      layout: $layout.fill,
    };
  }

  createInput(key, icon, title, events) {
    let id = `setting-input-${this.dataCenter.get('name')}-${key}`;
    return {
      type: 'view',
      views: [
        this.createLineLabel(title, icon),
        {
          type: 'view',
          views: [
            {
              type: 'label',
              props: {
                id: `${id}-label`,
                color: $color('secondaryText'),
                text: this.controller.get(key),
              },
              layout: (make, view) => {
                make.right.inset(0);
                make.height.equalTo(view.super);
                make.width.lessThanOrEqualTo(200);
              },
            },
          ],
          events: {
            tapped: async () => {
              $input.text({
                text: this.controller.get(key),
                placeholder: title,
                handler: (text) => {
                  if (this.updateSetting(key, text)) {
                    $(`${id}-label`).text = text;
                    if (events)
                      eval(
                        `(()=>{return ${events}(text,this.updateSetting,key,this.dataCenter.get('name'))})()`,
                      );
                  }
                },
              });
            },
          },
          layout: (make, view) => {
            make.right.inset(15);
            make.height.equalTo(50);
            make.width.equalTo(view.super);
          },
        },
      ],
      layout: $layout.fill,
    };
  }

  createImage(key, icon, title, events, input = true) {
    let id = `setting-image-${this.dataCenter.get('name')}-${key}`;
    return {
      type: 'view',
      views: [
        this.createLineLabel(title, icon),
        {
          type: 'view',
          views: [
            {
              type: 'view',
              views: [
                {
                  type: 'image',
                  props: {
                    id: `${id}-image`,
                    tintColor: $color('white'),
                    image: $image(this.controller.get(key)),
                    cornerRadius: 4,
                  },
                  layout: (make, view) => {
                    make.center.equalTo(view.super);
                    make.size.equalTo(30);
                  },
                },
              ],
              layout: (make, view) => {
                make.centerY.equalTo(view.super);
                make.right.inset(0);
                make.size.equalTo(20);
              },
            },
          ],
          events: {
            tapped: async () => {
              if (input !== false) {
                $input.text({
                  text: this.controller.get(key),
                  placeholder: title,
                  handler: (text) => {
                    if (text === '') {
                      $ui.toast($l10n('INVALID_VALUE'));
                      return;
                    }
                    if (this.updateSetting(key, text)) {
                      $(`${id}-image`).image = $image(text);
                      if (events)
                        eval(
                          `(()=>{return ${events}(text,this.updateSetting,key,this.dataCenter.get('name'))})()`,
                        );
                    }
                  },
                });
              } else {
                if (events)
                  eval(
                    `(()=>{return ${events}(this.updateSetting,key,this.dataCenter.get('name'))})()`,
                  );
              }
            },
          },
          layout: (make, view) => {
            make.right.inset(15);
            make.height.equalTo(50);
            make.width.equalTo(view.super);
          },
        },
      ],
      layout: $layout.fill,
    };
  }

  getView() {
    let header = this.headerTitle(
      `setting-title-${this.dataCenter.get('name')}`,
      $l10n('SETTING'),
    );
    let footer = this.dataCenter.get('footer');
    if (!footer)
      footer = {
        type: 'view',
        props: { height: 130 },
        views: [
          {
            type: 'label',
            props: {
              font: $font(14),
              text: `${$l10n('VERSION')} ${this.info.version} © ${
                this.info.author
              }`,
              textColor: $color({
                light: '#C0C0C0',
                dark: '#545454',
              }),
              align: $align.center,
            },
            layout: (make) => {
              make.left.right.inset(0);
              make.top.inset(10);
            },
          },
        ],
      };
    return this.defaultList(header, footer, this.getSections());
  }

  getSections() {
    let sections = [];
    for (let section of this.controller.struct) {
      let rows = [];
      for (let item of section.items) {
        let value = this.controller.get(item.key);
        let row = null;
        if (!item.icon) item.icon = ['square.grid.2x2.fill', '#00CC00'];
        if (typeof item.items === 'object')
          item.items = item.items.map((item) => $l10n(item));
        switch (item.type) {
          case 'switch':
            /**
                         * {
                                "icon": [
                                    "archivebox",
                                    "#336699"
                                ],
                                "title": "USE_COMPRESSED_IMAGE",
                                "type": "switch",
                                "key": "album.useCompressedImage",
                                "value": true
                            }
                         */
            row = this.createSwitch(
              item.key,
              item.icon,
              $l10n(item.title),
              item.events,
            );
            break;
          case 'slider':
            /**
                         * {
                                "icon": [
                                    "rectangle.split.3x1.fill",
                                    "#FF6666"
                                ],
                                "title": "SWITCH_INTERVAL",
                                "type": "slider",
                                "key": "album.switchInterval",
                                "value": 1
                            }
                         */
            row = this.createSlider(
              item.key,
              item.icon,
              $l10n(item.title),
              item.events,
            );
            break;
          case 'stepper':
            /**
                             * {
                                    "icon": [
                                        "rectangle.split.3x1.fill",
                                        "#FF6666"
                                    ],
                                    "title": "SWITCH_INTERVAL",
                                    "type": "stepper",
                                    "key": "album.switchInterval",
                                    "min": 10,
                                    "max": 60,
                                    "value": 10
                                }
                             */
            row = this.createStepper(
              item.key,
              item.icon,
              $l10n(item.title),
              item.min === undefined ? 1 : item.min,
              item.max === undefined ? 12 : item.max,
              item.events,
            );
            break;
          case 'string':
            /**
                         * {
                                "icon": [
                                    "link",
                                    "#CC6699"
                                ],
                                "title": "URL_SCHEME",
                                "type": "string",
                                "key": "album.urlScheme",
                                "value": ""
                            }
                         */
            row = this.createString(
              item.key,
              item.icon,
              $l10n(item.title),
              item.events,
            );
            break;
          case 'number':
            /**
                         * {
                                "icon": [
                                    "rectangle.split.3x1.fill",
                                    "#FF6666"
                                ],
                                "title": "TIME_SPAN",
                                "type": "number",
                                "key": "timeSpan",
                                "value": 10
                            }
                         */
            row = this.createNumber(
              item.key,
              item.icon,
              $l10n(item.title),
              item.events,
            );
            break;
          case 'info':
            /**
                         * {
                                "icon": [
                                    "book.fill",
                                    "#A569BD"
                                ],
                                "title": "README",
                                "type": "script",
                                "key": "readme",
                                "value": "this.controller.readme()"
                            }
                         */
            row = this.createInfo(item.icon, $l10n(item.title), value);
            break;
          case 'script':
            /**
                         * {
                                "icon": [
                                    "book.fill",
                                    "#A569BD"
                                ],
                                "title": "README",
                                "type": "script",
                                "key": "calendar",
                                "value": "this.controller.readme"
                            }
                         */
            row = this.createScript(
              item.key,
              item.icon,
              $l10n(item.title),
              value,
            );
            break;
          case 'tab':
            /**
                         * {
                                "icon": [
                                    "flag.fill",
                                    "#FFCC00"
                                ],
                                "title": "FIRST_DAY_OF_WEEK",
                                "type": "tab",
                                "key": "calendar.firstDayOfWeek",
                                "items": [
                                    "_SUNDAY",
                                    "_MONDAY"
                                ],
                                "value": 0
                            }
                         */
            row = this.createTab(
              item.key,
              item.icon,
              $l10n(item.title),
              item.items,
              item.events,
              item.withTitle,
            );
            break;
          case 'color':
            /**
                         * {
                                "icon": [
                                    "wand.and.rays",
                                    "orange"
                                ],
                                "title": "COLOR_TONE",
                                "type": "color",
                                "key": "calendar.colorTone",
                                "value": "orange"
                            }
                         */
            row = this.createColor(
              item.key,
              item.icon,
              $l10n(item.title),
              item.events,
            );
            break;
          case 'menu':
            /**
                         * {
                                "icon": [
                                    "rectangle.3.offgrid.fill"
                                ],
                                "title": "RIGHT",
                                "type": "menu",
                                "key": "right",
                                "items": "this.controller.getMenu",
                                "value": 0
                            }
                         */
            if (typeof item.items === 'string') {
              item.items = eval(`(()=>{return ${item.items}()})()`);
            }
            row = this.createMenu(
              item.key,
              item.icon,
              $l10n(item.title),
              item.items,
              item.events,
              item.withTitle,
            );
            break;
          case 'date':
            row = this.createDate(
              item.key,
              item.icon,
              $l10n(item.title),
              item.mode,
              item.events,
            );
            break;
          case 'input':
            row = this.createInput(
              item.key,
              item.icon,
              $l10n(item.title),
              item.events,
            );
            break;
          case 'text':
            row = this.createText(
              item.key,
              item.icon,
              $l10n(item.title),
              item.events,
            );
            break;
          case 'image':
            row = this.createImage(
              item.key,
              item.icon,
              $l10n(item.title),
              item.events,
              item.input,
            );
            break;

          default:
            continue;
        }
        rows.push(row);
      }
      sections.push({
        title: $l10n(section.title),
        rows: rows,
      });
    }
    return sections;
  }

  /**
   * 标准列表视图
   * @param {Object} header 该对象中需要包含一个标题label的id和title (info: { id: id, title: title }) 供动画使用
   * @param {*} footer 视图对象
   * @param {*} data
   * @param {*} events
   */
  defaultList(header, footer, data, events = {}) {
    let indicatorInsetBottom = this.dataCenter.get('secondaryPage') ? 0 : 50;
    return [
      {
        type: 'view',
        props: { bgcolor: $color('insetGroupedBackground') },
        views: [
          {
            type: 'view',
            layout: (make, view) => {
              make.top.left.right.equalTo(view.super.safeArea);
              make.bottom.inset(0);
            },
            views: [
              {
                type: 'list',
                props: {
                  style: 2,
                  separatorInset: $insets(0, 50, 0, 10),
                  rowHeight: 50,
                  indicatorInsets: $insets(55, 0, indicatorInsetBottom, 0),
                  header: this.dataCenter.get('secondaryPage') ? {} : header,
                  footer: footer,
                  data: data,
                },
                events: Object.assign(
                  {
                    didScroll: (sender) => {
                      // 若设置了显示为二级页面则关闭动画
                      if (this.dataCenter.get('secondaryPage')) {
                        return;
                      }
                      // 下拉放大字体
                      if (sender.contentOffset.y <= this.topOffset) {
                        let size = 35 - sender.contentOffset.y * 0.04;
                        if (size > this.titleSizeMax) size = this.titleSizeMax;
                        $(header.info.id).font = $font('bold', size);
                      }
                      // 顶部信息栏
                      if (sender.contentOffset.y >= 5) {
                        $ui.animate({
                          duration: 0.2,
                          animation: () => {
                            $(header.info.id + '-header').alpha = 1;
                          },
                        });
                        if (sender.contentOffset.y > 40) {
                          $ui.animate({
                            duration: 0.2,
                            animation: () => {
                              $(header.info.id + '-header-title').alpha = 1;
                              $(header.info.id).alpha = 0;
                            },
                          });
                        } else {
                          $ui.animate({
                            duration: 0.2,
                            animation: () => {
                              $(header.info.id + '-header-title').alpha = 0;
                              $(header.info.id).alpha = 1;
                            },
                          });
                        }
                      } else if (sender.contentOffset.y < 5) {
                        $ui.animate({
                          duration: 0.2,
                          animation: () => {
                            $(header.info.id + '-header').alpha = 0;
                          },
                        });
                      }
                    },
                  },
                  events,
                ),
                layout: $layout.fill,
              },
            ],
          },
          {
            // 顶部bar，用于显示 设置 字样
            type: 'view',
            props: {
              id: header.info.id + '-header',
              hidden: this.dataCenter.get('secondaryPage') ? true : false,
              alpha: this.dataCenter.get('secondaryPage') ? 1 : 0,
            },
            layout: (make, view) => {
              make.left.top.right.inset(0);
              make.bottom.equalTo(view.super.safeAreaTop).offset(45);
            },
            views: [
              {
                type: 'blur',
                props: { style: this.blurStyle },
                layout: $layout.fill,
              },
              {
                type: 'canvas',
                layout: (make, view) => {
                  make.top.equalTo(view.prev.bottom);
                  make.height.equalTo(1 / $device.info.screen.scale);
                  make.left.right.inset(0);
                },
                events: {
                  draw: (view, ctx) => {
                    let width = view.frame.width;
                    let scale = $device.info.screen.scale;
                    ctx.strokeColor = $color('gray');
                    ctx.setLineWidth(1 / scale);
                    ctx.moveToPoint(0, 0);
                    ctx.addLineToPoint(width, 0);
                    ctx.strokePath();
                  },
                },
              },
              {
                type: 'view',
                layout: $layout.fill,
                views: [
                  {
                    type: 'button',
                    props: {
                      symbol: 'chevron.left',
                      tintColor: this.textColor,
                      bgcolor: $color('clear'),
                      hidden: this.dataCenter.get('secondaryPage')
                        ? false
                        : true,
                    },
                    events: {
                      tapped: () => {
                        this.dataCenter.get('pop')();
                      },
                    },
                    layout: (make, view) => {
                      make.left.inset(10);
                      make.size.equalTo(30);
                      make.top.equalTo(view.super.safeAreaTop);
                      make.bottom.equalTo(view.super);
                    },
                  },
                  {
                    type: 'label',
                    props: {
                      id: header.info.id + '-header-title',
                      alpha: this.dataCenter.get('secondaryPage') ? 1 : 0,
                      text: header.info.title,
                      font: $font('bold', 17),
                      align: $align.center,
                      bgcolor: $color('clear'),
                      textColor: this.textColor,
                    },
                    layout: (make, view) => {
                      make.left.right.inset(0);
                      make.top.equalTo(view.super.safeAreaTop);
                      make.bottom.equalTo(view.super);
                    },
                  },
                ],
              },
            ],
          },
        ],
        layout: $layout.fill,
      },
    ];
  }
}

module.exports = View;
