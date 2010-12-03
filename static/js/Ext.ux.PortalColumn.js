Ext.ux.PortalColumn = Ext.extend(Ext.Container, {
    layout:"anchor"
    ,defaultType:"portlet"
    ,cls:"x-portal-column"
    // ,remove : function(comp, autoDestroy){
    //     this.initItems();
    //     var c = this.getComponent(comp);
    //     console.log("before move", c, this.items);
    //     if(c && this.fireEvent('beforeremove', this, c) !== false){
    //         console.log("after before move", c);
    //         this.doRemove(c, autoDestroy);
    //         this.fireEvent('remove', this, c);
    //     }
    //     return c;
    // }
    // ,getComponent : function(comp){
    //     if(Ext.isObject(comp)){
    //         comp = comp.getItemId();
    //         console.log("getComponent", comp, this.items.get(comp));
    //     }
    //     return this.items.get(comp);
    // }
    // ,doRemove: function(c, autoDestroy){
    //     console.log("DO REMOVE", arguments);
    //     var l = this.layout,
    //     hasLayout = l && this.rendered;
    //     if(hasLayout){
    //         console.log("layout remove", l, c);
    //         l.onRemove(c);
    //     }
    //     console.log("item remove", this.items, c);
    //     this.items.remove(c);
    //     c.onRemoved();
    //     this.onRemove(c);
    //     if(autoDestroy === true || (autoDestroy !== false && this.autoDestroy)){
    //         c.destroy();
    //     }
    //     if(hasLayout){
    //         console.log("after remove", l, c);
    //         l.afterRemove(c);
    //     }
    // }
});

Ext.reg('portalcolumn', Ext.ux.PortalColumn);
