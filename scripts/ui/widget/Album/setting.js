const Setting = require("../setting")

class PictureSetting extends Setting {
    constructor(kernel) {
        super(kernel, "Album")
    }

    initSettingMethods() {
        this.setting.album = () => {
            let buttons = [{
                type: "button",
                props: {
                    symbol: "plus",
                    tintColor: this.kernel.page.view.textColor,
                    bgcolor: $color("clear")
                },
                layout: make => {
                    make.right.inset(20)
                    make.size.equalTo(30)
                },
                events: {
                    tapped: () => {
                        $drive.open({
                            handler: file => {
                                $file.write({
                                    data: file,
                                    path: `${this.albumPath}/${file.fileName}`
                                })
                                let pictures = $file.list(this.albumPath)
                                let data = []
                                if (pictures)
                                    for (let picture of pictures) {
                                        data.push({
                                            image: {
                                                src: `${this.albumPath}/${picture}`
                                            }
                                        })
                                    }
                                $("picture-edit-matrix").data = data
                                $ui.toast($l10n("SUCCESS"))
                            }
                        })
                    }
                }
            }]
            let pictures = $file.list(this.albumPath)
            let data = []
            if (pictures)
                for (let picture of pictures) {
                    data.push({
                        image: {
                            src: `${this.albumPath}/${picture}`
                        }
                    })
                }
            let views = [{
                type: "matrix",
                props: {
                    id: "picture-edit-matrix",
                    columns: this.setting.get("album.columns"),
                    square: true,
                    data: data,
                    template: {
                        props: {},
                        views: [
                            {
                                type: "image",
                                props: {
                                    id: "image"
                                },
                                layout: make => {
                                    make.size.equalTo($device.info.screen.width / this.setting.get("album.columns"))
                                }
                            }
                        ]
                    }
                },
                events: {
                    didSelect: (sender, indexPath, data) => {
                        $ui.menu({
                            items: [$l10n("DELETE")],
                            handler: (title, idx) => {
                                if (idx === 0) {
                                    $file.delete(data.image.src)
                                }
                            }
                        });
                    }
                },
                layout: $layout.fill
            }]
            this.kernel.page.view.push(views, $l10n("BACK"), buttons)
        }
    }
}

module.exports = PictureSetting