const NAME = "Calendar"
const Setting = require("../setting")

class CalendarSetting extends Setting {
    constructor(kernel) {
        super(kernel, NAME)
        this.path = `${this.kernel.widgetAssetsPath}/${NAME}`
        if (!$file.exists(this.path)) {
            $file.mkdir(this.path)
        }
        this.holidayPath = `${this.path}/holiday.json`
        // 自动获取节假日信息，有效期7天
        this.getHoliday(1000 * 60 * 60 * 24 * 7)
    }

    /**
     * 获取节假日信息
     * @param {Number} life 缓存有效期，单位ms
     */
    async getHoliday(life) {
        const getHolidayAction = () => {
            let year = new Date().getFullYear()
            $http.get({
                url: `http://timor.tech/api/holiday/year/${year}/`,
                handler: response => {
                    if (response.error) {
                        $ui.error(response.error)
                        return
                    }
                    if (response.data.code !== 0) {
                        $ui.error($l10n("HOLIDAY_API_ERROR"))
                        return
                    }
                    let content = {
                        holiday: response.data.holiday,
                        date: new Date().getTime()
                    }
                    $file.write({
                        data: $data({ string: JSON.stringify(content) }),
                        path: this.holidayPath
                    })
                }
            })
        }
        if ($file.exists(this.holidayPath)) {
            let holiday = JSON.parse($file.read(this.holidayPath).string)
            if (new Date().getTime() - holiday.date > life) {
                getHolidayAction()
            }
        } else {
            getHolidayAction()
        }
    }

    initSettingMethods() {
        this.setting.clearHoliday = () => {
            this.settingComponent.view.start()
            let style = {}
            if ($alertActionType) {
                style = { style: $alertActionType.destructive }
            }
            $ui.alert({
                title: $l10n("CLEAR_HOLIDAY_DATA"),
                actions: [
                    Object.assign({
                        title: $l10n("CLEAR"),
                        handler: () => {
                            $file.delete(this.holidayPath)
                            this.settingComponent.view.done()
                        }
                    }, style),
                    {
                        title: $l10n("CANCEL"),
                        handler: () => { this.settingComponent.view.cancel() }
                    }
                ]
            })
        }
        /**
         * 用于设置页面手动获取节假日信息
         */
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
                        if (response.data.code !== 0) {
                            $ui.error($l10n("HOLIDAY_API_ERROR"))
                            this.settingComponent.view.cancel()
                            return
                        }
                        let content = {
                            holiday: response.data.holiday,
                            date: new Date().getTime()
                        }
                        $file.write({
                            data: $data({ string: JSON.stringify(content) }),
                            path: this.holidayPath
                        })
                        this.settingComponent.view.done()
                    }
                })
            }
            if ($file.exists(this.holidayPath)) {
                $ui.alert({
                    title: $l10n("HOLIDAY_ALREADY_EXISTS"),
                    message: $l10n("NO_NEED_TO_OBTAIN_MANUALLY"),
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