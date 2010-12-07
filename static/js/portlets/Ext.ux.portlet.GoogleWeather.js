Ext.ns("Ext.ux.portlet");

cbfunc = function() {
    console.log("cbfunc", arguments);
}

Ext.ux.portlet.GoogleWeather = Ext.extend(Ext.Panel, {

    initComponent:function() {
// http://query.yahooapis.com/v1/public/yql?q=use%20%27http://github.com/yql/yql-tables/raw/master/weather/weather.bylocation.xml%27%20as%20we;select%20*%20from%20we%20where%20location=%22berlin,germany%22%20and%20unit=%27c%27&format=json&diagnostics=true&env=store://datatables.org/alltableswithkeys

// http://query.yahooapis.com/v1/public/yql?q=use%20%27http://github.com/yql/yql-tables/raw/master/weather/weather.bylocation.xml%27%20as%20we;select%20*%20from%20we%20where%20location=%22berlin,germany%22%20and%20unit=%27c%27&format=json&diagnostics=true&env=store://datatables.org/alltableswithkeys
        this.yahooWeatherServiceUrl = "http://github.com/yql/yql-tables/raw/master/weather/weather.bylocation.xml";
        this.yahooWeatherServiceParams = "&format=json&diagnostics=true&env=store://datatables.org/alltableswithkeys";
        this.yahooWeatherApiQuery = 'use "'+this.yahooWeatherServiceUrl+'" as we; select * from we where location="berlin,germany" and unit="c"';
        this.yahooWeatherApiUrl = "http://query.yahooapis.com/v1/public/yql?q=" + this.yahooWeatherApiQuery + this.yahooWeatherServiceParams;

        console.log("url", this.yahooWeatherApiUrl);

        var content = false;

        this.layout = "fit";

        this.bubbleEvents = ["saveconfig"];

        this.store = new Ext.data.Store({
            proxy: new Ext.data.ScriptTagProxy({
                url:this.yahooWeatherApiUrl
                ,onRead:this.readCallback
            }),
            reader: new Ext.data.JsonReader({
                // root:'query.results.weather.rss.channel'
                // root:"query"
                // totalProperty: 'totalCount',
                // id: 'post_id'
            }, [
                {name:"count", mapping:"query"}
                // {name: 'location', mapping: 'location'}
                // {name: 'topicId', mapping: 'topic_id'},
                // {name: 'author', mapping: 'author'},
                // {name: 'lastPost', mapping: 'post_time', type: 'date', dateFormat: 'timestamp'},
                // {name: 'excerpt', mapping: 'post_text'}
            ])
        });

        if (this.url && this.url.length) {
            content = this.getView();
            this.height = Ext.isIE7 ? 200 : null;
        } else {
            this.height = Ext.isIE7 ? 100 : null;
            content = this.getForm();
        }

        Ext.apply(this, {
            items:content
        });

        Ext.ux.portlet.GoogleWeather.superclass.initComponent.apply(this, arguments);
        
        // this.on({
        //     afterrender:function() {
        //         var customSearchControl = new google.search.CustomSearchControl('013999461852530400620:gebx3ddzzr4');
        //         customSearchControl.setResultSetSize(google.search.Search.FILTERED_CSE_RESULTSET);
        //         customSearchControl.draw(this.body.dom.id);
        //     }
        // });
    }

    ,getForm:function() {
        this.form = new Ext.form.FormPanel({
            autoHeight:true
            ,padding:"5"
            ,labelAlign:"top"
            ,items:[{
                xtype:"textfield"
                ,fieldLabel:"CITY"
                ,anchor:"0"
                ,ref:"city"
                // ,emptyText:""
            }]
            ,buttons:[{
                text:"OK"
                ,scope:this
                ,handler:this.saveConfig
            }]
        });
        return this.form;
    }

    ,saveConfig:function() {
        this.city = this.form.city.getValue();
        this.url = this.googleWeatherApiUrl + this.city;
        if (this.city && this.city.length) {
            this.removeAll();
            // this.add(this.getView());
            this.loadFeed(this.url);
            this.doLayout();
            // this.fireEvent("saveconfig", this.ownerCt, {url:this.url});
        }
    }

    ,loadFeed:function(url) {
        this.store.load();
        // if (__PROXY__ && __PROXY__.length) {
        //     this.view.store.load();
        // } else {
        //     var feed = new google.feeds.Feed(url);
        //     feed.load((function(data) {
        //         console.log("DATA", data);
        //         // this.view.store.loadData(data);
        //     }).createDelegate(this));
        // }
    }

    ,readCallback:function(action, trans, res) {
        console.log("res", res);
    }

});

Ext.reg("portlet-googleweather", Ext.ux.portlet.GoogleWeather);