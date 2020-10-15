class Setting {
    constructor(kernel, widget) {
        this.kernel = kernel
        this.widget = widget
        this.settingComponent = this.kernel._registerComponent("Setting", `${this.widget}Setting`)
        this.setting = this.settingComponent.controller.init(
            `/scripts/ui/widget/${this.widget}/setting.json`,
            `/assets/widget/${this.widget}/setting.json`
        )
        this.setting.isSecondaryPage(true, () => { $ui.pop() })
        this.setting.setFooter({ type: "view" })
        this.defaultSettingMethods()
        this.initSettingMethods()
        this.settingUrlScheme = `jsbox://run?name=EasyWidget&widget=${this.widget}`
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