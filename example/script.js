var PORTAL;

Ext.onReady(function() {

    Ext.QuickTips.init();

    var ddGroup = "PortalDD";

    var handleLinkClick = function(e, el) {
        el = Ext.get(el);
        var status = parseInt(el.getAttribute("status"));
        var itemIndex = parseInt(el.getAttribute("itemIndex"));
        links.removeClass("pressed");
        el.addClass(!status ? "pressed" : "");
        toggleMenuVisibility(el, !status, itemIndex);
        links.set({status:0}, true);
        el.set({status:(status > 0 ? 0 : 1)}, true);
    }

    var onSettingsSelect = function() {
        var node = settingsDataView.getSelectedNodes();
        console.log("onSettingsSelect", arguments, node, node.id);
    }

    var toggleMenuVisibility = function(btn, pressed, itemIndex) {
        var rendered = true;
        if (pressed && northPanel.hidden) {
            northPanel.show();
            rendered = false;
        }
        else if (!pressed) northPanel.hide();
        northPanel.getLayout().setActiveItem(itemIndex);
        northPanel.ownerCt.doLayout();
        if (rendered) {
            var animEl = northPanel.body.select(".images-view");
            animEl.hide();
            animEl.slideIn("t", {stopFx:true, duration:.3});
        }
    }

    var onNodeOver = function(target, dd, e, data) {
        var node = data.node;
        if (node.isLeaf()) {
            if (portal.itemExists(node.attributes.portlet.itemId))
                return false;
        } else {
            var nodes = node.childNodes, p, count = 0;
            for (var i = 0, l = nodes.length; i < l; i++) {
                p = nodes[i].attributes.portlet;
                if (!portal.itemExists(p.itemId))
                    count++;
            }
            if (count === 0) return false;
        }
        return Ext.dd.DropZone.prototype.dropAllowed;
    };

    var onNodeDrop = function (target, dd, e, data) {
        var node = data.node, nodes, portlets, p;
        if (node.isLeaf()) {
            portlets = data.node.attributes.portlet;
            if (portal.itemExists(portlets.itemId))
                return false;
            if (!Ext.isArray(portlets)) portlets = [portlets];
        } else {
            portlets = [];
            nodes = node.childNodes;
            for (var i = 0, l = nodes.length; i < l; i++) {
                if (p = nodes[i].attributes.portlet) {
                    if (!Ext.isArray(p)) p = [p];
                    for (var j = 0, k = p.length; j < k; j++) {
                        if (!portal.itemExists(p[j].itemId))
                            portlets.push(p[j]);
                    }
                }
            }
        }
        if (portlets && portlets.length) {
            portal.addItems(portlets);
            return true;
        } return false;
    };
/*
    var tree = new Ext.tree.TreePanel({
        useArrows:true
        ,title:"Drop a node over the portal >>"
        ,autoScroll:true
        ,dataUrl:"php/get-nodes.php"
        ,rootVisible:false
        ,enableDrag:true
        ,ddGroup:ddGroup
        ,region:"west"
        ,split:true
        ,width:190
        ,root:{
            nodeType:"async"
            ,expanded:true
        }
    });
*/

    var settingsDataView = new Ext.DataView({
        cls:"images-view"
        ,autoHeight:true
        ,singleSelect:true
        ,overClass:'x-view-over'
        ,itemSelector:'div.thumb-wrap'
        ,emptyText:'No settings'
        ,store:new Ext.data.JsonStore({
            fields:['name', 'url']
            ,data:[
                {name:"1 Column", url:"http://www.netvibes.com/themes/base/img/flexilayout/1/0.png?v=564"}
                ,{name:"2 Columns", url:"http://www.netvibes.com/themes/base/img/flexilayout/2/0.png?v=564"}
                ,{name:"3 Columns", url:"http://www.netvibes.com/themes/base/img/flexilayout/3/0.png?v=564"}
            ]
        })
        ,tpl:new Ext.XTemplate(
    		'<tpl for=".">',
                '<div class="thumb-wrap" id="{name}">',
    		    '<div class="thumb"><img src="{url}" title="{name}"></div>',
    		    '<span class="x-editable">{name}</span></div>',
            '</tpl>',
            '<div class="x-clear"></div>'
    	)
    	,listeners: {
            selectionchange:onSettingsSelect
        }
    });

    var widgetDataView = new Ext.DataView({
        cls:"images-view"
        ,store:new Ext.data.JsonStore({
            fields:['name', 'url']
            ,data:[
                {name:"Meteo Widget", url:"http://eco.netvibes.com/img/thumbnail/ginger/4/f/1/4f141a6966a6ab93216338312af721a8-64-48.png?v=1272016337"}
                ,{name:"Notes Widget", url:"http://eco.netvibes.com/img/thumbnail/ginger/4/e/2/4e2a7fe47dedf578fe303ee06b0bb150-64-48.png?v=1260964812"}
                ,{name:"Tasks Widget", url:"http://eco.netvibes.com/img/thumbnail/ginger/8/7/e/87ef5f41ec84e7d16b9177a6b2e77dbd-64-48.png?v=1260965664"}
                ,{name:"Calendar Widget", url:"http://eco.netvibes.com/img/thumbnail/ginger/7/5/5/755d9e1c1fdd5060c6aa03095ef9410c-64-48.png?v=1260965490"}
            ]
        })
        ,tpl:new Ext.XTemplate(
    		'<tpl for=".">',
                '<div class="thumb-wrap" id="{name}">',
    		    '<div class="thumb"><img src="{url}" title="{name}"></div>',
    		    '<span class="x-editable">{name}</span></div>',
            '</tpl>',
            '<div class="x-clear"></div>'
    	)
        ,autoHeight:true
        ,multiSelect: true
        ,overClass:'x-view-over'
        ,itemSelector:'div.thumb-wrap'
        ,emptyText: 'No images to display'
    });

    var accessDataView = new Ext.DataView({
        cls:"images-view"
        ,store:new Ext.data.JsonStore({
            fields:['name', 'url']
            ,data:[
                {name:"First Site", url:"http://blog.eches.net/wp-content/uploads/2009/04/ginic-thumbnail-preview.jpg"}
                ,{name:"Second Site", url:"http://img694.imageshack.us/img694/2359/vasedenoces2.jpg"}
                ,{name:"Third Site", url:"http://www.motocms.com/wp-content/uploads/2010/06/flash-cms-template-28533.jpg"}
            ]
        })
        ,tpl:new Ext.XTemplate(
    		'<tpl for=".">',
                '<div class="thumb-wrap" id="{name}">',
    		    '<div class="thumb"><img src="{url}" title="{name}"></div>',
    		    '<span class="x-editable">{name}</span></div>',
            '</tpl>',
            '<div class="x-clear"></div>'
    	)
        ,autoHeight:true
        ,multiSelect: true
        ,overClass:'x-view-over'
        ,itemSelector:'div.thumb-wrap'
        ,emptyText: 'No images to display'
        // ,plugins:[
        //     new Ext.DataView.DragSelector(),
        //     new Ext.DataView.LabelEditor({dataIndex: 'name'})
        // ]
        // ,prepareData:function(data){
        //     data.shortName = Ext.util.Format.ellipsis(data.name, 15);
        //     data.sizeString = Ext.util.Format.fileSize(data.size);
        //     data.dateString = data.lastmod.format("m/d/Y g:i a");
        //     return data;
        // }
    });

    // var toolbar = new Ext.Toolbar({
    //     items:[{
    //         text:"remove all"
    //         ,handler:function() {
    //             portal.removeAllItems();
    //         }
    //     }, "->", {
    //         nbColumns:1
    //         ,scope:this
    //         ,allowDepress:false
    //         ,enableToggle:true
    //         ,iconCls:"icon-column-1"
    //         ,pressed:false
    //         ,toggleGroup:"changeColumnsCount"
    //         ,handler:function(btn) {
    //             portal.changeColumnsCount(btn.nbColumns);
    //         }
    //     }, "-", {
    //         nbColumns:2
    //         ,scope:this
    //         ,allowDepress:false
    //         ,enableToggle:true
    //         ,iconCls:"icon-column-2"
    //         ,pressed:false
    //         ,toggleGroup:"changeColumnsCount"
    //         ,handler:function(btn) {
    //             portal.changeColumnsCount(btn.nbColumns);
    //         }
    //     }, "-", {
    //         nbColumns:3
    //         ,scope:this
    //         ,allowDepress:false
    //         ,enableToggle:true
    //         ,iconCls:"icon-column-3"
    //         ,pressed:true
    //         ,toggleGroup:"changeColumnsCount"
    //         ,handler:function(btn) {
    //             portal.changeColumnsCount(btn.nbColumns);
    //         }
    //     }]
    // });

    var portal = new Ext.ux.Portal({
        title:"My Space"
        ,url:"php/controller.php"
        // ,tbar:toolbar
        ,ddGroup:ddGroup
        ,onNodeDrop:onNodeDrop
        ,onNodeOver:onNodeOver
    });

    var htmlPanel = new Ext.Panel({
        layout:"fit"
        ,title:"Corporate"
        ,border:false
        ,html:'<iframe src="http://www.chanel.com/fr_FR/" width="100%" height="100%" frameborder="0"></iframe>'
    });

    var centerPanel = new Ext.TabPanel({
        activeTab:0
        ,region:"center"
        ,border:false
        ,margins:"30 0 0 0"
        // ,bodyStyle:"margin-top:30px"
        // ,padding:"30 0 0 0"
        // ,style:"background-color:white"
        ,items:[htmlPanel, portal]
    });

    var northPanel = new Ext.Panel({
        region:"north"
        // ,layout:"border"
        // ,height:200
        ,border:false
        ,items:[accessDataView, widgetDataView, settingsDataView]
        // ,hidden:true
        ,bodyStyle:"background-color:black"
        ,layout:"card"
        ,height:120
        ,hidden:true
    });

    // var centerPanel = new Ext.Panel({
    //     region:"center"
    //     ,layout:"border"
    //     // ,height:200
    //     // ,items:[accessDataView, widgetDataView, settingsDataView]
    //     ,hidden:true
    //     ,bodyStyle:"border-width:0 0 1px 0"
    // });

    var headPanel = new Ext.Panel({
        region:"north"
        ,border:false
        ,height:70
        ,bodyStyle:"background-color:black"
        ,contentEl:"header"
    });

    var bodyPanel = new Ext.Panel({
        layout:"border"
        ,region:"center"
        ,border:false
        ,bodyStyle:"background-color:white"
        ,items:[northPanel, centerPanel]
    });

    new Ext.Viewport({
        layout:"border"
        ,items:[headPanel, bodyPanel]
    });

    PORTAL = portal;

    var links = Ext.select(".header-link");
    links.on("click", handleLinkClick)

});