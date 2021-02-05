const minimumScaleFactor = 0.5;
const border = { width: 1, color: $color('red') };
const label = ['viewCount', 'subscriberCount', 'videoCount'];

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

  service = {};
  config = {};

  init = () => {
    this.counterView();
  };

  video_view = [];

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
    };
  };

  avatar = () => {
    return {
      type: 'image',
      props: {
        resizable: true,
        scaledToFit: true,
        uri: this.service.channel.snippet.thumbnails.high.url,
        cornerRadius: {
          value: 10,
          style: 1,
        },
        frame: { width: 20, height: 20 },
      },
    };
  };

  abbreviateNumber(num, fixed) {
    num = Number(num);
    if (num === null) {
      return null;
    } // terminate early
    if (num === 0) {
      return '0';
    } // terminate early
    fixed = !fixed || fixed < 0 ? 0 : fixed; // number of decimal places to show
    var b = num.toPrecision(2).split('e'), // get power
      k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
      c =
        k < 1
          ? num.toFixed(0 + fixed)
          : (num / Math.pow(10, k * 3)).toFixed(1 + fixed), // divide by power
      d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
      e = d + ['', 'K', 'M', 'B', 'T'][k]; // append power
    return e;
  }

  counterView = () => {
    const { videos } = this.service;
    videos.items.forEach((item, index) => {
      if (index >= 3) return;
      const publishedAt = new Date(item.snippet.publishedAt);
      this.video_view.push({
        type: 'hstack',
        props: {
          alignment: $widget.verticalAlignment.center,
          spacing: 5,
          frame: { height: 40 },
          link: `youtube://www.youtube.com/watch?v=${item.id}`,
        },
        views: [
          {
            type: 'image',
            props: {
              uri: item.snippet.thumbnails.standard.url,
              resizable: true,
              scaledToFill: true,
              frame: { width: 64, height: 40 },
              cornerRadius: {
                value: 4,
                style: 1,
              },
            },
          },
          {
            type: 'vstack',
            props: {
              alignment: $widget.horizontalAlignment.leading,
              spacing: 5,
            },
            views: [
              {
                type: 'text',
                props: {
                  text: item.snippet.title,
                  lineLimit: 1,
                  font: $font('bold', 12),
                  color: this.fontColor,
                },
              },
              {
                type: 'text',
                props: {
                  text: `${publishedAt.getFullYear()}/${
                    publishedAt.getMonth() + 1
                  }/${publishedAt.getDate()} ${publishedAt.getHours()}:${publishedAt.getMinutes()}`,
                  lineLimit: 1,
                  minimumScaleFactor,
                  font: $font(10),
                  color: this.fontColor,
                  opacity: 0.8,
                },
              },
            ],
          },
        ],
      });
    });
  };

  content = (width, height) => {
    const counters = this.service.channel.statistics;
    let today = new Date();
    let updateTime = `${today.getMonth() + 1}/${today.getDate()} ${this.zeroPad(
      today.getHours(),
    )}:${this.zeroPad(today.getMinutes())}`;
    return {
      type: 'vstack',
      props: {
        ...this.contentProps(10),
        frame: { width, height },
        widgetURL: `youtube://www.youtube.com\/channel\/${this.service.id}`,
      },
      views: [
        {
          type: 'vstack',
          props: {
            alignment: $widget.horizontalAlignment.center,
            spacing: 2,
          },
          views: [
            {
              type: 'text',
              props: {
                text: this.abbreviateNumber(counters.subscriberCount, 1),
                font: $font('bold', 24),
                color: this.fontColor,
                minimumScaleFactor,
              },
            },
            {
              type: 'text',
              props: {
                text: 'Subscribers',
                font: $font('AppleSDGothicNeo-SemiBold', 12),
                color: this.fontColor,
                minimumScaleFactor,
              },
            },
          ],
        },
        {
          type: 'vstack',
          props: {
            alignment: $widget.horizontalAlignment.center,
            spacing: 2,
          },
          views: [
            {
              type: 'hstack',
              props: {
                alignment: $widget.horizontalAlignment.center,
                spacing: 5,
              },
              views: [
                {
                  type: 'image',
                  props: {
                    symbol: {
                      glyph: 'play.fill',
                      size: 14,
                    },
                    color: this.fontColor,
                  },
                },
                {
                  type: 'text',
                  props: {
                    text: this.abbreviateNumber(counters.viewCount, 1),
                    font: $font('AppleSDGothicNeo-SemiBold', 20),
                    color: this.fontColor,
                    minimumScaleFactor,
                  },
                },
              ],
            },
            {
              type: 'text',
              props: {
                text: 'view',
                font: $font('AppleSDGothicNeo-SemiBold', 14),
                color: this.fontColor,
                minimumScaleFactor,
              },
            },
          ],
        },
        {
          type: 'hstack',
          props: {
            alignment: $widget.horizontalAlignment.center,
            spacing: 5,
          },
          views: [
            this.avatar(),
            {
              type: 'text',
              props: {
                text: `@${this.setting.get('channelName')}`,
                font: $font('AppleSDGothicNeo-SemiBold', 12),
                color: this.fontColor,
                minimumScaleFactor,
              },
            },
          ],
        },
        {
          type: 'hstack',
          props: {
            alignment: $widget.horizontalAlignment.center,
            spacing: 5,
          },
          views: [
            {
              type: 'image',
              props: {
                symbol: {
                  glyph: 'arrow.triangle.2.circlepath',
                  size: 10,
                },
                color: this.fontColor,
              },
            },
            {
              type: 'text',
              props: {
                text: updateTime,
                font: $font('Baskerville-SemiBoldItalic', 10),
                color: this.fontColor,
                opacity: 0.9,
                minimumScaleFactor,
              },
            },
          ],
        },
      ],
    };
  };

  right = () => {
    return {
      type: 'vstack',
      props: {
        spacing: 10,
        alignment: $widget.horizontalAlignment.leading,
      },
      views: this.video_view,
    };
  };

  zeroPad(numToPad) {
    if (numToPad > 9) {
      return numToPad;
    } else {
      return `0${numToPad}`;
    }
  }

  small = () => {
    const { width, height } = this.config.displaySize;
    return {
      type: 'zstack',
      props: this.containerProps(),
      views: [this.content(width, height)],
    };
  };

  medium = () => {
    const { height } = this.config.displaySize;
    return {
      type: 'zstack',
      props: this.containerProps(),
      views: [
        {
          type: 'hstack',
          props: this.contentProps(7.5),
          views: [
            this.content(height / 1.3, height),
            {
              type: 'divider',
              props: {
                color: $color('#e8e8e8'),
                frame: { width: 2, height: height },
              },
            },
            this.right(),
            this.spacerMaker(height, 0),
          ],
        },
      ],
    };
  };
}

module.exports = Actions;
