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
        this.dateFontSize = this.setting.get("dateFontSize")
        this.dateColor = this.setting.get("dateColor")
        this.dateColorDark = this.setting.get("dateColorDark")
        this.infoColor = this.setting.get("infoColor")
        this.infoColorDark = this.setting.get("infoColorDark")
        this.backgroundColor = this.setting.get("backgroundColor")
        this.backgroundColorDark = this.setting.get("backgroundColorDark")
        this.backgroundImage = $cache.get("MyDays.image")
        this.isImageBackground = $file.exists(this.backgroundImage)
        this.showMinus = this.setting.get("showMinus")
        this.overdueColor = this.setting.get("overdueColor")
    }

    dateSpan(date) {
        let now = new Date()
        if (typeof date === "number") date = new Date(date)
        // 重置时间
        date.setHours(0, 0, 0, 0)
        if (date.getDate() === now.getDate()) {
            return 0
        }
        let span = (date.getTime() - (now.getTime())) / 1000 / 3600 / 24
        return Math.ceil(span)
    }

    view2x2(family) {
        let myday = this.myday
        if (!myday) return {
            type: "text",
            props: { text: $l10n("NONE") }
        }
        const remainingDays = this.dateSpan(myday.date)
        return {
            type: "vstack",
            props: Object.assign({
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
                } : $color(this.backgroundColor, this.backgroundColorDark),
                frame: {
                    maxWidth: Infinity,
                    maxHeight: Infinity
                }
            }, family !== this.setting.family.small ? {
                link: this.setting.settingUrlScheme
            } : {
                    widgetURL: this.setting.settingUrlScheme
                }),
            views: [
                {
                    type: "text",
                    props: {
                        text: remainingDays === 0 ? $l10n("TODAY") : String(
                            this.showMinus ? remainingDays : Math.abs(remainingDays)
                        ),
                        font: $font(this.dateFontSize),
                        color: remainingDays >= 0 ? $color(this.dateColor, this.dateColorDark) : $color(this.overdueColor),
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
                        color: $color(this.infoColor, this.infoColorDark),
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
                        color: $color(this.infoColor, this.infoColorDark),
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
                        color: $color(this.infoColor, this.infoColorDark),
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
                let view = this.view2x2()
                this.printTimeConsuming()
                return view
            }
        })
    }
}

module.exports = {
    Widget: MyDaysWidget
}