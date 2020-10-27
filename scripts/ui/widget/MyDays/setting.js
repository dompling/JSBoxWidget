const NAME = "MyDays"
const Setting = require("../setting")

class MyDaysSetting extends Setting {
    constructor(kernel) {
        super(kernel, NAME)
        this.path = `${this.kernel.widgetAssetsPath}/${NAME}`
        if (!$file.exists(this.path)) {
            $file.mkdir(this.path)
        }
        this.imageMaxSize = 50 // kb
    }

    initSettingMethods() {
        this.setting.backgroundImage = () => {
            this.settingComponent.view.touchHighlightStart()
            $ui.menu({
                items: [$l10n("CHOOSE_IMAGE"), $l10n("CLEAR_IMAGE")],
                handler: (title, idx) => {
                    switch (idx) {
                        case 0:
                            this.settingComponent.view.start()
                            $photo.pick({
                                format: "data",
                                handler: resp => {
                                    if (!resp.status) {
                                        if (resp.error.description !== "canceled") $ui.toast($l10n("ERROR"))
                                        else this.settingComponent.view.cancel()
                                    }
                                    if (!resp.data) return
                                    let fileName = "background" + resp.data.fileName.slice(resp.data.fileName.lastIndexOf("."))
                                    // TODO 控制压缩图片大小
                                    let image = resp.data.image.jpg(this.imageMaxSize * 1000 / resp.data.info.size)
                                    $file.write({
                                        data: image,
                                        path: `${this.path}/${fileName}`
                                    })
                                    $cache.set("MyDays.image", `${this.path}/${fileName}`)
                                    this.settingComponent.view.done()
                                }
                            })
                            break
                        case 1:
                            $cache.remove("MyDays.image")
                            this.settingComponent.view.done()
                            break
                    }
                },
                finished: (cancelled) => {
                    if (cancelled)
                        this.settingComponent.view.touchHighlightEnd()
                }
            })
        }
    }
}

module.exports = MyDaysSetting