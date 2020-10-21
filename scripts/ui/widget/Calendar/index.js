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
                let cache = family => {
                    let cache = this.getCache(family)
                    // 未超过一天则不更新缓存
                    let oneDay = 1000 * 60 * 60 * 24
                    if (cache && new Date().setHours(0, 0, 0, 0).getTime() - cache.date.getTime() < oneDay)
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
    Widget: CalendarWidget
}