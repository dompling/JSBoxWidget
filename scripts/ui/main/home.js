const EditorUI = require("./editor")

class HomeUI {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
        this.editor = new EditorUI(this.kernel, this.factory)
    }

    getViews() {
        return [
            {
                type: "view",
                layout: $layout.fill,
                views: [
                    {
                        type: "label",
                        props: {
                            text: "对的，现在只有日历Widget",
                            align: $align.center
                        },
                        layout: $layout.fill
                    }
                ]
            }
        ]
    }
}

module.exports = HomeUI