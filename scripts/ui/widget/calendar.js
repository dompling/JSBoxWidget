class CalendarWidget {
    constructor(kernel) {
        this.kernel = kernel
        this.colorTone = this.kernel.setting.get("colorTone")
    }

    localizedWeek(index) {
        let week = []
        week[0] = $l10n("SUNDAY")
        week[1] = $l10n("MONDAY")
        week[2] = $l10n("TUESDAY")
        week[3] = $l10n("WEDNESDAY")
        week[4] = $l10n("THURSDAY")
        week[5] = $l10n("FRIDAY")
        week[6] = $l10n("SATURDAY")
        return week[index]
    }

    localizedMonth(index) {
        let month = []
        month[0] = $l10n("JANUARY")
        month[1] = $l10n("FEBRUARY")
        month[2] = $l10n("MARCH")
        month[3] = $l10n("APRIL")
        month[4] = $l10n("MAY")
        month[5] = $l10n("JUNE")
        month[6] = $l10n("JULY")
        month[7] = $l10n("AUGUST")
        month[8] = $l10n("SEPTEMBER")
        month[9] = $l10n("OCTOBER")
        month[10] = $l10n("NOVEMBER")
        month[11] = $l10n("DECEMBER")
        return month[index] + $l10n("MONTH")
    }

    getCalendar() {
        let date = new Date()
        let year = date.getFullYear()
        let month = date.getMonth()
        let dateNow = date.getDate()// 当前日期
        let dates = new Date(year, month + 1, 0).getDate()// 总天数
        let firstDay = new Date(year, month, 1).getDay()// 本月第一天是周几
        let calendar = []
        for (let date = 1; date <= dates;) {
            let week = []
            for (let day = 0; day <= 6; day++) {
                if (day === firstDay) firstDay = 0
                // 只有当firstDay为0时才开始放入数据，之前的用-1补位
                week.push(firstDay === 0 ? (date > dates ? -1 : { date: date, day: day }) : -1)
                if (firstDay === 0) date++
            }
            calendar.push(week)
        }
        return {
            year: year,
            month: month,
            calendar: calendar,
            date: dateNow,
        }
    }

    formatCalendar(calendarInfo) {
        const template = (text, props = {}) => {
            return {
                type: "hstack",
                props: {
                    clipped: true,
                    cornerRadius: 5,
                    alignment: $widget.verticalAlignment.center
                },
                views: [{
                    type: "text",
                    props: Object.assign({
                        text: text,
                        font: $font(12),
                        color: $color("primaryText"),
                        background: $color("clear"),
                        frame: {
                            width: 16,
                            height: 20,
                            alignment: $widget.alignment.center
                        },
                        padding: $insets(0, 3, 0, 3)
                    }, props)
                }]
            }
        }

        let calendar = calendarInfo.calendar
        let days = []
        for (let line of calendar) {
            for (let date of line) {
                let props = {}
                // 当天会有红色背景
                if (date.date === calendarInfo.date) {
                    props = {
                        color: $color("white"),
                        background: $color(this.colorTone),
                    }
                }
                // 周六周天显示灰色
                if (date.day === 0 || date.day === 6) {
                    props = Object.assign(props, {
                        color: $color("systemGray2"),
                    })
                }
                days.push(template(date === -1 ? "" : String(date.date), props))
            }
        }
        // 加入标题
        let title = []
        for (let i = 0; i < 7; i++) {
            title.push(template(this.localizedWeek(i), {
                color: $color(this.colorTone)
            }))
        }
        return title.concat(days)
    }

    calendarView(ctx) {
        let calendarInfo = this.getCalendar()
        let calendar = {
            type: "vgrid",
            props: {
                columns: Array(7).fill({
                    flexible: {
                        minimum: 12,
                        maximum: Infinity
                    },
                    spacing: 0,
                    alignment: $widget.alignment.center
                }),
                padding: $insets(0, 5, 0, 5),
                spacing: 0,
                alignment: $widget.horizontalAlignment.center
            },
            views: this.formatCalendar(calendarInfo)
        }
        let titleBar = {
            type: "hstack",
            props: {
                alignment: $widget.horizontalAlignment.center,
                spacing: 20,
                columns: Array(2).fill({
                    flexible: {
                        minimum: 10,
                        maximum: Infinity
                    }
                })
            },
            views: [
                {
                    type: "text",
                    props: {
                        text: this.localizedMonth(calendarInfo.month),
                        color: $color(this.colorTone),
                        font: $font("blur", 14),
                        frame: {
                            maxWidth: Infinity,
                            width: 60,
                            height: 20
                        }
                    }
                },
                {
                    type: "spacer",
                    props: {
                        minLength: 10
                    }
                },
                {
                    type: "text",
                    props: {
                        text: String(calendarInfo.year),
                        color: $color(this.colorTone),
                        font: $font("blur", 14),
                        frame: {
                            maxWidth: Infinity,
                            width: 60,
                            height: 20
                        }
                    }
                }
            ]
        }
        return {
            type: "vstack",
            props: {
                alignment: $widget.verticalAlignment.center,
                spacing: 0
            },
            views: [titleBar, calendar]
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
                switch (ctx.family) {
                    case 0:// 2x2
                        return this.calendarView(ctx)
                    case 1:// 4x2
                        return {
                            type: "text",
                            props: {
                                text: "对的，现在只有2x2"
                            }
                        }
                    case 2:// 4x4
                        return {
                            type: "text",
                            props: {
                                text: "对的，现在只有2x2"
                            }
                        }
                }
            }
        })
    }
}

module.exports = {
    Widget: CalendarWidget
}