const VERSION = '0.0.1';

const DataCenter = require('./Foundation/data-center');

class Kernel {
  constructor(rootPath) {
    this.startTime = new Date();
    this.path = {
      root: rootPath ? rootPath : '/EasyJsBox',
    };
    Object.assign(this.path, {
      components: `${this.path.root}/src/Components`,
    });
    this.version = VERSION;
    this.components = {};
    this.plugins = {};
    if ($file.exists('/config.json')) {
      const config = JSON.parse($file.read('/config.json').string);
      this.name = config.info.name;
    }
    this.loadUIKit();
  }

  loadUIKit() {
    const BaseView = require('./Foundation/view');
    this.UIKit = new BaseView();
  }

  /**
   * 注册组件
   * @param {String} component 组件名
   * @param {Object} args 参数
   */
  _registerComponent(component, args = {}) {
    if (typeof args !== 'object') {
      args = { name: args };
    } else if (!args.name) args.name = component;
    const View = require(`${this.path.components}/${component}/view`);
    const Controller = require(`${this.path.components}/${component}/controller`);
    // 新实例
    const view = new View(this);
    const controller = new Controller(this);
    // 关联view和controller
    view.setController(controller);
    controller.setView(view);
    // 加载数据中心
    const dataCenter = new DataCenter();
    view.setDataCenter(dataCenter);
    controller.setDataCenter(dataCenter);
    // 初始化
    view.init();
    controller.init(args);
    // 注册到kernel
    this.components[args.name] = {
      view: view,
      controller: controller,
      dataCenter: dataCenter,
    };
    return this.components[args.name];
  }

  /**
   * 批量注册组件
   * @param {Array} components 包含组件名的数组
   */
  _registerComponents(components) {
    for (let component of components) {
      this._registerComponent(component);
    }
  }

  /**
   * 通过组件名获取已注册的组件
   * @param {String} component 组件名
   */
  getComponent(component) {
    return this.components[component];
  }

  /**
   * 注册组件
   * @param {String} plugin
   */
  registerPlugin(plugin) {
    const { Plugin, VERSION } = require(`./Plugins/${plugin}`);
    this.plugins[plugin] = {
      plugin: Plugin,
      version: VERSION,
    };
    return this.plugins[plugin].plugin;
  }

  /**
   * 批量注册组件
   * @param {Array} plugins
   */
  registerPlugins(plugins) {
    for (let plugin of plugins) {
      this.registerPlugin(plugin);
    }
  }

  /**
   * 获取插件
   * @param {String} plugin
   */
  getPlugin(plugin) {
    return this.plugins[plugin];
  }

  /**
   * 渲染页面
   * @return {CallableFunction} 返回值为匿名函数，调用该函数开始渲染页面
   */
  render(pages, menus) {
    this._registerComponents(['Loading', 'Menu', 'Page']);
    // 注入menu控制器
    this.components.Menu.controller.setCallback((from, to) => {
      $(
        `${this.components.Page.dataCenter.get('pageIdPrefix')}${from}`,
      ).hidden = true;
      $(
        `${this.components.Page.dataCenter.get('pageIdPrefix')}${to}`,
      ).hidden = false;
    });
    // 首页加载动画
    this.components.Loading.controller.start();
    // 注入页面和菜单
    this.components.Page.controller.setPages(pages);
    this.components.Menu.controller.setMenus(menus);
    return () => {
      $ui.render({
        type: 'view',
        props: {
          navBarHidden: true,
          titleColor: $color('primaryText'),
          barColor: $color('primarySurface'),
          statusBarStyle: 0,
        },
        layout: $layout.fill,
        views: [
          this.components.Page.view.getView(),
          this.components.Menu.view.getView(),
        ],
        events: {
          ready: () => {
            this.components.Loading.controller.end();
          },
          layoutSubviews: () => {
            if (!this.orientation) {
              this.orientation = $device.info.screen.orientation;
              return;
            }
            if (this.orientation !== $device.info.screen.orientation) {
              this.orientation = $device.info.screen.orientation;
              let menuView = this.components.Menu.view;
              let menuDataCenter = this.components.Menu.dataCenter;
              // 更新菜单元素的布局
              for (let i = 0; i < menuDataCenter.get('menus').length; i++) {
                $(`${menuDataCenter.get('itemIdPrefix')}${i}`).remakeLayout(
                  menuView.menuLayout.menuItem,
                );
              }
              // 更新菜单栏
              $(menuDataCenter.get('id')).remakeLayout(
                menuView.menuLayout.menuBar,
              );
            }
          },
        },
      });
    };
  }
}

module.exports = {
  Kernel: Kernel,
  VERSION: VERSION,
};
