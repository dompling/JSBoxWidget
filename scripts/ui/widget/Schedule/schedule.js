class Schedule {
    constructor(kernel, setting) {
        this.kernel = kernel
        this.setting = setting
        this.timeSpan = this.setting.get("timeSpan")
        this.colorTone = this.setting.get("colorTone")
        this.colorReminder = this.setting.get("colorReminder")
        switch (this.setting.get("clickEvent")) {
            case 0:
                this.urlScheme = this.setting.settingUrlScheme
                break
            case 1:
                this.urlScheme = "x-apple-reminderkit://"
                break
            case 2:
                this.urlScheme = "calshow://"
                break
        }
    }

    async getSchedule() {
        let nowDate = new Date()
        let startDate = new Date().setDate(nowDate.getDate() - parseInt(this.timeSpan / 2))
        let hours = this.timeSpan * 24
        let calendar = await $calendar.fetch({
            startDate: startDate,
            hours: hours
        })
        calendar = calendar.events
        let reminder = await $reminder.fetch({
            startDate: startDate,
            hours: hours
        })
        reminder = reminder.events
        // 混合日程和提醒事项
        let total = []
        // 未过期日程
        calendar.forEach(item => {
            if (item.endDate >= nowDate) {
                total.push(item)
            }
        })
        // 未完成提醒事项
        reminder.forEach(item => {
            if (!item.completed) {
                total.push(item)
            }
        })
        // 按创建日期排序
        return this.sort(total, (item, compare) => {
            if (item.creationDate > compare.creationDate) {
                return true
            }
            return false
        })
    }

    /**
     * 排序
     * @param {Array} arr 数组
     * @param {CallableFunction} compare 比较大小，item为被比较对象，compare为比较对象，如果item大则应该返回true
     */
    sort(arr, compare) {
        if (arr.length <= 1) { return arr }
        let left = []
        let right = []
        let middle = arr.splice(0, 1)[0]
        arr.forEach(item => {
            if (compare(item, middle)) {
                right.push(item)
            } else {
                left.push(item)
            }
        })
        return this.sort(left, compare).concat([middle], this.sort(right, compare))
    }

    /**
     * 格式化日期时间
     * @param {Date} date 
     * @param {Number} mode 模式，0：只有日期，1：只有时间
     */
    formatDate(date, mode = 0) {
        if (!date) return $l10n("NO_DATE")
        const formatInt = int => int < 10 ? `0${int}` : String(int)
        if (mode === 0) {
            let month = date.getMonth() + 1
            date = date.getDate()
            return date === new Date().getDate() ? $l10n("TODAY") : `${month}${$l10n("MONTH")}${date}${$l10n("DATE")}`
        } else if (mode === 1) {
            return `${formatInt(date.getHours())}:${formatInt(date.getMinutes())}`
        }

    }

    async getListView() {
        // 获取数据
        let list = await this.getSchedule()
        if (list.length === 0) {
            return [{
                type: "text",
                props: { text: $l10n("NO_CALENDAR&REMINDER") }
            }]
        }
        let dateCollect = {}
        const isReminder = item => item.completed !== undefined
        for (let item of list) {
            let dateString = isReminder(item) ? this.formatDate(item.alarmDate) : this.formatDate(item.endDate)
            if (!dateCollect[dateString])
                dateCollect[dateString] = []
            dateCollect[dateString].push(item)
        }
        let views = []
        for (let date of Object.keys(dateCollect)) {
            let view = []
            for (let item of dateCollect[date]) {
                view.push({
                    type: "hstack",
                    props: {
                        frame: {
                            maxWidth: Infinity,
                            alignment: $widget.alignment.leading,
                            height: 30,
                        },
                        spacing: 5
                    },
                    views: [
                        {// 竖条颜色
                            type: "color",
                            props: {
                                color: isReminder(item) ? $color(this.colorReminder) : $color(this.colorTone),
                                frame: {
                                    width: 2,
                                    height: 30,
                                }
                            }
                        },
                        {
                            type: "vstack",
                            props: {
                                frame: {
                                    maxWidth: Infinity,
                                    alignment: $widget.alignment.leading
                                },
                                spacing: 0
                            },
                            views: [
                                {// 标题
                                    type: "text",
                                    props: {
                                        lineLimit: 1,
                                        text: item.title,
                                        font: $font(14),
                                        frame: {
                                            maxWidth: Infinity,
                                            alignment: $widget.alignment.leading
                                        },
                                        padding: $insets(0, 0, 2, 0)
                                    }
                                },
                                {// 图标和截止日期
                                    type: "hstack",
                                    props: {
                                        frame: {
                                            maxWidth: Infinity,
                                            alignment: $widget.alignment.leading,
                                        },
                                        spacing: 5
                                    },
                                    views: [
                                        {
                                            type: "image",
                                            props: {
                                                symbol: isReminder(item) ? "list.dash" : "calendar",
                                                frame: {
                                                    width: 12,
                                                    height: 12
                                                },
                                                color: isReminder(item) ? $color(this.colorReminder) : $color(this.colorTone),
                                                resizable: true
                                            }
                                        },
                                        {
                                            type: "text",
                                            props: {
                                                lineLimit: 1,
                                                text: isReminder(item) ? this.formatDate(item.alarmDate, 1) : this.formatDate(item.endDate, 1),
                                                font: $font(12),
                                                color: $color("systemGray2"),
                                                frame: { height: 10 }
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                })
            }
            views.push({
                type: "vstack",
                props: { spacing: 5 },
                views: [
                    {
                        type: "text",
                        props: {
                            text: date,
                            color: $color(this.colorTone),
                            font: $font("bold", 12),
                            frame: {
                                maxWidth: Infinity,
                                alignment: $widget.alignment.leading,
                                height: 10,
                            },
                            padding: $insets(-5, 5 + 2, -2, 0)
                        }
                    }
                ].concat(view)
            })
        }
        return views
    }

    /**
     * 获取视图
     * 只提供正方形视图布局
     */
    async scheduleView() {
        return {
            type: "vstack",
            props: {
                widgetURL: this.urlScheme,
                frame: {
                    maxWidth: Infinity,
                    maxHeight: Infinity,
                    alignment: $widget.alignment.topLeading
                },
                padding: 15
            },
            views: [{
                type: "vstack",
                props: {
                    widgetURL: this.urlScheme,
                    padding: 5,
                    spacing: 15
                },
                views: await this.getListView()
            }]
        }
    }
}

module.exports = Schedule