Ext.ns("Ext.ux");
var pof;
Ext.ux.Portal = Ext.extend(Ext.Panel, {

    ddGroup:"PortalDD"

    ,columnCount:3
    
    ,maxColumnCount:3

    ,url:false

    ,initComponent:function() {

        this.store = new Ext.util.MixedCollection();

        Ext.apply(this, {
            layout:"splitcolumn"
            ,autoScroll:true
            ,cls:"x-portal"
            ,defaultType:"portalcolumn"
            ,items:this.getColumnsConfig()
        });

        Ext.ux.Portal.superclass.initComponent.apply(this, arguments);

        this.addEvents({
            validatedrop:true
            ,beforedragover:true
            ,dragover:true
            ,beforedrop:true
            ,drop:true
            ,columncountchange:true
        });

        this.on({
            afterrender:function() {
                this.initDropZone();
                this.mask = new Ext.LoadMask(this.getEl(), {msgCls:"x-portal-mask-loading"});
                if (this.columnCount != this.maxColumnCount) {
                    var c = parseInt(this.columnCount);
                    this.columnCount = this.maxColumnCount;
                    this.changeColumnsCount(c, true);
                }
            }
            ,drop:this.onItemMove
            ,removeItem:this.onRemoveItem
            ,itemadd:this.onItemAdd
        });
        pof = this;
    }

    ,initEvents : function(){
        Ext.ux.Portal.superclass.initEvents.call(this);
        this.dd = new Ext.ux.Portal.DropZone(this, this.dropConfig);
    }

    ,beforeDestroy:function() {
        if (this.dd) this.dd.unreg();
        Ext.ux.Portal.superclass.beforeDestroy.call(this);
    }

    // ,loadItems:function() {
    //     var callback = function(options, success, response) {
    //         var items = Ext.decode(response.responseText).data;
    //         this.addItems(items, true);
    //     };
    //     Ext.Ajax.request({
    //         url:this.url
    //         ,scope:this
    //         ,params:{xaction:"getItems"}
    //         ,callback:callback
    //     });
    // }

    ,addItems:function(items, stopEvent) {
        if (!items) return false;
        items = Ext.isArray(items) ? items : [items];
        Ext.each(items, function(item, index) {
            this.store.add({
                columnIndex:item.columnIndex || false
                ,weight:item.weight || 0
                ,rendered:false
                ,widgetId:item.widgetId
                ,collapsed:item.collapsed || false
                ,items:item.config
                ,title:item.title || "Widget"
            });
        }, this);
        this.renderItems(stopEvent);
    }

    ,renderItems:function(stopEvent) {
        var items = this.store.filter("rendered", false);
        items.sort("ASC", function(a, b) {
            return a.weight - b.weight;
        });
        items.each(function(item) {
            this.renderItem(item, stopEvent);
        }, this);
        // this.getLayout().onResize();
    }

    ,renderItem:function(item, stopEvent) {
        var column = this.getItemColumn(item);
        var cmp = column.add(Ext.applyIf(item, {
            layout:"fit"
            // ,height:200
            ,listeners:{
                scope:this
                ,collapse:this.onItemToggle
                ,expand:this.onItemToggle
                ,close:this.onItemClose
                ,maximize:this.onItemMaximize
                ,saveconfig:this.onSaveConfig
            }
        }));
        item.rendered = true;
        column.doLayout();
        if (!stopEvent) {
            this.fireEvent("itemadd", cmp, item, column.ownerCt.items.indexOf(column), column.items.getCount() - 1);
        }
    }

    ,getItemColumn:function(item) {
        var colIndex;
        if (item.columnIndex && Ext.isNumber(parseInt(item.columnIndex)))
            colIndex = item.columnIndex;
        else {
            colIndex = this.getLightWeightColumn();
            item.columnIndex = colIndex;
        }
        return this.items.itemAt(colIndex);
    }

    ,getLightWeightColumn:function() {
        var index, count = false;
        this.items.each(function(item, i) {
            n = item.items.getCount();
            if (count === false || n < count)
                count = n, index = i;
        });
        return index;
    }

    ,removeAllItems:function() {
        var i;
        this.store.clear();
        this.items.each(function(column) {
            while (i = column.items.last())
                this.removeItem(i, column);
            column.doLayout();
        }, this);
    }

    ,removeItem:function(item, column) {
        if (!column) column = item.ownerCt;
        column.remove(item, true);
        this.fireEvent("removeitem", item);
    }

    ,onRemoveItem:Ext.emptyFn
    // ,onRemoveItem:function(item) {
    //     Ext.Ajax.request({
    //         url:this.url
    //         ,scope:this
    //         ,params:{
    //             xaction:"removeItem"
    //             ,id:item.widgetId
    //         }
    //     });
    // }

    ,initDropZone:function() {
        this.dropZone = new Ext.dd.DropZone(this.body, {
            ddGroup:this.ddGroup
            ,getTargetFromEvent:(function(e) {
                return this.body;
            }).createDelegate(this)
            ,onNodeOver:this.onNodeOver
            ,onNodeDrop:this.onNodeDrop
        });
    }

    ,getColumnsConfig:function() {
        var columns = [], style, width;
        for (var i = 0; i < this.maxColumnCount; i ++) {
            style = "padding:"+this.getColumnPadding(i)+";";
            width = 1/this.maxColumnCount;
            columns.push({
                columnWidth:width
                ,hideMode:"offsets"
                ,style:style
                ,items:[]
            });
        };
        return columns;
    }

    ,getColumnPadding:function(colIndex) {
        if (colIndex === 0)
            return "10px 2px 10px 10px";
        else if (colIndex < this.columnCount - 1)
            return "10px 2px 10px 5px";
        else return "10px 10px 10px 5px";
    }

    ,changeColumnsCount:function(n, stopEvent) {
        if (!this.rendered) return;
        if (this.columnCount > n) {
            var hiddenColumns = [];
            var availableColumns = [];
            this.items.each(function(c, index) {
                c.columnIndex = index;
                if (index + 1 > n) {
                    hiddenColumns.push(c);
                } else {
                    availableColumns.push(c);
                }
            }, this);
            this.hideColumns(hiddenColumns, availableColumns);
        } else {
            var shownColumns = [];
            var availableColumns = [];
            this.items.each(function(c, index) {
                if (index + 1 > this.columnCount && index + 1 <= n) {
                    shownColumns.push(c);
                } else {
                    availableColumns.push(c);
                }
            }, this);
            this.showColumns(shownColumns, availableColumns);
        }
        this.getLayout().onResize();

        this.columnCount = n;
        if (!stopEvent)
            this.fireEvent("columncountchange", this, this.columnCount);
    }

    ,showColumns:function(columns, availableColumns) {
        Ext.each(columns, function(c, index) {
            c.show();
            c.el.setWidth(c.visibleWidth);
            Ext.each(availableColumns, function(ac) {
                ac.items.each(function(item) {
                    if (item.columnIndex === c.columnIndex) {
                        this.moveItem(item, c);
                    }
                }, this);
            }, this);
        }, this);
        Ext.each(columns, function(c) {
            c.doLayout();
        });
        this.getLayout().onResize();
    }

    ,hideColumns:function(columns, availableColumns) {
        var items = [];
        Ext.each(columns, function(column, index) {
            column.items.each(function(item) {
                item.columnIndex = column.columnIndex;
                items.push(item);
            });
            if (column.el)
                column.visibleWidth = column.el.getWidth();
            else column.visibleWidth = 400;
            column.hide();
        }, this);
        Ext.each(items, function(item, index) {
            targetColumn = this.getTargetColumn(availableColumns);
            this.moveItem(item, targetColumn);
        }, this);
        Ext.each(availableColumns, function(c) {
            c.doLayout();
        });
    }

    ,getTargetColumn:function(availableColumns) {
        var col = null;
        var count = false;
        Ext.each(availableColumns, function(c) {
            if (count === false || count > c.items.items.length) {
                col = c;
                count = c.items.items.length;
            }
        });
        return col;
    }

    ,moveItem:function(item, column) {
        item.el.dom.parentNode.removeChild(item.el.dom);
        column.add(item);
        this.fireEvent("drop", {panel:item, columnIndex:column.columnIndex, weight:column.items.getCount()-1});
    }

    ,itemExists:function(widgetId) {
        var items = this.store.filter("widgetId", widgetId);
        return items.getCount();
    }

    ,resizeFullScreenItem:function(portal, width, height) {
        var size = this.getLayout().getLayoutTargetSize();
        size.height -= Ext.getScrollBarWidth();
        size.width -= Ext.getScrollBarWidth();
        this.fullScreenCmp.setSize(size);
        this.fullScreenCmp.doLayout();
    }

    ,onItemClose:function(item) {
        if (item.fullScreen)
            this.onItemMinimize(item);
        else this.removeItem(item);
    }

    ,onItemMinimize:function(item) {
        this.mask.hide();
        var el = item.getEl();
        var ctn = this.body.dom.firstChild;
        Ext.fly(ctn).setStyle("position", "relative");
        el.setStyle({position:"inherit", "z-index":0});
        this.un("bodyresize", this.resizeFullScreenItem);
        var parent = item.getEl().parent();
        item.fullScreen.width = parent.getWidth() - parent.getPadding("lr");
        item.setSize(item.fullScreen);
        item.getEl().frame();
        item.fullScreen = false;
        this.fullScreenCmp = false;
    }

    ,onItemMaximize:function(item) {
        if (item.collapsed) return;
        if (item.fullScreen) {
            this.onItemMinimize(item);
            return;
        }
        this.mask.show();
        var el = item.getEl();
        var firstColumnEl = this.items.itemAt(0).getEl();
        this.on("bodyresize", this.resizeFullScreenItem);
        item.fullScreen = item.getSize();
        var leftPadding = firstColumnEl.getPadding("l") - Ext.isIE;
        var topPadding = firstColumnEl.getPadding("t") - Ext.isIE;
        var pos = firstColumnEl.getXY();
        var size = this.getLayout().getLayoutTargetSize();
        pos[0] += leftPadding;
        pos[1] += topPadding;
        size.height -= Ext.getScrollBarWidth();
        size.width -= Ext.getScrollBarWidth();
        var ctn = this.body.dom.firstChild;
        Ext.get(ctn).setStyle("position", "static");
        el.setStyle({position:"absolute", "z-index":20002 /* higher than loadmask msg box (20001) */ });
        item.setPagePosition(pos[0], pos[1]);
        item.setSize(size);
        item.doLayout();
        this.fullScreenCmp = item;
    }

    ,onItemToggle:function(item) {
        Ext.Ajax.request({
            url:this.url
            ,params:{
                xaction:"toggleItem"
                ,id:item.items.itemAt(0).widgetId
                ,collapsed:item.collapsed
            }
        });
    }

    ,onItemMove:function(e) {
        this.getLayout().onResize();
        // this.onSetItemPosition(e.panel/*.items.itemAt(0)*/, e.columnIndex, e.position);
    }

    ,onItemAdd:Ext.emptyFn
    // ,onItemAdd:function(cmp, item) {
    //     Ext.Ajax.request({
    //         url:this.url
    //         ,params:{
    //             xaction:"addItem"
    //             ,id:item.widgetId
    //             ,columnIndex:item.columnIndex
    //             ,weight:item.weight
    //             ,collapsed:item.collapsed
    //             ,config:Ext.encode(item.items)
    //         }
    //         ,success:function(response, options) {
    //             var json = Ext.decode(response.responseText);
    //             if (json.success) {
    //                 cmp.widgetId = item.widgetId = json.data.id;
    //             }
    //         }
    //     });
    // }

    // ,onSetItemPosition:function(item, columnIndex, weight) {
    //     item.columnIndex = columnIndex;
    //     item.weight = weight;
    //     Ext.Ajax.request({
    //         url:this.url
    //         ,params:{
    //             xaction:"setItemPosition"
    //             ,id:item.widgetId
    //             ,columnIndex:columnIndex
    //             ,weight:weight
    //         }
    //     });
    // }

    ,onSaveConfig:function(item, extraConfig) {
        var key = null, config = {};
        for (key in item.initialConfig.items)
            config[key] = item.initialConfig.items[key];
        // var config = Ext.apply(item.initialConfig.items, {});

        Ext.apply(config, extraConfig);
        Ext.Ajax.request({
            url:this.url
            ,params:{
                xaction:"saveConfig"
                ,id:item.widgetId
                ,config:Ext.encode(config)
            }
        });
    }

    ,onItemOver:Ext.emptyFn
    ,onItemDrop:Ext.emptyFn

});

Ext.reg("portal", Ext.ux.Portal);