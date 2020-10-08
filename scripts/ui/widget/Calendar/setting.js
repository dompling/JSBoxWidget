const Setting = require("../setting")

class CalendarSetting extends Setting {
    constructor(kernel) {
        super(kernel, "Calendar")
    }

    initSettingMethods() {
        this.setting.holiday = () => {
            $ui.alert('next version...')
            return
        }
    }
}

module.exports = CalendarSetting