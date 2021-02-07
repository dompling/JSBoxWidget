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
    this.headerColor = $color({
      dark: setting.get('lightColor'),
      light: setting.get('nightColor'),
    });
    this.headerTextColor = $color({
      dark: setting.get('lightFont'),
      light: setting.get('nightFont'),
    });
  }

  config = {};

  init = () => {};

  sizeConfig = {};

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
            color: this.headerColor,
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
      clipped: true,
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

  header = () => {
    const { height } = this.config.displaySize;
    const { familyName } = this.service.dataSource;
    return {
      type: 'zstack',
      props: {
        alignment: $widget.alignment.center,
        frame: {
          height: 30,
          width: height * (this.config.family ? 1.5 : 0.8),
        },
      },
      views: [
        {
          type: 'color',
          props: {
            color: this.headerColor,
            cornerRadius: 12,
          },
        },
        {
          type: 'hstack',
          props: {
            alignment: $widget.horizontalAlignment.center,
            spacing: 5,
          },
          views: [
            ...(this.config.family
              ? [
                  {
                    type: 'text',
                    props: {
                      color: this.headerTextColor,
                      text: 'HomeScreen',
                      font: $font(14),
                      minimumScaleFactor,
                    },
                  },
                ]
              : []),
            {
              type: 'image',
              props: {
                symbol: {
                  glyph: 'heart.fill',
                  size: 14,
                  weight: 'medium',
                },
                color: this.headerTextColor,
                minimumScaleFactor,
              },
            },
            {
              type: 'text',
              props: {
                color: this.headerTextColor,
                text: familyName,
                font: $font(14),
                minimumScaleFactor,
              },
            },
          ],
        },
      ],
    };
  };

  label = (icon, scheme) => {
    return {
      type: 'image',
      props: {
        symbol: {
          glyph: icon,
          size: 54,
          weight: 'medium',
        },
        color: this.fontColor,
        minimumScaleFactor,
        link: scheme,
      },
    };
  };

  small = () => {
    const { width, height } = this.config.displaySize;
    const { phoneNumbers, emailAddresses, note } = this.service.dataSource;
    const phone = phoneNumbers[0] || {};
    const phoneNum = phone.content.split(' ').join('');
    const email = emailAddresses[0] || {};
    return {
      type: 'zstack',
      props: this.containerProps(),
      views: [
        ...(!this.is_bg
          ? [
              {
                type: 'color',
                props: {
                  color: this.bgColor,
                  cornerRadius: 12,
                  frame: { width: width - 15, height: height - 15 },
                },
              },
            ]
          : []),
        {
          type: 'vstack',
          props: this.contentProps(10),
          views: [
            this.header(),
            {
              type: 'text',
              props: {
                text: 'Contact',
                color: this.fontColor,
                font: $font('bold', 20),
              },
            },
            {
              type: 'hstack',
              props: {
                alignment: $widget.horizontalAlignment.center,
                spacing: 7.5,
              },
              views: [
                this.label('phone.circle', `tel:${phoneNum}`),
                this.label('message.circle', `sms:${phoneNum}`),
              ],
            },
            { type: 'spacer', props: { minLength: 2 } },
          ],
        },
      ],
    };
  };

  medium = () => {
    const { width, height } = this.config.displaySize;
    const { phoneNumbers, emailAddresses, note } = this.service.dataSource;
    const phone = phoneNumbers[0] || {};
    const phoneNum = phone.content.split(' ').join('');
    const email = emailAddresses[0] || {};
    return {
      type: 'zstack',
      props: this.containerProps(),
      views: [
        ...(!this.is_bg
          ? [
              {
                type: 'color',
                props: {
                  color: this.bgColor,
                  cornerRadius: 12,
                  frame: { width: width - 15, height: height - 15 },
                },
              },
            ]
          : []),
        {
          type: 'vstack',
          props: this.contentProps(10),
          views: [
            this.header(),
            {
              type: 'text',
              props: {
                text: 'Contact',
                color: this.fontColor,
                font: $font('bold', 20),
              },
            },
            {
              type: 'hstack',
              props: {
                alignment: $widget.horizontalAlignment.center,
                spacing: 7.5,
              },
              views: [
                this.label('video.circle', `facetime://${phoneNum}`),
                this.label('phone.circle', `tel:${phoneNum}`),
                this.label('message.circle', `sms:${phoneNum}`),
                this.label('envelope.circle', `mailto://${email.content}`),
              ],
            },
            {
              type: 'text',
              props: {
                text: note,
                color: this.fontColor,
                font: $font(14),
                minimumScaleFactor,
              },
            },
            { type: 'spacer', props: { minLength: 8 } },
          ],
        },
      ],
    };
  };
}

module.exports = Actions;
