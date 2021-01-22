const NAME = 'JDDou';
const Setting = require('../setting');
const Actions = require('./Actions');

class CurrentSetting extends Setting {
  constructor(kernel) {
    super(kernel, NAME);
    this.actions = new Actions(this.kernel, this);
    this.path = `${this.kernel.widgetAssetsPath}/${NAME}`;
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
                this.clearBackgroundImage();
                let fileName =
                  'background' +
                  resp.data.fileName.slice(resp.data.fileName.lastIndexOf('.'));
                // TODO 控制压缩图片大小
                let image = resp.data.image.jpg(
                  (this.imageMaxSize * 1000) / resp.data.info.size,
                );
                $file.write({
                  data: image,
                  path: `${this.path}/${fileName}_${key}`,
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
    this.setting.lightBg = (animate) => {
      this.menu('lightBg', animate);
    };
    this.setting.nightBg = (animate) => {
      this.menu('nightBg', animate);
    };

    this.setting.clearCache = (animate) => {
      animate.touchHighlight();
      animate.actionStart();
      $cache.remove('switch.data');
      animate.actionDone();
    };
  }

  getBackgroundImage(key) {
    let path = null;
    $file.list(this.path).forEach((file) => {
      if (file.slice(0, file.indexOf('.')) === 'background') {
        if (path === null) {
          path = `${this.path}/${file}_${key}`;
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

  clearBackgroundImage(key) {
    $file.list(this.path).forEach((file) => {
      if (file.slice(0, file.indexOf('.')) === 'background') {
        $file.delete(`${this.path}/${file}_${key}`);
      }
    });
  }
}

module.exports = CurrentSetting;
