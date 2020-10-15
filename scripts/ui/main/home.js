class HomeUI {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
        this.widgetRootPath = "/scripts/ui/widget"
        // 检查是否携带widget参数，携带则打开设置页面
        if (this.kernel.query["widget"]) {
            setTimeout(() => {
                let widget = this.kernel.widgetInstance(this.kernel.query["widget"])
                if (widget) {
                    widget.custom()
                    // 清空参数
                    this.kernel.query["widget"] = undefined
                }
            }, 500)
        }
    }

    getWidgetListView() {
        let data = []
        let widgets = $file.list(this.widgetRootPath)
        for (let widget of widgets) {
            let widgetPath = `${this.widgetRootPath}/${widget}`
            if ($file.exists(`${widgetPath}/config.json`)) {
                let config = JSON.parse($file.read(`${widgetPath}/config.json`).string)
                if (typeof config.icon !== "object") {
                    config.icon = [config.icon, config.icon]
                }
                config.icon = config.icon.map(icon => icon[0] === "@" ? icon.replace("@", widgetPath) : icon)
                data.push({
                    title: config.title,
                    describe: config.describe,
                    name: widget,
                    icon: config.icon
                })
            } else {// 没有config.json文件则跳过
                continue
            }
        }
        const template = data => {
            return {
                icon: {// 如果不设置image属性，默认为小组件目录下的icon.png
                    image: $image(data.icon[0], data.icon[1])
                },
                title: {
                    text: data.title
                },
                describe: {
                    text: data.describe
                },
                name: data.name
            }
        }
        return data.map(item => template(item))
    }

    getViews() {
        let views = this.getWidgetListView()
        return [
            {
                type: "list",
                props: {
                    id: "EasyWidget-home-list",
                    rowHeight: 100,
                    data: views,
                    header: {
                        type: "view",
                        props: { height: 80 },
                        views: [{
                            type: "label",
                            props: {
                                text: "EasyWidget",
                                font: $font(36)
                            },
                            layout: (make, view) => {
                                make.left.inset(20)
                                make.centerY.equalTo(view.super)
                            }
                        }]
                    },
                    template: {
                        props: {
                            bgcolor: $color("clear")
                        },
                        layout: $layout.fill,
                        views: [
                            {
                                type: "image",
                                props: {
                                    id: "icon",
                                    bgcolor: $color("clear"),
                                    clipsToBounds: true,
                                    cornerRadius: 10,
                                    smoothCorners: true
                                },
                                layout: make => {
                                    make.size.equalTo(80)
                                    make.left.inset(20)
                                    make.top.inset(10)
                                }
                            },
                            {
                                type: "label",
                                props: {
                                    id: "title",
                                    font: $font(20)
                                },
                                layout: (make, view) => {
                                    make.top.equalTo(view.prev).offset(10)
                                    make.left.equalTo(view.prev.right).offset(20)
                                }
                            },
                            {
                                type: "label",
                                props: {
                                    id: "describe",
                                    font: $font(12),
                                    color: $color("systemGray2")
                                },
                                layout: (make, view) => {
                                    make.left.equalTo(view.prev)
                                    make.top.equalTo(view.prev.bottom).offset(10)
                                }
                            }
                        ]
                    },
                    actions: [
                        {
                            title: $l10n("SELECT"),
                            color: $color("#00CC00"),
                            handler: (sender, indexPath) => {
                                let widget = sender.object(indexPath).name
                                $ui.alert({
                                    title: $l10n("ALERT_INFO"),
                                    message: $l10n("SELECT_AND_COPY_TO_APPLY") + `\n"${widget}"`,
                                    actions: [
                                        {
                                            title: $l10n("COPY"),
                                            handler: () => {
                                                $clipboard.text = widget
                                                $ui.success($l10n("SUCCESS"))
                                            }
                                        },
                                        { title: $l10n("CANCEL") }
                                    ]
                                })
                            }
                        },
                        {
                            title: $l10n("COPY"),
                            color: $color("orange"),
                            handler: (sender, indexPath) => {
                                let widgetName = sender.object(indexPath).name
                                if (!$file.exists(`${this.widgetRootPath}/${widgetName}/setting.js`) || !$file.exists(`${this.widgetRootPath}/${widgetName}/config.json`)) {
                                    $ui.error($l10n("CANNOT_COPY_THIS_WIDGET"))
                                    return
                                }
                                $file.copy({
                                    src: `${this.widgetRootPath}/${widgetName}`,
                                    dst: `${this.widgetRootPath}/${widgetName}Copy`
                                })
                                // 更新设置文件中的NAME常量
                                let settingjs = $file.read(`${this.widgetRootPath}/${widgetName}Copy/setting.js`).string
                                let firstLine = settingjs.split("\n")[0]
                                let newFirstLine = `const NAME = "${widgetName}Copy"`
                                settingjs = settingjs.replace(firstLine, newFirstLine)
                                $file.write({
                                    data: $data({ string: settingjs }),
                                    path: `${this.widgetRootPath}/${widgetName}Copy/setting.js`
                                })
                                // 更新config.json
                                let config = JSON.parse($file.read(`${this.widgetRootPath}/${widgetName}Copy/config.json`).string)
                                config.title = `${widgetName}Copy`
                                $file.write({
                                    data: $data({ string: JSON.stringify(config) }),
                                    path: `${this.widgetRootPath}/${widgetName}Copy/config.json`
                                })
                                // 更新列表
                                setTimeout(() => { $("EasyWidget-home-list").data = this.getWidgetListView() }, 200)
                            }
                        },
                        {
                            title: $l10n("DELETE"),
                            color: $color("red"),
                            handler: (sender, indexPath) => {
                                let widgetName = sender.object(indexPath).name
                                let style = {}
                                if ($alertActionType) {
                                    style = { style: $alertActionType.destructive }
                                }
                                $ui.alert({
                                    title: $l10n("CONFIRM_DELETE_MSG"),
                                    actions: [
                                        Object.assign({
                                            title: $l10n("DELETE"),
                                            handler: () => {
                                                $file.delete(`${this.widgetRootPath}/${widgetName}`)
                                                // 删除assets
                                                $file.delete(`/assets/widget/${widgetName}`)
                                                sender.delete(indexPath)
                                            }
                                        }, style),
                                        { title: $l10n("CANCEL") }
                                    ]
                                })
                            }
                        }
                    ]
                },
                events: {
                    didSelect: (sender, indexPath, data) => {
                        let widgetName = data.name
                        let widget = this.kernel.widgetInstance(widgetName)
                        if (widget) {
                            widget.custom()
                        } else {
                            $ui.error($l10n("ERROR"))
                        }
                    }
                },
                layout: $layout.fill
            }
        ]
    }
}

module.exports = HomeUI