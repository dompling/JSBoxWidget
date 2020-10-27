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
                link: this.setting.settingUrlScheme,
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
            },
            views: [
                {
                    type: "text",
                    props: {
                        text: remainingDays === 0 ? $l10n("TODAY") : String(remainingDays),
                        font: $font(this.dateFontSize),
                        color: remainingDays >= 0 ? $color(this.dateColor, this.dateColorDark) : $color("red"),
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
            }
        })
    }
}

module.exports = {
    Widget: MyDaysWidget
}