Ext.ns("Ext.ux.portlet");
var STORE;
Ext.ux.portlet.RssReader = Ext.extend(Ext.Panel, {

    initComponent:function() {

        var content = false;

        this.layout = "fit";

        this.bubbleEvents = ["saveconfig"];

        if (this.url && this.url.length)
            content = this.getView();
        else content = this.getForm();

        Ext.apply(this, {
            items:content
        });

        Ext.ux.portlet.RssReader.superclass.initComponent.apply(this, arguments);
        
        this.on({
            afterrender:function() {
                if (this.url) {
                    this.loadFeed(this.url);
                }
            }
        });

    }

    ,getForm:function() {
        this.form = new Ext.form.FormPanel({
            autoHeight:true
            ,padding:"5"
            ,labelAlign:"top"
            ,items:[{
                xtype:"textfield"
                ,fieldLabel:"RSS FEED URL"
                ,anchor:"0"
                ,ref:"url"
                ,emptyText:"http://www.domaine.com/feed.xml"
            }]
            ,buttons:[{
                text:"OK"
                ,scope:this
                ,handler:this.saveConfig
            }]
        });
        return this.form;
    }

    ,getView:function() {
        this.view = new Ext.DataView({
            store:(__PROXY__ && __PROXY__.length)
                ? new Ext.data.Store({
                    url:__PROXY__
                    ,reader: new Ext.data.XmlReader({
                        record:'item'
                    }, [
                        'title', "link"
                        ,{name:"contentSnippet", mapping:"description"}
                        ,{name:"date", mapping:"pubDate", type:"date"}
                        ,{name:"img", mapping:"enclosure@url"}
                    ])
                    ,listeners:{
                        load:function() {
                            console.log("load XML", arguments);
                        }
                    }
                })
                : new Ext.data.JsonStore({
                    root:"feed.entries"
                    ,fields:[
                        "title","link", "content", "contentSnippet"
                        ,{name:"date", mapping:"publishedDate", type:"date"}
                    ]
                })
            ,tpl:new Ext.XTemplate(
                '<tpl for=".">',
                    '<tpl if="xindex &lt; xcount"><div style="margin-bottom:10px;"></tpl>'
                    ,'<tpl if="xindex == xcount"><div></tpl>'
                    
                        ,'<table style="width:100%"><tr>'
                        ,'<td style="vertical-align:top;">'
                        ,'<div><img style="margin-top:3px;" src="{img}" /></div>'
                        ,'<div style="color:#AAAAAA;font-size: 10px;">{[values.date.format("d/m/Y H:i")]}</div>'
                        ,'</td>'
                        ,'<td style="vertical-align:top;">'
                        ,'<div style="font-size:14px;font-weight:bold;">{title}</div>'
                        ,'<div>{contentSnippet}</div>'
                        ,'</td>'
                        ,'</tr></table>'
                    
                    ,'</div>'
                ,'</tpl>'
                ,'<div class="x-clear"></div>'
            )
            ,autoHeight:true
            ,singleSelect:true
            ,overClass:'x-view-over'
            ,itemSelector:'div.thumb-wrap'
            ,emptyText:'No news to display'
        });
        STORE = this.view.store;
        return {height:200, padding:"5", autoScroll:true, items:this.view};
    }

    ,saveConfig:function() {
        this.url = this.form.url.getValue();
        if (this.url && this.url.length) {
            this.fireEvent("saveconfig", this.ownerCt, {url:this.url});
            this.removeAll();
            this.add(this.getView());
            this.loadFeed(this.url);
            this.doLayout();
        }
    }

    ,loadFeed:function(url) {
        if (__PROXY__ && __PROXY__.length) {
            this.view.store.load();
            // Ext.Ajax.request({
            //     url:__PROXY__ + "?" + url
            //     ,callback:function() {
            //         console.log("callback", arguments);
            //     }
            // })
        } else {
            var feed = new google.feeds.Feed(url);
            feed.load((function(data) {
                console.log("DATA", data);
                this.view.store.loadData(data);
            }).createDelegate(this));
        }
    }

});

Ext.reg("rssreader", Ext.ux.portlet.RssReader);