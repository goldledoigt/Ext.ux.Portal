Ext.ns("Ext.ux.portlet");

Ext.ux.portlet.YoutubeSearchPagingToolbar = Ext.extend(Ext.Toolbar, {

    start:null

    ,limit:null

    ,store:null

    ,paramNames:null

    ,initComponent:function() {

        this.infoTpl = new Ext.Template("{start} - {end} ({total})", {compiled:true});

        Ext.apply(this, {
            items:[{
                xtype:"button"
                ,ref:"previous"
                ,iconCls:"x-tbar-page-prev"
                ,scope:this
                ,handler:this.goPrevious
            }, {
                xtype:"button"
                ,ref:"next"
                ,iconCls:"x-tbar-page-next"
                ,scope:this
                ,handler:this.goNext
            }, "->", {
                xtype:"tbtext"
                ,ref:"info"
                ,text:""
            }]
        });

        Ext.ux.portlet.YoutubeSearchPagingToolbar.superclass.initComponent.call(this);

        this.store.on({
            scope:this
            ,load:function(store) {
                this.info.setText(this.infoTpl.apply({
                    total:store.getTotalCount()
                    ,start:this.store.baseParams[this.paramNames.start]
                    ,end:this.store.baseParams[this.paramNames.start] + this.store.baseParams[this.paramNames.limit]
                }));
            }
        });

    }

    ,goPrevious:function() {
        var start = this.store.baseParams[this.paramNames.start];
        var limit = this.store.baseParams[this.paramNames.limit];
        var index = start-limit > 0 ? start-limit : 1;
        this.store.setBaseParam(this.paramNames.start, start-limit);
        this.store.load();
    }

    ,goNext:function() {
        var start = this.store.baseParams[this.paramNames.start];
        var limit = this.store.baseParams[this.paramNames.limit];
        var index = start+limit;
        this.store.setBaseParam(this.paramNames.start, index);
        this.store.load();
    }
});

Ext.ux.portlet.YoutubeSearch = Ext.extend(Ext.Panel, {

    paramNames:null

    ,initComponent:function() {

        var store = new Ext.data.JsonStore({
            root:"feed.entry"
            ,idProperty:"id.$t"
            ,totalProperty:"feed.openSearch$totalResults.$t"
            ,autoDestroy:true
            ,autoLoad:true
            ,baseParams:{
                alt:"json"
                ,v:2
            }
            ,proxy:new Ext.data.ScriptTagProxy({
                url:"http://gdata.youtube.com/feeds/api/videos"
            })
            ,fields:[
                {name:"id", mapping:"id.$t"}
                ,{name:"title", mapping:"title.$t"}
                ,{name:"views", mapping:"yt$statistics.viewCount"}
                ,{name:"url", mapping:"media$group.media$player"}
                ,{name:"thumbnail", mapping:"media$group.media$thumbnail[0].url"}
                ,{name:"duration", mapping:"media$group.yt$duration.seconds", type:"date", dateFormat:"timestamp"}
            ]
            ,listeners:{
                scope:this
                ,load:function(store, records, options) {
                    this.mask.hide();
                }
                ,beforeload:function(store) {
                    this.mask.show();
                    if (!store.baseParams[this.paramNames.limit]) {
                        store.setBaseParam(this.paramNames.limit, 10);
                        store.setBaseParam(this.paramNames.start, 1);
                    }
                }
                ,exception:function() {
                    this.mask.hide();
                }
            }
        });
        
        var tpl = new Ext.XTemplate(
            '<tpl for=".">'
            ,'<div class="x-desktop-youtubesearch-item">'
            ,'<div class="x-desktop-youtubesearch-item-details">'
            ,'<div style="width:30px;">{duration}</div>'
            ,'<div style="text-align:right;">{views} views</div>'
            ,'</div>'
            ,'<div><img src="{thumbnail}" /></div>'
            ,'<div class="x-desktop-youtubesearch-item-title">'
            ,'<a href="#">{title}</a>'
            ,'</div>'
            ,'</div>'
            ,'</tpl>'
        );
        
        this.dataView = new Ext.DataView({
            store:store
            ,tpl:tpl
            ,autoScroll:true
            ,singleSelect:true
            ,selectedClass:"x-desktop-youtubesearch-item-selected"
            ,overClass:"x-desktop-youtubesearch-item-over"
            ,itemSelector:"div.x-desktop-youtubesearch-item"
            ,emptyText:"No items to display"
            ,listeners:{
                scope:this
                ,click:function(view, index, node, event) {
                    this.fireEvent("videoselect", this, view.store.getAt(index).get("url"));
                }
            }
            ,prepareData:function(data) {
                data.duration = data.duration.format("i:s");
                data.url = Ext.isArray(data.url) ? data.url[0].url : data.url.url;
                return data;
            }
        
        });
        
        this.tbar = {
            style:"border-width:1px 1px 0 1px"
            ,items:["->", {
                xtype:"searchfield"
                ,emptyText:"search on Youtube..."
                ,store:store
                ,width:194
                ,paramNames:this.paramNames
            }]
        };

        this.bbar = new Ext.ux.portlet.YoutubeSearchPagingToolbar({
            store:store
            ,paramNames:this.paramNames
        });
        
        Ext.apply(this, {
            layout:"fit"
            ,items:this.dataView
        });

        this.addEvents("videoselect");

        Ext.ux.portlet.YoutubeSearch.superclass.initComponent.call(this);

        this.on({
            afterrender:function() {
                this.mask = new Ext.LoadMask(this.getEl(), {msg:"Loading..."});
            }
        });

    }
});

Ext.reg('portlet-youtubeplayer-search', Ext.ux.portlet.YoutubeSearch);


Ext.ux.portlet.YoutubePlayer = Ext.extend(Ext.Panel, {

    initComponent:function() {

        this.player = this.getPlayer();
      
        this.controls = this.getControls();

        Ext.apply(this, {
          layout:"border"
          ,height:300
          ,cls:"x-portlet-youtubeplayer"
          ,items:[{
              layout:"border"
              ,region:"center"
              ,items:[
                  this.player
              ,{
                  region:"south"
                  ,height:27
                  ,border:false
                  ,bbar:this.controls
              }]
            }, {
              region:"east"
              ,width:200
              ,minWidth:200
              ,split:true
              ,collapseMode:"mini"
              ,bodyStyle:"border:1px solid #99BBE8;border-width:1px 0 1px 1px"
              ,xtype:"portlet-youtubeplayer-search"
              ,paramNames:{
                  query:"q"
                  ,start:"start-index"
                  ,limit:"max-results"
              }
              ,listeners:{
                scope:this
                ,videoselect:function(panel, url) {
                    var id = this.controls._parseVideoId(url);
                    if (this.player.cueVideoById)
                        this.player.cueVideoById(id, 0);
                }
              }
            }]
            ,listeners:{
              scope:this
              ,resize:function(){
                  this.controls.fireEvent('resize')
              }
            }
        });

      Ext.ux.portlet.YoutubePlayer.superclass.initComponent.apply(this, arguments);
  }

  ,getPlayer:function() {
      return new Ext.ux.YoutubePlayer({
          region:"center"
          ,playerId:'myplayer'
          ,ratioMode:'stretch'
          ,bgColor:"#000000"
          ,cls:'ext-ux-youtubeplayer'
      });
  }

  ,getControls:function() {
      return new Ext.ux.YoutubePlayer.Control({
          player:this.player
          ,height:27
      });
  }

});

Ext.reg("portlet-youtubeplayer", Ext.ux.portlet.YoutubePlayer);
