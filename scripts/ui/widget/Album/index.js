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
        let data = $cache.get("album.switch.data")
        if (!data) {// 首次写入缓存
            data = {
                date: new Date().getTime(),
                index: 0
            }
            $cache.set("album.switch.data", data)
        }
        let switchInterval = 1000 * 60 * this.setting.get("album.switchInterval")
        const expireDate = new Date(data.date + switchInterval)
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
                let index = 0 // 图片索引
                if (new Date().getTime() - data.date > switchInterval) {// 下一张
                    $cache.set("album.switch.data", {
                        date: new Date().getTime(),
                        index: data.index + 1
                    })
                    if (this.setting.get("album.imageSwitchMethod") === 0) {// 0随机切换，1顺序切换
                        index = this.randomNum(0, pictures.length - 1)
                    } else {
                        index = data.index + 1
                    }
                } else {// 维持不变
                    index = data.index
                }
                let image // 获取图片
                if (this.setting.get("album.useCompressedImage")) {// 检查是否使用压缩后的图片
                    image = $image(`${this.albumPath}/archive/${pictures[index]}`)
                } else {
                    image = $image(`${this.albumPath}/${pictures[index]}`)
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