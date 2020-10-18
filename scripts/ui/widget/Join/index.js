const Widget = require("../widget")
const JoinSetting = require("./setting")

class JoinWidget extends Widget {
    constructor(kernel) {
        super(kernel, new JoinSetting(kernel))
        this.left = this.setting.get("left")
        this.spacing = this.setting.get("spacing")
        if (typeof this.left === "object") this.left = this.left[1]
        else this.left = this.setting.menu[this.left]
        this.right = this.setting.get("right")
        if (typeof this.right === "object") this.right = this.right[1]
        else this.right = this.setting.menu[this.right]
    }

    async view2x4() {
        let leftWidget = this.kernel.widgetInstance(this.left)
        let rightWidget = this.kernel.widgetInstance(this.right)
        let leftView = await leftWidget.joinView()
        let rightView = await rightWidget.joinView()
        $widget.family = this.setting.family.medium
        let width = $widget.displaySize.width / 2 - this.spacing / 2
        let height = $widget.displaySize.height
        return {
            type: "vgrid",
            props: {
                columns: Array(2).fill({
                    flexible: {
                        minimum: 10,
                        maximum: Infinity
                    },
                    spacing: this.spacing
                })
            },
            views: [
                {
                    type: "hstack",
                    props: {
                        frame: {
                            maxWidth: width,
                            maxHeight: height
                        },
                        clipped: true
                    },
                    views: [leftView]
                },
                {
                    type: "hstack",
                    props: {
                        frame: {
                            maxWidth: width,
                            maxHeight: height
                        },
                        clipped: true
                    },
                    views: [rightView]
                }
            ]
        }
    }

    async render() {
        let switchInterval = 1000 * 60 * this.switchInterval
        const expireDate = new Date(new Date() + switchInterval)
        let view2x4 = await this.view2x4()
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
                        return view2x4
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