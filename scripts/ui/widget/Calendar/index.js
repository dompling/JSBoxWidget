const CalendarSetting = require("./setting")
const Calendar = require("./calendar")

class CalendarWidget {
    constructor(kernel) {
        this.kernel = kernel
        this.setting = new CalendarSetting(this.kernel)
        this.calendar = new Calendar(this.kernel, this.setting)
    }

    custom() {
        this.setting.push()
    }

    view2x2() {
        return this.calendar.calendarView(this.setting.family.small)
    }

    view2x4() {
        return {
            type: "text",
            props: { text: $l10n("ONLY_SQUARE_VIEW") }
        }
    }

    view4x4() {
        return this.calendar.calendarView(this.setting.family.large)
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
                // 设定ctx
                this.calendar.setCtx(ctx)
                switch (ctx.family) {
                    case 0:
                        return this.view2x2()
                    case 1:
                        return this.view2x4()
                    case 2:
                        return this.view4x4()
                    default:
                        return this.view2x2()
                }
            }
        })
    }
}

module.exports = {
    Widget: CalendarWidget
}