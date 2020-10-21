const { Kernel, VERSION } = require("../EasyJsBox/src/kernel")
const MainUI = require("./ui/main")

class AppKernel extends Kernel {
    constructor() {
        super()
        this.query = $context.query
        // 注册组件
        this.settingComponent = this._registerComponent("Setting")
        this.setting = this.settingComponent.controller
        this.initSettingMethods()
        this.page = this._registerComponent("Page")
        this.menu = this._registerComponent("Menu")
        // 小组件根目录
        this.widgetRootPath = "/scripts/ui/widget"
        this.widgetAssetsPath = "/assets/widget"
        // 更新所有小组件缓存
        this.refreshWidgetCache()
        // 检查是否携带URL scheme
        if (this.query["url-scheme"]) {
            // 延时500ms后跳转
            setTimeout(() => { $app.openURL(this.query["url-scheme"]) }, 500)
        }
    }

    uuid() {
        var s = []
        var hexDigits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
        }
        s[14] = "4" // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-"

        return s.join("")
    }

    /**
     * 更新所有小组件缓存
     */
    async refreshWidgetCache() {
        let widgets = this.getWidgetList()
        for (let widget of widgets) {
            widget = this.widgetInstance(widget.name)
            widget.refreshCache()
        }
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
        if ($file.exists(`${this.widgetRootPath}/${widget}/index.js`)) {
            let { Widget } = require(`./ui/widget/${widget}/index.js`)
            return new Widget(this)
        } else {
            return false
        }
    }

    getWidgetList() {
        let data = []
        let widgets = $file.list(this.widgetRootPath)
        for (let widget of widgets) {
            let widgetPath = `${this.widgetRootPath}/${widget}`
            if ($file.exists(`${widgetPath}/config.json`)) {
                let config = JSON.parse($file.read(`${widgetPath}/config.json`).string)
                if (typeof config.icon !== "object") {
                    config.icon = [config.icon, config.icon]
                }
                config.icon = config.icon.map(icon => icon[0] === "@" ? icon.replace("@", widgetPath) : icon)
                data.push({
                    title: config.title,
                    describe: config.describe,
                    name: widget,
                    icon: config.icon
                })
            } else {// 没有config.json文件则跳过
                continue
            }
        }
        return data
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