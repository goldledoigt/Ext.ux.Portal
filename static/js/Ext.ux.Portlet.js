Ext.ux.Portlet = Ext.extend(Ext.Panel, {
    anchor:"100%"
    ,frame:true
    ,collapsible:true
    ,draggable:true
    ,cls:"x-portlet"
    
    ,initComponent:function() {
        this.tools = [{
            id:"maximize"
            ,scope:this
            // ,qtip:"fullscreen"
            ,handler:this.maximize
        }, {
            id:"close"
            ,scope:this
            // ,qtip:"remove item"
            ,handler:this.close
        }];
        
        Ext.apply(this.items, {title:false, collapsed:false});

        Ext.ux.Portlet.superclass.initComponent.call(this, arguments);
    }

    ,close:function(e, tool, panel, options) {
        this.fireEvent("close", panel);
    }

    ,maximize:function(e, tool, panel, options) {
        this.fireEvent("maximize", panel);
    }
    
});

Ext.reg('portlet', Ext.ux.Portlet);
