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
        let pictures = $file.list(this.albumPath)
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
                        image: $image(`${this.albumPath}/${image}`),
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