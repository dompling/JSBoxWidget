class PhotoWidget {
    constructor(kernel) {
        this.kernel = kernel
        this.path = "/assets/picture"
        if (!$file.exists(this.path)) {
            $file.mkdir(this.path)
        }
    }

    edit() {
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
                                path: `${this.path}/${file.fileName}`
                            })
                            let pictures = $file.list(this.path)
                            let data = []
                            if (pictures)
                                for (let picture of pictures) {
                                    data.push({
                                        image: {
                                            src: `${this.path}/${picture}`
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
        let pictures = $file.list(this.path)
        let data = []
        if (pictures)
            for (let picture of pictures) {
                data.push({
                    image: {
                        src: `${this.path}/${picture}`
                    }
                })
            }
        let views = [{
            type: "matrix",
            props: {
                id: "picture-edit-matrix",
                columns: this.kernel.setting.get("picture.album.columns"),
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
                                make.size.equalTo($device.info.screen.width / this.kernel.setting.get("picture.album.columns"))
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
        this.kernel.page.view.push(views, $l10n("HOME"), buttons)
    }

    randomNum(min, max) {
        switch (arguments.length) {
            case 1:
                return parseInt(Math.random() * min + 1, 10)
            case 2:
                return parseInt(Math.random() * (max - min + 1) + min, 10)
            default:
                return 0
        }
    }

    render() {
        let pictures = $file.list(this.path)
        let image = pictures[this.randomNum(0, pictures.length - 1)]
        const midnight = new Date()
        midnight.setHours(0, 0, 0, 0)
        const expireDate = new Date(midnight.getTime() + 60 * 60 * 24 * 1000)
        $widget.setTimeline({
            entries: [
                {
                    date: new Date(),
                    info: {}
                }
            ],
            policy: {
                afterDate: expireDate
            },
            render: ctx => {
                return {
                    type: "image",
                    props: {
                        image: $image(`${this.path}/${image}`),
                        resizable: true,
                        scaledToFill: true
                    }
                }
            }
        })
    }
}

module.exports = {
    Widget: PhotoWidget
}