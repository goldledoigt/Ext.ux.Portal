var PORTAL;
Ext.onReady(function() {

    Ext.QuickTips.init();

    var ddGroup = "PortalDD";

    var onNodeOver = function(target, dd, e, data) {
        var node = data.node;
        if (node.isLeaf()) {
            if (portal.itemExists(node.attributes.portlet.itemId))
                return false;
        } else {
            var nodes = node.childNodes, p, count = 0;
            for (var i = 0, l = nodes.length; i < l; i++) {
                p = nodes[i].attributes.portlet;
                if (!portal.itemExists(p.itemId))
                    count++;
            }
            if (count === 0) return false;
        }
        return Ext.dd.DropZone.prototype.dropAllowed;
    };

    var onNodeDrop = function (target, dd, e, data) {
        var node = data.node, nodes, portlets, p;
        if (node.isLeaf()) {
            portlets = data.node.attributes.portlet;
            if (portal.itemExists(portlets.itemId))
                return false;
            if (!Ext.isArray(portlets)) portlets = [portlets];
        } else {
            portlets = [];
            nodes = node.childNodes;
            for (var i = 0, l = nodes.length; i < l; i++) {
                if (p = nodes[i].attributes.portlet) {
                    if (!Ext.isArray(p)) p = [p];
                    for (var j = 0, k = p.length; j < k; j++) {
                        if (!portal.itemExists(p[j].itemId))
                            portlets.push(p[j]);
                    }
                }
            }
        }
        if (portlets && portlets.length) {
            portal.addItems(portlets);
            return true;
        } return false;
    };

    var tree = new Ext.tree.TreePanel({
        useArrows:true
        ,title:"Drop a node over the portal >>"
        ,autoScroll:true
        ,dataUrl:"php/get-nodes.php"
        ,rootVisible:false
        ,enableDrag:true
        ,ddGroup:ddGroup
        ,region:"west"
        ,split:true
        ,width:190
        ,root:{
            nodeType:"async"
            ,expanded:true
        }
    });

    var toolbar = new Ext.Toolbar({
        items:[{
            text:"remove all"
            ,handler:function() {
                portal.removeAllItems();
            }
        }, "->", {
            nbColumns:1
            ,scope:this
            ,allowDepress:false
            ,enableToggle:true
            ,iconCls:"icon-column-1"
            ,pressed:false
            ,toggleGroup:"changeColumnsCount"
            ,handler:function(btn) {
                portal.changeColumnsCount(btn.nbColumns);
            }
        }, "-", {
            nbColumns:2
            ,scope:this
            ,allowDepress:false
            ,enableToggle:true
            ,iconCls:"icon-column-2"
            ,pressed:false
            ,toggleGroup:"changeColumnsCount"
            ,handler:function(btn) {
                portal.changeColumnsCount(btn.nbColumns);
            }
        }, "-", {
            nbColumns:3
            ,scope:this
            ,allowDepress:false
            ,enableToggle:true
            ,iconCls:"icon-column-3"
            ,pressed:true
            ,toggleGroup:"changeColumnsCount"
            ,handler:function(btn) {
                portal.changeColumnsCount(btn.nbColumns);
            }
        }]
    });

    var portal = new Ext.ux.Portal({
        region:"center"
        ,url:"php/controller.php"
        ,tbar:toolbar
        ,ddGroup:ddGroup
        ,onNodeDrop:onNodeDrop
        ,onNodeOver:onNodeOver
    });
    
    new Ext.Viewport({
        layout:"border"
        ,items:[tree, portal]
    });

    PORTAL = portal;

});