const Widget = require("../widget")
const CalendarSetting = require("./setting")
const Calendar = require("./calendar")

class CalendarWidget extends Widget {
    constructor(kernel) {
        super(kernel, new CalendarSetting(kernel))
        this.calendar = new Calendar(this.kernel, this.setting)
    }

    view2x2() {
        return this.calendar.calendarView(this.setting.family.small)
    }

    view2x4() {
        return this.calendar.weekView(this.setting.family.meduim)
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
                let cache
                switch (ctx.family) {
                    case 0:
                        cache = this.getCache(this.setting.family.small)
                        if (cache) return cache
                        else return this.view2x2()
                    case 1:
                        cache = this.getCache(this.setting.family.meduim)
                        if (cache) return cache
                        else return this.view2x4()
                    case 2:
                        cache = this.getCache(this.setting.family.large)
                        if (cache) return cache
                        else return this.view4x4()
                    default:
                        return this.errorView
                }
            }
        })
    }
}

module.exports = {
    Widget: CalendarWidget
}