class Setting {
  constructor(kernel, widget) {
    this.kernel = kernel;
    this.widget = widget;
    // 初始化
    this.init();
    this.settingUrlScheme = `jsbox://run?name=${this.kernel.name}&widget=${this.widget}`;
    this.family = {
      small: 0,
      medium: 1,
      large: 2,
    };
    this.joinMode = {
      small: 0,
      medium: 1,
    };
  }

  setting = {};

  init() {
    const rootPath = `${this.kernel.widgetRootPath}/${this.widget}`,
      assetsPath = `${this.kernel.widgetAssetsPath}/${this.widget}`;
    // 检查目录是否存在，不存在则创建
    if (!$file.exists(rootPath)) {
      $file.mkdir(rootPath);
    }
    if (!$file.exists(assetsPath)) {
      $file.mkdir(assetsPath);
    }
    const structPath = `${rootPath}/setting.json`,
      savePath = `${assetsPath}/setting.json`;
    // 判断当前环境
    if (this.kernel.inWidgetEnv) {
      this.widgetCache(structPath, savePath);
    } else {
      this.settingComponent = this.kernel._registerComponent('Setting', {
        name: `${this.widget}Setting`,
        savePath: savePath,
        structPath: structPath,
      });
      this.setting = this.settingComponent.controller;
      // 每次从主程序启动都更新设置项缓存
      $cache.set(`setting-${this.widget}`, this.setting.setting);
      this.setting.isSecondaryPage(true, () => {
        $ui.pop();
      });
      this.setting.setFooter({ type: 'view' });
      this.defaultSettingMethods();
      this.initSettingMethods();
      let user = {}; // 用户的设置
      if ($file.exists(savePath)) {
        user = JSON.parse($file.read(savePath).string);
      }
      Object.keys(user).forEach((key) => {
        this.set(key, user[key]);
      });
      this.set('boxjs', $cache.get('BOXJS') || 'boxjs.net');
    }
  }

  push() {
    this.kernel.UIKit.push({
      view: this.setting.getView(),
      title: this.widget,
      hasTopOffset: false,
    });
  }

  set(key, value) {
    // 每次操作都更新缓存
    let result = this.setting.set(key, value);
    $cache.set(`setting-${this.widget}`, this.setting.setting);
    return result;
  }

  get(key) {
    return this.setting.get(key);
  }

  widgetCache = (structPath, savePath) => {
    let cache = $cache.get(`setting-${this.widget}`) || {};

    let user = {}; // 用户的设置
    if ($file.exists(savePath)) {
      user = JSON.parse($file.read(savePath).string);
    }
    for (let section of JSON.parse($file.read(structPath).string)) {
      for (let item of section.items) {
        cache[item.key] = item.key in user ? user[item.key] : item.value;
      }
    }
    if (!cache) $cache.set(`setting-${this.widget}`, cache);
    this.setting = { get: (key) => cache[key] };
  };

  defaultSettingMethods() {
    this.setting.readme = (animate) => {
      animate.touchHighlightStart();
      let content = $file.read(`/scripts/pages/widget/${this.widget}/README.md`)
        .string;
      this.kernel.UIKit.push({
        view: [
          {
            type: 'markdown',
            props: { content: content },
            layout: (make, view) => {
              make.size.equalTo(view.super);
            },
          },
        ],
        title: $l10n('README'),
        disappeared: () => {
          animate.touchHighlightEnd();
        },
      });
    };

    this.setting.clearCache = (animate) => {
      animate.touchHighlight();
      animate.actionStart();
      $cache.remove('switch.data');
      const assetsPath = `${this.kernel.widgetAssetsPath}/${this.widget}`;
      if ($file.exists(assetsPath)) $file.delete(assetsPath);
      $cache.remove(`setting-${this.widget}`);
      $ui.pop();
      $ui.toast('清空缓存成功，请重新进入该页面');
      animate.actionDone();
    };

    this.setting.preview = (animate) => {
      animate.touchHighlight();
      let widget = this.kernel.widgetInstance(this.widget);
      if (widget) {
        widget.render();
      } else {
        $ui.error($l10n('ERROR'));
      }
    };
  }

  initSettingMethods() {}
}

module.exports = Setting;
