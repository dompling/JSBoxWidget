class MainUI {
    constructor(kernel) {
        this.kernel = kernel
    }

    mainUi() {
        const Factory = require("./main/factory")
        new Factory(this.kernel).render()
    }

    widgetUi() {
        const Widget = require("./widget/index")
        new Widget(this.kernel).render()
    }

    render() {
        switch ($app.env) {
            case $env.app:
                this.mainUi()
                break
            case $env.keyboard:
                $ui.alert("不可以在键盘中使用。。。")
                break
            case $env.widget:
                this.widgetUi()
                break
            default:
                $ui.alert({
                    title: $l10n("ALERT_INFO"),
                    message: "后续可能开发，敬请期待！"
                })
        }

    }
}

module.exports = MainUI