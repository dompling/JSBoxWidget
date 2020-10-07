const inputValue = $widget.inputValue

class WidgetBase {
    constructor(kernel) {
        this.kernel = kernel
    }

    noSelected() {
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
                return {
                    type: "text",
                    props: {
                        text: "去主程序选择一个Widget，或者参数有误？\n注意，不需要引号"
                    }
                }
            }
        })
    }

    render() {
        let widgetName = inputValue
        if ($file.exists(`/scripts/ui/widget/${widgetName}.js`)) {
            let { Widget } = require(`./${widgetName}`)
            let widget = new Widget(this.kernel)
            widget.render()
        } else {
            this.noSelected()
        }
    }
}

module.exports = WidgetBase