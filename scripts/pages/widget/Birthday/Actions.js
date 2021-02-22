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
            color: this.bgColor,
          },
        };

    return {
      frame: this.config.displaySize,
      alignment: $widget.alignment.center,
      background,
    };
  };

  labelItem = (value) => {
    return {
      type: 'hstack',
      props: {
        alignment: $widget.verticalAlignment.center,
        spacing: 10,
      },
      views: [
        {
          type: 'text',
          props: {
            text: value,
            color: this.fontColor,
            font: $font('AmericanTypewriter-Bold', 18),
            minimumScaleFactor,
          },
        },
      ],
    };
  };

  small = () => {
    const { avatar, name, birthday, next } = this.service.dataSource;
    const { width, height } = this.config.displaySize;
    return {
      type: 'zstack',
      props: this.containerProps(),
      views: [
        ...(this.is_bg
          ? [
              {
                type: 'color',
                props: {
                  color: $color('#000'),
                  opacity: this.opacity,
                },
              },
            ]
          : []),
        {
          type: 'vstack',
          props: {
            alignment: $widget.horizontalAlignment.leading,
            spacing: 5,
          },
          views: [
            ...(avatar
              ? [
                  {
                    type: 'hstack',
                    props: {
                      alignment: $widget.verticalAlignment.firstTextBaseline,
                    },
                    views: [
                      {
                        type: 'image',
                        props: {
                          image: $image(avatar),
                          resizable: true,
                          scaledToFill: true,
                          cornerRadius: {
                            value: width / 8,
                            style: 1,
                          },
                          frame: { width: width / 4, height: height / 4 },
                        },
                      },
                    ],
                  },
                ]
              : []),
            {
              type: 'text',
              props: {
                text: `${name}'s birthday`,
                color: this.fontColor,
                font: $font('AmericanTypewriter-Bold', 18),
                minimumScaleFactor,
              },
            },
            {
              type: 'text',
              props: {
                text: `${birthday.toDateString()} ·In`,
                color: $color('#e8e8e8'),
                font: $font('AmericanTypewriter-Bold', 14),
                opacity: 0.8,
                minimumScaleFactor,
              },
            },
            {
              type: 'hstack',
              props: {
                alignment: $widget.verticalAlignment.lastTextBaseline,
              },
              views: [
                {
                  type: 'text',
                  props: {
                    text: `${next}`,
                    color: this.fontColor,
                    font: $font('ChalkboardSE-Bold', 30),
                  },
                },
                {
                  type: 'text',
                  props: {
                    text: 'days',
                    color: $color('#e8e8e8'),
                    font: $font('AmericanTypewriter-Bold', 14),
                    opacity: 0.8,
                    minimumScaleFactor,
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
    const { avatar, name, birthday, next, data } = this.service.dataSource;
    const { height } = this.config.displaySize;
    return {
      type: 'zstack',
      props: this.containerProps(),
      views: [
        ...(this.is_bg
          ? [
              {
                type: 'color',
                props: {
                  color: $color('#000'),
                  opacity: this.opacity,
                },
              },
            ]
          : []),
        {
          type: 'hstack',
          props: { alignment: $widget.verticalAlignment.center, spacing: 10 },
          views: [
            ...(avatar
              ? [
                  {
                    type: 'image',
                    props: {
                      image: $image(avatar),
                      resizable: true,
                      scaledToFill: true,
                      frame: { width: height, height },
                    },
                  },
                ]
              : []),
            {
              type: 'vstack',
              props: {
                alignment: $widget.horizontalAlignment.leading,
                frame: { maxWidth: Infinity, maxHeight: Infinity },
                spacing: 10,
              },
              views: [
                this.labelItem(`${data.IMonthCn}${data.IDayCn}`),
                {
                  type: 'text',
                  props: {
                    text: `${name}'s birthday`,
                    color: this.fontColor,
                    font: $font('AmericanTypewriter-Bold', 18),
                    minimumScaleFactor,
                  },
                },
                {
                  type: 'text',
                  props: {
                    text: `${birthday.toDateString()} ·In`,
                    color: $color('#e8e8e8'),
                    font: $font('AmericanTypewriter-Bold', 14),
                    opacity: 0.8,
                    minimumScaleFactor,
                  },
                },
                {
                  type: 'hstack',
                  props: {
                    alignment: $widget.verticalAlignment.lastTextBaseline,
                  },
                  views: [
                    {
                      type: 'text',
                      props: {
                        text: `${next}`,
                        color: this.fontColor,
                        font: $font('ChalkboardSE-Bold', 30),
                      },
                    },
                    {
                      type: 'text',
                      props: {
                        text: 'days',
                        color: $color('#e8e8e8'),
                        font: $font('AmericanTypewriter-Bold', 14),
                        opacity: 0.8,
                        minimumScaleFactor,
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
}

module.exports = Actions;
