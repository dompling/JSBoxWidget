class Actions {
  constructor(kernel, setting) {
    this.kernel = kernel;
    this.setting = setting;
    this.setting.family.small;
    this.logo = 'https://raw.githubusercontent.com/Orz-3/task/master/jd.png';
    this.fontColor = {
      light: setting.get('lightFont'),
      dark: setting.get('nightFont'),
    };
    this.account = setting.get('cookie') || {};
    this.backgroundImage = this.setting.getBackgroundImage();
    this.is_bg = $file.exists(this.backgroundImage);
    this.opacity = setting.get('opacity');
  }

  header = () => {
    return {
      type: 'hstack',
      props: {
        alignment: $widget.verticalAlignment.center,
        padding: $insets(10, 20, 5, 20),
        clipped: true,
        background: {
          type: 'color',
          props: {
            color: this.is_bg ? $rgba(0, 0, 0, 0) : '#ee3125',
          },
        },
      },
      views: [
        {
          type: 'image',
          props: {
            uri: this.logo,
            resizable: true,
            cornerRadius: {
              value: 10,
              style: 1, // 0: circular, 1: continuous
            },
            frame: {
              width: 30,
              height: 30,
            },
          },
        },
        { type: 'spacer' },
        {
          type: 'text',
          props: {
            text: this.account.userName,
            lineLimit: 1,
            color: $color('#fff'),
            font: $font('bold', 15),
          },
        },
      ],
    };
  };

  labelItem = (data) => {
    return {
      type: 'vstack',
      props: {
        alignment: $widget.verticalAlignment.center,
        frame: {
          width: 100,
          alignment: $widget.alignment.center,
        },
        spacing: 10,
      },
      views: [
        {
          type: 'image',
          props: {
            uri:
              'https://gitee.com/scriptableJS/Scriptable/raw/master/JDDou/jdd.png',
            frame: {
              width: 25,
              height: 25,
            },
          },
        },
        {
          type: 'text',
          props: {
            lineLimit: 1,
            text: `${data.value}`,
            font: {
              name: 'AmericanTypewriter',
              size: 20,
            },
            color: $color('#ffef03'),
          },
        },
        {
          type: 'text',
          props: {
            lineLimit: 1,
            text: data.label,
            ...this.fontColor,
          },
        },
      ],
    };
  };

  medium = (_, service) => {
    return {
      type: 'zstack',
      props: {
        padding: 0,
        alignment: $widget.alignment.center,
        clipped: true,
        ...(this.is_bg
          ? {
              background: {
                type: 'image',
                props: {
                  image: $image(this.backgroundImage),
                  resizable: true,
                  scaledToFill: true,
                },
              },
            }
          : {}),
      },
      views: [
        {
          type: 'vstack',
          props: {
            alignment: $widget.verticalAlignment.center,
            ...(this.is_bg && {
              background: {
                type: 'color',
                props: {
                  color: $color('#000'),
                  opacity: this.opacity,
                },
              },
            }),
          },
          views: [
            this.header(),
            {
              type: 'hstack',
              props: {
                alignment: $widget.verticalAlignment.center,
                padding: $insets(20, 0, 0, 0),
              },
              views: [
                { type: 'spacer' },
                this.labelItem({
                  value: service.beanCount,
                  label: '当前京豆',
                }),
                this.labelItem({
                  value: service.incomeBean,
                  label: '昨日收入',
                }),
                this.labelItem({
                  value: service.expenseBean,
                  label: '昨日支出',
                }),
                { type: 'spacer' },
              ],
            },
            { type: 'spacer' },
          ],
        },
      ],
    };
  };
}

module.exports = Actions;
