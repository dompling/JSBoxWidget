const border = { width: 1, color: $color('red') };
const minimumScaleFactor = 0.5;
class Actions {
  constructor(setting, config, service) {
    this.setting = setting;
    this.backgroundImage = this.setting.getBackgroundImage();
    this.is_bg = $file.exists(this.backgroundImage);
    this.opacity = setting.get('opacity');
    this.config = config;
    this.bgColor = $color({
      light: setting.get('lightColor'),
      dark: setting.get('nightColor'),
    });
    this.fontColor = $color({
      light: setting.get('lightFont'),
      dark: setting.get('nightFont'),
    });
    this.service = service;
  }

  init = () => {
    if (!this.config.family) {
      this.sizeConfig = {
        ...this.sizeConfig,
        chartsSize: 80,
        labelTextFont: 12,
        circle: 15,
        labelSpacer: 2,
      };
    }
  };

  sizeConfig = {
    chartsSize: 140,
    labelSpacer: 5,
    labelTextFont: 14,
    circle: 20,
  };

  charts = (size) => {
    const getchart = (image) => {
      return {
        type: 'image',
        props: { image, resizable: true, scaledToFill: true },
      };
    };
    const getStackProps = (key) => {
      const frame = { width: size, height: size };
      return {
        frame,
        alignment: $widget.alignment.center,
        background: getchart(this.service[`chart${key}`]),
      };
    };

    return {
      type: 'zstack',
      props: getStackProps(3),
      views: [
        {
          type: 'zstack',
          props: getStackProps(2),
          views: [
            {
              type: 'zstack',
              props: getStackProps(1),
            },
          ],
        },
      ],
    };
  };

  circle = (icon, url) => {
    return url
      ? {
          type: 'image',
          props: {
            image: $image(icon),
            resizable: true,
            scaledToFill: true,
            cornerRadius: {
              value: this.sizeConfig.circle / 2,
              style: 1, // 0: circular, 1: continuous
            },
            clipped: true,
            frame: {
              width: this.sizeConfig.circle,
              height: this.sizeConfig.circle,
            },
          },
        }
      : {
          type: 'image',
          props: {
            // border,
            symbol: 'circle.fill',
            color: $color(icon[1]),
            cornerRadius: {
              value: this.sizeConfig.circle / 2,
              style: 0, // 0: circular, 1: continuous
            },
            clipped: true,
            frame: {
              width: this.sizeConfig.circle,
              height: this.sizeConfig.circle,
            },
          },
        };
  };

  labelText = (icon, label, text, url = false, type = 'hstack') => {
    return {
      type,
      props: {
        alignment: $widget.horizontalAlignment.center,
        spacing: this.sizeConfig.labelSpacer,
      },
      views: [
        this.circle(icon, url),
        {
          type: 'text',
          props: {
            text: label,
            lineLimit: 1,
            color: this.fontColor,
            minimumScaleFactor,
            font: { size: this.sizeConfig.labelTextFont },
          },
        },
        text
          ? {
              type: 'text',
              props: {
                text,
                lineLimit: 1,
                color: this.fontColor,
                font: { size: this.sizeConfig.labelTextFont },
              },
            }
          : null,
      ],
    };
  };

  right = () => {
    const { todayData, usedData, restData } = this.service.dataSource;
    return {
      type: 'vstack',
      props: {
        alignment: $widget.horizontalAlignment.leading,
        spacing: 10,
      },
      views: [
        this.labelText(
          this.service.account.logo,
          this.service.account.title,
          '',
          true,
        ),
        this.labelText(
          this.service.color3,
          `${this.service.label.todayData}：`,
          todayData,
        ),
        this.labelText(
          this.service.color2,
          `${this.service.label.usedData}：`,
          `${usedData}`,
        ),
        this.labelText(
          this.service.color1,
          `${this.service.label.restData}:`,
          `${restData}`,
        ),
      ],
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
      background,
    };
  };

  contentProps = (spacing = 20) => {
    return {
      spacing,
      frame: this.config.displaySize,
      alignment: $widget.horizontalAlignment.center,
      spacing: 10,
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
    const { todayData, usedData, restData } = this.service.dataSource;
    return {
      type: 'zstack',
      props: this.containerProps(),
      views: [
        {
          type: 'vstack',
          props: this.contentProps(10),
          views: [
            {
              type: 'hstack',
              props: {
                alignment: $widget.horizontalAlignment.center,
                spacing: 20,
              },
              views: [
                this.labelText(
                  this.service.account.logo,
                  this.service.account.title,
                  '',
                  true,
                ),
                {
                  type: 'text',
                  props: {
                    text: `${this.service.label.todayData}：${todayData}`,
                    color: this.fontColor,
                    font: { size: this.sizeConfig.labelTextFont },
                  },
                },
              ],
            },
            {
              type: 'hstack',
              props: {
                alignment: $widget.verticalAlignment.bottom,
                spacing: 10,
              },
              views: [
                this.labelText(
                  this.service.color2,
                  this.service.label.usedData,
                  ``,
                  false,
                  'vstack',
                ),
                this.charts(this.sizeConfig.chartsSize),
                this.labelText(
                  this.service.color1,
                  this.service.label.restData,
                  ``,
                  false,
                  'vstack',
                ),
              ],
            },
            {
              type: 'color',
              props: {
                frame: { width: this.config.displaySize.width - 10, height: 6 },
                color: $color('#91d5ff', '#ffadd2'),
                cornerRadius: 3,
              },
            },
            {
              type: 'hstack',
              props: {
                alignment: $widget.verticalAlignment.center,
                spacing: 20,
              },
              views: [
                {
                  type: 'text',
                  props: {
                    text: `${usedData}`,
                    color: this.fontColor,
                    font: { size: this.sizeConfig.labelTextFont },
                  },
                },
                {
                  type: 'text',
                  props: {
                    text: `${restData}`,
                    color: this.fontColor,
                    font: { size: this.sizeConfig.labelTextFont },
                  },
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
          views: [this.charts(this.sizeConfig.chartsSize), this.right()],
        },
      ],
    };
  };
}

module.exports = Actions;
