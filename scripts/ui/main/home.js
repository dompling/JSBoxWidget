class HomeUI {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
    }

    getViews() {
        let data = [
            {
                image: "/assets/icon.png",
                title: "Calendar",
                describe: "日历小组件",
                info: {
                    name: "Calendar"
                }
            },
            {
                image: "/assets/icon.png",
                title: "Album",
                describe: "将你最爱的照片放到桌面上！",
                info: {
                    name: "Album"
                }
            }
        ]
        const template = data => {
            return {
                image: {
                    src: data.image
                },
                title: {
                    text: data.title
                },
                describe: {
                    text: data.describe
                },
                info: data.info,
                events: data.events
            }
        }
        let views = []
        for (let item of data) {
            views.push(template(item))
        }
        return [
            {
                type: "list",
                props: {
                    rowHeight: 100,
                    data: views,
                    template: {
                        props: {
                            bgcolor: $color("clear")
                        },
                        layout: $layout.fill,
                        views: [
                            {
                                type: "image",
                                props: {
                                    id: "image",
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
                                let widget = sender.object(indexPath).info.name
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
                                let widgetName = sender.object(indexPath).info.name
                                let widget = this.kernel.widgetInstance(widgetName)
                                if (widget) {
                                    widget.render()
                                }
                            }
                        }
                    ]
                },
                events: {
                    didSelect: (sender, indexPath, data) => {
                        let widgetName = data.info.name
                        let widget = this.kernel.widgetInstance(widgetName)
                        if (widget) {
                            widget.custom()
                        }
                    }
                },
                layout: $layout.fill
            }
        ]
    }
}

module.exports = HomeUI