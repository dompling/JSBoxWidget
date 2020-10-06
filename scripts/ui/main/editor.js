const ColorUI = require("./color")

class EditorUI {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
        this.color = new ColorUI(this.kernel, this.factory)
    }

    save(myday, isUpdate, callback) {
        if (myday.myday === "") {
            $ui.toast($l10n("DATA_ERROR"))
            return false
        }
        let result
        if (isUpdate) {
            result = this.kernel.storage.update(myday)
        } else {
            result = this.kernel.storage.save(myday)
        }
        if (result) {
            $ui.success($l10n("SAVE_SUCCESS"))
            // 更新list
            callback()
            // 弹出窗口
            setTimeout(() => {
                $ui.pop()
            }, 500)
        } else {
            $ui.error($l10n("SAVE_ERROR"))
        }
    }

    customTemplate() {
        const template = (title, color) => {
            return {
                customColorCircle: {
                    info: color,
                    bgcolor: $color(color)
                },
                customColorTitle: {
                    text: title
                }
            }
        }
        let list = []
        for (let item of Object.keys(this.customStyle)) {
            list.push(template(this.customStyle[item][0], this.customStyle[item][1]))
        }
        return list
    }

    push(myday = null, callback = null) {
        if (myday === null) {
            if (!$cache.get("customStyle"))
                $cache.set("customStyle", {
                    title: { color: ["#333333", "secondaryText"] },
                    describe: { color: ["#333333", "secondaryText"] },
                    date: { color: ["red", "#00CC00"] }
                })
            myday = {
                title: "",
                describe: "",
                date: "",
                style: $cache.get("customStyle")
            }
        }
        this.customStyle = {
            title: [$l10n("TITLE"), myday.style.title.color[0]],
            describe: [$l10n("DESCRIBE"), myday.style.describe.color[0]],
            daysPass: [$l10n("DAYS_PASS"), myday.style.date.color[0]],
            daysLeft: [$l10n("DAYS_LEFT"), myday.style.date.color[1]]
        }
        let navButtons = [
            {
                type: "button",
                props: {
                    symbol: "checkmark",
                    tintColor: this.factory.textColor,
                    bgcolor: $color("clear")
                },
                layout: make => {
                    make.right.inset(10)
                    make.size.equalTo(20)
                },
                events: {
                    tapped: () => {
                        const getCustomColor = (index) => {
                            return $("custom-color").object($indexPath(0, index)).customColorCircle.info
                        }
                        myday.style = {
                            title: {
                                color: [getCustomColor(0), "secondaryText"],
                                font: ["default", 30]
                            },
                            describe: {
                                color: [getCustomColor(1), "secondaryText"],
                                font: ["default", 14]
                            },
                            date: {
                                color: [getCustomColor(2), getCustomColor(3)]
                            }
                        }
                        $cache.set("customStyle", myday.style)
                        // TODO 循环类型的日期
                        myday.type = {
                            type: "default"
                        }
                        myday.title = $("title").text
                        myday.describe = $("describe").text
                        myday.date = parseInt($("date").info)
                        if (myday.date === "") {
                            myday.date = new Date().getTime()
                        }
                        let isUpdate = false
                        if (undefined !== myday.id) {
                            isUpdate = true
                        }
                        this.save(myday, isUpdate, callback)
                    }
                }
            }
        ]
        let views = [
            {
                type: "scroll",
                props: { contentSize: $size(0, 520) },
                layout: $layout.fill,
                views: [
                    {
                        type: "view",
                        layout: (make, view) => {
                            make.width.equalTo(view.super)
                            make.height.equalTo(520)
                        },
                        views: [
                            {
                                type: "label",
                                props: {
                                    text: $l10n("TITLE"),
                                    textColor: this.factory.textColor,
                                    align: $align.left,
                                    font: $font(16),
                                    line: 1
                                },
                                layout: make => {
                                    make.left.inset(10)
                                    make.width.equalTo(60)
                                    make.height.equalTo(40)
                                    make.top.equalTo(40)
                                }
                            },
                            {
                                type: "input",
                                props: {
                                    id: "title",
                                    align: $align.left,
                                    insets: 0,
                                    text: myday.title,
                                    placeholder: $l10n("TITLE"),
                                    textColor: this.factory.textColor
                                },
                                layout: (make, view) => {
                                    make.right.inset(10)
                                    make.left.inset(60)
                                    make.height.top.equalTo(view.prev)
                                },
                                events: {
                                    returned: sender => {
                                        sender.blur()
                                    }
                                }
                            },
                            {
                                type: "label",
                                props: {
                                    text: $l10n("DESCRIBE"),
                                    textColor: this.factory.textColor,
                                    align: $align.left,
                                    font: $font(16),
                                    line: 1
                                },
                                layout: (make, view) => {
                                    make.left.inset(10)
                                    make.width.equalTo(60)
                                    make.height.equalTo(view.prev)
                                    make.top.equalTo(view.prev.bottom).offset(20)
                                }
                            },
                            { // 描述
                                type: "input",
                                props: {
                                    id: "describe",
                                    align: $align.left,
                                    text: myday.describe,
                                    placeholder: $l10n("DESCRIBE"),
                                    textColor: this.factory.textColor
                                },
                                layout: (make, view) => {
                                    make.right.inset(10)
                                    make.left.inset(60)
                                    make.height.equalTo(view.prev)
                                    make.top.equalTo(view.prev)
                                },
                                events: {
                                    returned: sender => {
                                        sender.blur()
                                    }
                                }
                            },
                            { // 调色盘
                                type: "label",
                                props: {
                                    text: "以下颜色均为浅色模式下的颜色",
                                    font: $font(12),
                                    align: $align.center,
                                    textColor: $color("secondaryText")
                                },
                                layout: (make, view) => {
                                    make.left.inset(10)
                                    make.right.inset(0)
                                    make.top.equalTo(view.prev.bottom).offset(25)
                                }
                            },
                            {
                                type: "matrix",
                                props: {
                                    id: "custom-color",
                                    columns: this.customStyle.length,
                                    scrollEnabled: false,
                                    autoItemSize: true,
                                    template: [
                                        {
                                            type: "view",
                                            layout: make => {
                                                make.size.equalTo(55)
                                            },
                                            views: [
                                                {
                                                    type: "view",
                                                    props: {
                                                        id: "customColorCircle",
                                                        radius: 20,
                                                        borderWidth: 0.3,
                                                        borderColor: $color("lightGray")
                                                    },
                                                    layout: (make, view) => {
                                                        make.centerX.equalTo(view.super)
                                                        make.top.inset(0)
                                                        make.size.equalTo(40)
                                                    }
                                                },
                                                {
                                                    type: "label",
                                                    props: {
                                                        id: "customColorTitle",
                                                        font: $font(12),
                                                        textColor: $color("primaryText", "secondaryText")
                                                    },
                                                    layout: (make, view) => {
                                                        make.centerX.equalTo(view.super)
                                                        make.top.equalTo(view.prev.bottom)
                                                    }
                                                }
                                            ]
                                        }
                                    ],
                                    data: this.customTemplate()
                                },
                                events: {
                                    didSelect: (sender, indexPath, data) => {
                                        this.color.push(data.customColorCircle.bgcolor, hex => {
                                            let title = data.customColorTitle.text
                                            sender.delete(indexPath)
                                            sender.insert({
                                                indexPath: indexPath,
                                                value: {
                                                    customColorCircle: {
                                                        info: hex,
                                                        bgcolor: $color(hex)
                                                    },
                                                    customColorTitle: {
                                                        text: title
                                                    }
                                                }
                                            })
                                        })
                                    }
                                },
                                layout: (make, view) => {
                                    make.right.left.equalTo(view.super.safeArea).offset(10)
                                    make.width.equalTo(view.super).offset(20)
                                    make.top.equalTo(view.prev.bottom).offset(10)
                                    make.height.equalTo(70)
                                }
                            },
                            { // 日期
                                type: "view",
                                views: [
                                    {
                                        type: "label",
                                        props: {
                                            text: $l10n("DATE"),
                                            textColor: this.factory.textColor,
                                            align: $align.left,
                                            font: $font(16),
                                            line: 1
                                        },
                                        layout: make => {
                                            make.left.inset(10)
                                            make.width.equalTo(60)
                                            make.height.equalTo(40)
                                            make.top.equalTo(0)
                                        }
                                    },
                                    {
                                        type: "text",
                                        props: {
                                            id: "date",
                                            info: myday.date ? myday.date : new Date().getTime(),
                                            editable: false,
                                            align: $align.right,
                                            insets: $insets(11, 0, 0, 0),
                                            bgcolor: $color("clear"),
                                            text: myday.date ? new Date(myday.date).toLocaleDateString() : "",
                                            textColor: this.factory.textColor,
                                            placeholder: $l10n("CHOOSE_DATE")
                                        },
                                        layout: (make, view) => {
                                            make.right.inset(10)
                                            make.left.inset(60)
                                            make.top.height.equalTo(view.prev)
                                        }
                                    },
                                    {
                                        type: "date-picker",
                                        props: {
                                            date: myday.date ? new Date(Number(myday.date)) : new Date(),
                                            mode: 1
                                        },
                                        events: {
                                            changed: sender => {
                                                let date = $("date")
                                                date.text = sender.date.toLocaleDateString()
                                                date.info = sender.date.getTime()
                                            }
                                        },
                                        layout: (make, view) => {
                                            make.width.equalTo(300)
                                            make.centerX.equalTo(view.super)
                                            make.top.equalTo(view.prev.bottom)
                                            make.height.equalTo(180)
                                        }
                                    }
                                ],
                                layout: (make, view) => {
                                    make.right.left.inset(0)
                                    make.top.equalTo(view.prev.bottom).offset(5)
                                    make.height.equalTo(220)
                                }
                            }
                        ]
                    }
                ],
                events: {
                    layoutSubviews: () => {
                        $("custom-color").reload()
                    }
                }
            }
        ]
        this.factory.push(views, $l10n("BACK"), navButtons)
    }
}

module.exports = EditorUI