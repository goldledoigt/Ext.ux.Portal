Ext.ns("Ext.ux.portlet");

Ext.ux.portlet.GoogleLanguage = Ext.extend(Ext.Panel, {

    initComponent:function() {

        this.languages = [
            ["af", "Afrikaans"]
            ,["sq", "Albanian"]
            ,["ar", "Arabic"]
            ,["be", "Belarusian"]
            ,["bg", "Bulgarian"]
            ,["ca", "Catalan"]
            ,["hr", "Croatian"]
            ,["cs", "Czech"]
            ,["da", "Danish"]
            ,["nl", "Dutch"]
            ,["en", "English"]
            ,["et", "Estonian"]
            ,["eu", "Basque"]
            ,["tl", "Filipino"]
            ,["fi", "Finnish"]
            ,["fr", "French"]
            ,["gl", "Galician"]
            ,["de", "German"]
            ,["el", "Greek"]
            ,["ht", "Haitian Creole"]
            ,["iw", "Hebrew"]
            ,["hi", "Hindi"]
            ,["hu", "Hungarian"]
            ,["is", "Icelandic"]
            ,["id", "Indonesian"]
            ,["ga", "Irish"]
            ,["it", "Italian"]
            ,["ja", "Japanese"]
            ,["lv", "Latvian"]
            ,["lt", "Lithuanian"]
            ,["mk", "Macedonian"]
            ,["ms", "Malay"]
            ,["mt", "Maltese"]
            ,["no", "Norwegian"]
            ,["fa", "Persian"]
            ,["pl", "Polish"]
            ,["pt", "Portuguese"]
            ,["ro", "Romanian"]
            ,["ru", "Russian"]
            ,["sr", "Serbian"]
            ,["sk", "Slovak"]
            ,["sl", "Slovenian"]
            ,["es", "Spanish"]
            ,["sw", "Swahili"]
            ,["sv", "Swedish"]
            ,["th", "Thai"]
            ,["tr", "Turkish"]
            ,["uk", "Ukrainian"]
            ,["vi", "Vietnamese"]
            ,["cy", "Welsh"]
            ,["yi", "Yiddish"]
            ,["zh-CN", "Chinese Simplified"]
            ,["zh-TW", "Chinese Traditional"]
        ];

        Ext.apply(this, {
            layout:{
                type:'vbox',
                padding:'5',
                align:'stretch'
            }
            ,height:200
            ,items:[{
                padding:"5"
                ,xtype:"form"
                ,hideLabels:true
                ,ref:"form"
                ,flex:1
                ,items:[{
                    xtype:"compositefield"
                    ,items:[{
                        xtype:"combo"
                        ,store:new Ext.data.ArrayStore({
                            fields:['id', 'language']
                            ,data:this.languages
                        })
                        ,typeAhead:true
                        ,forceSelection:true
                        ,triggerAction:"all"
                        ,selectOnFocus:true
                        ,displayField:"language"
                        ,valueField:"id"
                        ,hiddenName:"source"
                        ,name:"source_text"
                        ,mode:"local"
                        ,emptyText:"Source"
                        ,flex:1
                    }, {
                        xtype:"combo"
                        ,store:new Ext.data.ArrayStore({
                            fields:['id', 'language']
                            ,data:this.languages
                        })
                        ,typeAhead:true
                        ,forceSelection:true
                        ,triggerAction:"all"
                        ,selectOnFocus:true
                        ,displayField:"language"
                        ,valueField:"id"
                        ,hiddenName:"target"
                        ,name:"target_text"
                        ,mode:"local"
                        ,emptyText:"Target"
                        ,flex:1
                    }]
                }, {
                    xtype:"textfield"
                    ,emptyText:"Text to translate..."
                    ,anchor:"0"
                    ,name:"query"
                }]
                ,buttons:[{
                    text:"Translate"
                    ,scope:this
                    ,handler:this.translate
                }]
            }, {
                ref:"response"
                ,xtype:"fieldset"
                ,title:"Translation"
                ,flex:1
            }]
        });

        Ext.ux.portlet.GoogleLanguage.superclass.initComponent.apply(this, arguments);
        
    }

    ,translate:function() {
        var v = this.form.getForm().getValues();
        google.language.translate(v.query, v.source, v.target, this.translateCallback.createDelegate(this));
    }
    
    ,translateCallback:function(result) {
        this.response.update(result.translation);
    }

});

Ext.reg("portlet-googlelanguage", Ext.ux.portlet.GoogleLanguage);
