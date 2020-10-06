const BaseView = require("../../../EasyJsBox/src/Foundation/view")

class Factory extends BaseView {
    constructor(kernel) {
        super(kernel)
        // 设置初始页面
        this.kernel.page.controller.setSelectedPage(0)
    }

    home() {
        const HomeUI = require("./home")
        let interfaceUi = new HomeUI(this.kernel, this)
        return this.kernel.page.view.creator(interfaceUi.getViews(), 0)
    }

    setting() {
        return this.kernel.page.view.creator(this.kernel.getComponent("Setting").view.getViews(), 1, false)
    }

    /**
     * 渲染页面
     */
    render() {
        this.kernel.render([
            this.home(),
            this.setting()
        ], [
            {
                icon: ["house", "house.fill"],
                title: $l10n("HOME")
            },
            {
                icon: "gear",
                title: $l10n("SETTING")
            }
        ])()
    }
}

module.exports = Factory