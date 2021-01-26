const NAME = 'JDDou';
const Setting = require('../setting');

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

  boxCache = (response) => {
    const cookies = [];
    const data = response.data.datas;
    if (data.CookiesJD && data.CookiesJD.length > 0) {
      try {
        cookies.push(...JSON.parse(data.CookiesJD));
      } catch (e) {}
    }
    if (data.CookieJD) {
      cookies.push({
        cookie: data.CookieJD,
        userName: data.CookieJD.match(/pt_pin=(.+?);/)[1],
      });
    }
    if (data.CookieJD2) {
      cookies.push({
        cookie: data.CookieJD2,
        userName: data.CookieJD2.match(/pt_pin=(.+?);/)[1],
      });
    }
    if (cookies.length > 0) {
      $ui.menu({
        items: cookies.map((item) => item.userName),
        handler: (userName, idx) => {
          this.set('cookie', cookies[idx]);
          $ui.success(`${userName}账号信息设置成功`);
        },
      });
    } else {
      $ui.toast('读取失败');
    }
  };

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

  getBoxJsData = () => {
    $ui.toast('读取中...');
    $http.get({
      url: `http://${this.prefix}/query/boxdata`,
      handler: this.boxCache,
    });
  };

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

    this.setting.clearCache = (animate) => {
      animate.touchHighlight();
      animate.actionStart();
      $cache.remove('switch.data');
      const assetsPath = `${this.kernel.widgetAssetsPath}/${this.widget}`;
      const savePath = `${assetsPath}/setting.json`;
      if ($file.exists(savePath)) $file.delete(savePath);
      $cache.remove(`setting-${this.widget}`);
      animate.actionDone();
    };
  }
}

module.exports = {
  Setting: CurrentSetting,
  NAME,
};
