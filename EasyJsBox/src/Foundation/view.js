class BaseView {
    constructor(kernel) {
        this.kernel = kernel
        // 通用样式
        this.blurStyle = $blurStyle.thinMaterial
        this.textColor = $color("primaryText", "secondaryText")
        this.linkColor = $color("systemLink")
    }

    init() { }

    setController(controller) {
        this.controller = controller
    }

    setDataCenter(dataCenter) {
        this.dataCenter = dataCenter
    }

    /**
     * 是否属于大屏设备
     */
    isLargeScreen() {
        return $device.info.screen.width > 500
    }

    /**
     * 页面标题
     * @param {*} id 标题id
     * @param {*} title 标题文本
     */
    headerTitle(id, title) {
        return {
            type: "view",
            info: { id: id, title: title }, // 供动画使用
            props: {
                height: 90
            },
            views: [{
                type: "label",
                props: {
                    id: id,
                    text: title,
                    textColor: this.textColor,
                    align: $align.left,
                    font: $font("bold", 35),
                    line: 1
                },
                layout: (make, view) => {
                    make.left.equalTo(view.super.safeArea).offset(20)
                    make.top.equalTo(view.super.safeAreaTop).offset(50)
                }
            }]
        }
    }

    /**
     * 重新设计$ui.push()
     * @param {Object} args 参数
     * {
            view: [],
            title: "",
            parent: "",
            navButtons: [],
            hasTopOffset: true,
            disappeared: () => { },
        }
     */
    push(args) {
        const navTop = 45,
            view = args.view,
            title = args.title !== undefined ? args.title : "",
            parent = args.parent !== undefined ? args.parent : $l10n("BACK"),
            navButtons = args.navButtons !== undefined ? args.navButtons : [{}, {}],
            hasTopOffset = args.hasTopOffset !== undefined ? args.hasTopOffset : true,
            disappeared = args.disappeared !== undefined ? args.disappeared : undefined
        $ui.push({
            props: {
                navBarHidden: true,
                statusBarStyle: 0
            },
            events: {
                disappeared: () => {
                    if (disappeared !== undefined) disappeared()
                },
                dealloc: () => {
                    if (disappeared !== undefined) disappeared()
                }
            },
            views: [
                {
                    type: "view",
                    views: view,
                    layout: hasTopOffset ? (make, view) => {
                        make.top.equalTo(view.super.safeAreaTop).offset(navTop)
                        make.bottom.width.equalTo(view.super)
                    } : $layout.fill
                },
                {
                    type: "view",
                    layout: (make, view) => {
                        make.left.top.right.inset(0)
                        make.bottom.equalTo(view.super.safeAreaTop).offset(navTop)
                    },
                    views: [
                        { // blur
                            type: "blur",
                            props: { style: this.blurStyle },
                            layout: $layout.fill
                        },
                        { // canvas
                            type: "canvas",
                            layout: (make, view) => {
                                make.top.equalTo(view.prev.bottom)
                                make.height.equalTo(1 / $device.info.screen.scale)
                                make.left.right.inset(0)
                            },
                            events: {
                                draw: (view, ctx) => {
                                    let width = view.frame.width
                                    let scale = $device.info.screen.scale
                                    ctx.strokeColor = $color("gray")
                                    ctx.setLineWidth(1 / scale)
                                    ctx.moveToPoint(0, 0)
                                    ctx.addLineToPoint(width, 0)
                                    ctx.strokePath()
                                }
                            }
                        },
                        { // view
                            type: "view",
                            layout: (make, view) => {
                                make.top.equalTo(view.super.safeAreaTop)
                                make.bottom.width.equalTo(view.super)
                            },
                            views: [
                                { // 返回按钮
                                    type: "button",
                                    props: {
                                        bgcolor: $color("clear"),
                                        symbol: "chevron.left",
                                        tintColor: this.linkColor,
                                        title: ` ${parent}`,
                                        titleColor: this.linkColor,
                                        font: $font("bold", 16)
                                    },
                                    layout: (make, view) => {
                                        make.left.inset(10)
                                        make.centerY.equalTo(view.super)
                                    },
                                    events: {
                                        tapped: () => { $ui.pop() }
                                    }
                                },
                                {
                                    type: "label",
                                    props: {
                                        text: title,
                                        font: $font("bold", 17)
                                    },
                                    layout: (make, view) => {
                                        make.center.equalTo(view.super)
                                    }
                                }
                            ].concat(navButtons)
                        },
                    ]
                }
            ]
        })
    }

    /**
     * 用于创建一个靠右侧按钮（自动布局）
     * @param {String} id 不可重复
     * @param {String} symbol symbol图标（目前只用symbol）
     * @param {CallableFunction} tapped 按钮点击事件，会传入两个函数，start()和done(status, message)
     *     调用 start() 表明按钮被点击，准备开始动画
     *     调用 done() 表明您的操作已经全部完成，默认操作成功完成，播放一个按钮变成对号的动画
     *                 若第一个参数传出false则表示运行出错
     *                 第二个参数为错误原因($ui.toast(message))
     *      调用 cancel() 表示取消操作
     *     示例：
     *      (start, done, cancel) => {
     *          start()
     *          const upload = (data) => { return false }
     *          if(upload(data)) { done() }
     *          else { done(false, "Upload Error!") }
     *      }
     */
    navButton(id, symbol, tapped, hidden) {
        const actionStart = () => {
            // 隐藏button，显示spinner
            let button = $(id)
            button.alpha = 0
            button.hidden = true
            $("spinner-" + id).alpha = 1
        }

        const actionDone = (status = true, message = $l10n("ERROR")) => {
            $("spinner-" + id).alpha = 0
            let button = $(id)
            button.hidden = false
            if (!status) { // 失败
                $ui.toast(message)
                button.alpha = 1
                return
            }
            // 成功动画
            button.symbol = "checkmark"
            $ui.animate({
                duration: 0.6,
                animation: () => {
                    button.alpha = 1
                },
                completion: () => {
                    setTimeout(() => {
                        $ui.animate({
                            duration: 0.4,
                            animation: () => {
                                button.alpha = 0
                            },
                            completion: () => {
                                button.symbol = symbol
                                $ui.animate({
                                    duration: 0.4,
                                    animation: () => {
                                        button.alpha = 1
                                    },
                                    completion: () => {
                                        button.alpha = 1
                                    }
                                })
                            }
                        })
                    }, 600)
                }
            })
        }

        const actionCancel = () => {
            $("spinner-" + id).alpha = 0
            let button = $(id)
            button.alpha = 1
            button.hidden = false
        }

        return {
            type: "view",
            props: { id: id },
            views: [
                {
                    type: "button",
                    props: {
                        id: id,
                        hidden: hidden,
                        tintColor: this.textColor,
                        symbol: symbol,
                        bgcolor: $color("clear")
                    },
                    events: {
                        tapped: () => {
                            tapped(actionStart, actionDone, actionCancel)
                        }
                    },
                    layout: $layout.fill
                },
                {
                    type: "spinner",
                    props: {
                        id: "spinner-" + id,
                        loading: true,
                        alpha: 0
                    },
                    layout: $layout.fill
                }
            ],
            layout: (make, view) => {
                make.height.equalTo(view.super)
                if (view.prev && view.prev.id !== "label") {
                    make.right.equalTo(view.prev.left).offset(-20)
                } else {
                    make.right.inset(20)
                }
            }
        }
    }
}

module.exports = BaseView