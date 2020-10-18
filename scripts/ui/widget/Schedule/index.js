const Widget = require("../widget")
const ScheduleSetting = require("./setting")
const Schedule = require("./schedule")

class ScheduleWidget extends Widget {
    constructor(kernel) {
        super(kernel, new ScheduleSetting(kernel))
        this.schedule = new Schedule(this.kernel, this.setting)
        this.switchInterval = 1000 * 60 * 10 // 10分钟
    }

    async joinView() {
        let cache = this.getCache(this.setting.family.medium)
        if (cache) return cache
        return await this.view2x4()
    }

    async view2x2() {
        return await this.schedule.scheduleView(this.setting.family.small)
    }

    async view2x4() {
        console.log("aaa")
        // 中等大小将使用link而不是widgetURL
        return await this.schedule.scheduleView(this.setting.family.medium)
    }

    async render() {
        let nowDate = new Date()
        const expireDate = new Date(nowDate + this.switchInterval)
        // 获取视图
        let view2x2
        let cache = this.getCache(this.setting.family.small)
        if (cache) view2x2 = cache
        else view = await this.view2x2()
        $widget.setTimeline({
            entries: [
                {
                    date: nowDate,
                    info: {}
                }
            ],
            policy: {
                afterDate: expireDate
            },
            render: ctx => {
                // 只提供一种视图
                return view2x2
            }
        })
    }
}

module.exports = {
    Widget: ScheduleWidget
}