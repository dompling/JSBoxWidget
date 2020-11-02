const { Kernel, VERSION } = require("../EasyJsBox/src/kernel")
const widgetRootPath = "/scripts/ui/widget"
const widgetAssetsPath = "/assets/widget"
const backupPath = "/assets/backup"

/**
 * 实例化一个小组件
 * @param {String} widget widget名
 * @param {Kernel} that Kernel实例
 */
function widgetInstance(widget, that) {
    if ($file.exists(`${widgetRootPath}/${widget}/index.js`)) {
        let { Widget } = require(`./ui/widget/${widget}/index.js`)
        return new Widget(that)
    } else {
        return false
    }
}

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
        this.widgetRootPath = widgetRootPath
        this.widgetAssetsPath = widgetAssetsPath
        // backup
        this.backupPath = backupPath
        // 更新时间线
        $widget.reloadTimeline()
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
                        name: `${this.name}Backup-${new Date().getTime()}.zip`,
                        handler: success => {
                            //删除压缩文件
                            $file.delete(this.backupPath)
                            if (success) {
                                this.settingComponent.view.done()
                            } else {
                                this.settingComponent.view.cancel()
                            }
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
                        handler: async success => {
                            if (success) {
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
                                        $file.delete(`${this.backupPath}/widgets.zip`)
                                        $file.delete(`${this.backupPath}/userdata.zip`)
                                        // 恢复
                                        $file.list(`${this.backupPath}/widgets`).forEach(item => {
                                            if ($file.isDirectory(`${this.backupPath}/widgets/${item}`)) {
                                                $file.delete(`${this.widgetRootPath}/${item}`)
                                                $file.move({
                                                    src: `${this.backupPath}/widgets/${item}`,
                                                    dst: `${this.widgetRootPath}/${item}`
                                                })
                                            }
                                        })
                                        $file.move({
                                            src: `${this.backupPath}/userdata`,
                                            dst: this.widgetAssetsPath
                                        })
                                        $file.delete(this.backupPath)
                                        this.settingComponent.view.done()
                                    } catch (error) {
                                        this.settingComponent.view.cancel()
                                        console.log(error)
                                    }
                                }
                            } else {
                                this.settingComponent.view.cancel()
                            }
                        }
                    })
                }
            })
        }
    }

    widgetInstance(widget) {
        return widgetInstance(widget, this)
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

class minimumKernel extends Kernel {
    constructor() {
        super()
        this.minimum = true
        // 小组件根目录
        this.widgetRootPath = widgetRootPath
        this.widgetAssetsPath = widgetAssetsPath
    }

    widgetInstance(widget) {
        return widgetInstance(widget, this)
    }
}

module.exports = {
    run: () => {
        if ($app.env === $env.widget) {
            let kernel = new minimumKernel()
            let widgetName = $widget.inputValue
            let widget = kernel.widgetInstance(widgetName)
            if (widget) {
                widget.render()
            } else {
                $widget.setTimeline({
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
        } else {
            const Factory = require("./ui/main/factory")
            new Factory(new AppKernel()).render()
        }
    }
}