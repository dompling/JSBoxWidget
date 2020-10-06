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
                    name: "calendar"
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
                info: data.info
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
                                $cache.set("selected", widget)
                                $ui.toast($l10n("SELECT_SUCCESS"))
                            }
                        },
                        {
                            title: $l10n("PREVIEW"),
                            color: $color("#33CC33"),
                            handler: (sender, indexPath) => {
                                $ui.toast("暂时无法预览")
                                return
                                // TODO 无法预览bug
                                let widgetName = sender.object(indexPath).info.name
                                let { Widget } = require(`../widget/${widgetName}`)
                                let widget = new Widget()
                                widget.render()
                            }
                        }
                    ]
                },
                events: {
                    didSelect: (sender, indexPath, data) => {
                        // TODO
                    }
                },
                layout: $layout.fill
            }
        ]
    }
}

module.exports = HomeUI