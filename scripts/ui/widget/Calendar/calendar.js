class Calendar {
    constructor(kernel, setting) {
        this.kernel = kernel
        this.setting = setting
        this.sloarToLunar = this.kernel.registerPlugin("sloarToLunar")
        this.colorTone = this.setting.get("calendar.colorTone")
        this.hasHoliday = this.setting.get("calendar.holiday")
        this.holidayColor = this.setting.get("calendar.holidayColor")
        this.holidayNoRestColor = this.setting.get("calendar.holidayNoRestColor")// 调休
        if (this.hasHoliday && $file.exists(this.setting.holidayPath)) {// 假期信息
            this.holiday = JSON.parse($file.read(this.setting.holidayPath).string).holiday
        }
        this.monthDisplayMode = this.setting.get("calendar.monthDisplayMode")// 月份显示模式
        this.widget2x2TitleYear = this.setting.get("calendar.small.title.year")// 2x2标题是否显示年
        this.firstDayOfWeek = this.setting.get("calendar.firstDayOfWeek")// 每周第一天
        this.lunar2x2 = this.setting.get("calendar.small.lunar")// 2x2是否显示农历
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
        if (this.firstDayOfWeek === 1) {
            index += 1
            if (index > 6) index = 0
        }
        return week[index]
    }

    localizedMonth(index) {
        let mode = this.monthDisplayMode === 0 ? "_C" : "_N"
        let month = []
        month[0] = $l10n("JANUARY" + mode)
        month[1] = $l10n("FEBRUARY" + mode)
        month[2] = $l10n("MARCH" + mode)
        month[3] = $l10n("APRIL" + mode)
        month[4] = $l10n("MAY" + mode)
        month[5] = $l10n("JUNE" + mode)
        month[6] = $l10n("JULY" + mode)
        month[7] = $l10n("AUGUST" + mode)
        month[8] = $l10n("SEPTEMBER" + mode)
        month[9] = $l10n("OCTOBER" + mode)
        month[10] = $l10n("NOVEMBER" + mode)
        month[11] = $l10n("DECEMBER" + mode)
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

    getCalendar(lunar) {
        let date = new Date()
        let year = date.getFullYear()
        let month = date.getMonth()
        let dateNow = date.getDate()// 当前日期
        let dates = new Date(year, month + 1, 0).getDate()// 总天数
        let firstDay = new Date(year, month, 1).getDay()// 本月第一天是周几
        if (this.firstDayOfWeek === 1) {// 设置中设定每周第一天是周几
            firstDay -= 1
            if (firstDay < 0) firstDay = 6
        }
        let calendar = []
        for (let date = 1; date <= dates;) {
            let week = []
            for (let day = 0; day <= 6; day++) {
                if (day === firstDay) firstDay = 0
                // 只有当firstDay为this.firstDay时才开始放入数据，之前的用0补位
                let formatDay = this.firstDayOfWeek === 1 ? day + 1 : day// 判断每周第一天
                if (formatDay > 6) formatDay = 0
                let formatDate = firstDay === 0 ? (date > dates ? 0 : {
                    date: date,
                    day: formatDay
                }) : 0
                // 农历
                if (date === dateNow) {
                    // 保存农历信息
                    this.lunar = this.sloarToLunar(year, month + 1, date)
                }
                if (lunar && formatDate !== 0) {
                    formatDate["lunar"] = date === dateNow ? this.lunar : this.sloarToLunar(year, month + 1, date)
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

    formatCalendar(family, calendarInfo) {
        const template = (text, props = {}, extra = undefined) => {
            let views = [{
                type: "text",
                props: Object.assign({
                    text: text,
                    font: $font(12),
                    lineLimit: 1,
                    minimumScaleFactor: 0.5,
                    padding: extra ? $insets(3, 3, 0, 3) : 0,
                    frame: {
                        maxWidth: Infinity,
                        maxHeight: Infinity
                    }
                }, props.text)
            }]
            if (extra) {
                views.push({
                    type: "text",
                    props: Object.assign({
                        text: extra,
                        font: $font(12),
                        lineLimit: extra.length > 3 ? 2 : 1,
                        minimumScaleFactor: 0.5,
                        padding: $insets(0, 3, 3, 3),
                        frame: {
                            maxWidth: Infinity,
                            maxHeight: Infinity
                        }
                    }, props.ext)
                })
            }
            return {
                type: "vstack",
                modifiers: [
                    Object.assign({
                        color: $color("primaryText"),
                        background: $color("clear")
                    }, props.box),
                    {
                        frame: {
                            maxWidth: Infinity,
                            maxHeight: Infinity
                        },
                        cornerRadius: 5
                    }
                ],
                views: views
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
                // 当天
                if (date.date === calendarInfo.date) {
                    props.text.color = $color("white")
                    props.ext.color = $color("white")
                    if (!date.holiday) {
                        props.box.background = $color(this.colorTone)
                    } else {
                        if (date.holiday.holiday)
                            props.box.background = $color(this.holidayColor)
                        else
                            props.box.background = $color(this.holidayNoRestColor)
                    }
                }
                // 4x4 widget 可显示额外信息
                let ext
                if (family === this.setting.family.large) {
                    ext = date.holiday ? date.holiday.name : date.lunar.lunarDay
                }
                days.push(template(String(date.date), props, ext))
            }
        }
        // 加入星期指示器
        let title = []
        for (let i = 0; i < 7; i++) {
            title.push(template(this.localizedWeek(i), {
                text: { color: $color(this.colorTone) }
            }))
        }
        return title.concat(days)
    }

    calendarView(family) {
        let calendarInfo = this.getCalendar(family === this.setting.family.large)
        let calendar = {
            type: "vgrid",
            props: {
                columns: Array(7).fill({
                    flexible: {
                        minimum: 10,
                        maximum: Infinity
                    }
                }),
                frame: {
                    maxWidth: Infinity,
                    maxHeight: Infinity
                }
            },
            views: this.formatCalendar(family, calendarInfo)
        }
        // 标题栏文字内容
        let content
        if (family === this.setting.family.large) {
            content = {
                left: calendarInfo.year + $l10n("YEAR") + this.localizedMonth(calendarInfo.month),
                right: this.lunar.lunarYear + $l10n("YEAR") + this.lunar.lunarMonth + $l10n("MONTH") + this.lunar.lunarDay,
                size: 18
            }
        } else {
            let year = this.widget2x2TitleYear ? String(calendarInfo.year).slice(-2) + $l10n("YEAR") : ""
            let right = this.lunar2x2 ? this.lunar.lunarMonth + $l10n("MONTH") + this.lunar.lunarDay : ""
            content = {
                left: year + this.localizedMonth(calendarInfo.month),
                right: right
            }
        }
        let titleBar = {
            type: "hstack",
            props: {
                frame: {
                    width: Infinity,
                    height: Infinity
                },
                padding: $insets(10, 3, 10, 3)
            },
            views: [
                {
                    type: "text",
                    props: {
                        text: content.left,
                        lineLimit: 1,
                        color: $color(this.colorTone),
                        font: $font("bold", content.size),
                        frame: {
                            alignment: $widget.alignment.leading,
                            maxWidth: Infinity,
                            height: Infinity
                        }
                    }
                },
                {
                    type: "text",
                    props: {
                        text: content.right,
                        lineLimit: 1,
                        color: $color(this.colorTone),
                        font: $font("bold", content.size),
                        frame: {
                            alignment: $widget.alignment.trailing,
                            maxWidth: Infinity,
                            height: Infinity
                        }
                    }
                }
            ]
        }
        return {
            type: "vstack",
            props: Object.assign({
                maxWidth: Infinity,
                maxHeight: Infinity,
                spacing: 0,
                padding: 10
            }, family === this.setting.family.medium ? {
                link: this.setting.settingUrlScheme
            } : {
                    widgetURL: this.setting.settingUrlScheme
                }),
            views: [titleBar, calendar]
        }
    }
}

module.exports = Calendar