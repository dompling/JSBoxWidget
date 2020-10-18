class Widget {
    constructor(kernel, setting) {
        this.kernel = kernel
        this.setting = setting
        this.errorView = {
            type: "text",
            props: {
                text: $l10n("FAILED_TO_LOAD_VIEW")
            }
        }
        // 每次实例化都刷新缓存
        this.refreshCache()
    }

    custom() {
        this.setting.push()
    }

    async refreshCache() {
        this.setCache(this.setting.family.small)
        this.setCache(this.setting.family.medium)
        this.setCache(this.setting.family.large)
    }

    async setCache(family) {
        switch (family) {
            case this.setting.family.small:
                $cache.set(`view-${this.setting.widget}-${family}`, await this.view2x2())
                break
            case this.setting.family.medium:
                $cache.set(`view-${this.setting.widget}-${family}`, await this.view2x4())
                break
            case this.setting.family.large:
                $cache.set(`view-${this.setting.widget}-${family}`, await this.view4x4())
                break
        }
    }

    getCache(family) {
        switch (family) {
            case this.setting.family.small:
                return $cache.get(`view-${this.setting.widget}-${family}`)
            case this.setting.family.medium:
                return $cache.get(`view-${this.setting.widget}-${family}`)
            case this.setting.family.large:
                return $cache.get(`view-${this.setting.widget}-${family}`)
            default:
                return false
        }
    }

    view2x2() {
        return this.errorView
    }

    view2x4() {
        return this.errorView
    }

    view4x4() {
        return this.errorView
    }

    async joinView(mode) {
        let cache
        switch (mode) {
            case this.setting.joinMode.small:
                cache = this.getCache(this.setting.family.small)
                if (cache) return cache
                return await this.view2x2()
            case this.setting.joinMode.medium:
                cache = this.getCache(this.setting.family.medium)
                if (cache) return cache
                return await this.view2x4()
            default:
                return false
        }
    }
}

module.exports = Widget