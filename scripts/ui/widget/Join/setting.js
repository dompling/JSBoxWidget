const NAME = "Join"
const Setting = require("../setting")

class JoinSetting extends Setting {
    constructor(kernel) {
        super(kernel, NAME)
        this.menu = (() => {
            let data = this.kernel.getWidgetList()
            let result = []
            data.forEach(item => {
                if (item.title !== NAME)
                    result.push(item.title)
            })
            return result
        })()
    }

    initSettingMethods() {
        this.setting.getMenu = () => {
            return this.menu
        }
    }
}

module.exports = JoinSetting