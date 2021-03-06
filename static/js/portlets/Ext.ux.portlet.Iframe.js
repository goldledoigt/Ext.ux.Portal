Ext.ns("Ext.ux.portlet");

Ext.ux.portlet.Iframe = Ext.extend(Ext.Panel, {

    initComponent:function() {

        this.layout = "fit";
        
        this.height = 300;

        Ext.apply(this, {
            html:'<iframe src="'+this.url+'" width="100%" height="100%" frameborder="0"></iframe>'
        });

        Ext.ux.portlet.Iframe.superclass.initComponent.apply(this, arguments);
    }

});

Ext.reg("portlet-iframe", Ext.ux.portlet.Iframe);