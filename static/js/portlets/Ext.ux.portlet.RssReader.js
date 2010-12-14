Ext.ns("Ext.ux.portlet");

Ext.ux.portlet.RssReader = Ext.extend(Ext.Panel, {

    initComponent:function() {

        var content = false;

        this.layout = "fit";

        this.bubbleEvents = ["saveconfig"];

        if (this.url && this.url.length) {
            // content = this.getView();
            content = this.getGrid();
            this.height = Ext.isIE7 ? 200 : null;
        } else {
            this.height = Ext.isIE7 ? 100 : null;
            content = this.getForm();
        }

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


    ,getGrid:function() {
        this.grid = new Ext.grid.GridPanel({
            height:300
            ,enableHdMenu:false
            ,strippeRows:true
            ,autoExpandColumn:"link"
            ,viewConfig:{
                forceFit:true
                ,enableRowBody:true
                ,getRowClass:function(record, index, rowParams, store) {
                    rowParams.body = '<div style="padding:0 5px 5px;">'
                        + record.get("contentSnippet")
                        + '</div>';
                }
            }
            ,store:new Ext.data.JsonStore({
                root:"feed.entries"
                ,fields:[
                    "title","link", "content", "contentSnippet"
                    ,{name:"date", mapping:"publishedDate", type:"date", }
                    ,{name:"img", defaultValue:"http://cdn2.iconfinder.com/data/icons/DarkGlass_Reworked/128x128/apps/knode2.png"}
                ]
            })
            ,columns:[
                {id:"link", header:"Title", dataIndex:"title", renderer:this.titleRenderer}
                ,{header:"Date", dataIndex:"date", fixed:true, width:85, renderer:this.dateRenderer}
            ]
        });

        // return {height:200, padding:"5", autoScroll:true, items:this.grid};
        return this.grid;
    }

    // ,getView:function() {
    //     this.view = new Ext.DataView({
    //         store:(__PROXY__ && __PROXY__.length)
    //             ? new Ext.data.Store({
    //                 url:__PROXY__
    //                 ,reader: new Ext.data.XmlReader({
    //                     record:'item'
    //                 }, [
    //                     'title', "link"
    //                     ,{name:"contentSnippet", mapping:"description", convert:this.filterContent}
    //                     ,{name:"date", mapping:"pubDate", type:"date"}
    //                     ,{name:"img", mapping:"enclosure@url", defaultValue:"http://cdn2.iconfinder.com/data/icons/DarkGlass_Reworked/128x128/apps/knode2.png"}
    //                 ])
    //             })
    //             : new Ext.data.JsonStore({
    //                 root:"feed.entries"
    //                 ,fields:[
    //                     "title","link", "content", "contentSnippet"
    //                     ,{name:"date", mapping:"publishedDate", type:"date"}
    //                     ,{name:"img", defaultValue:"http://cdn2.iconfinder.com/data/icons/DarkGlass_Reworked/128x128/apps/knode2.png"}
    //                 ]
    //             })
    //         ,tpl:new Ext.XTemplate(
    //             '<tpl for=".">',
    //                 '<tpl if="xindex &lt; xcount"><div style="padding-bottom:10px;margin-bottom:10px;border-bottom:1px solid #EFEFEF"></tpl>'
    //                 ,'<tpl if="xindex == xcount"><div></tpl>'
    //                     ,'<table style="width:100%"><tr>'
    //                     ,'<td style="vertical-align:top;"><center>'
    //                     ,'<div style="height:58px;width:87px"><img style="margin-top:3px;" width="87" height="58" src="{img}" /></div>'
    //                     ,'<div style="color:#AAAAAA;font-size: 10px;text-align:center;margin-top:2px">{[values.date.format("d/m/Y H:i")]}</div>'
    //                     ,'</center></td>'
    //                     ,'<td style="vertical-align:top;">'
    //                     ,'<div><a style="font-size:14px;font-weight:bold;color:#000000;text-decoration:none" href="{link}" onmouseout="Ext.fly(this).setStyle(\'text-decoration\', \'none\');" onmouseover="Ext.fly(this).setStyle(\'text-decoration\', \'underline\');">{title}</a></div>'
    //                     ,'<div>{contentSnippet}</div>'
    //                     ,'</td>'
    //                     ,'</tr></table>'
    //                 
    //                 ,'</div>'
    //             ,'</tpl>'
    //             ,'<div class="x-clear"></div>'
    //         )
    //         ,autoHeight:true
    //         ,singleSelect:true
    //         ,overClass:'x-view-over'
    //         ,itemSelector:'div.thumb-wrap'
    //         ,emptyText:'No news to display'
    //     });
    // 
    //     return {height:200, padding:"5", autoScroll:true, items:this.view};
    // }

    ,titleRenderer:function(value, metaData, record) {
        return '<div style="white-space:normal;width:300px;">'
            + '<a style="color:#15428B;font-size:14px;text-decoration:none;" href="'+ record.data.link +'">'+ value +'</a></div>'
            // + '<div style="text-align:justify;white-space:normal;width:280px;">'+ record.data.contentSnippet +'</div>';
    }
    
    ,dateRenderer:function(value, metaData, record) {
        metaData.attr = 'style="color:#666666"';
        return value.format("H:i d/m/y");
    }

    ,saveConfig:function() {
        this.url = this.form.url.getValue();
        if (this.url && this.url.length) {
            this.removeAll();
            this.add(this.getView());
            this.loadFeed(this.url);
            this.doLayout();
            this.fireEvent("saveconfig", this.ownerCt, {url:this.url});
        }
    }

    ,loadFeed:function(url) {
        if (__PROXY__ && __PROXY__.length) {
            this.view.store.load();
        } else {
            var feed = new google.feeds.Feed(url);
            feed.load((function(data) {
                this.grid.getStore().loadData(data);
            }).createDelegate(this));
        }
    }

    ,filterContent:function(value, record) {
        return Ext.util.Format.stripTags(value);
    }

});

Ext.reg("portlet-rssreader", Ext.ux.portlet.RssReader);