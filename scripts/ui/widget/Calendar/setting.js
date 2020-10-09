const Setting = require("../setting")

class CalendarSetting extends Setting {
    constructor(kernel) {
        super(kernel, "Calendar")
        this.calendarPath = "/assets/widget/Calendar"
        if (!$file.exists(this.calendarPath)) {
            $file.mkdir(this.calendarPath)
        }
        this.holidayPath = `${this.calendarPath}/holiday.json`
    }

    initSettingMethods() {
        this.setting.holiday = () => {
            let holiday = $file.read(this.holidayPath).string
            $ui.alert({
                title: $l10n("HOLIDAY"),
                message: holiday
            })
        }
        this.setting.getHoliday = async () => {
            this.settingComponent.view.start()
            const saveHolidayAction = () => {
                let year = new Date().getFullYear()
                $http.get({
                    url: `http://timor.tech/api/holiday/year/${year}/`,
                    handler: response => {
                        if (response.error) {
                            $ui.error(response.error)
                            this.settingComponent.view.cancel()
                            return
                        }
                        $file.write({
                            data: $data({ string: JSON.stringify(response.data) }),
                            path: this.holidayPath
                        })
                        this.settingComponent.view.done()
                    }
                })
            }
            if ($file.exists(this.holidayPath)) {
                $ui.alert({
                    title: $l10n("HOLIDAY_ALREADY_EXISTS"),
                    actions: [
                        {
                            title: $l10n("OK"),
                            handler: saveHolidayAction
                        },
                        {
                            title: $l10n("CANCEL"),
                            handler: () => { this.settingComponent.view.cancel() }
                        }
                    ]
                })
            } else { saveHolidayAction() }
            return
        }
    }
}

module.exports = CalendarSetting