const JoinSetting = require("./setting")

class JoinWidget {
    constructor(kernel) {
        this.kernel = kernel
        this.setting = new JoinSetting(this.kernel)
        this.left = this.setting.get("left")
        if (typeof this.left === "object") this.left = this.left[1]
        else this.left = this.setting.menu[this.left]
        this.right = this.setting.get("right")
        if (typeof this.right === "object") this.right = this.right[1]
        else this.right = this.setting.menu[this.right]
    }

    custom() {
        this.setting.push()
    }

    async view2x4() {
        let leftWidget = this.kernel.widgetInstance(this.left)
        let rightWidget = this.kernel.widgetInstance(this.right)
        let leftView = await leftWidget.joinView()
        let rightView = await rightWidget.joinView()
        return {
            type: "vgrid",
            props: {
                columns: Array(2).fill({
                    flexible: {
                        minimum: 10,
                        maximum: Infinity
                    },
                    spacing: 10
                })
            },
            views: [leftView, rightView]
        }
    }

    view4x4() { }

    async render() {
        let switchInterval = 1000 * 60 * this.switchInterval
        const expireDate = new Date(new Date() + switchInterval)
        let view2x2 = await this.view2x4()
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
                switch (ctx.family) {
                    case 0:
                        return {
                            type: "text",
                            props: { text: $l10n("NO_SMALL_VIEW") }
                        }
                    case 1:
                        return view2x2
                    /* case 2:
                        return this.view4x4() */
                    default:
                        return {
                            type: "text",
                            props: { text: "在未来可能会提供该视图" }
                        }
                }
            }
        })
    }
}

module.exports = {
    Widget: JoinWidget
}