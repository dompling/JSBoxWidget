const avatarBg = $image('assets/icon/JDDou/vip.png');
const logo = $image('assets/icon/JDDou/icon.png');
const jddou = $image('assets/icon/JDDou/jdd.png');
const jtImg = $image('assets/icon/JDDou/jt.png');
const gbImg = $image('assets/icon/JDDou/gb.png');
const headerColor = $color('#e4393c');
const minimumScaleFactor = 0.5;
const border = { width: 1, color: $color('red') };
class Actions {
  constructor(setting, config, state) {
    this.setting = setting;
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
    this.ctType = setting.get('ctType');
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
          font2: 12,
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
      font2: 16,
    },
    headerSize: {
      font1: 18,
      font2: 14,
    },
    logo: {
      width: 25,
      height: 25,
    },
    labelSpacer: 10,
    footerSpacer: 20,
  };

  avatar = (size = 90) => {
    return {
      type: 'zstack',
      props: {
        frame: { width: size, height: size },
        alignment: $widget.alignment.center,
      },
      views: [
        {
          type: 'image',
          props: {
            image: this.state.userInfo.headImageUrl,
            uri: this.state.userInfo.headImageUrl,
            resizable: true,
            scaledToFit: true,
            cornerRadius: {
              value: size / 2,
              style: 1, // 0: circular, 1: continuous
            },
          },
        },
        ...(this.state.isPlusVip
          ? [
              {
                type: 'image',
                props: {
                  image: avatarBg,
                  resizable: true,
                  frame: {
                    width: size,
                    height: size,
                  },
                },
              },
            ]
          : []),
      ],
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
                  image: icon,
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
            minimumScaleFactor,
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
        // border,
        spacing: this.sizeConfig.labelSpacer,
        alignment: $widget.horizontalAlignment.center,
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
            minimumScaleFactor,
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
            minimumScaleFactor,
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
            frame: { width: 100 },
            clipped: true,
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
                image: logo,
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
                minimumScaleFactor,
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
                minimumScaleFactor,
              },
            },
          ],
        },
      ],
    };
  };

  body = () => {
    return !this.ctType
      ? {
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
                image: jddou,
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
        }
      : {
          type: 'image',
          props: {
            // border,
            image: this.state.chart,
            resizable: true,
            scaledToFill: true,
            frame: {
              width: this.config.displaySize.height,
              height: (this.config.displaySize.height / 6) * 2,
            },
          },
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
        spacing: 10,
        frame: { width: 200 },
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
      widgetURL:
        'https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean',
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
                    alignment: $widget.horizontalAlignment.leading,
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
          props: this.contentProps(7.5),
          views: [this.left(), this.right()],
        },
      ],
    };
  };
}

module.exports = Actions;
