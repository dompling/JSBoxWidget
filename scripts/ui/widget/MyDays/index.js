const Widget = require("../widget")
const MyDaysSetting = require("./setting")

class MyDaysWidget extends Widget {
    constructor(kernel) {
        super(kernel, new MyDaysSetting(kernel))
        this.myday = {
            title: this.setting.get("title"),
            describe: this.setting.get("describe"),
            date: this.setting.get("date") === 0 ? new Date().getTime() : this.setting.get("date")
        }
        this.dateColor = this.setting.get("dateColor")
        this.infoColor = this.setting.get("infoColor")
        this.backgroundColor = this.setting.get("backgroundColor")
        this.backgroundImage = $cache.get("MyDays.image")
        this.isImageBackground = $file.exists(this.backgroundImage)
    }

    dateSpan(date) {
        let now = new Date()
        if (typeof date === "number") date = new Date(date)
        if (date.getDate() === now.getDate()) {
            return 0
        }
        let span = (date - (now.getTime())) / 1000 / 3600 / 24
        if ((span < 1 && span > 0) || (span > -1 && span < 0)) {
            return Math.ceil(span)
        } else {
            return parseInt(span)
        }
    }

    view2x4() {
        // 中等大小将使用link而不是widgetURL
        return this.view2x2()
    }

    view2x2() {
        let myday = this.myday
        if (!myday) return {
            type: "text",
            props: { text: $l10n("NONE") }
        }
        const remainingDays = this.dateSpan(myday.date)
        return {
            type: "vstack",
            props: {
                alignment: $widget.verticalAlignment.center,
                spacing: 0,
                padding: 10,
                background: this.isImageBackground ? {
                    type: "image",
                    props: {
                        image: $image(this.backgroundImage),
                        resizable: true,
                        scaledToFill: true
                    }
                } : $color(this.backgroundColor),
                frame: {
                    maxWidth: Infinity,
                    maxHeight: Infinity
                }
            },
            views: [
                {
                    type: "text",
                    props: {
                        text: remainingDays === 0 ? $l10n("TODAY") : String(remainingDays),
                        font: $font(remainingDays === 0 ? 34 : 40),
                        color: remainingDays >= 0 ? $color(this.dateColor) : $color("red"),
                        frame: {
                            alignment: $widget.alignment.topLeading,
                            maxWidth: Infinity,
                            maxHeight: Infinity
                        }
                    }
                },
                {
                    type: "text",
                    props: {
                        text: myday.title,
                        font: $font(16),
                        color: $color(this.infoColor),
                        frame: {
                            alignment: $widget.alignment.bottomTrailing,
                            maxWidth: Infinity
                        }
                    }
                },
                {
                    type: "text",
                    props: {
                        text: myday.describe,
                        font: $font(12),
                        color: $color(this.infoColor),
                        frame: {
                            alignment: $widget.alignment.bottomTrailing,
                            maxWidth: Infinity
                        }
                    }
                },
                {
                    type: "text",
                    props: {
                        text: new Date(myday.date).toLocaleDateString(),
                        font: $font(12),
                        color: $color(this.infoColor),
                        frame: {
                            alignment: $widget.alignment.bottomTrailing,
                            maxWidth: Infinity
                        }
                    }
                }
            ]
        }
    }

    render() {
        const midnight = new Date()
        midnight.setHours(0, 0, 0, 0)
        const expireDate = new Date(midnight.getTime() + 60 * 60 * 24 * 1000)
        $widget.setTimeline({
            entries: [
                {
                    date: new Date(),
                    info: {}
                }
            ],
            policy: {
                afterDate: expireDate
            },
            render: ctx => {
                return this.view2x2()
                let cache = family => {
                    let cache = this.getCache(family)
                    // 未超过一天则不更新缓存
                    if (cache && (() => {
                        if (this.cacheDateStartFromZero) {
                            const midnight = new Date()
                            midnight.setHours(0, 0, 0, 0)
                            return midnight.getTime()
                        } else return new Date().getTime()
                    })() - cache.date.getTime() < this.cacheLife)
                        return cache.view
                    else {
                        let view
                        switch (family) {
                            case 0:
                                view = this.view2x2()
                                break
                            case 1:
                                view = this.view2x4()
                                break
                            case 2:
                                view = this.view4x4()
                                break
                            default:
                                view = this.errorView
                        }
                        // 更新缓存
                        this.setCache(family, view)
                        return view
                    }
                }
                return cache(ctx.family)
            }
        })
    }
}

module.exports = {
    Widget: MyDaysWidget
}