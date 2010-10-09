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
                ,config:Ext.apply({}, item)
            });
        }, this);
        this.renderItems(stopEvent);
    }

    ,removeAllItems:function() {
        var i;
        this.store.clear();
        this.items.each(function(column) {
            while (i = column.items.last())
                this.removeItem(column, i);
            column.doLayout();
        }, this);
    }

    ,removeItem:function(column, item) {
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

    ,renderItems:function(stopEvent) {
        var items = this.store.filter("rendered", false);
        items.sort("ASC", function(a, b) {
            return a.weight - b.weight;
        });
        items.each(function(item) {
            this.renderItem(item, stopEvent);
        }, this);
        this.getLayout().onResize();
    }

    ,renderItem:function(item, stopEvent) {
        var column = this.getItemColumn(item);
        var config = {
            title:item.config.title
            ,items:item.config
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
                // ,hideMode:"offsets"
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
        else return "10px 10px 10px 5px"
    }

    ,itemExists:function(itemId) {
        var items = this.store.filter("itemId", itemId);
        return items.getCount();
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