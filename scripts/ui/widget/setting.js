class Setting {
    constructor(kernel, widget) {
        this.kernel = kernel
        this.widget = widget
        // 检查目录是否存在，不存在则创建
        let assetsPath = `${this.kernel.widgetAssetsPath}/${this.widget}`
        let rootPath = `${this.kernel.widgetRootPath}/${this.widget}`
        if (!$file.exists(rootPath)) {
            $file.mkdir(rootPath)
        }
        if (!$file.exists(assetsPath)) {
            $file.mkdir(assetsPath)
        }
        // 判断当前环境
        if (this.kernel.minimum) {
            this.setting = this.init(
                `${rootPath}/setting.json`,
                `${assetsPath}/setting.json`
            )
        } else {
            this.settingComponent = this.kernel._registerComponent("Setting", `${this.widget}Setting`)
            this.setting = this.settingComponent.controller.init(
                `${rootPath}/setting.json`,
                `${assetsPath}/setting.json`
            )
            this.setting.isSecondaryPage(true, () => { $ui.pop() })
            this.setting.setFooter({ type: "view" })
            this.defaultSettingMethods()
            this.initSettingMethods()
        }
        this.settingUrlScheme = `jsbox://run?name=EasyWidget&widget=${this.widget}`
        this.family = {
            small: 0,
            medium: 1,
            large: 2
        }
        this.joinMode = {
            small: 0,
            medium: 1
        }
    }

    init(settintPath, savePath) {
        this.struct = JSON.parse($file.read(settintPath).string)
        this.settingData = {}
        let user = {}
        if ($file.exists(savePath)) {
            user = JSON.parse($file.read(savePath).string)
        }
        for (let section of this.struct) {
            for (let item of section.items) {
                this.settingData[item.key] = item.key in user ? user[item.key] : item.value
            }
        }
        return { get: key => this.settingData[key] }
    }

    push() {
        $ui.push({
            props: {
                navBarHidden: true,
                statusBarStyle: 0
            },
            views: this.settingComponent.view.getViews()
        })
    }

    set(key, value) {
        return this.setting.set(key, value)
    }

    get(key) {
        return this.setting.get(key)
    }

    defaultSettingMethods() {
        this.setting.readme = () => {
            this.settingComponent.view.touchHighlightStart()
            let content = $file.read(`/scripts/ui/widget/${this.widget}/README.md`).string
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

        this.setting.preview = () => {
            this.settingComponent.view.touchHighlight()
            let widget = this.kernel.widgetInstance(this.widget)
            if (widget) {
                widget.render()
            } else {
                $ui.error($l10n("ERROR"))
            }
        }
    }

    initSettingMethods() { }
}

module.exports = Setting