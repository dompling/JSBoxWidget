const NAME = "Album"
const Setting = require("../setting")
const Album = require("./album")

class PictureSetting extends Setting {
    constructor(kernel) {
        super(kernel, NAME)
        this.album = new Album(this.kernel, this)
    }

    initSettingMethods() {
        this.setting.album = () => {
            this.settingComponent.view.touchHighlightStart()
            let views = this.album.getAlbumViews(),
                buttons = this.album.getAlbumButtons()
            this.kernel.page.view.push(views, $l10n("BACK"), buttons, () => {
                this.settingComponent.view.touchHighlightEnd()
            })
        }

        this.setting.clearCache = () => {
            this.settingComponent.view.touchHighlight()
            this.settingComponent.view.start()
            $cache.remove("switch.data")
            this.settingComponent.view.done()
        }
    }
}

module.exports = PictureSetting