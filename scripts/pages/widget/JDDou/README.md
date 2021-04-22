# 京东豆小组件

> 读取 boxjs 缓存, boxjs 需要使用代理缓存。也可以自行抓包获取 cookie

> 多个账号，在组件列表左滑动组件，复制设置组件信息即可


### 京东多账号重写
```
===================
特别说明：
1.获取多个京东cookie文件，不和野比大佬的文件冲突。暂不支持野比大佬脚本签到。
2.若是要使用京东多合一签到，请使用修改版地址：https://raw.githubusercontent.com/dompling/Script/master/jd/JD_extra_sign.js
===================
===================
使用方式：复制 https://home.m.jd.com/myJd/newhome.action 到浏览器打开 ，在个人中心自动获取 cookie，
若弹出成功则正常使用。否则继续再此页面继续刷新一下试试
===================

===================
[MITM]
hostname = me-api.jd.com

【Surge脚本配置】:
===================
[Script]
获取京东Cookie = type=http-request,pattern=^https:\/\/me-api\.jd\.com\/user_new\/info\/GetJDUserInfoUnion,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/dompling/Script/master/jd/JD_extra_cookie.js,script-update-interval=0

===================
【Loon脚本配置】:
===================
[Script]
http-request ^https:\/\/me-api\.jd\.com\/user_new\/info\/GetJDUserInfoUnion tag=获取京东Cookie, script-path=https://raw.githubusercontent.com/dompling/Script/master/jd/JD_extra_cookie.js

===================
【 QX  脚本配置 】 :
===================

[rewrite_local]
^https:\/\/me-api\.jd\.com\/user_new\/info\/GetJDUserInfoUnion  url script-request-header https://raw.githubusercontent.com/dompling/Script/master/jd/JD_extra_cookie.js

```