"use strict"

var DemiseUI = UIBase.extend({
    ctor:function () {
        this._super();
        this.resourceFilename = "res/ui/DemiseUI.json";
    },

    show_by_info:function (club_id) {
        if(!h1global.player().club_entity_dict[club_id]){return}
        this.club = h1global.player().club_entity_dict[club_id];
        this.show();
    },

    initUI:function () {
        var self = this;
        this.mem_page_index = 0;
        this.apply_page_index = 0;
        this.page_show_num = 5;
        this.rootUINode.getChildByName("player_panel").getChildByName("back_btn").addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                self.hide()
            }
        });
        h1global.player().clubOperation(const_val.CLUB_OP_GET_MEMBERS, this.club.club_id)
    },

    update_club_member:function (member_list) {
        cc.error("member_list", member_list)
        if(!this.is_show){return;}
        var self = this;
        this.club.members = member_list;
        var player_panel = this.rootUINode.getChildByName("player_panel");
        var member_panel = player_panel.getChildByName("member_panel");

        var title_panel = member_panel.getChildByName("title_panel");
        var info_panel = member_panel.getChildByName("info_panel");

        if(this.mem_page_index >= Math.ceil(member_list.length/this.page_show_num) && this.mem_page_index > 0){
            this.mem_page_index -= 1;
        }

        var show_list = member_list.slice(this.mem_page_index * this.page_show_num, this.mem_page_index * this.page_show_num + this.page_show_num);

        function update_page() {
            title_panel.getChildByName("page_progress_label").setString((self.mem_page_index+1).toString() + "/" + Math.ceil(member_list.length/self.page_show_num).toString())
        }

        title_panel.getChildByName("last_page_btn").addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                if(self.mem_page_index <= 0){
                    return
                }
                self.mem_page_index -= 1;
                update_page();
                var show_list = member_list.slice(self.mem_page_index * self.page_show_num, self.mem_page_index * self.page_show_num + self.page_show_num);
                self.update_member_page(info_panel, show_list)
            }
        });

        title_panel.getChildByName("next_page_btn").addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                if(self.mem_page_index + 1 >= Math.ceil(member_list.length/self.page_show_num)){
                    return
                }
                self.mem_page_index += 1;
                update_page();
                var show_list = member_list.slice(self.mem_page_index * self.page_show_num, self.mem_page_index * self.page_show_num + self.page_show_num);
                self.update_member_page(info_panel, show_list)
            }
        });
        update_page();
        this.update_member_page(info_panel, show_list)
    },

    update_member_page:function (info_panel, show_list) {
        if(!this.is_show){return;}
        var self = this;

        function update_item_func(itemPanel, itemData, index){
            if(index%2 === 1){
                itemPanel.getChildByName("light_img").setVisible(false);
            } else {
                itemPanel.getChildByName("light_img").setVisible(true);
            }
            var head_img_frame = itemPanel.getChildByName("head_img_frame");

            itemPanel.reorderChild(itemPanel.getChildByName("light_img"), head_img_frame.getLocalZOrder()-10);

            cutil.loadPortraitTexture(itemData["head_icon"], itemData["sex"], function(img){
                if(self && self.is_show){
                    if(itemPanel.getChildByName("head_icon")){
                        itemPanel.removeChild(itemPanel.getChildByName("head_icon"))
                    }
                    var portrait_sprite  = new cc.Sprite(img);
                    portrait_sprite.setScale(52/portrait_sprite.getContentSize().width);
                    itemPanel.addChild(portrait_sprite);
                    portrait_sprite.setPosition(head_img_frame.getPosition());
                    portrait_sprite.setName("head_icon");
                    itemPanel.reorderChild(portrait_sprite, head_img_frame.getLocalZOrder()-1)
                }
            });

            itemPanel.getChildByName("name_label").setString(itemData["nickname"]);
            itemPanel.getChildByName("id_label").setString(itemData["userId"]);
            itemPanel.getChildByName("time_label").setString(cutil.convert_timestamp_to_ymd(itemData["ts"]));
            itemPanel.getChildByName("mark_label").setString(itemData["notes"]);


            itemPanel.getChildByName("demise_btn").addTouchEventListener(function (sender, eventType) {
                if(eventType === ccui.Widget.TOUCH_ENDED){
                    if(h1global.curUIMgr.confirm_ui && !h1global.curUIMgr.confirm_ui.is_show && self.club.club_id) {
                        h1global.curUIMgr.confirm_ui.show_by_info("确定转让亲友圈给" + itemData["nickname"] +"?双方将强制退出游戏", function () {
                            h1global.player().clubOperation(const_val.CLUB_OP_DEMISE, self.club.club_id, [itemData["userId"]]);
                        });
                    }
                }
            });
            if(h1global.player().userId === self.club.owner.userId){
                if(self.club.owner.userId === itemData.userId){
                    itemPanel.getChildByName("demise_btn").setVisible(false);
                }else{
                    itemPanel.getChildByName("demise_btn").setVisible(true);
                }
            }else{
                itemPanel.getChildByName("demise_btn").setVisible(false);
            }
        }
        UICommonWidget.update_panel_items(info_panel, show_list, update_item_func)
    },
});