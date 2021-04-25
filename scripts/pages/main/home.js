const logoPath = '/assets/favicon.png';
class HomeUI {
  constructor(kernel, factory) {
    this.kernel = kernel;
    this.factory = factory;
    // 检查是否携带widget参数，携带则打开设置页面
    if (this.kernel.query['widget']) {
      setTimeout(() => {
        let widget = this.kernel.widgetInstance(this.kernel.query['widget']);
        if (widget) {
          widget.custom();
          // 清空参数
          this.kernel.query['widget'] = undefined;
        }
      }, 500);
    }
    this.matrixId = 'widget-actions';
    this.initData();
  }

  initData = () => {
    if ($(`${this.matrixId}-input`)) $(`${this.matrixId}-input`).text = '';
    this.widgetList = this.kernel.getWidgetList();
    this.dataSource = this.actionsToData(this.widgetList);
  };

  actionsToData(listItems) {
    // 格式化数据供 matrix 使用
    const template = (data) => {
      return {
        icon: {
          // 如果不设置image属性，默认为小组件目录下的icon.png
          image: $image(data.icon[0], data.icon[1]),
        },
        info: {
          text: data.title,
        },
        describe: {
          text: data.describe,
        },
        name: data.name,
      };
    };
    return listItems.map((item) => template(item));
  }

  menuItems() {
    // 卡片长按菜单
    return [
      {
        title: '复制',
        handler: (sender, indexPath) => {
          $input.text({
            placeholder: $l10n('NEW_WIDGET_NAME'),
            text: '',
            handler: (text) => {
              let widgetName = sender.object(indexPath).name;
              if (
                !$file.exists(
                  `${this.kernel.widgetRootPath}/${widgetName}/setting.js`,
                ) ||
                !$file.exists(
                  `${this.kernel.widgetRootPath}/${widgetName}/config.json`,
                )
              ) {
                $ui.error($l10n('CANNOT_COPY_THIS_WIDGET'));
                return;
              }
              let newName = text === '' ? widgetName + 'Copy' : text;
              $file.copy({
                src: `${this.kernel.widgetRootPath}/${widgetName}`,
                dst: `${this.kernel.widgetRootPath}/${newName}`,
              });
              // 更新设置文件中的NAME常量
              let settingjs = $file.read(
                `${this.kernel.widgetRootPath}/${newName}/setting.js`,
              ).string;
              let firstLine = settingjs.split('\n')[0];
              let newFirstLine = `const NAME = "${newName}"`;
              settingjs = settingjs.replace(firstLine, newFirstLine);
              $file.write({
                data: $data({ string: settingjs }),
                path: `${this.kernel.widgetRootPath}/${newName}/setting.js`,
              });
              // 更新config.json
              let config = JSON.parse(
                $file.read(
                  `${this.kernel.widgetRootPath}/${newName}/config.json`,
                ).string,
              );
              config.title = newName;

              $file.write({
                data: $data({ string: JSON.stringify(config) }),
                path: `${this.kernel.widgetRootPath}/${newName}/config.json`,
              });

              if (!$file.exists(`${this.kernel.copyPath}/${newName}`)) {
                $file.mkdir(`${this.kernel.copyPath}/${newName}`);
              }

              $file.write({
                data: $data({ string: JSON.stringify(config) }),
                path: `${this.kernel.copyPath}/${newName}/config.json`,
              });

              // 更新列表
              setTimeout(() => {
                this.initData();
                sender.data = this.dataSource;
              }, 200);
            },
          });
        },
      },
      {
        // 删除
        title: $l10n('DELETE'),
        destructive: true,
        handler: (sender, indexPath) => {
          let widgetName = sender.object(indexPath).name;
          let style = {};
          if ($alertActionType) {
            style = { style: $alertActionType.destructive };
          }
          $ui.alert({
            title: $l10n('CONFIRM_DELETE_MSG'),
            actions: [
              Object.assign(
                {
                  title: $l10n('DELETE'),
                  handler: () => {
                    $file.delete(`${this.kernel.widgetRootPath}/${widgetName}`);
                    // 删除assets
                    $file.delete(
                      `${this.kernel.widgetAssetsPath}/${widgetName}`,
                    );

                    // 删除 copyPath
                    $file.delete(`${this.kernel.copyPath}/${widgetName}`);
                    sender.delete(indexPath);
                  },
                },
                style,
              ),
              { title: $l10n('CANCEL') },
            ],
          });
        },
      },
    ];
  }

  searchAction = (key) => {
    const datas = this.widgetList.filter(
      (item) =>
        (item.source || item.name).indexOf(key) > -1 ||
        item.title.indexOf(key) > -1 ||
        item.name.indexOf(key) > -1,
    );
    this.dataSource = this.actionsToData(datas);
    $(this.matrixId).data = this.dataSource;
  };

  getViews() {
    return [
      // 水平安全距离手动设置，因为需要设置背景色
      {
        type: 'view',
        layout: $layout.fill,
        views: [
          {
            // 顶部按钮栏
            type: 'view',
            props: { bgcolor: $color('#ffffff', '#141414') },
            views: [
              {
                type: 'image',
                props: {
                  cornerRadius: 15,
                  borderWidth: 1,
                  borderColor: $color('#e8e8e8'),
                  image: $image(logoPath),
                },
                layout: (make, view) => {
                  make.left.equalTo(view.super).offset(20);
                  make.top.equalTo(view.super).offset(18);
                  make.size.equalTo($size(30, 30));
                },
              },
              {
                type: 'input',
                props: {
                  id: `${this.matrixId}-input`,
                  type: $kbType.search,
                  placeholder: $l10n('SEARCH'),
                  bgcolor: $color('#fff', '#262626'),
                  borderColor: $color('#e8e8e8'),
                  borderWidth: 1,
                },
                layout: (make, view) => {
                  make.centerX.equalTo(view.super);
                  make.top.equalTo(view.super).offset(15);
                  make.left.equalTo(view.super).offset(60);
                  make.height.equalTo(35);
                },
                events: {
                  changed: (sender) => this.searchAction(sender.text),
                },
              },
              {
                type: 'label',
                props: {
                  text: '搜索',
                  color: $color('#141414', '#fff'),
                },
                events: {
                  tapped: () => {
                    this.searchAction($(`${this.matrixId}-input`).text);
                  },
                },
                layout: (make, view) => {
                  make.top.equalTo(view.prev).offset(6);
                  make.right.equalTo(view.prev).offset(45);
                },
              },
            ],
            layout: (make, view) => {
              make.top.equalTo(view.super);
              make.bottom.equalTo(view.super.safeAreaTop).offset(60);
              make.left.right.equalTo(view.super.safeArea);
            },
          },
          {
            type: 'matrix',
            props: {
              id: this.matrixId,
              columns: 2,
              itemHeight: 100,
              spacing: 20,
              indicatorInsets: $insets(0, 0, 50, 0),
              bgcolor: $color('insetGroupedBackground'),
              menu: { items: this.menuItems() },
              footer: {
                // 防止被菜单遮挡
                type: 'view',
                props: { height: 50 },
              },
              data: this.dataSource,
              template: {
                props: {
                  smoothCorners: true,
                  cornerRadius: 16,
                  bgcolor: $color('#ffffff', '#242424'),
                },
                views: [
                  {
                    type: 'image',
                    props: {
                      id: 'icon',
                      cornerRadius: 15,
                      borderWidth: 1,
                      borderColor: $color('#e8e8e8'),
                      tintColor: $color('#ffffff'),
                    },
                    layout: (make) => {
                      make.top.left.inset(15);
                      make.size.equalTo($size(30, 30));
                    },
                  },
                  {
                    type: 'image',
                    props: {
                      symbol: 'chevron.right',
                    },
                    layout: (make) => {
                      make.top.right.inset(10);
                    },
                  },
                  {
                    type: 'label',
                    props: {
                      id: 'info',
                      font: $font('bold', 16),
                    },
                    layout: (make, view) => {
                      make.bottom.left.inset(10);
                      make.width.equalTo(view.super);
                    },
                  },
                ],
              },
            },
            events: {
              pulled: (animate) => {
                setTimeout(() => {
                  $(this.matrixId).data = [...this.dataSource];
                  animate.endRefreshing();
                }, 1000);
              },
              didSelect: (sender, indexPath, data) => {
                let widgetName = data.name;
                let widget = this.kernel.widgetInstance(widgetName);
                sender.data = [...this.dataSource];
                if (widget) {
                  widget.custom();
                } else {
                  $ui.error($l10n('ERROR'));
                }
              },
              willEndDragging: (sender) => {
                this.initData();
              },
            },
            layout: (make, view) => {
              make.bottom.equalTo(view.super);
              make.top.equalTo(view.prev.bottom);
              make.left.right.equalTo(view.super.safeArea);
            },
          },
        ],
      },
    ];
  }
}

module.exports = HomeUI;
