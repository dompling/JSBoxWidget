const minimumScaleFactor = 0.5;
const border = { width: 1, color: $color('red') };

const logo_10000 = $image('assets/icon/MobileWidget/10000_logo.png');
const logo_10000_desc = $image('assets/icon/MobileWidget/10000_logo_desc.png');

const logo_10010 = $image('assets/icon/MobileWidget/10010_logo.png');
const logo_10010_desc = $image('assets/icon/MobileWidget/10010_logo_desc.png');

class Actions {
  constructor(setting, config, service) {
    this.setting = setting;
    this.fontColor = $color({
      light: setting.get('lightFont'),
      dark: setting.get('nightFont'),
    });
    this.backgroundImage = this.setting.getBackgroundImage();
    this.is_bg = $file.exists(this.backgroundImage);
    this.opacity = setting.get('opacity');
    this.dataSource = service.dataSource;
    this.config = config;
    this.bgColor = $color({
      light: setting.get('lightColor'),
      dark: setting.get('nightColor'),
    });

    this.logo = setting.get('ctType') ? logo_10010 : logo_10000;
    this.logo_desc = setting.get('ctType') ? logo_10010_desc : logo_10000_desc;
    this.ctColor = setting.get('ctType')
      ? $color('#f72c1b')
      : $color('#0A4B9D');
    const step1 = setting.get('step1');
    const step2 = setting.get('step2');
    const inner1 = setting.get('inner1');
    const inner2 = setting.get('inner2');

    this.flowColorHex = $color(step1 ? step1 : this.flowColorHex);
    this.voiceColorHex = $color(step2 ? step2 : this.voiceColorHex);

    const flowColor = this.flowColorHex.components;
    const bgcolor = $rgba(flowColor.red, flowColor.blue, flowColor.green, 0.2);

    const voiceColor = this.voiceColorHex.components;
    const bgcolor2 = $rgba(
      voiceColor.red,
      voiceColor.blue,
      voiceColor.green,
      0.2,
    );

    this.dataSource.flow.BGColor = inner1
      ? $color(inner1)
      : $color(bgcolor.hexCode);

    this.dataSource.voice.BGColor = inner2
      ? $color(inner2)
      : $color(bgcolor2.hexCode);

    this.dataSource.flow.FGColor = this.flowColorHex;
    this.dataSource.voice.FGColor = this.voiceColorHex;

    this.gradient = setting.get('gradient');
    this.cellWSize = this.config.displaySize.width / 3 - 10;
    this.cellHSize = this.config.displaySize.height - 20;
  }

  flowColorHex = '#FF6620';
  voiceColorHex = '#78C100';

  canvSize = 100;
  canvRadius = 50;
  canvWidth = 8;
  ringStackSize = 80;

  init = () => {
    this.drawCircle(
      this.dataSource.flow.percent * 3.6,
      this.dataSource.flow.FGColor,
      this.dataSource.flow.BGColor,
    );
  };

  sinDeg(deg) {
    return Math.sin((deg * Math.PI) / 180);
  }

  cosDeg(deg) {
    return Math.cos((deg * Math.PI) / 180);
  }

  drawCircle = (deg, fillColor, strokeColor) => {
    const options = { size: $size(this.canvSize, this.canvSize) };
    const image = $imagekit.render(options, (ctx) => {
      const r = this.canvRadius - this.canvWidth;
      const ctr = { x: this.canvSize / 2, y: this.canvSize / 2 };
      ctx.strokeColor = strokeColor;
      ctx.setLineWidth(this.canvWidth);
      ctx.addArc(ctr.x, ctr.y, r, 0, 360, false);
      ctx.strokePath();
      ctx.fillColor = fillColor;
      for (let t = 0; t < deg; t++) {
        const rect_x = ctr.x + r * this.sinDeg(t);
        const rect_y = ctr.y - r * this.cosDeg(t);
        ctx.addArc(rect_x, rect_y, this.canvWidth / 2, 0, 360, false);
        ctx.fillPath();
      }
    });
    return image;
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
      alignment: $widget.alignment.leading,
      background,
    };
  };

  contentProps = (spacing = 20) => {
    return {
      spacing,
      frame: this.config.displaySize,
      // alignment: $widget.horizontalAlignment.center,
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

  imageCell = (data) => {
    const image = this.drawCircle(
      data.percent * 3.6,
      data.FGColor,
      data.BGColor,
    );

    const rgb = data.BGColor.components;
    const color = $rgba(rgb.red, rgb.green, rgb.blue, 0.2);
    return {
      type: 'zstack',
      views: [
        {
          type: 'color',
          props: {
            frame: { width: this.cellWSize, height: this.cellHSize },
            color: color,
            cornerRadius: 20,
          },
        },
        {
          type: 'vstack',
          props: {
            alignment: $widget.horizontalAlignment.center,
            padding: $insets(30, 0, 0, 0),
          },
          views: [
            {
              type: 'image',
              props: {
                image: image,
                frame: {
                  width: this.ringStackSize,
                  height: this.ringStackSize,
                },
                scaledToFit: true,
                resizable: true,
              },
            },
            {
              type: 'vstack',
              props: {
                offset: $point(0, -this.ringStackSize / 1.3),
                spacing: 2,
              },
              views: [
                {
                  type: 'image',
                  props: {
                    color: data.FGColor,
                    symbol: {
                      glyph: data.icon,
                      size: 10,
                    },
                  },
                },
                {
                  type: 'text',
                  props: {
                    bold: true,
                    text: `${data.percent || 0}`,
                    font: { size: 12 },
                    color: data.FGColor,
                  },
                },
                {
                  type: 'text',
                  props: {
                    text: '%',
                    font: { size: 10 },
                    color: data.FGColor,
                  },
                },
              ],
            },
            {
              type: 'vstack',
              props: {
                offset: $point(0, -this.ringStackSize / 2.5),
              },
              views: [
                {
                  type: 'text',
                  props: {
                    bold: true,
                    text: `${data.number} ${data.unit}`,
                    color: data.FGColor,
                    font: { size: 16 },
                  },
                },
                {
                  type: 'text',
                  props: {
                    text: data.title,
                    font: { size: 12 },
                    color: data.FGColor,
                  },
                },
              ],
            },
          ],
        },
      ],
    };
  };

  feeCell = (data) => {
    const textColor = this.ctColor;
    const bg = textColor.components;
    return {
      type: 'zstack',
      views: [
        {
          type: 'color',
          props: {
            frame: { width: this.cellWSize, height: this.cellHSize },
            color: $rgba(bg.red, bg.green, bg.blue, 0.2),
            cornerRadius: 20,
          },
        },
        {
          type: 'vstack',
          props: {
            alignment: $widget.horizontalAlignment.center,
            spacing: 10,
            padding: $insets(10, 0, 0, 0),
          },
          views: [
            {
              type: 'image',
              props: {
                frame: {
                  width: 45,
                  height: 45,
                },
                image: this.logo,
                scaledToFit: true,
                resizable: true,
              },
            },
            {
              type: 'hstack',
              props: {
                alignment: $widget.verticalAlignment.center,
              },
              views: [
                {
                  type: 'image',
                  props: {
                    color: textColor,
                    symbol: {
                      glyph: 'arrow.2.circlepath',
                      size: 10,
                    },
                  },
                },
                {
                  type: 'text',
                  props: {
                    date: new Date(),
                    style: $widget.dateStyle.time,
                    color: textColor,
                    font: { size: 12 },
                  },
                },
              ],
            },
            {
              type: 'vstack',
              views: [
                {
                  type: 'text',
                  props: {
                    bold: true,
                    color: textColor,
                    font: { size: 16 },
                    text: `${data.number} ${data.unit}`,
                  },
                },
                {
                  type: 'text',
                  props: {
                    text: data.title,
                    color: textColor,
                    font: { size: 12 },
                  },
                },
              ],
            },
          ],
        },
      ],
    };
  };

  textLayout = (data) => {
    return {
      type: 'hstack',
      props: {
        alignment: $widget.verticalAlignment.center,
        padding: $insets(0, 10, 0, 10),
      },
      views: [
        {
          type: 'image',
          props: {
            color: data.FGColor,
            symbol: {
              glyph: data.icon,
              size: 12,
            },
          },
        },
        {
          type: 'text',
          props: {
            text: data.title,
            color: this.fontColor,
            font: { size: 12 },
            lineLimit: 1,
          },
        },
        {
          type: 'text',
          props: {
            bold: true,
            color: this.fontColor,
            font: { size: 12 },
            text: `${data.number} ${data.unit}`,
            lineLimit: 1,
          },
        },
      ],
    };
  };

  small = () => {
    const { width } = this.config.displaySize;
    return {
      type: 'zstack',
      props: this.containerProps(),
      views: [
        {
          type: 'vstack',
          props: {
            ...this.contentProps(15),
            alignment: $widget.horizontalAlignment.center,
          },
          views: [
            {
              type: 'image',
              props: {
                image: this.logo_desc,
                scaledToFit: true,
                resizable: true,
                frame: {
                  width: width - 30,
                  // height: (this.displaySize - 100) / 2,
                },
              },
            },
            {
              type: 'text',
              props: {
                bold: true,
                text: `${this.dataSource.fee.number || 0} ${
                  this.dataSource.fee.unit
                }`,
                color: this.fontColor,
                font: { size: 22 },
              },
            },
            {
              type: 'vstack',
              props: {
                alignment: $widget.horizontalAlignment.leading,
                spacing: 10,
              },
              views: [
                this.textLayout(this.dataSource.flow),
                this.textLayout(this.dataSource.voice),
              ],
            },
          ],
        },
      ],
    };
  };

  backgroundView = () => {
    return this.is_bg
      ? [
          {
            type: 'color',
            props: {
              frame: {
                ...this.config.displaySize,
              },
              color: $color('#000'),
              opacity: this.opacity,
            },
          },
        ]
      : [];
  };

  medium = () => {
    return {
      type: 'zstack',
      props: this.containerProps(),
      views: [
        ...this.backgroundView(),
        {
          type: 'hstack',
          props: {
            alignment: $widget.verticalAlignment.center,
          },
          views: [
            this.feeCell(this.dataSource.fee),
            this.imageCell(this.dataSource.flow),
            this.imageCell(this.dataSource.voice),
          ],
        },
      ],
    };
  };
}

module.exports = Actions;
