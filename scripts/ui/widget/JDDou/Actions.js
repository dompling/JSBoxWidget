const avatarBg =
  'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/11fbba4a-4f92-4f7c-8fb3-dcff653fe20c.png';
const logo = 'https://raw.githubusercontent.com/Orz-3/task/master/jd.png';
const jddou =
  'https://gitee.com/scriptableJS/Scriptable/raw/master/JDDou/jdd.png';
const jtImg =
  'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-imgbed/dacbd8f6-8115-4fd6-aedc-95cce83788a9.png';
const gbImg =
  'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-imgbed/3947a83b-7aa6-4a53-be34-8fed610ddb77.png';
const headerColor = $color('#e4393c');
const minimumScaleFactor = 0.5;
// const border = { width: 1, color: $color('red') };
class Actions {
  constructor(setting, config, state) {
    this.setting = setting;
    this.setting.family.small;
    this.fontColor = $color({
      light: setting.get('lightFont'),
      dark: setting.get('nightFont'),
    });
    this.backgroundImage = this.setting.getBackgroundImage();
    this.is_bg = $file.exists(this.backgroundImage);
    this.opacity = setting.get('opacity');
    this.state = state;
    this.config = config;
    this.bgColor = $color({
      light: setting.get('lightColor'),
      dark: setting.get('nightColor'),
    });
  }

  config = {};

  init = () => {
    if (!this.config.family) {
      this.sizeConfig = {
        ...this.sizeConfig,
        jddouSize: {
          width: 30,
          height: 30,
        },
        labelSize: {
          font1: 20,
          font2: 14,
        },
        headerSize: {
          font1: 16,
          font2: 14,
        },
        logo: {
          width: 20,
          height: 20,
        },
        footerSpacer: 0,
      };
    }
  };

  sizeConfig = {
    jddouSize: {
      width: 60,
      height: 50,
    },
    labelSize: {
      font1: 24,
      font2: 18,
    },
    headerSize: {
      font1: 20,
      font2: 15,
    },
    logo: {
      width: 30,
      height: 30,
    },
    labelSpacer: 10,
    footerSpacer: 20,
  };

  family = 1;
  state = {
    incomeBean: 0,
    expenseBean: 0,
    beanCount: 0,
    userInfo: {
      jvalue: 0,
      nickname: '未登录',
      headImageUrl:
        'https://img11.360buyimg.com/jdphoto/s120x120_jfs/t21160/90/706848746/2813/d1060df5/5b163ef9N4a3d7aa6.png',
    },
    isPlusVip: false,
    jt_and_gb: {
      jintie: 0,
      gangbeng: 0,
    },
  };

  avatar = (size = 90) => {
    return {
      type: 'hstack',
      props: {
        frame: { width: size, height: size },
        alignment: $widget.horizontalAlignment.center,
        background: {
          type: 'image',
          props: {
            uri: this.state.userInfo.headImageUrl,
            resizable: true,
            scaledToFit: true,
            cornerRadius: {
              value: size / 2,
              style: 1, // 0: circular, 1: continuous
            },
          },
        },
      },
      ...(this.state.isPlusVip && {
        views: [
          {
            type: 'image',
            props: {
              uri: avatarBg,
              resizable: true,
              frame: {
                width: 90,
                height: 90,
              },
            },
          },
        ],
      }),
    };
  };

  iconText = (icon, sfColor, text, url = false) => {
    return {
      type: 'hstack',
      props: {
        alignment: $widget.verticalAlignment.center,
      },
      views: [
        {
          type: 'image',
          props: {
            ...(!url
              ? {
                  color: $color(sfColor),
                  symbol: {
                    glyph: icon,
                    size: 14,
                  },
                }
              : {
                  uri: icon,
                  resizable: true,
                  scaledToFit: true,
                  frame: {
                    width: 20,
                    height: 30,
                  },
                }),
          },
        },
        {
          type: 'text',
          props: {
            text: `${text}`,
            color: this.fontColor,
            lineLimit: 1,
            font: {
              size: 14,
            },
          },
        },
      ],
    };
  };

  labelItem = (data) => {
    return {
      type: 'vstack',
      props: {
        spacing: this.sizeConfig.labelSpacer,
        alignment: $widget.verticalAlignment.center,
        // frame: { width: this.sizeConfig.jddouSize.width },
      },
      views: [
        {
          type: 'text',
          props: {
            lineLimit: 1,
            text: `${data.value}`,
            font: {
              name: 'AmericanTypewriter',
              size: this.sizeConfig.labelSize.font1,
              weight: 'bold',
            },
            color: $color('#ffef03'),
          },
        },
        {
          type: 'text',
          props: {
            lineLimit: 1,
            text: data.label,
            font: {
              size: this.sizeConfig.labelSize.font2,
              weight: 'bold',
            },
            color: this.fontColor,
          },
        },
      ],
    };
  };

  left = () => {
    const { userInfo } = this.state;
    return {
      type: 'hstack',
      props: {
        alignment: $widget.horizontalAlignment.center,
      },
      views: [
        {
          type: 'vstack',
          props: {
            alignment: $widget.horizontalAlignment.leading,
            spacing: 5,
          },
          views: [
            this.avatar(),
            this.iconText('person.circle', '#f95e4c', userInfo.nickname),
            this.iconText(
              'creditcard.circle',
              '#f7de65',
              `${userInfo.jvalue}京享`,
            ),
          ],
        },
      ],
    };
  };

  header = () => {
    return {
      type: 'hstack',
      props: {
        spacing: 20,
        alignment: $widget.horizontalAlignment.center,
      },
      views: [
        {
          type: 'hstack',
          props: {
            spacing: 5,
            alignment: $widget.horizontalAlignment.center,
          },
          views: [
            {
              type: 'image',
              props: {
                uri: logo,
                cornerRadius: {
                  value: this.sizeConfig.logo.width / 2,
                  style: 1, // 0: circular, 1: continuous
                },
                resizable: true,
                scaledToFit: true,
                frame: this.sizeConfig.logo,
              },
            },
            {
              type: 'text',
              props: {
                color: headerColor,
                font: $font('bold', this.sizeConfig.headerSize.font1),
                text: '京东',
                lineLimit: 1,
              },
            },
          ],
        },
        {
          type: 'hstack',
          props: {
            alignment: $widget.horizontalAlignment.center,
          },
          views: [
            {
              type: 'text',
              props: {
                color: headerColor,
                font: {
                  name: 'AmericanTypewriter',
                  size: this.sizeConfig.headerSize.font1,
                  weight: 'bold',
                },
                text: `${this.state.beanCount}`,
                lineLimit: 1,
                minimumScaleFactor,
              },
            },
            {
              type: 'text',
              props: {
                color: headerColor,
                font: $font('bold', this.sizeConfig.headerSize.font2),
                text: '京豆',
                lineLimit: 1,
              },
            },
          ],
        },
      ],
    };
  };

  body = () => {
    return {
      type: 'hstack',
      props: {
        alignment: $widget.verticalAlignment.center,
      },
      views: [
        this.labelItem({
          label: '收入',
          value: this.state.incomeBean,
        }),
        {
          type: 'image',
          props: {
            uri: jddou,
            resizable: true,
            scaledToFit: true,
            frame: this.sizeConfig.jddouSize,
          },
        },
        this.labelItem({
          label: '支出',
          value: this.state.expenseBean,
        }),
      ],
    };
  };

  footer = () => {
    return {
      type: 'hstack',
      props: {
        alignment: $widget.horizontalAlignment.center,
        spacing: this.sizeConfig.footerSpacer,
      },
      views: [
        this.iconText(
          jtImg,
          '#f95e4c',
          `${this.state.jt_and_gb.jintie}津贴`,
          true,
        ),
        this.iconText(
          gbImg,
          '#f95e4c',
          `${this.state.jt_and_gb.gangbeng}钢镚`,
          true,
        ),
      ],
    };
  };

  right = () => {
    return {
      type: 'vstack',
      props: {
        alignment: $widget.verticalAlignment.center,
        spacing: 5,
      },
      views: [this.header(), this.body(), this.footer()],
    };
  };

  containerProps = () => {
    const background = this.is_bg
      ? {
          type: 'image',
          props: {
            image: $image(this.backgroundImage),
            resizable: true,
            scaledToFill: true,
          },
        }
      : {
          type: 'color',
          props: {
            color: this.bgColor,
          },
        };

    return {
      frame: this.config.displaySize,
      alignment: $widget.alignment.center,
      background,
    };
  };

  contentProps = (spacing = 20) => {
    return {
      spacing,
      frame: this.config.displaySize,
      alignment: $widget.horizontalAlignment.center,
      ...(this.is_bg && {
        background: {
          type: 'color',
          props: {
            color: $color('#000'),
            opacity: this.opacity,
          },
        },
      }),
    };
  };

  small = () => {
    return {
      type: 'zstack',
      props: this.containerProps(),
      views: [
        {
          type: 'vstack',
          props: this.contentProps(10),
          views: [
            this.header(),
            this.body(),
            {
              type: 'hstack',
              props: {
                alignment: $widget.verticalAlignment.center,
                spacing: 5,
              },
              views: [
                {
                  type: 'vstack',
                  props: {
                    alignment: $widget.horizontalAlignment.center,
                    spacing: this.sizeConfig.footerSpacer,
                  },
                  views: [
                    this.iconText(
                      jtImg,
                      '#f95e4c',
                      `${this.state.jt_and_gb.jintie}津贴`,
                      true,
                    ),
                    this.iconText(
                      gbImg,
                      '#f95e4c',
                      `${this.state.jt_and_gb.gangbeng}钢镚`,
                      true,
                    ),
                  ],
                },
                {
                  type: 'vstack',
                  props: {
                    alignment: $widget.horizontalAlignment.center,
                    spacing: 5,
                  },
                  views: [
                    this.avatar(30),
                    {
                      type: 'text',
                      props: {
                        text: this.state.userInfo.nickname,
                        color: this.fontColor,
                        lineLimit: 1,
                        minimumScaleFactor,
                        font: { size: 10 },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  };

  medium = () => {
    return {
      type: 'zstack',
      props: this.containerProps(),
      views: [
        {
          type: 'hstack',
          props: this.contentProps(),
          views: [this.left(), this.right()],
        },
      ],
    };
  };
}

module.exports = Actions;
