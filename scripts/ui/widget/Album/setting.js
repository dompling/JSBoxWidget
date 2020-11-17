const NAME = "Album"
const Setting = require("../setting")
const Album = require("./album")

class PictureSetting extends Setting {
    constructor(kernel) {
        super(kernel, NAME)
        this.album = new Album(this.kernel, this)
    }

    initSettingMethods() {
        this.setting.album = animate => {
            animate.touchHighlightStart()
            let views = this.album.getAlbumViews(),
                buttons = this.album.getAlbumButtons()
            this.kernel.page.view.push(views, $l10n("BACK"), buttons, () => {
                animate.touchHighlightEnd()
            })
        }

        this.setting.clearCache = animate => {
            animate.touchHighlight()
            animate.actionStart()
            $cache.remove("switch.data")
            animate.actionDone()
        }
    }
}

module.exports = PictureSetting