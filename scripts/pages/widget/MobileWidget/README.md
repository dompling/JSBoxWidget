# 小组件

> 目前支持中国电信、中国联通

> 多个账号，在组件列表左滑动组件，复制设置组件信息即可

## 电信 cookie 获取方式

```
打开天翼账号中心，获取cookie；

运行脚本，点击基础设置-->BoxJS域名，设置为你自己的BoxJS域名，再次运行脚本，选择代理缓存，获取缓存cookie；

无代理缓存的，请使用Stream类抓包APP进行手动抓包，获取cookie后填入脚本内注释位置或运行脚本——>账户设置——>手动输入；

脚本内提供网站登录获取cookie，无代理缓存的可尝试网站登录获取cookie


# quantumultx
 [rewrite_local]
 ^https?:\/\/e\.189\.cn\/store\/user\/package_detail\.do url script-request-header telecomInfinity.js
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Loon
[Script]
http-request ^https?:\/\/e\.189\.cn\/store\/user\/package_detail\.do script-path=https://raw.githubusercontent.com/Sunert/Scripts/master/Task/telecomSky.js, timeout=10, tag=中国电信套餐

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 
# Surge 4.0 :
[Script]
电信套餐查询 = script-path=https://raw.githubusercontent.com/Sunert/Scripts/master/Task/telecomInfinity.js,type=http-request,pattern=https?:\/\/e\.189\.cn\/store\/user\/package_detail\.do
~~~~~~~~~~~~~~~~~~~~~


 # MITM
hostname = e.189.cn
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
