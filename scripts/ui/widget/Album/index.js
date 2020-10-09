const PictureSetting = require("./setting")

class PictureWidget {
    constructor(kernel) {
        this.kernel = kernel
        this.setting = new PictureSetting(this.kernel)
        this.albumPath = this.setting.albumPath
    }

    custom() {
        this.setting.push()
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
        let switchInterval = 1000 * 60 * 60 * this.setting.get("album.switchInterval")
        const midnight = new Date()
        midnight.setHours(0, 0, 0, 0)
        const expireDate = new Date(midnight.getTime() + switchInterval)
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
                let pictures = this.setting.getImages()
                let image
                // 0随机切换，1顺序切换
                if (this.setting.get("album.imageSwitchMethod") === 0) {
                    image = pictures[this.randomNum(0, pictures.length - 1)]
                } else {
                    let data = $cache.get("album.switch.data")
                    if (!data) {// 首次写入缓存
                        $cache.set("album.switch.data", {
                            date: new Date().getTime(),
                            index: 0
                        })
                        image = pictures[0]
                    } else if (new Date().getTime() - data.date > switchInterval) {// 下一张
                        image = pictures[data.index + 1]
                    } else {// 维持不变
                        image = pictures[data.index]
                    }
                }
                if (this.setting.get("album.useCompressedImage")) {
                    image = $image(`${this.albumPath}/archive/${image}`)
                } else {
                    image = $image(`${this.albumPath}/${image}`)
                }
                return {
                    type: "image",
                    props: {
                        widgetURL: "jsbox://run?name=EasyWidget&url-scheme=" + this.setting.get("album.urlScheme"),
                        image: image,
                        resizable: true,
                        scaledToFill: true
                    }
                }
            }
        })
    }
}

module.exports = {
    Widget: PictureWidget
}