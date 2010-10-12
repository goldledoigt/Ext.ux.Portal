Ext.ns("Ext.ux");

Ext.ux.Portal = Ext.extend(Ext.Panel, {

    ddGroup:"PortalDD"

    ,columnCount:3

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
        });

        this.on({
            afterrender:function() {
                this.initDropZone();
                this.loadItems();
                this.mask = new Ext.LoadMask(this.getEl(), {msgCls:"x-portal-mask-loading"});
            }
            ,drop:this.onItemMove
            ,removeItem:this.onRemoveItem
            ,setitemposition:this.onSetItemPosition
        });
    }

    ,initEvents : function(){
        Ext.ux.Portal.superclass.initEvents.call(this);
        this.dd = new Ext.ux.Portal.DropZone(this, this.dropConfig);
    }

    ,beforeDestroy:function() {
        if (this.dd) this.dd.unreg();
        Ext.ux.Portal.superclass.beforeDestroy.call(this);
    }

    ,loadItems:function() {
        var callback = function(options, success, response) {
            var items = Ext.decode(response.responseText).items;
            this.addItems(items, true);
        };
        Ext.Ajax.request({
            url:this.url
            ,scope:this
            ,params:{xaction:"getItems"}
            ,callback:callback
        });
    }

    ,addItems:function(items, stopEvent) {
        if (!items) return false;
        items = Ext.isArray(items) ? items : [items];
        Ext.each(items, function(item, index) {
            this.store.add({
                columnIndex:item.columnIndex || false
                ,weight:item.weight || 0
                ,rendered:false
                ,itemId:item.itemId
                ,collpased:item.collapsed
                ,config:Ext.apply({}, item)
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
        var config = {
            title:item.config.title
            ,collapsed:item.config.collapsed
            ,items:item.config
            ,listeners:{
                scope:this
                ,collapse:this.onItemToggle
                ,expand:this.onItemToggle
                ,close:this.onItemClose
                ,maximize:this.onItemMaximize
            }
        };
        column.add(config);
        item.rendered = true;
        column.doLayout();
        if (!stopEvent)
            this.fireEvent("setitemposition", item, column.ownerCt.items.indexOf(column), column.items.getCount() - 1);
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

    ,onRemoveItem:function(item) {
        Ext.Ajax.request({
            url:this.url
            ,scope:this
            ,params:{
                xaction:"removeItem"
                ,id:item.initialConfig.items.itemId
            }
        });
    }
    
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
        for (var i = 0; i < this.columnCount; i ++) {
            style = "padding:"+this.getColumnPadding(i)+";";
            width = 1/this.columnCount;
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
            return "10px 0 10px 10px";
        else if (colIndex < this.columnCount - 1)
            return "10px 0px 10px 5px";
        else return "10px 10px 10px 5px";
    }

    ,changeColumnsCount:function(n) {
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
    }

    ,showColumns:function(columns, availableColumns) {
        Ext.each(columns, function(c, index) {
            c.show();
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
            column.visibleWidth = column.el.getWidth();
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
    }

    ,itemExists:function(itemId) {
        var items = this.store.filter("itemId", itemId);
        return items.getCount();
    }

    ,resizeFullScreenItem:function(portal, width, height) {
        // this.mask.show();
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
                ,id:item.items.itemAt(0).itemId
                ,collapsed:item.collapsed
            }
        });
    }

    ,onItemMove:function(e) {
        this.getLayout().onResize();
        this.onSetItemPosition(e.panel.items.itemAt(0), e.columnIndex, e.position);
    }

    ,onSetItemPosition:function(item, columnIndex, weight) {
        Ext.Ajax.request({
            url:this.url
            ,params:{
                xaction:"setItemPosition"
                ,id:item.itemId
                ,columnIndex:columnIndex
                ,weight:weight
            }
        });
    }

    ,onItemOver:Ext.emptyFn
    ,onItemDrop:Ext.emptyFn

});

Ext.reg("portal", Ext.ux.Portal);