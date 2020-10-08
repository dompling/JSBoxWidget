kconst CalendarSetting = require("./setting")

class CalendarWidget {
    constructor(kernel) {
        this.kernel = kernel
        this.setting = new CalendarSetting(this.kernel)
        this.colorTone = this.setting.get("calendar.colorTone")
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

    formatCalendar(ctx, calendarInfo) {
        let min = ctx.displaySize.width >= ctx.displaySize.height ? ctx.displaySize.height : ctx.displaySize.width
        let titleHeight = 20 + 15 // +10为标题padding
        let padding = 10 // 自身表格边距
        let minWidth = parseInt(min / 7 - 10)
        let line = calendarInfo.calendar.length + 1 // 日历行数
        let height = parseInt((min - titleHeight - padding) / line)
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
                        minimumScaleFactor: 0.5,
                        color: $color("primaryText"),
                        background: $color("clear"),
                        padding: $insets(0, 3, 0, 3),
                        frame: {
                            minWidth: minWidth,
                            height: height,
                            alignment: $widget.alignment.center
                        },
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
                        minimum: 10,
                        maximum: Infinity
                    },
                    spacing: 0,
                    padding: 0,
                }),
                padding: $insets(0, 10, 10, 10),
            },
            views: this.formatCalendar(ctx, calendarInfo)
        }
        let titleBar = {
            type: "hstack",
            props: {
                alignment: $widget.horizontalAlignment.center,
                padding: $insets(10, 13, 5, 13),
                columns: Array(2).fill({
                    flexible: {
                        minimum: 10,
                        maximum: Infinity
                    }
                }),
                frame: {
                    height: 20
                }
            },
            views: [
                {
                    type: "text",
                    props: {
                        text: this.localizedMonth(calendarInfo.month),
                        color: $color(this.colorTone),
                        font: $font("blur", 14),
                        minimumScaleFactor: 0.5,
                        frame: {
                            minWidth: 30,
                            height: 20
                        }
                    }
                },
                { type: "spacer" },
                {
                    type: "text",
                    props: {
                        text: String(calendarInfo.year),
                        color: $color(this.colorTone),
                        font: $font("blur", 14),
                        minimumScaleFactor: 0.5,
                        frame: {
                            minWidth: 30,
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

    custom() {
        this.setting.push()
    }

    holiday() {
        // TODO 节假日
        let holiday = $cache.get("calendar.holiday")
        if (holiday) {
            this.holiday = holiday.holiday
        } else {
            $ui.alert($l10n("NEED_HOLIDAY_DATA"))
        }
    }

    view2x2(ctx) {
        return this.calendarView(ctx)
    }

    view2x4(ctx) {
        return {
            type: "vgrid",
            props: {
                columns: Array(2).fill({
                    flexible: {
                        minimum: 10,
                        maximum: Infinity
                    },
                    spacing: 10,
                }),
                spacing: 10,
            },
            views: [
                {
                    type: "text",
                    props: {
                        text: "Hello World!"
                    }
                },
                this.calendarView(ctx)
            ]
        }
    }

    view4x4(ctx) {
        return this.calendarView(ctx)
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
                        return this.view2x2(ctx)
                    case 1:// 2x4
                        return this.view2x4(ctx)
                    case 2:// 4x4
                        return this.view4x4(ctx)
                }
            }
        })
    }
}

module.exports = {
    Widget: CalendarWidget
}