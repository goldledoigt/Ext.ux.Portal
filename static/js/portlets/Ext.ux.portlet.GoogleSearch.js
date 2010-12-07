Ext.ns("Ext.ux.portlet");

Ext.ux.portlet.GoogleSearch = Ext.extend(Ext.Panel, {

    initComponent:function() {

        Ext.apply(this, {
            layout:"fit"
            ,height:200
            ,autoScroll:true
        });

        Ext.ux.portlet.GoogleSearch.superclass.initComponent.apply(this, arguments);
        
        this.on({
            afterrender:function() {
                var customSearchControl = new google.search.CustomSearchControl('013999461852530400620:gebx3ddzzr4');
                customSearchControl.setResultSetSize(google.search.Search.FILTERED_CSE_RESULTSET);
                customSearchControl.draw(this.body.dom.id);
            }
        });
    }

});

Ext.reg("portlet-googlesearch", Ext.ux.portlet.GoogleSearch);