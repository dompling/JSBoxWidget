class Album {
    constructor(kernel, setting) {
        this.kernel = kernel
        this.setting = setting
        this.albumPath = `${this.kernel.widgetAssetsPath}/${this.setting.widget}/pictures`
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

    getAlbumButtons() {
        return [{
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
                                    data: data.image.jpg(0.5),
                                    path: `${this.albumPath}/archive/${fileName}`
                                })
                                // UI隐藏无图片字样
                                $("no-image-text").hidden = true
                                // UI插入图片
                                let matrix = $("picture-edit-matrix")
                                matrix.hidden = false
                                matrix.insert({
                                    indexPath: $indexPath(0, 0),
                                    value: {
                                        image: {
                                            src: `${this.albumPath}/${fileName}`
                                        }
                                    }
                                })
                                $ui.toast($l10n("SUCCESS"))
                            }
                            if (idx === 0) { // 从系统相册选取图片
                                $photo.pick({
                                    format: "data",
                                    multi: true,
                                    handler: resp => {
                                        if (!resp.status) {
                                            $ui.error($l10n("ERROR"))
                                            return
                                        }
                                        for (let image of resp.results) {
                                            saveImageAction(image.data)
                                        }
                                    }
                                })
                            } else if (idx === 1) { // 从iCloud选取图片
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
    }

    getAlbumViews() {
        let pictures = this.getImages()
        let data = []
        if (pictures.length > 0) {
            pictures.forEach(picture => {
                data.push({
                    image: { src: `${this.albumPath}/${picture}` }
                })
            })
        }
        return [
            {
                type: "label",
                layout: $layout.fill,
                props: {
                    id: "no-image-text",
                    hidden: pictures.length > 0 ? true : false,
                    text: $l10n("NO_IMAGES"),
                    color: $color("secondaryText"),
                    align: $align.center
                }
            },
            {
                type: "matrix",
                props: {
                    id: "picture-edit-matrix",
                    hidden: pictures.length > 0 ? false : true,
                    columns: this.setting.get("columns"),
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
                                    make.size.equalTo($device.info.screen.width / this.setting.get("columns"))
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
                                                    // 同时删除压缩过的文件
                                                    let name = data.image.src.slice(data.image.src.lastIndexOf("/"))
                                                    $file.delete(`${this.albumPath}/archive/${name}`)
                                                    sender.delete(indexPath)
                                                    // 检查是否已经为空，为空则显示提示字样
                                                    if (sender.data.length === 0) {
                                                        $("no-image-text").hidden = false
                                                        $("picture-edit-matrix").hidden = true
                                                    }
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
    }
}

module.exports = Album