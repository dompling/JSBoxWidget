class Widget {
    constructor(kernel, setting) {
        this.startTime = new Date()
        this.kernel = kernel
        this.setting = setting
        this.cacheDateStartFromZero = false
        this.errorView = {
            type: "text",
            props: {
                // text: $l10n("FAILED_TO_LOAD_VIEW")
                text: $l10n("VIEW_NOT_PROVIDED")
            }
        }
    }

    custom() {
        this.setting.push()
    }

    printTimeConsuming() {
        if (!this.kernel.inWidgetEnv && this.setting.get("isPrintTimeConsuming"))
            console.log(`Use ${new Date() - this.startTime} ms`)
    }

    async view2x2() {
        return this.errorView
    }

    async view2x4() {
        return this.errorView
    }

    async view4x4() {
        return this.errorView
    }

    async joinView(mode) {
        let view
        switch (mode) {
            case this.setting.joinMode.small:
                view = this.view2x2(this.setting.joinMode.medium) // 校正family
                break
            case this.setting.joinMode.medium:
                view = this.view2x4()
                break
            default:
                return false
        }
        return view
    }
}

module.exports = Widget