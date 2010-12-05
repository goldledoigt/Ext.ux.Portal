/**
 * @class Ext.layout.SplitColumnLayout
 * @extends Ext.layout.ContainerLayout
 * <p>This is the layout style of choice for creating structural layouts in a multi-column format where the width of
 * each column can be specified as a percentage or fixed width, but the height is allowed to vary based on the content.
 * This class is intended to be extended or created via the layout:'column' {@link Ext.Container#layout} config,
 * and should generally not need to be created directly via the new keyword.</p>
 * <p>SplitColumnLayout does not have any direct config options (other than inherited ones), but it does support a
 * specific config property of <b><tt>columnWidth</tt></b> that can be included in the config of any panel added to it.  The
 * layout will use the columnWidth (if present) or width of each panel during layout to determine how to size each panel.
 * If width or columnWidth is not specified for a given panel, its width will default to the panel's width (or auto).</p>
 * <p>The width property is always evaluated as pixels, and must be a number greater than or equal to 1.
 * The columnWidth property is always evaluated as a percentage, and must be a decimal value greater than 0 and
 * less than 1 (e.g., .25).</p>
 * <p>The basic rules for specifying column widths are pretty simple.  The logic makes two passes through the
 * set of contained panels.  During the first layout pass, all panels that either have a fixed width or none
 * specified (auto) are skipped, but their widths are subtracted from the overall container width.  During the second
 * pass, all panels with columnWidths are assigned pixel widths in proportion to their percentages based on
 * the total <b>remaining</b> container width.  In other words, percentage width panels are designed to fill the space
 * left over by all the fixed-width and/or auto-width panels.  Because of this, while you can specify any number of columns
 * with different percentages, the columnWidths must always add up to 1 (or 100%) when added together, otherwise your
 * layout may not render as expected.  Example usage:</p>
 * <pre><code>
// All columns are percentages -- they must add up to 1
var p = new Ext.Panel({
    title: 'Column Layout - Percentage Only',
    layout:'column',
    items: [{
        title: 'Column 1',
        columnWidth: .25
    },{
        title: 'Column 2',
        columnWidth: .6
    },{
        title: 'Column 3',
        columnWidth: .15
    }]
});

// Mix of width and columnWidth -- all columnWidth values must add up
// to 1. The first column will take up exactly 120px, and the last two
// columns will fill the remaining container width.
var p = new Ext.Panel({
    title: 'Column Layout - Mixed',
    layout:'column',
    items: [{
        title: 'Column 1',
        width: 120
    },{
        title: 'Column 2',
        columnWidth: .8
    },{
        title: 'Column 3',
        columnWidth: .2
    }]
});
</code></pre>
 */
Ext.layout.SplitColumnLayout = Ext.extend(Ext.layout.ContainerLayout, {
    // private
    monitorResize:true,
    // private
    extraCls: 'x-column',

    scrollOffset : 0,

    /**
     * @cfg {Number} margin
     * Width of margin between columns in pixels. Overrides any style settings. Defaults to 0.
     */
    margin: 0,

    /**
     * @cfg {Boolean} split
     * True to allow resizing of the columns using a SplitBar. Defaults to true.
     */
    split: true,

    /**
     * @cfg {Boolean} fitHeight
     * True to fit the column elements height-wise into the Container. Defaults to false.
     */
    fitHeight: false,

    getLayoutTargetSize : function() {
        var target = this.container.getLayoutTarget(), ret;
        if (target) {
            ret = target.getViewSize();

            // IE in strict mode will return a width of 0 on the 1st pass of getViewSize.
            // Use getStyleSize to verify the 0 width, the adjustment pass will then work properly
            // with getViewSize
            if (Ext.isIE && Ext.isStrict && ret.width == 0){
                ret =  target.getStyleSize();
            }

            ret.width -= target.getPadding('lr');
            ret.height -= target.getPadding('tb');
        }
        return ret;
    },

    // private
    isValidParent : function(c, target){
        return c.getEl().dom.parentNode == this.innerCt.dom;
    },

    renderAll : function(ct, target){

//      If we are allowing resize (The split config), declare splitBars Array, and
//      set the margin to 5 pixels: the width of a SplitBar.
        if (this.split && !this.splitBars) {
            this.splitBars = [];

//          allow space in calculations for splitbars.
            this.margin = 5;
        }

        Ext.layout.SplitColumnLayout.superclass.renderAll.apply(this, arguments);
    },

    // private
    onLayout : function(ct, target) {
        var cs = ct.items.items, len = cs.length, c, cel, i;

        if(!this.innerCt) {
            target.addClass('x-column-layout-ct');

            // the innerCt prevents wrapping and shuffling while
            // the container is resizing
            this.innerCt = target.createChild({cls:'x-column-inner', style: {position: 'relative'}});
            this.innerCt.createChild({cls:'x-clear'});
        }
        this.renderAll(ct, this.innerCt);

        var styleSize = target.getStyleSize();
        var viewSize = target.getViewSize();

        var size = Ext.isIE && target.dom != Ext.getBody().dom ? styleSize : viewSize;
        if (styleSize.width === viewSize.width)
            size.width -= 15;

        if (!this.lastClientWidth) this.lastClientWidth = size.width;

        if(size.width < 1 && size.height < 1) { // display none?
            return;
        }

        var w = size.width - target.getPadding('lr') - this.scrollOffset,
            h = size.height - target.getPadding('tb');
        var pw = this.availableWidth = w;
        if (this.split) {
            this.minWidth = Math.min(pw / len, 100);
            this.maxWidth = pw - ((this.minWidth + 5) * (len ? (len - 1) : 1));
        }

//      Set the size of the column container. Set the height if we are configure to fit the height.
        this.innerCt.setSize(w, this.fitHeight ? h : undefined);
        if(this.fitHeight){
            this.innerCt.setSize(w, h);
        } else {
            this.innerCt.setWidth(w);
        }
        // some columns can be percentages while others are fixed
        // so we need to make 2 passes
		var lastProportionedColumn, vc = 0;
        for(i = 0; i < len; i++){
            c = cs[i];
            cel = c.getEl();

//          Add the margin
            if (this.margin && (i < (len - 1))) {
                cel.setStyle("margin-right", this.margin + 'px');
            }
            if(c.columnWidth){
                lastProportionedColumn = i;
            } else {
                pw -= (c.getSize().width + cel.getMargins('lr'));
            }
            if (!c.hidden) vc++;
        }

//      Keep track of remaining unallocated width. Last proportioned column takes all remaining width.
        var remaining = (pw = pw < 0 ? 0 : pw);

        var splitterPos = 0;

        this.setLastColumnWidth(cs);
        var cw = 0;
        for(i = 0; i < len; i++){
            c = cs[i];
            cel = c.getEl();
            if(c.columnWidth) {
                cw = this.getLastColumnWidth(i, vc);
            	var w = (i == lastProportionedColumn) ? remaining : Math.floor(/*c.columnWidth*/cw * pw);
                if(this.fitHeight){
                    c.setSize(w - cel.getMargins('lr'), h);
                } else {
                    c.setWidth(w - cel.getMargins('lr'));
                }
                remaining -= w;
            } else if (this.fitHeight) {
                c.setHeight(h);
            }

//          Create the splitbar between the current item and the next which resizes the current item.
            if (this.split) {
                var cw = cel.getWidth();

                if (i < (len - 1)) {
                    splitterPos += cw;
                    if (this.splitBars[i]) {
                        this.splitBars[i].el.setHeight(h);
                    } else {
                        this.splitBars[i] = new Ext.SplitBar(this.innerCt.createChild({
                            cls: 'x-layout-split x-layout-split-west',
                            style: {
                                top: '0px',
                                left: splitterPos + 'px',
                                height: h + 'px'
                            }
                        }), cel);
                        this.splitBars[i].index = i;
                        this.splitBars[i].leftComponent = c;
                        this.splitBars[i].addListener('resize', this.onColumnResize, this);
                        this.splitBars[i].minSize = this.minWidth;
                    }

                    // HACK DGA ----------------------------------
 					if(cs[i+1].hidden)this.splitBars[i].el.hide();
 					else this.splitBars[i].el.show();
 					// -------------------------------------------

                    //this.splitBars[i].el.display='none';
//                  Keep track of splitter position
                    splitterPos += this.splitBars[i].el.getWidth();
                }
//              Initial column widths are a one-off setting if split set
                delete c.columnWidth;
            }
        }

//      Set maximum item widths.
        if (this.split) {
	  var flag = false;
	  for (var index = 0, l = cs.length; index < l; index++) {
	    if (cs[index].stopFireColumnState === true) {
	      flag = index;
	      break;
	    }
	  }
          if (flag === false) this.setMaxWidths();
	  if (flag) cs[flag].stopFireColumnState = false;
        }
    },

//  On column resize, explicitly size the Components to the left and right of the SplitBar
    onColumnResize: function(sb, newWidth) {
        if (sb.dragSpecs.startSize) {
            sb.leftComponent.setWidth(newWidth);
            var items = this.container.items.items;
            var expansion = newWidth - sb.dragSpecs.startSize;
            for (var i = sb.index + 1, len = items.length; expansion && i < len; i++) {
                var c = items[i];
                var w = c.el.getWidth();
                var newWidth = w - expansion;
                if (newWidth < this.minWidth) {
                    c.setWidth(this.minWidth);
                } else if (newWidth > this.maxWidth) {
                    expansion -= (newWidth - this.maxWidth);
                    c.setWidth(this.maxWidth);
                } else {
                    c.setWidth(c.el.getWidth() - expansion);
                    break;
                }
            }
            this.setMaxWidths();
        }
    },

    setMaxWidths: function() {
        var items = this.container.items.items;

//      How much space there is to expand into.
        var spare = items[items.length - 1].el.dom.offsetWidth - 100;

        for (var i = items.length - 2; i > -1; i--) {
            var sb = this.splitBars[i], sbel = sb.el, c = items[i], cel = c.el;
            var itemWidth = cel.dom.offsetWidth;
            sbel.setStyle('left', (cel.getX() - Ext.fly(cel.dom.parentNode).getX() + itemWidth) + 'px');
            sb.maxSize = itemWidth + spare;
            spare = itemWidth - 100;
        }

        var count = 0;
        for (var i = 0, l = items.length; i < l; i++) {
            count += items[i].el.dom.clientWidth;
        }

        var l = (items[0].el.dom.clientWidth/count).toFixed(2);
        var r = (items[items.length-1].el.dom.clientWidth/count).toFixed(2);

	if (this.lastLeft && this.lastRight && this.lastLeft == l && this.lastRight == r) {
	  return;
	}

	this.lastLeft = l;
	this.lastRight = r;
/*
	Ext.Ajax.request({
	  url:'controller/state.php',
	  params:{
	    action:'columnsResize',
	    l:l,
	    r:r,
	    men_id:this.container.men_id
	  }
	});
*/
    },

    getLastColumnWidth:function(index, visibleColumnsCount) {
        // console.log("getLastColumnWidth", this.lastColumnsWidth[visibleColumnsCount-1][index]);
        return this.lastColumnsWidth[visibleColumnsCount-1][index];
    }

    ,setLastColumnWidth:function(columns) {
        if (!columns[0].columnWidth) return;
        var vc = 0, hcp = 0;
        for (var i = 0, l = columns.length; i < l; i++) {
            if (columns[i].hidden) hcp += columns[i].columnWidth;
            else vc++;
        }
        var index = vc - 1;
        if (!this.lastColumnsWidth)
            this.lastColumnsWidth = [];
        if (!this.lastColumnsWidth[index])
            this.lastColumnsWidth[index] = [];
        if (this.lastColumnsWidth[index][0]) return;
        for (var i = 0, l = columns.length; i < l; i++) {
            if (!columns[i].hidden)
                this.lastColumnsWidth[index][i] = columns[i].columnWidth + hcp/vc;
        }
    },

    onResize: function() {
        if (this.split) {
            var items = this.container.items.items;
            
            if (items[0].rendered) {
                var tw = 0, vc = 0;

                for (var i = 0; i < items.length; i++) {
                    var c = items[i];
                    tw += c.el.getWidth() + c.el.getMargins('lr');
                    if (!c.hidden) vc++;
                }

                for (var i = 0; i < items.length; i++) {
                    var c = items[i],
                    w = (c.el.getWidth() + c.el.getMargins('lr')) / tw;
                    // console.log("width", c.el.getWidth(), w);
                    c.columnWidth = w;
                }

            }
        }
        Ext.layout.SplitColumnLayout.superclass.onResize.apply(this, arguments);
    }

    /**
     * @property activeItem
     * @hide
     */
});
Ext.Container.LAYOUTS['splitcolumn'] = Ext.layout.SplitColumnLayout;