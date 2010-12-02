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
                        ,{name:"contentSnippet", mapping:"description", convert:this.filterContent}
                        ,{name:"date", mapping:"pubDate", type:"date"}
                        ,{name:"img", mapping:"enclosure@url", defaultValue:"http://cdn2.iconfinder.com/data/icons/DarkGlass_Reworked/128x128/apps/knode2.png"}
                    ])
                    // ,listeners:{
                    //     load:function() {
                    //         console.log("load XML", arguments);
                    //     }
                    // }
                })
                : new Ext.data.JsonStore({
                    root:"feed.entries"
                    ,fields:[
                        "title","link", "content", "contentSnippet"
                        ,{name:"date", mapping:"publishedDate", type:"date"}
                        ,{name:"img", defaultValue:"http://cdn2.iconfinder.com/data/icons/DarkGlass_Reworked/128x128/apps/knode2.png"}
                    ]
                })
            ,tpl:new Ext.XTemplate(
                '<tpl for=".">',
                    '<tpl if="xindex &lt; xcount"><div style="padding-bottom:10px;margin-bottom:10px;border-bottom:1px solid #EFEFEF"></tpl>'
                    ,'<tpl if="xindex == xcount"><div></tpl>'
                        ,'<table style="width:100%"><tr>'
                        ,'<td style="vertical-align:top;">'
                        ,'<div style="height:58px;width:87px"><img style="margin-top:3px;" width="87" height="58" src="{img}" /></div>'
                        ,'<div style="color:#AAAAAA;font-size: 10px;text-align:center;margin-top:2px">{[values.date.format("d/m/Y H:i")]}</div>'
                        ,'</td>'
                        ,'<td style="vertical-align:top;">'
                        ,'<div><a style="font-size:14px;font-weight:bold;color:#000000;text-decoration:none" href="{link}" onmouseout="Ext.fly(this).setStyle(\'text-decoration\', \'none\');" onmouseover="Ext.fly(this).setStyle(\'text-decoration\', \'underline\');">{title}</a></div>'
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
        this.url = this.ownerCt.initialConfig.items.url = this.form.url.getValue();
        if (this.url && this.url.length) {
            this.removeAll();
            this.add(this.getView());
            this.loadFeed(this.url);
            this.doLayout();
            this.fireEvent("saveconfig", this.ownerCt);
        }
    }

    ,loadFeed:function(url) {
        if (__PROXY__ && __PROXY__.length) {
            this.view.store.load();
        } else {
            var feed = new google.feeds.Feed(url);
            feed.load((function(data) {
                this.view.store.loadData(data);
            }).createDelegate(this));
        }
    }

    ,filterContent:function(value, record) {
        return Ext.util.Format.stripTags(value);
    }

});

Ext.reg("rssreader", Ext.ux.portlet.RssReader);