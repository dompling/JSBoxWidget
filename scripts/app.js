const { Kernel, VERSION } = require("../EasyJsBox/src/kernel")
const MainUI = require("./ui/main")

class AppKernel extends Kernel {
    constructor() {
        super()
        // 检查是否携带URL scheme
        this.query = $context.query
        if (this.query["url-scheme"]) {
            $app.openURL(this.query["url-scheme"])
        }
        // 注册组件
        this.settingComponent = this._registerComponent("Setting")
        this.setting = this.settingComponent.controller
        this.initSettingMethods()
        this.page = this._registerComponent("Page")
        this.menu = this._registerComponent("Menu")
    }

    /**
     * 注入设置中的脚本类型方法
     */
    initSettingMethods() {
        this.setting.readme = () => {
            this.settingComponent.view.touchHighlightStart()
            let content = $file.read("/README.md").string
            this.settingComponent.view.push([{
                type: "markdown",
                props: { content: content },
                layout: (make, view) => {
                    make.size.equalTo(view.super)
                }
            }], $l10n("BACK"), [], () => {
                this.settingComponent.view.touchHighlightEnd()
            })
        }

        this.setting.tips = () => {
            this.settingComponent.view.touchHighlight()
            $ui.alert("什么都没有~")
        }
    }

    widgetInstance(widget) {
        if ($file.exists(`/scripts/ui/widget/${widget}/index.js`)) {
            let path = `./ui/widget/${widget}/index.js`
            let { Widget } = require(path)
            return new Widget(this)
        } else {
            return false
        }
    }
}

module.exports = {
    run: () => {
        // 实例化应用核心
        let kernel = new AppKernel()
        // 渲染UI
        new MainUI(kernel).render()
    }
}