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
        // backup
        this.backupPath = "/assets/backup"
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
            $ui.alert("每个小组件中都有README文件，点击可以得到一些信息。")
        }

        this.setting.backupToICloud = () => {
            this.settingComponent.view.start()
            const backupAction = async () => {
                // 保证目录存在
                if (!$file.exists(this.backupPath)) $file.mkdir(this.backupPath)
                try {
                    // 打包压缩
                    await $archiver.zip({
                        directory: this.widgetRootPath,
                        dest: `${this.backupPath}/widgets.zip`
                    })
                    await $archiver.zip({
                        directory: this.widgetAssetsPath,
                        dest: `${this.backupPath}/userdata.zip`
                    })
                    await $archiver.zip({
                        paths: [`${this.backupPath}/widgets.zip`, `${this.backupPath}/userdata.zip`],
                        dest: `${this.backupPath}/backup.zip`
                    })
                    // 用户选择保存位置
                    $drive.save({
                        data: $data({ path: `${this.backupPath}/backup.zip` }),
                        name: `EasyWidgetBackup-${new Date().getTime()}.zip`,
                        handler: () => {
                            //删除压缩文件
                            $file.delete(this.backupPath)
                            this.settingComponent.view.done()
                        }
                    })
                } catch (error) {
                    this.settingComponent.view.cancel()
                    console.log(error)
                }
            }
            $ui.alert({
                title: $l10n("BACKUP"),
                message: $l10n("START_BACKUP") + "?",
                actions: [
                    {
                        title: $l10n("OK"),
                        handler: () => {
                            backupAction()
                        }
                    },
                    {
                        title: $l10n("CANCEL"),
                        handler: () => { this.settingComponent.view.cancel() }
                    }
                ]
            })
        }

        this.setting.recoverFromICloud = () => {
            this.settingComponent.view.start()
            $drive.open({
                handler: data => {
                    // 保证目录存在
                    if (!$file.exists(this.backupPath)) $file.mkdir(this.backupPath)
                    $file.write({
                        data: data,
                        path: `${this.backupPath}/backup.zip`
                    })
                    // 解压
                    $archiver.unzip({
                        path: `${this.backupPath}/backup.zip`,
                        dest: this.backupPath,
                        handler: async () => {
                            if ($file.exists(`${this.backupPath}/widgets.zip`) && $file.exists(`${this.backupPath}/userdata.zip`)) {
                                try {
                                    // 保证目录存在
                                    $file.mkdir(`${this.backupPath}/widgets`)
                                    $file.mkdir(`${this.backupPath}/userdata`)
                                    // 解压
                                    await $archiver.unzip({
                                        path: `${this.backupPath}/widgets.zip`,
                                        dest: `${this.backupPath}/widgets`
                                    })
                                    await $archiver.unzip({
                                        path: `${this.backupPath}/userdata.zip`,
                                        dest: `${this.backupPath}/userdata`
                                    })
                                    // 删除文件
                                    $file.delete(`${this.backupPath}/backup.zip`)
                                    $file.delete(`${this.backupPath}/userdata.zip`)
                                    $file.delete(`${this.backupPath}/userdata.zip`)
                                    // 恢复
                                    $file.move({
                                        src: `${this.backupPath}/widgets`,
                                        dst: this.widgetRootPath
                                    })
                                    $file.move({
                                        src: `${this.backupPath}/userdata`,
                                        dst: this.widgetAssetsPath
                                    })
                                    this.settingComponent.view.done()
                                } catch (error) {
                                    this.settingComponent.view.cancel()
                                    console.log(error)
                                }
                            }
                        }
                    })
                }
            })
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