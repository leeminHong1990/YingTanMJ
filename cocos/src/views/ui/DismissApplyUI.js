"use strict"

var DismissApplyUI = UIBase.extend({
    ctor:function () {
        this._super();
        this.resourceFilename = "res/ui/DismissApplyUI.json";
    },

    show_by_info:function (club_id) {
        this.club = h1global.player().club_entity_dict[club_id];
        if(!this.club){
            return
        }
        this.show();
    },

    initUI:function () {
        var self = this;
        this.rootUINode.getChildByName("dismiss_panel").getChildByName("close_btn").addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                self.hide();
            }
        });
        this.update_msg(this.club.club_id, this.club.dismiss_apply_list)
    },

    update_msg:function (club_id, msg_list) {
        if(this.club.club_id !== club_id){return;}
        let msg_scroll = this.rootUINode.getChildByName("dismiss_panel").getChildByName("msg_scroll");
        function update_panel_func(item, data, i) {
            var msg_label = item.getChildByName("msg_label");
            var agree_btn = item.getChildByName("agree_btn");
            var refuse_btn = item.getChildByName("refuse_btn");
            msg_label.setString((data["table_index"] + 1).toString() + "号桌玩家申请解散");
            agree_btn.addTouchEventListener(function (sender, eventType) {
                if(eventType === ccui.Widget.TOUCH_ENDED){
                    h1global.player().clubOperation(const_val.CLUB_OP_PRODDUCE_DISMISS, club_id,[data["table_index"], 1])
                }
            });

            refuse_btn.addTouchEventListener(function (sender, eventType) {
                if(eventType === ccui.Widget.TOUCH_ENDED){
                    h1global.player().clubOperation(const_val.CLUB_OP_PRODDUCE_DISMISS, club_id,[data["table_index"], 0])
                }
            });
        }
        UICommonWidget.update_scroll_items(msg_scroll, msg_list, update_panel_func)
    },
});