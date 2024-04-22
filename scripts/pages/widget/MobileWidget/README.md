# 小组件

> 目前支持中国电信、中国联通

> 多个账号，在组件列表左滑动组件，复制设置组件信息即可

## 电信 cookie 获取方式

```
获取方式：打开  https://e.dlife.cn/index.do 登录
===================
[MITM]
hostname = e.dlife.cn

【Surge脚本配置】:
===================
[Script]
电信登录地址 = type=http-request,pattern=^https:\/\/e\.dlife\.cn\/user\/loginMiddle,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/dompling/Script/master/10000/index.js,script-update-interval=0

===================
【Loon脚本配置】:
===================
[Script]
http-request ^https:\/\/e\.dlife\.cn\/user\/loginMiddle tag=电信登录地址, script-path=https://raw.githubusercontent.com/dompling/Script/master/10000/index.js

===================
【 QX  脚本配置 】 :
===================

[rewrite_local]
^https:\/\/e\.dlife\.cn\/user\/loginMiddle  url script-request-header https://raw.githubusercontent.com/dompling/Script/master/10000/index.js

```


## 联通 cookie 获取方式
```

获取方式：打开  中国联通 app 【官方版】-> 首页的流量查询获取 Cookie
===================
[MITM]
hostname = m.client.10010.com
【Surge脚本配置】:
===================
[Script]
联通 headers = type=http-request,pattern=https:\/\/m\.client\.10010\.com\/mobileserviceimportant\/smart\/smartwisdomCommon,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/dompling/Script/master/10010/index.js,script-update-interval=0
===================
【Loon脚本配置】:
===================
[Script]
http-request https:\/\/m\.client\.10010\.com\/mobileserviceimportant\/smart\/smartwisdomCommon tag=联通 headers, script-path=https://raw.githubusercontent.com/dompling/Script/master/10010/index.js
===================
【 QX  脚本配置 】 :
===================
[rewrite_local]
https:\/\/m\.client\.10010\.com\/mobileserviceimportant\/smart\/smartwisdomCommon  url script-request-header https://raw.githubusercontent.com/dompling/Script/master/10010/index.js

```
