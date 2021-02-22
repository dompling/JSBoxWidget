const NAME = 'PlaneWidget';
const Setting = require('../setting');
const { requestFailed } = require('../../../utils/index');

class CurrentSetting extends Setting {
  constructor(kernel) {
    super(kernel, NAME);
    this.path = `${this.kernel.widgetAssetsPath}/${NAME}`;
    if (!$file.exists(this.path)) $file.mkdir(this.path);
    this.prefix = this.get('boxjs');
  }

  clearBackgroundImage() {
    $file.list(this.path).forEach((file) => {
      if (file.slice(0, file.indexOf('.')) === 'background') {
        $file.delete(`${this.path}/${file}`);
      }
    });
  }

  getBackgroundImage() {
    let path = null;
    $file.list(this.path).forEach((file) => {
      if (file.slice(0, file.indexOf('.')) === 'background') {
        if (path === null) {
          path = `${this.path}/${file}`;
        } else if (typeof path === 'string') {
          path = [path];
          path.push(file);
        } else {
          path.push(file);
        }
        return;
      }
    });
    return path;
  }

  menu(key, animate) {
    animate.touchHighlightStart();
    $ui.menu({
      items: [$l10n('CHOOSE_IMAGE'), $l10n('CLEAR_IMAGE')],
      handler: (_, idx) => {
        switch (idx) {
          case 0:
            animate.actionStart();
            $photo.pick({
              format: 'data',
              handler: (resp) => {
                if (!resp.status) {
                  if (resp.error.description !== 'canceled')
                    $ui.toast($l10n('ERROR'));
                  else animate.actionCancel();
                }
                if (!resp.data) return;
                // 清除旧图片
                this.clearBackgroundImage(key);
                let fileName =
                  'background' +
                  resp.data.fileName.slice(resp.data.fileName.lastIndexOf('.'));
                // TODO 控制压缩图片大小
                let image = resp.data.image.jpg(
                  (this.imageMaxSize * 1000) / resp.data.info.size,
                );
                $file.write({
                  data: image,
                  path: `${this.path}/${fileName}`,
                });
                animate.actionDone();
              },
            });
            break;
          case 1:
            this.clearBackgroundImage(key);
            animate.actionDone();
            break;
        }
      },
      finished: (cancelled) => {
        if (cancelled) animate.touchHighlightEnd();
      },
    });
  }

  initSettingMethods() {
    this.setting.background = (animate) => {
      this.menu('', animate);
    };

    this.setting.getBoxJsData = (animate) => {
      animate.touchHighlight();
      animate.actionStart();
      this.getBoxJsData();
      animate.actionDone();
    };

    this.setting.getWidgetScreenShot = (animate) => {
      animate.touchHighlight();
      animate.actionStart();
      this.getWidgetScreenShot();
      animate.actionDone();
    };

    this.setting.setIcon = (url, update, key) => {
      if (url.match(/^(http||https):\/\//)) {
        $http.download({
          url,
          showsProgress: true, // Optional, default is true
          handler: (resp) => {
            if (requestFailed(resp)) {
              return;
            }
            const savePath = `${this.path}/icon.png`;
            const { image } = resp.data;
            update(key, savePath);
            $file.write({
              data: image.jpg(),
              path: savePath,
            });
          },
        });
      }
    };
  }

  generateAlert = async (_, options) => {
    return $ui.menu({ items: options });
  };

  async getWidgetScreenShot(title = null) {
    // Crop an image into the specified rect.
    function cropImage(img, rect) {
      const options = {
        size: $size(rect.width, rect.height),
      };
      try {
        // prettier-ignore
        const image = $imagekit.render(options, ctx => {
          options.size = $size(rect.width, rect.height);
          ctx.drawImage($rect(-rect.x, -rect.y, img.size.width, img.size.height), img);
        });
        return image;
      } catch (e) {
        console.log(e);
      }
    }

    // Pixel sizes and positions for widgets on all supported phones.
    function phoneSizes() {
      return {
        // 12 and 12 Pro
        2532: {
          small: 474,
          medium: 1014,
          large: 1062,
          left: 78,
          right: 618,
          top: 231,
          middle: 819,
          bottom: 1407,
        },

        // 11 Pro Max, XS Max
        2688: {
          small: 507,
          medium: 1080,
          large: 1137,
          left: 81,
          right: 654,
          top: 228,
          middle: 858,
          bottom: 1488,
        },

        // 11, XR
        1792: {
          small: 338,
          medium: 720,
          large: 758,
          left: 54,
          right: 436,
          top: 160,
          middle: 580,
          bottom: 1000,
        },

        // 11 Pro, XS, X
        2436: {
          small: 465,
          medium: 987,
          large: 1035,
          left: 69,
          right: 591,
          top: 213,
          middle: 783,
          bottom: 1353,
        },

        // Plus phones
        2208: {
          small: 471,
          medium: 1044,
          large: 1071,
          left: 99,
          right: 672,
          top: 114,
          middle: 696,
          bottom: 1278,
        },

        // SE2 and 6/6S/7/8
        1334: {
          small: 296,
          medium: 642,
          large: 648,
          left: 54,
          right: 400,
          top: 60,
          middle: 412,
          bottom: 764,
        },

        // SE1
        1136: {
          small: 282,
          medium: 584,
          large: 622,
          left: 30,
          right: 332,
          top: 59,
          middle: 399,
          bottom: 399,
        },

        // 11 and XR in Display Zoom mode
        1624: {
          small: 310,
          medium: 658,
          large: 690,
          left: 46,
          right: 394,
          top: 142,
          middle: 522,
          bottom: 902,
        },

        // Plus in Display Zoom mode
        2001: {
          small: 444,
          medium: 963,
          large: 972,
          left: 81,
          right: 600,
          top: 90,
          middle: 618,
          bottom: 1146,
        },
      };
    }

    let message =
      title || '开始之前，请先前往桌面，截取空白界面的截图。然后回来继续';
    let exitOptions = ['我已截图', '前去截图 >'];
    let shouldExit = await this.generateAlert(message, exitOptions);
    if (shouldExit.index) return;

    const resp = await $photo.pick({ format: 'data' });
    if (!resp.status) {
      if (resp.error.description !== 'canceled') $ui.toast($l10n('ERROR'));
    }
    if (!resp.data) return;

    // Get screenshot and determine phone size.
    let img = resp.data.image;
    let height = img.size.height;
    let phone = phoneSizes()[height];
    if (!phone) {
      message = '好像您选择的照片不是正确的截图，请先前往桌面';
      await this.generateAlert(message, ['我已知晓']);
      return;
    }

    // Prompt for widget size and position.
    message = '截图中要设置透明背景组件的尺寸类型是？';
    let sizes = ['小尺寸', '中尺寸', '大尺寸'];
    let size = await this.generateAlert(message, sizes);

    let widgetSize = sizes[size.index];

    message = '要设置透明背景的小组件在哪个位置？';
    message +=
      height === 1136
        ? ' （备注：当前设备只支持两行小组件，所以下边选项中的「中间」和「底部」的选项是一致的）'
        : '';

    // Determine image crop based on phone size.
    let crop = { w: '', h: '', x: '', y: '' };
    if (widgetSize === '小尺寸') {
      crop.w = phone.small;
      crop.h = phone.small;
      let positions = [
        '左上角',
        '右上角',
        '中间左',
        '中间右',
        '左下角',
        '右下角',
      ];
      let _posotions = [
        'Top left',
        'Top right',
        'Middle left',
        'Middle right',
        'Bottom left',
        'Bottom right',
      ];
      let position = await this.generateAlert(message, positions);

      // Convert the two words into two keys for the phone size dictionary.
      let keys = _posotions[position.index].toLowerCase().split(' ');
      crop.y = phone[keys[0]];
      crop.x = phone[keys[1]];
    } else if (widgetSize === '中尺寸') {
      crop.w = phone.medium;
      crop.h = phone.small;

      // Medium and large widgets have a fixed x-value.
      crop.x = phone.left;
      let positions = ['顶部', '中间', '底部'];
      let _positions = ['Top', 'Middle', 'Bottom'];
      let position = await this.generateAlert(message, positions);
      let key = _positions[position.index].toLowerCase();
      crop.y = phone[key];
    } else if (widgetSize === '大尺寸') {
      crop.w = phone.medium;
      crop.h = phone.large;
      crop.x = phone.left;
      let positions = ['顶部', '底部'];
      let position = await this.generateAlert(message, positions);

      // Large widgets at the bottom have the "middle" y-value.
      crop.y = position.index ? phone.middle : phone.top;
    }

    // 清除旧图片
    this.clearBackgroundImage();
    const fileName =
      'background' +
      resp.data.fileName.slice(resp.data.fileName.lastIndexOf('.'));
    const imageResponse = cropImage(img, {
      x: crop.x - 1,
      y: crop.y + 1,
      width: crop.w,
      height: crop.h,
    });

    $file.write({
      data: imageResponse.jpg(),
      path: `${this.path}/${fileName}`,
    });
    $ui.toast('设置成功');
  }
}

module.exports = {
  Setting: CurrentSetting,
  NAME,
};
