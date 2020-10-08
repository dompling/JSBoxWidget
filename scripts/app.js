const { Kernel, VERSION } = require("../EasyJsBox/src/kernel")
const MainUI = require("./ui/main")

class AppKernel extends Kernel {
    constructor() {
        super()
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
            let content = $file.read("/README.md").string
            this.settingComponent.view.push([{
                type: "markdown",
                props: { content: content },
                layout: (make, view) => {
                    make.size.equalTo(view.super)
                }
            }])
        }

        this.setting.tips = () => {
            $ui.alert("什么都没有~")
        }
    }

    fistLetterUpper(str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    widgetInstance(widget) {
        if ($file.exists(`/scripts/ui/widget/${this.fistLetterUpper(widget)}/index.js`)) {
            let path = `./ui/widget/${this.fistLetterUpper(widget)}/index.js`
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