class Widget {
    constructor(kernel, setting) {
        this.kernel = kernel
        this.setting = setting
        this.cacheLife = 1000 * 60 * 10
        this.cacheDateStartFromZero = false
        this.errorView = {
            type: "text",
            props: {
                text: $l10n("FAILED_TO_LOAD_VIEW")
            }
        }
    }

    custom() {
        this.setting.push()
    }

    async refreshCache() {
        this.setCache(this.setting.family.small)
        this.setCache(this.setting.family.medium)
        this.setCache(this.setting.family.large)
    }

    async setCache(family, view) {
        switch (family) {
            case this.setting.family.small:
                $cache.set(`view-${this.setting.widget}-${family}`, {
                    view: view ? view : await this.view2x2(),
                    date: new Date()
                })
                break
            case this.setting.family.medium:
                $cache.set(`view-${this.setting.widget}-${family}`, {
                    view: view ? view : await this.view2x4(),
                    date: new Date()
                })
                break
            case this.setting.family.large:
                $cache.set(`view-${this.setting.widget}-${family}`, {
                    view: view ? view : await this.view4x4(),
                    date: new Date()
                })
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
        let cache = mode => {
            let cache = this.getCache(mode)
            if (cache && (this.cacheDateStartFromZero ? new Date().setHours(0, 0, 0, 0).getTime() : new Date().getTime()) - cache.date.getTime() < this.cacheLife)
                return cache.view
            else {
                let view
                switch (mode) {
                    case this.setting.joinMode.small:
                        view = this.view2x2()
                        break
                    case this.setting.joinMode.medium:
                        view = this.view2x4()
                        break
                    default:
                        return false
                }
                // 更新缓存
                this.setCache(mode, view)
                return view
            }
        }
        return cache(mode)
    }
}

module.exports = Widget