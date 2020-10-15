const ScheduleSetting = require("./setting")
const Schedule = require("./schedule")

class CalendarWidget {
    constructor(kernel) {
        this.kernel = kernel
        this.setting = new ScheduleSetting(this.kernel)
        this.schedule = new Schedule(this.kernel, this.setting)
    }

    custom() {
        this.setting.push()
    }

    async view2x2() {
        return await this.schedule.scheduleView()
    }

    async view2x4() {
        return {
            type: "vgrid",
            props: {
                columns: Array(2).fill({
                    flexible: {
                        minimum: 10,
                        maximum: Infinity
                    },
                    spacing: 10
                }),
                spacing: 10
            },
            views: [
                {
                    type: "text",
                    props: {
                        background: $color("blue"),
                        text: "Hello World!"
                    }
                },
                this.schedule.scheduleView(this.setTimeLine)
            ]
        }
    }

    async view4x4() {
        return this.schedule.scheduleView(this.setTimeLine)
    }

    /**
     * 将会作为函数传递
     * @param {CallableFunction} view 视图处理函数
     */
    setTimeLine(view) {
        let switchInterval = 1000 * 60 * 10 // 10分钟
        let nowDate = new Date()
        const expireDate = new Date(nowDate + switchInterval)
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
                return view(ctx)
            }
        })
    }

    async render() {
        let switchInterval = 1000 * 60 * 10 // 10分钟
        let nowDate = new Date()
        const expireDate = new Date(nowDate + switchInterval)
        // 获取视图
        let view2x2 = await this.view2x2()
        //console.log(view2x2)
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
                switch (ctx.family) {
                    case 0:
                        return view2x2
                    /* case 1:
                        return this.view2x4()
                    case 2:
                        return this.view4x4() */
                    default:
                        return view2x2
                }
            }
        })
        return
        switch ($widget.family) {
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
}

module.exports = {
    Widget: CalendarWidget
}