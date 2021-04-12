# Widget

## 复制

可复制一个 widget，用于多个 widget 使用。

## 删除

删除这个 widget。

```
{
    "title": "GENERAL",
    "items": [
      {
        "icon": ["clock.fill"],
        "title": "PRINT_TIME_CONSUMING",
        "type": "switch",
        "key": "isPrintTimeConsuming",
        "value": false
      },
      {
        "icon": ["arrow.2.circlepath", "#FF9900"],
        "title": "UPDATE_HOME_SCREEN_WIDGET_OPTIONS",
        "type": "script",
        "key": "updateHomeScreenWidgetOptions",
        "value": "this.controller.updateHomeScreenWidgetOptions"
      }
    ]
  },
  {
    "title": "BACKUP",
    "items": [
      {
        "icon": ["icloud.and.arrow.up.fill"],
        "title": "BACKUP_TO_ICLOUD",
        "type": "script",
        "key": "backup",
        "value": "this.controller.backupToICloud"
      },
      {
        "icon": ["arrow.clockwise.icloud.fill", "#FFCC33"],
        "title": "RECOVER_FROM_ICLOUD",
        "type": "script",
        "key": "recover",
        "value": "this.controller.recoverFromICloud"
      }
    ]
  },
```
