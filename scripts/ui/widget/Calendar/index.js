const Widget = require("../widget")
const CalendarSetting = require("./setting")
const Calendar = require("./calendar")

class CalendarWidget extends Widget {
    constructor(kernel) {
        super(kernel, new CalendarSetting(kernel))
        this.calendar = new Calendar(this.kernel, this.setting)
        this.cacheLife = 1000 * 60 * 60 * 24
        this.cacheDateStartFromZero = true
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
                let view = cache(ctx.family)
                this.printTimeConsuming()
                return view
            }
        })
    }
}

module.exports = {
    Widget: CalendarWidget
}