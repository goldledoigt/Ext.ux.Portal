var PORTAL;

Ext.onReady(function() {

    Ext.QuickTips.init();

    var ddGroup = "PortalDD";

    var addWidget = function(win, record) {
        win.close();
        portal.addItems([Ext.apply(record.get("config"), {itemId:record.get("id")})]);
    }

    var setGroups = function(view) {
        groupsPanel.removeAll();
        var groups = view.store.collect("group");
        var l = groups.length;
        if (l) {
            groupsPanel.body.addClass("chanel-filters-panel");
            var items = [{xtype:"label", text:"FILTERS:", margins:'0 10 0 0'}];
            var defaults = {xtype:"button"/*, scope:view*/};
            for (var i = 0; i < l; i++) {
                items.push(Ext.apply({
                    text:groups[i].toUpperCase()
                    ,handler:onGroupClick.createDelegate(view, [groups[i]], true)
                }, defaults));
            }
            groupsPanel.add(items);
            onGroupClick.call(view, groupsPanel.items.items[1], false, groups[0]);
        } else {
            groupsPanel.body.removeClass("chanel-filters-panel");
        }
        // groupsPanel.ownerCt.doLayout();
        // groups = groupsPanel.body.select(".group-link");
        // if (l) {
        //     groups.on("click", onGroupClick, view);

        // }
    }

    var onGroupClick = function(btn, e, group) {
        groupsPanel.body.select("button").removeClass("selected");
        if (btn.rendered)
            btn.btnEl.addClass("selected");
        else btn.on({
            render:function() {
                this.btnEl.addClass("selected");
            }
        })
        this.store.filter("group", group);
    }

    var onLinkClick = function(e, el) {
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
        var node = settingsDataView.getSelectedNodes()[0];
        var count = Ext.fly(node).getAttribute("colcount");
        portal.changeColumnsCount(count);
    }

    var onWidgetSelect = function() {
        var node = widgetsDataView.getSelectedNodes()[0];
        if (!node) return;
        var id = Ext.fly(node).getAttribute("widgetId");
        var store = widgetsDataView.store;
        var record = store.getAt(store.find("id", id));
        var win = new Ext.Window({
            height:130
            ,width:265
            ,title:"Add Widget"
            ,modal:true
            ,html:new Ext.Template(
                '<div class="widget-window" style="background:url({icon}) no-repeat scroll 0 0 transparent;">'
                ,'<div class="widget-window-title">{label}</div>'
                ,'<div class="widget-window-info">{info}</div>'
                ,'<div class="green-button" onclick="">Add to my space</div>'
                ,'</div>'
            ,{compiled:true}).apply(record.data)
            ,listeners:{
                close:function() {
                    button.un("click", addWidget);
                }
            }
        }).show();
        var button = win.body.select(".green-button");
        button.on("click", addWidget.createDelegate(this, [win, record]));
    }

    var toggleMenuVisibility = function(btn, pressed, itemIndex) {
        var rendered = true;
        var view = viewsPanel.items.items[itemIndex];
        if (pressed && (northPanel.hidden || northPanel.collapsed)) {
            northPanel.expand();
            rendered = false;
        }
        else if (!pressed) {
            northPanel.collapse();
        }
        view.store.clearFilter();
        setGroups(view);
        northPanel.ownerCt.doLayout();
        viewsPanel.getLayout().setActiveItem(itemIndex);
        if (rendered) {
            var animEl = viewsPanel.body.select(".images-view");
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
/*
    var settingsDataView = new Ext.DataView({
        cls:"images-view"
        ,autoHeight:true
        ,singleSelect:true
        ,overClass:'x-view-over'
        ,itemSelector:'div.thumb-wrap'
        ,emptyText:'No settings'
        ,store:new Ext.data.JsonStore({
            fields:["name", "icon", "colcount"]
            ,data:[
                {name:"1 Column", icon:"http://www.netvibes.com/themes/base/img/flexilayout/1/0.png?v=564", colcount:1}
                ,{name:"2 Columns", icon:"http://www.netvibes.com/themes/base/img/flexilayout/2/0.png?v=564", colcount:2}
                ,{name:"3 Columns", icon:"http://www.netvibes.com/themes/base/img/flexilayout/3/0.png?v=564", colcount:3}
            ]
        })
        ,tpl:new Ext.XTemplate(
    		'<tpl for=".">',
                '<div class="thumb-wrap" colcount={colcount}>',
    		    '<div class="thumb"><img src="{icon}" title="{name}"></div>',
    		    '<span class="x-editable">{name}</span></div>',
            '</tpl>',
            '<div class="x-clear"></div>'
    	)
    	,listeners: {
            selectionchange:onSettingsSelect
            ,show:function(view) {
                view.select(portal.columnCount-1, false, true);
            }
        }
    });

    var widgetsDataView = new Ext.DataView({
        cls:"images-view"
        ,autoHeight:true
        ,multiSelect:true
        ,overClass:'x-view-over'
        ,itemSelector:'div.thumb-wrap'
        ,emptyText:'No widgets to display'
        ,store:new Ext.data.JsonStore({
            autoLoad:true
            ,url:"php/get-widgets.php"
            ,fields:["id", "label", "config", "icon", "info", "group", "type"]
        })
        ,tpl:new Ext.XTemplate(
    		'<tpl for=".">',
                '<div class="thumb-wrap" widgetId="{id}">',
    		    '<div class="thumb"><img src="{icon}" title="{label}"></div>',
    		    '<span class="x-editable">{label}</span></div>',
            '</tpl>',
            '<div class="x-clear"></div>'
    	)
        ,listeners: {
            selectionchange:onWidgetSelect
        }
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
        ,emptyText: 'No sites to display'
    });
*/
    var toolbar = new Ext.Toolbar({
        items:[{
            text:"remove all"
            ,handler:function() {
                portal.removeAllItems();
            }
        }, "->", {
            nbColumns:1
            ,scope:this
            ,allowDepress:false
            ,enableToggle:true
            ,iconCls:"icon-column-1"
            ,pressed:false
            ,toggleGroup:"changeColumnsCount"
            ,handler:function(btn) {
                portal.changeColumnsCount(btn.nbColumns);
            }
        }, "-", {
            nbColumns:2
            ,scope:this
            ,allowDepress:false
            ,enableToggle:true
            ,iconCls:"icon-column-2"
            ,pressed:false
            ,toggleGroup:"changeColumnsCount"
            ,handler:function(btn) {
                portal.changeColumnsCount(btn.nbColumns);
            }
        }, "-", {
            nbColumns:3
            ,scope:this
            ,allowDepress:false
            ,enableToggle:true
            ,iconCls:"icon-column-3"
            ,pressed:true
            ,toggleGroup:"changeColumnsCount"
            ,handler:function(btn) {
                portal.changeColumnsCount(btn.nbColumns);
            }
        }]
    });

    var portal = new Ext.ux.Portal({
        region:"center"
	,tbar:toolbar
	,onNodeOver:onNodeOver
	,onNodeDrop:onNodeDrop
        ,url:"php/controller.php"
    });

    new Ext.Viewport({
        layout:"border"
	,items:[tree, portal]
    });

});