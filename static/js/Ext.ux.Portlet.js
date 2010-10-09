Ext.ux.Portlet = Ext.extend(Ext.Panel, {
    anchor:"100%"
    ,frame:true
    ,collapsible:true
    ,draggable:true
    ,cls:"x-portlet"
    
    ,initComponent:function() {
        // this.title = false;
        Ext.apply(this.items, {title:false});
        Ext.ux.Portlet.superclass.initComponent.call(this, arguments);
    }
    
});

Ext.reg('portlet', Ext.ux.Portlet);
