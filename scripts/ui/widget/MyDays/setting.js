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

    getBackgroundImage() {
        let path = null
        $file.list(this.path).forEach(file => {
            if (file.slice(0, file.indexOf(".")) === "background") {
                if (path === null) {
                    path = `${this.path}/${file}`
                } else if (typeof path === "string") {
                    path = [path]
                    path.push(file)
                } else {
                    path.push(file)
                }
                return
            }
        })
        return path
    }

    clearBackgroundImage() {
        $file.list(this.path).forEach(file => {
            if (file.slice(0, file.indexOf(".")) === "background") {
                $file.delete(`${this.path}/${file}`)
            }
        })
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
                                    // 清除旧图片
                                    this.clearBackgroundImage()
                                    let fileName = "background" + resp.data.fileName.slice(resp.data.fileName.lastIndexOf("."))
                                    // TODO 控制压缩图片大小
                                    let image = resp.data.image.jpg(this.imageMaxSize * 1000 / resp.data.info.size)
                                    $file.write({
                                        data: image,
                                        path: `${this.path}/${fileName}`
                                    })
                                    this.settingComponent.view.done()
                                }
                            })
                            break
                        case 1:
                            this.clearBackgroundImage()
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