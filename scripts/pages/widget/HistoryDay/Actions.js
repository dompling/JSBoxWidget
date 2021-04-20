const minimumScaleFactor = 0.5;
const border = { width: 1, color: $color('red') };
class Actions {
  constructor(setting, config, service) {
    this.setting = setting;
    this.fontColor = $color({
      light: setting.get('lightFont'),
      dark: setting.get('nightFont'),
    });
    this.broadColor = $color({
      light: setting.get('broadColor'),
      dark: setting.get('broadNight'),
    });
    this.backgroundImage = this.setting.getBackgroundImage();
    this.is_bg = $file.exists(this.backgroundImage);
    this.opacity = setting.get('opacity');
    this.service = service;
    this.config = config;
    this.bgColor = $color({
      light: setting.get('lightColor'),
      dark: setting.get('nightColor'),
    });
    this.width = this.config.displaySize.width / 3 - 20;
    this.avatarWidth = this.width - 30;
  }

  config = {};
  data = {};

  service = {};
  sizeConfig = {};

  init = () => {
    this.data = this.getRandomArrayElements(this.service.dataSource, 6);
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

  spacerMaker(height, width) {
    return {
      type: 'spacer',
      props: {
        frame: {
          width: width,
          height: height,
        },
      },
    };
  }

  getRandomArrayElements(arr, count) {
    let shuffled = arr.slice(0),
      i = arr.length,
      min = i - count,
      temp,
      index;
    min = min > 0 ? min : 0;
    while (i-- > min) {
      index = Math.floor((i + 1) * Math.random());
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
    }
    return shuffled.slice(min);
  }

  listItemCell = (data) => {
    return {
      type: 'zstack',
      props: {
        link: data.href,
        frame: {
          width: this.width,
          height: this.width + this.width / 4,
        },
      },
      views: [
        {
          type: 'color',
          props: {
            frame: {
              width: this.width,
              height: this.width + this.width / 4,
            },
            color: this.broadColor,
            cornerRadius: 10,
          },
        },
        {
          type: 'vstack',
          props: {
            offset: $point(0, -this.avatarWidth / 7),
            spacing: 5,
            padding: $insets(0, 5, 5, 0),
          },
          views: [
            {
              type: 'image',
              props: {
                image: $image(data.img),
                resizable: true,
                scaledToFit: true,
                cornerRadius: this.avatarWidth / 2,
                frame: {
                  width: this.avatarWidth,
                  height: this.avatarWidth,
                },
              },
            },
            {
              type: 'text',
              props: {
                text: data.year,
                color: this.fontColor,
                font: $font('bold', 20),
              },
            },
            {
              type: 'text',
              props: {
                text: data.title,
                color: this.fontColor,
                font: $font('bold', 12),
                lineLimit: 3,
                frame: {
                  height: 40,
                },
              },
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

  large = () => {
    return {
      type: 'zstack',
      props: this.containerProps(),
      views: [
        ...this.backgroundView(),
        {
          type: 'vstack',
          props: { alignment: $widget.horizontalAlignment, spacing: 40 },
          views: [
            {
              type: 'hstack',
              props: { alignment: $widget.verticalAlignment },
              views: [
                this.listItemCell(this.data[0]),
                this.listItemCell(this.data[1]),
                this.listItemCell(this.data[2]),
              ],
            },
            {
              type: 'hstack',
              props: { alignment: $widget.verticalAlignment },
              views: [
                this.listItemCell(this.data[3]),
                this.listItemCell(this.data[4]),
                this.listItemCell(this.data[5]),
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
        ...this.backgroundView(),
        {
          type: 'hstack',
          props: {
            alignment: $widget.verticalAlignment,
            padding: $insets(10, 0, 0, 0),
          },
          views: [
            this.listItemCell(this.data[0]),
            this.listItemCell(this.data[1]),
            this.listItemCell(this.data[2]),
          ],
        },
      ],
    };
  };
}

module.exports = Actions;
