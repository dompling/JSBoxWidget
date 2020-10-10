class HomeUI {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
        this.widgetRootPath = "/scripts/ui/widget"
    }

    getViews() {
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
        let views = data.map(item => template(item))
        return [
            {
                type: "list",
                props: {
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
                            color: $color("orange"),
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
                            title: $l10n("PREVIEW"),
                            color: $color("#33CC33"),
                            handler: (sender, indexPath) => {
                                let widgetName = sender.object(indexPath).name
                                let widget = this.kernel.widgetInstance(widgetName)
                                if (widget) {
                                    widget.render()
                                } else {
                                    $ui.error($l10n("ERROR"))
                                }
                            }
                        },
                        {
                            title: $l10n("SETTING"),
                            handler: (sender, indexPath) => {
                                let widgetName = sender.object(indexPath).name
                                let widget = this.kernel.widgetInstance(widgetName)
                                if (widget) {
                                    widget.custom()
                                } else {
                                    $ui.error($l10n("ERROR"))
                                }
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