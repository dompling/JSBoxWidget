const NAME = "MyDays"
const Setting = require("../setting")

class MyDaysSetting extends Setting {
    constructor(kernel) {
        super(kernel, NAME)
        this.path = `${this.kernel.widgetAssetsPath}/${NAME}`
        if (!$file.exists(this.path)) {
            $file.mkdir(this.path)
        }
    }

    initSettingMethods() {
        this.setting.backgroundImage = () => {
            $ui.menu({
                items: [$l10n("PREVIEW"), $l10n("CHOOSE_IMAGE")],
                handler: (title, idx) => {
                    switch (idx) {
                        case 0:
                            const image = $cache.get("MyDays.image")
                            break
                        case 1:
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
                                    $file.write({
                                        data: resp.data.image.jpg(0.5),
                                        path: `${this.path}/${fileName}`
                                    })
                                    $cache.set("MyDays.image", `${this.path}/${fileName}`)
                                    $ui.toast($l10n("SUCCESS"))
                                    this.settingComponent.view.done()
                                }
                            })
                            break
                    }
                }
            });
        }
    }
}

module.exports = MyDaysSetting