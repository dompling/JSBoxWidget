const CalendarSetting = require("./setting")

class CalendarWidget {
    constructor(kernel) {
        this.kernel = kernel
        this.setting = new CalendarSetting(this.kernel)
        this.colorTone = this.setting.get("calendar.colorTone")
        this.hasHoliday = this.setting.get("calendar.holiday")
        this.holidayColor = this.setting.get("calendar.holidayColor")
        this.holidayNoRestColor = this.setting.get("calendar.holidayNoRestColor")// 调休
        if (this.hasHoliday && $file.exists(this.setting.holidayPath)) {
            this.holiday = JSON.parse($file.read(this.setting.holidayPath).string).holiday
        }
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

    isHoliday(year, month, date) {
        /**
         * 数字补0
         */
        const toString = number => {
            if (number < 10) {
                number = "0" + number
            }
            return String(number)
        }
        if (!this.holiday) {
            return false
        }
        let key = toString(month) + "-" + toString(date)
        let holiday = this.holiday[key]
        if (holiday && holiday.date === year + "-" + key) {
            return holiday
        }
        return false
    }

    getCalendar(ctx) {
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
                // 只有当firstDay为0时才开始放入数据，之前的用0补位
                let formatDate = firstDay === 0 ? (date > dates ? 0 : { date: date, day: day }) : 0
                // 农历
                if (ctx.family === 2 && formatDate !== 0) {
                    if (!this.sloarToLunar)// 只注册一次
                        this.sloarToLunar = this.kernel.registerPlugin("sloarToLunar")
                    if (date === dateNow) {
                        // 保存农历信息
                        this.lunar = this.sloarToLunar(year, month, date)
                        formatDate["lunar"] = this.lunar
                    } else {
                        formatDate["lunar"] = this.sloarToLunar(year, month, date)
                    }
                }
                // 节假日
                if (this.hasHoliday && formatDate !== 0) {// 判断是否需要展示节假日
                    // month是0-11，故+1
                    let holiday = this.isHoliday(year, month + 1, date)
                    if (holiday) {
                        formatDate["holiday"] = holiday
                    }
                }
                week.push(formatDate)
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
        const min = ctx.displaySize.width >= ctx.displaySize.height ? ctx.displaySize.height : ctx.displaySize.width
        const titleHeight = 20 + 15 // +10为标题padding
        const padding = 10 // 自身表格边距
        const minWidth = parseInt(min / 7 - 10)
        const line = calendarInfo.calendar.length + 1 // 日历行数
        const height = parseInt((min - titleHeight - padding) / line)
        const template = (text, props = {}, ext = undefined) => {
            let views = [{
                type: "text",
                props: Object.assign({
                    text: text,
                    font: $font(12),
                    minimumScaleFactor: 0.5
                }, props.text)
            }]
            if (ext) {
                views.push({
                    type: "text",
                    props: Object.assign({
                        text: ext,
                        font: $font(12),
                        minimumScaleFactor: 0.5
                    }, props.ext)
                })
            }
            return {
                type: "hstack",
                props: {
                    clipped: true,
                    cornerRadius: 5
                },
                views: [{
                    type: "vstack",
                    props: Object.assign({
                        alignment: $widget.verticalAlignment.center,
                        color: $color("primaryText"),
                        background: $color("clear"),
                        padding: $insets(0, 3, 0, 3),
                        frame: {
                            minWidth: minWidth,
                            height: height,
                            alignment: $widget.alignment.center
                        }
                    }, props.box),
                    views: views
                }]
            }
        }

        let calendar = calendarInfo.calendar
        let days = []
        for (let line of calendar) {
            for (let date of line) {
                if (date === 0) {// 空白直接跳过
                    days.push(template(""))
                    continue
                }
                // 初始样式
                let props = {
                    text: { color: $color("primaryText") },
                    ext: { color: $color("primaryText") },// 额外信息样式，如农历等
                    box: { background: $color("clear") }
                }
                // 当天
                if (Math.abs(date.date) === calendarInfo.date) {
                    props.text.color = $color("white")
                    props.ext.color = $color("white")
                    props.box.background = $color(this.colorTone)
                }
                // 周六周天显示灰色
                if (date.day === 0 || date.day === 6) {
                    props.ext.color = props.text.color = $color("systemGray2")
                }
                // 节假日
                if (date.holiday) {
                    if (date.holiday.holiday) {
                        props.ext.color = props.text.color = $color(this.holidayColor)
                    } else {
                        props.ext.color = props.text.color = $color(this.holidayNoRestColor)
                    }
                }
                // 4x4 widget 可显示额外信息
                let ext
                if (ctx.family === 2) {
                    ext = date.holiday ? date.holiday.name : date.lunar.lunarDay
                }
                days.push(template(String(date.date), props, ext))
            }
        }
        // 加入星期指示器
        let title = []
        for (let i = 0; i < 7; i++) {
            title.push(template(this.localizedWeek(i), {
                text: { color: $color(this.colorTone) },
                box: {
                    frame: {
                        minWidth: minWidth,
                        height: ctx.family === 2 ? height / 2 : height,// 4x4 widget 日期指示器高度减半
                        alignment: $widget.alignment.center
                    }
                }
            }))
        }
        return title.concat(days)
    }

    calendarView(ctx) {
        let calendarInfo = this.getCalendar(ctx)
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
        // 标题栏文字内容
        let content = {
            left: this.localizedMonth(calendarInfo.month),
            right: String(calendarInfo.year)
        }
        if (ctx.family === 2) {
            content = {
                left: calendarInfo.year + $l10n("YEAR") + this.localizedMonth(calendarInfo.month),
                right: this.lunar.lunarYear + $l10n("YEAR") + this.lunar.lunarMonth + $l10n("MONTH") + this.lunar.lunarDay
            }
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
                        text: content.left,
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
                        text: content.right,
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
                if (ctx.family === 1) return this.view2x4(ctx)
                return this.calendarView(ctx)
            }
        })
    }
}

module.exports = {
    Widget: CalendarWidget
}