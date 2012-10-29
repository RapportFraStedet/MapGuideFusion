/**
 * Fusion.Widget.OverviewMap
 *
 * $Id: OverviewMap.js 2139 2010-04-12 16:39:07Z chrisclaydon $
 *
 * Copyright 2012, MapGuideForm user group, Frederikssund Kommune and Helsingør Kommune - att. Anette Poulsen and Erling Kristensen
  
 * This file is part of "RapportFraStedet". 
 * "RapportFraStedet" is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.
 * "RapportFraStedet" is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with "RapportFraStedet". If not, see <http://www.gnu.org/licenses/>.
 */

 /********************************************************************
 * Class: Fusion.Widget.OverviewMap
 *
 * A widget that displays an overview map showing the current view of the
 * primary map.
 * **********************************************************************/

Fusion.Widget.MiniMap = OpenLayers.Class(Fusion.Widget, {
    oDialog: null,
    iframe: null,
	div : null,
	myurl:null,
	selectLayout:null,
	
    initializeWidget: function(widgetTag) {
	var iframeName = this.name+'_IFRAME';
        this.iframe = document.createElement('iframe');
        this.iframe.setAttribute('name', iframeName);
        this.iframe.setAttribute('id', iframeName);
		this.iframe.setAttribute('src', 'http://localhost:8008/mapguide/fusion/templates/mapguide/slate/index.html');
        this.iframe.setAttribute('frameborder', 0);
        this.iframe.style.border = '0px solid #fff';
        this.domObj.appendChild(this.iframe);
		this.div = document.createElement('textarea');
		new Jx.Layout(this.div);
		this.domObj.appendChild(this.div);
        var kort = new Jx.Layout(this.iframe);
				if(window.location.search=="")
		{
		this.myurl="http://localhost:8008/mapguide/fusion/templates/mapguide/Aqua/index.html?";
		}
		else
		{
		this.myurl = "http://localhost:8008/mapguide/fusion/templates/mapguide/Aqua/index.html"+window.location.search;
		}

		
	this.selectLayout = new Jx.Button.Combo({
            label: 'Vælg layout',
            items: [
                {label: 'http://localhost:8008/mapguide/fusion/templates/mapguide/Aqua/index.html'},
                {label: 'http://localhost:8008/mapguide/fusion/templates/mapguide/Slate/index.html'},
                {label: 'http://localhost:8008/mapguide/fusion/templates/mapguide/limegold/index.html'},
                {label: 'http://localhost:8008/mapguide/fusion/templates/mapguide/maroon/index.html'},
				{label: 'http://localhost:8008/mapguide/fusion/templates/mapguide/turquoiseyellow/index.html'}
            ],
			onChange: OpenLayers.Function.bind(this.layoutChanged, this) 
			
        });
	var myToolbar = new Jx.Toolbar().add(this.selectLayout);
	/*this.selectLayout.addEvent('change', OpenLayers.Function.bind(this.layoutChanged, this));*/
	var mypanel=new Jx.PanelSet({
        panels: [
		new Jx.Panel({
        /*height: 100,
        minHeight: 50,*/
        label: 'Vælg layout',
        collapse: false,
        maximize: false,
		toolbars: [myToolbar],
        content: kort
        }),
		new Jx.Panel({
        /*height: 100,*/
        minHeight: 100,
		maxHeight: 100,
        label: 'HTML kode',
        collapse: false,
        maximize: false,
        content: this.div
    })
		]
    });
 		
        this.oDialog = new Jx.Dialog({
        label: 'Mini map',
        modal: false, 
        resize: true,
        width: 200,
        height: 200,
        content: mypanel
        });
		this.oDialog.addEvent('sizeChange', OpenLayers.Function.bind(this.updateLink, this));
        this.oDialog.show();
		//this.layoutChanged();
		/*this.baseUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?';

        //remove any existing extent param
        var join = '';
        for (var param in Fusion.queryParams) {
          if (typeof Fusion.queryParams[param] == 'string') {
            if (param == 'extent' ||
                param == 'filter' ||
                param == 'spatialfilter' ||
                param == 'variant' ||
                param == 'theme' ||
                param == 'selectlayer' ||
                param == 'showlayers' ||
                param == 'hidelayers' ||
                param == 'showgroups' ||
                param == 'hidegroups' ) {
                continue;
            }
            this.baseUrl += join + param + '=' + Fusion.queryParams[param];
            join = '&';
          }
        }*/
        this.getMap().registerForEvent(Fusion.Event.MAP_LOADED, OpenLayers.Function.bind(this.updateLink, this));
				this.getMap().oMapOL.events.register("addlayer", this, this.setListener);
		this.getMap().registerForEvent(Fusion.Event.MAP_RESIZED, OpenLayers.Function.bind(this.updateLink, this));
        this.getMap().registerForEvent(Fusion.Event.MAP_EXTENTS_CHANGED, OpenLayers.Function.bind(this.updateLink, this));
		this.getMapLayer().registerForEvent(Fusion.Event.LAYER_PROPERTY_CHANGED, OpenLayers.Function.bind(this.updateLink,this));

    },

	 setListener: function(evt) {
        var layer = evt.layer;
        //register on the OL loadend event to update the link because this event
        //is fired whenever the layers are redrawn
        layer.events.register("loadend", this, this.updateLink);
    },
    
    updateLink: function() {
	try
	{
        var join = (this.myurl.indexOf('?')==this.myurl.length-1)?'':'&';
        var queryStr = this.getMap().getLinkParams();
        this.iframe.setAttribute('src', this.myurl + join + queryStr);
		this.div.innerText = "<iframe height=" + this.iframe.getHeight() + " width=" + this.iframe.getWidth() + " src='"+this.myurl + join + queryStr+"'></iframe>";
		}
		catch(err){}
    },
	/*sizeChanged: function() {
        var size1 = $(this.domObj).getContentBoxSize();
		this.iframe
		if(this.oDialog)
		{
		var size = this.oDialog.getContentBoxSize();
		alert(size);
		}
    },*/
	layoutChanged: function() {
        if(this.selectLayout)
		{
		if(window.location.search=="")
		{
		this.myurl=this.selectLayout.getValue()+"?";
		}
		else
		{
		this.myurl=this.selectLayout.getValue()+window.location.search;
		}
this.updateLink();		
	}
		/*if(this.oDialog)
		{
		var size = this.oDialog.getContentBoxSize();
		alert(size);
		}*/
    }


});

