const Setting = require("../setting")

class PictureSetting extends Setting {
    constructor(kernel) {
        super(kernel, "Album")
        this.albumPath = "/assets/widget/Album/pictures"
        if (!$file.exists(this.albumPath)) {
            $file.mkdir(this.albumPath)
        }
        if (!$file.exists(`${this.albumPath}/archive`)) {
            $file.mkdir(`${this.albumPath}/archive`)
        }
    }

    getImages(isCompress) {
        if (isCompress) return $file.list(`${this.albumPath}/archive`)
        let list = $file.list(this.albumPath)
        for (let i = 0; i < list.length; i++) {
            if ($file.isDirectory(`${this.albumPath}/${list[i]}`)) {
                list.splice(i, 1)
                return list
            }
        }
        return list
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
                        $ui.menu({
                            items: [$l10n("SYSTEM_ALBUM"), "iCloud"],
                            handler: (title, idx) => {
                                const saveImageAction = data => {
                                    let length = this.getImages().length
                                    let fileName = "img-" + length + data.fileName.slice(data.fileName.lastIndexOf("."))
                                    $file.write({
                                        data: data,
                                        path: `${this.albumPath}/${fileName}`
                                    })
                                    // 同时保留一份压缩后的图片
                                    $file.write({
                                        data: data.image.resized($size(300, 300)),
                                        path: `${this.albumPath}/archive/${fileName}`
                                    })
                                    $("picture-edit-matrix").insert({
                                        indexPath: $indexPath(0, 0),
                                        value: {
                                            image: {
                                                src: `${this.albumPath}/${fileName}`
                                            }
                                        }
                                    })
                                    $ui.toast($l10n("SUCCESS"))
                                }
                                if (idx === 0) {// 从系统相册选取图片
                                    $photo.pick({
                                        format: "data",
                                        handler: resp => {
                                            let image = resp.data
                                            saveImageAction(image)
                                        }
                                    })
                                } else if (idx === 1) {// 从iCloud选取图片
                                    $drive.open({
                                        handler: file => {
                                            if (!file) return
                                            saveImageAction(file)
                                        }
                                    })
                                }
                            }
                        })
                    }
                }
            }]
            let pictures = this.getImages()
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
                            items: [$l10n("SAVE_TO_SYSTEM_ALBUM"), $l10n("DELETE")],
                            handler: (title, idx) => {
                                if (idx === 0) {
                                    $photo.save({
                                        data: $file.read(data.image.src),
                                        handler: success => {
                                            if (success)
                                                $ui.success($l10n("SUCCESS"))
                                            else
                                                $ui.error($l10n("ERROR"))
                                        }
                                    })
                                } else if (idx === 1) {
                                    let style = {}
                                    if ($alertActionType) {
                                        style = { style: $alertActionType.destructive }
                                    }
                                    $ui.alert({
                                        title: $l10n("CONFIRM_DELETE_MSG"),
                                        actions: [
                                            Object.assign({
                                                title: $l10n("DELETE"),
                                                handler: () => {
                                                    $file.delete(data.image.src)
                                                    sender.delete(indexPath)
                                                }
                                            }, style),
                                            { title: $l10n("CANCEL") }
                                        ]
                                    })
                                }
                            }
                        })
                    }
                },
                layout: $layout.fill
            }]
            this.kernel.page.view.push(views, $l10n("BACK"), buttons)
        }
    }
}

module.exports = PictureSetting