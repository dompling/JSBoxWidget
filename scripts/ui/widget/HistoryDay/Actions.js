const minimumScaleFactor = 0.5;
const border = { width: 1, color: $color('red') };
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
    this.service = service;
    this.config = config;
    this.bgColor = $color({
      light: setting.get('lightColor'),
      dark: setting.get('nightColor'),
    });
  }

  config = {};
  data = {};

  service = {};
  sizeConfig = {};

  init = () => {
    const data = this.getRandomArrayElements(this.service.dataSource, 1);
    this.data = data[0];
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

  small = () => {
    return this.medium();
  };

  medium = () => {
    const { width, height } = this.config.displaySize;
    let { j, t } = this.data;
    const [year, desc] = t.split(' ');
    const link = `https://www.google.com\/search?q=`+encodeURIComponent(desc);
    return {
      type: 'zstack',
      props: {
        ...this.containerProps(),
        widgetURL: link,
      },
      views: [
        {
          type: 'image',
          props: {
            uri: `${this.service.imgUri}/${j}`,
            resizable: true,
            scaledToFill: true,
          },
        },
        {
          type: 'color',
          props: {
            color: 'black',
            opacity: this.opacity,
          },
        },
        {
          type: 'vstack',
          props: {
            alignment: $widget.horizontalAlignment.center,
            spacing: 10,
            frame: { width, height },
          },
          views: [
            { type: 'spacer', props: { minLength: 20 } },
            {
              type: 'text',
              props: {
                text: `${desc}`,
                font: $font('bold', 15),
                color: this.fontColor,
                frame: { width: width - 10 },
              },
            },
            {
              type: 'zstack',
              props: {
                alignment: $widget.alignment.center,
                frame: {
                  height: 20,
                },
              },
              views: [
                {
                  type: 'color',
                  props: {
                    color: $color('#e50914'),
                    cornerRadius: 7.5,
                  },
                },
                {
                  type: 'text',
                  props: {
                    text: `${year}`,
                    font: $font('bold', 10),
                    color: this.fontColor,
                    minimumScaleFactor: 0.8,
                    lineLimit: 1,
                  },
                },
              ],
            },
          ],
        },
      ],
    };
  };
}

module.exports = Actions;
