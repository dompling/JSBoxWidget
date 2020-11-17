class Schedule {
    constructor(kernel, setting) {
        this.kernel = kernel
        this.setting = setting
        this.timeSpan = this.setting.get("timeSpan")
        this.colorTone = this.setting.get("colorTone")
        this.colorReminder = this.setting.get("colorReminder")
        this.itemLength = this.setting.get("itemLength")
        switch (this.setting.get("clickEvent")) {
            case 0:
                this.urlScheme = this.setting.settingUrlScheme
                break
            case 1:
                this.urlScheme = `jsbox://run?name=${this.kernel.name}&url-scheme=x-apple-reminderkit://`
                break
            case 2:
                this.urlScheme = `jsbox://run?name=${this.kernel.name}&url-scheme=calshow://`
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
        // 按结束日期排序
        this.quicksort(total, 0, total.length - 1, (item, compare) => {
            let itemDate = item.endDate ? item.endDate : item.alarmDate ? item.alarmDate : nowDate
            let compareDate = compare.endDate ? compare.endDate : compare.alarmDate ? compare.alarmDate : nowDate
            return itemDate.getTime() >= compareDate.getTime()
        })
        return total
    }

    /**
     * 排序
     * @param {Array} arr 数组
     * @param {CallableFunction} compare 比较大小
     */
    quicksort(arr, left, right, compare) {
        let i, j, temp, middle
        if (left > right) return
        middle = arr[left]
        i = left
        j = right
        while (i != j) {
            while (compare(arr[j], middle) && i < j) j--
            while (compare(middle, arr[i]) && i < j) i++
            if (i < j) {
                temp = arr[i]
                arr[i] = arr[j]
                arr[j] = temp
            }
        }
        arr[left] = arr[i]
        arr[i] = middle
        this.quicksort(arr, left, i - 1, compare)
        this.quicksort(arr, i + 1, right, compare)
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
        const list = await this.getSchedule()
        if (list.length === 0) return null
        let itemLength = 0, dateCollect = {}
        const isReminder = item => item.completed !== undefined
        const isExpire = date => date ? date.getTime() < new Date().getTime() : false
        for (let item of list) {
            // 控制显示数目
            if (itemLength >= this.itemLength) break
            let dateString = isReminder(item) ? this.formatDate(item.alarmDate) : this.formatDate(item.endDate)
            if (!dateCollect[dateString])
                dateCollect[dateString] = []
            itemLength++
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
                                {// 图标和日期
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
                                                text: isReminder(item) ? this.formatDate(item.alarmDate, 1) : (() => {
                                                    let startDate = this.formatDate(item.startDate, 1)
                                                    let endDate = this.formatDate(item.endDate, 1)
                                                    return `${startDate}-${endDate}`
                                                })(),
                                                font: $font(12),
                                                color: $color("systemGray2"),
                                                frame: { height: 10 }
                                            }
                                        },
                                        { // 已过期
                                            type: "image",
                                            props: {
                                                opacity: (() => {
                                                    if (isReminder(item)) return isExpire(item.alarmDate) ? 1 : 0
                                                    else return isExpire(item.endDate) ? 1 : 0
                                                })(),
                                                symbol: "exclamationmark.triangle.fill",
                                                color: $color("red"),
                                                frame: {
                                                    width: 12,
                                                    height: 12
                                                },
                                                resizable: true
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
    async scheduleView(family) {
        const listView = await this.getListView()
        if (null === listView) return {
            type: "text",
            props: { text: $l10n("NO_CALENDAR&REMINDER") }
        }
        return {
            type: "vstack",
            props: Object.assign({
                frame: {
                    maxWidth: Infinity,
                    maxHeight: Infinity,
                    alignment: $widget.verticalAlignment.firstTextBaseline
                },
                padding: $insets(15, 15, 0, 0),
                spacing: 15
            }, family !== this.setting.family.small ? {
                link: this.urlScheme
            } : {
                    widgetURL: this.urlScheme
                }),
            views: listView
        }
    }
}

module.exports = Schedule