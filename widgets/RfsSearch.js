/**
 * Fusion.Widget.RfsSearch
 *
 * $Id: SearchFlyout.js 2363 2011-04-13 17:32:06Z madair $
 *
 * Copyright 2012, MapGuideForm user group, Frederikssund Kommune and Helsingør Kommune - att. Anette Poulsen and Erling Kristensen
  
 * This file is part of "RapportFraStedet". 
 * "RapportFraStedet" is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.
 * "RapportFraStedet" is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with "RapportFraStedet". If not, see <http://www.gnu.org/licenses/>.
 */

 /********************************************************************
 * Class: Fusion.Widget.RfsSearch
 *
 * A widget to display a legend of all layers in a Button.Flyout.
 *
 * **********************************************************************/

Fusion.Widget.RfsSearch = OpenLayers.Class(Fusion.Widget,  {
	uiClass: Jx.Button.Flyout,
	content: null,
	uiObj:null,
	ajax : null,
    x1 : null,
    y1 : null,
    x2 : null,
    y2 : null,
    url : null,
    projection : null,
    title1 : null,
    title2 : null,
    title3 : null,
    url1 : null,
    url2 : null,
    url3 : null,
    id1 : null,
    id2 : null,
    id3 : null,
    name1 : null,
    name2 : null,
    name3 : null,
    placeholder1 : null,
    placeholder2 : null,
    placeholder3 : null,
    chars1 : null,
    chars2 : null,
    chars3 : null,
    text1 : "",
    text2 : "",
    text3 : "",
    selection1 : null,
    selection2 : null,
    selection3 : null,
	input1:null,
	select1:null,
	input2:null,
	select2:null,
	input3:null,
	select3:null,
	widgetTag:null,
	kommuneNr:'1',
	searchHint:null,
	map:null,
	vector:null,
	searchStatus:null,
	icon:null,
	zoom:null,
	setUiObject: function(uiObj) {
		this.uiObj=uiObj;
		Fusion.Widget.prototype.setUiObject.apply(this, [uiObj]);
		uiObj.options.content = new Jx.Panel({
            content: this.content,
            label: this.widgetTag.label,
            width: 300,
            height: 300,
            collapse: false
        });
		uiObj.loadContent(uiObj.content);
		uiObj.addEvents({'open': (function(e) { this.onOpen(e); }).bind(this)});
    },
    /**
     * Constant: defaultLayerDWFIcon
     * {String} The default image for DWF layer
     */
	
    initializeWidget: function(widgetTag) {
		this.map = this.getMap().oMapOL;
		var size = new OpenLayers.Size(21,25);
		var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
		this.icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png',size,offset);
		var result = this.map.getLayersByName("RfsSearch");
		if(result.length==0)
		{
			//this.vector = new OpenLayers.Layer.Vector("RfsSearch", {});
			this.vector = new OpenLayers.Layer.Markers("RfsSearch", {});
			this.map.addLayer(this.vector);
		}
		else
		{
			this.vector=result[0];
		}
		
		if (typeof jQuery == 'undefined') {
			var script = document.createElement('script');
			script.type = "text/javascript";
			script.src = "jquery-1.8.2.js";
			document.getElementsByTagName('head')[0].appendChild(script);
			var script1 = document.createElement('script');
			script1.type = "text/javascript";
			script1.src = "jquery.tinysort.js";
			document.getElementsByTagName('head')[0].appendChild(script1);
			var script2 = document.createElement('script');
			script2.type = "text/javascript";
			script2.src = "jquery.tinysort.charorder.js";
			document.getElementsByTagName('head')[0].appendChild(script2);
		}
        // TODO: maybe it's a good idea to do a function like Fusion.Widget.BindRenderer.. for limit the code
        // duplication if we plan to apply this pattern to others widgets
		var s = jQuery('head').find("link[href='"+Fusion.getFusionURL()+widgetTag.location+"RfsSearch/RfsSearch.css']");
		if(s.length==0)
		{
			Fusion.addWidgetStyleSheet(widgetTag.location + 'RfsSearch/RfsSearch.css');
		}
		this.content = document.createElement('div');

        this.widgetTag = widgetTag;
		/*this.content = new Jx.Panel({
            content: this.content,
            label: 'Panel in Flyout',
            width: 300,
            height: 300,
            collapse: false
        });*/    
		
		this.getMap().registerForEvent(Fusion.Event.MAP_LOADED, OpenLayers.Function.bind(this.render, this));
	},
	onOpen: function(flyout) {
	if(!this.select1)
	{
		var tablediv= jQuery('.jxFlyoutContent > .jxPanel > .jxPanelContentContainer > .jxPanelContent > div').addClass('RfsSearchTable');//jQuery("<div>",{class:'RfsSearchTable'});
		var table = jQuery("<table>").appendTo(tablediv);
		var rowHeader =jQuery("<tr>").appendTo(table);
		var rowInput = jQuery("<tr>").appendTo(table);
		var rowSelect = jQuery("<tr>").addClass('RfsSearchSelectRow').appendTo(table);

		var ext = this.widgetTag.extension;
		this.placeholder1 = ext.placeholder1[0];
		this.title1 = ext.title1[0];
		jQuery("<th>").append(ext.title1[0]).addClass('col1').appendTo(rowHeader);
		this.input1=jQuery("<input>",{'type':'text'}).keyup(this, this.search1);
		jQuery("<td>").append(this.input1).addClass('col1').appendTo(rowInput);
		this.select1=jQuery("<ul>");
		jQuery("<td>").append(this.select1).addClass('col1').appendTo(rowSelect);;
		if (ext.title2)
		{
			this.title2 = ext.title2[0];
			jQuery("<th>").append(ext.title2[0]).addClass('col2').appendTo(rowHeader);
			this.input2=jQuery("<input>",{'type':'text'}).keyup(this, this.search2);
			jQuery("<td>").append(this.input2).addClass('col2').appendTo(rowInput);
			this.select2=jQuery("<ul>");
			jQuery("<td>").append(this.select2).addClass('col2').appendTo(rowSelect);;
		}
		if (ext.title3)
		{
			this.title3 = ext.title3[0];
			jQuery("<th>").append(ext.title3[0]).addClass('col3').appendTo(rowHeader);
			this.input3=jQuery("<input>",{'type':'text'}).keyup(this, this.search3);
			jQuery("<td>").append(this.input3).addClass('col3').appendTo(rowInput);
			this.select3=jQuery("<ul>");
			jQuery("<td>").append(this.select3).addClass('col3').appendTo(rowSelect);;
		}

		this.url1 = ext.url1[0].replace(/%26/gi, '&');
		this.id1 = ext.id1[0];
		this.name1 = ext.name1[0];
		this.chars1 = ext.chars1[0];

		if (ext.placeholder2)
		{
			this.placeholder2 = ext.placeholder2[0];
			
		}	
		if (ext.url2)
			this.url2 = ext.url2[0].replace(/%26/gi, '&');
		if (ext.id2)
			this.id2 = ext.id2[0];
		if (ext.name2)
			this.name2 = ext.name2[0];
		if (ext.chars2)
			this.chars2 = ext.chars2[0];
		if (ext.placeholder3)
		{
			this.placeholder3 = ext.placeholder3[0];
			
		}
		if (ext.url3)
			this.url3 = ext.url3[0].replace(/%26/gi, '&');
		if (ext.id3)
			this.id3 = ext.id3[0];
		if (ext.name3)
			this.name3 = ext.name3[0];
		if (ext.chars3)
			this.chars3 = ext.chars3[0];
		this.url = ext.url[0].replace(/%26/gi, '&');
		this.x1 = ext.x1[0];
		this.y1 = ext.y1[0];
		if (ext.x2)
			this.x2 = ext.x2[0];
		if (ext.y2)
			this.y2 = ext.y2[0];
		if (ext.zoom)
			this.zoom = ext.zoom[0];
		this.projection = ext.projection[0];
		jQuery('.jxFlyout').addClass('RfsSearch');
		//jQuery('.jxFlyoutContent > .jxPanel > .jxPanelContentContainer > .jxPanelContent').append(tablediv);
		if(ext.chars1[0]>0)
			this.searchHint=jQuery("<p>Indtast minimum " + ext.chars1[0] + " karakterer!</p>").appendTo(tablediv);
		else
			this.searchHint=jQuery('<p>').appendTo(tablediv);
		this.searchStatus=jQuery('<p>').appendTo(tablediv);
		}
				jQuery('.jxFlyout').css('width','').css('height','');
		jQuery('.jxFlyout > .jxFlyoutContent > .jxPanel').css('width','').css('height','');
		jQuery('.jxFlyout > .jxFlyoutContent > .jxPanel > .jxPanelContentContainer').css('width','').css('height','');
		jQuery('.jxFlyout > .jxFlyoutContent > .jxPanel > .jxPanelContentContainer > .jxPanelContent').css('width','').css('height','');
		jQuery('.jxFlyout > .jxChrome').css('width','').css('height','');
		this.input1.focus();
		this.search1({data:this});
    },
	render: function(){
		

	},
	search1 : function (e) {
		var self = e.data;
		if(self.input1)
		{
		self.text1 = self.input1.val();
		self.select1.html("");
		if(self.select2)
		{
			self.input2.val("");
			self.select2.html("");
		}
		if(self.select3)
		{
			self.input3.val("");
			self.select3.html("");
		}
		if (self.text1.length >= self.chars1) {
			if (self.ajax != null) {
				self.ajax.abort();
			}
			self.searchStatus.html("<p>Søger...</p>");
			this.ajax = jQuery.ajax({
				url: self.url1.replace("[text]", self.text1).replace("[kommune]", this.kommuneNr),
				dataType: 'jsonp',
				success: function (data) {
					

					for (var i = 0; i < data.length; i++) {
						var name = self.name1;
						var m = self.name1.match(/\[.+?\]/g);
						while (m.length) {
							var a = m.shift();
							var b = self.getPath(data[i], a.replace("[", "").replace("]", ""));
							name = name.replace(a, b);
						}
						self.addItem1(self.getPath(data[i], self.id1), name, self);
					}
					self.select1.find("li").tsort({charOrder:'æøå[{Aa}]'});
				},
				complete: function () {
					self.input1.focus();
					self.searchStatus.html("");
				}
			});
		}
		}
    },
    search2 : function (e) {
		var self = e.data;
		self.text2 = self.input2.val();
		self.select2.html("");
		if(self.select3)
		{
			self.input3.val("");
			self.select3.html("");
		}
		if (self.text2.length >= self.chars2) {
            if (self.ajax != null) {
                self.ajax.abort();
            }
			self.searchStatus.html("<p>Søger...</p>");
            self.ajax = jQuery.ajax({
                url: self.url2.replace("[text]", self.text2).replace("[kommune]", self.kommuneNr).replace("[selection1]", self.selection1),
                dataType: 'jsonp',
                success: function (data) {
                    for (var i = 0; i < data.length; i++) {
                        var name = self.name2;
                        var m = self.name2.match(/\[.+?\]/g);
                        while (m.length) {
                            var a = m.shift();
                            var b = self.getPath(data[i], a.replace("[", "").replace("]", ""));
                            name = name.replace(a, b);
                        }
                        self.addItem2(self.getPath(data[i], self.id2), name,self);
                    }
					self.select2.find("li").tsort({charOrder:'æøå[{Aa}]'});
                },
                complete: function () {
					self.input2.focus();
					self.searchStatus.html("");
                }
            });
		}
    },
    search3 : function (e) {
		var self = e.data;
		self.text3 = self.input3.val();
        self.select3.html("");
        if (self.text3.length >= self.chars3) {
		if (self.ajax != null) {
            self.ajax.abort();
        }
		self.searchStatus.html("<p>Søger...</p>");
        self.ajax = jQuery.ajax({
            url: self.url3.replace("[text]", self.text3).replace("[kommune]", self.kommuneNr).replace("[selection1]", self.selection1).replace("[selection2]", self.selection2),
            dataType: 'jsonp',
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    var name = self.name3;
                    var m = self.name3.match(/\[.+?\]/g);
                    while (m.length) {
                        var a = m.shift();
                        var b = self.getPath(data[i], a.replace("[", "").replace("]", ""));
                        name = name.replace(a, b);
                    }
                    self.addItem3(self.getPath(data[i], self.id3), name,self);
                }
				self.select3.find("li").tsort({charOrder:'æøå[{Aa}]'});
            },
            complete: function () {
				self.input3.focus();
				self.searchStatus.html("");
            }
        });
		}
    },
    addItem1 : function (id, name, self) {
        jQuery("<li>").append(
			jQuery('<a />',{text: name}).click(function () {
                self.select1.find('a').each(function(){
					this.removeClass('selected');
				});
				jQuery(this).addClass('selected');
				self.selection1 = id;
                if (self.url2) {
                    self.input2.val("");
					self.input2.focus();
                    self.select2.html("");
                    if (self.chars2 > 0)
                        self.searchHint.html("<p>Indtast minimum " + self.chars2 + " karakterer!</p>");
                    else {
                        self.searchHint.html("");
                        self.text2 = "";
                        self.search2({data:self});
                    }
                }
                else {
                    self.getPosition(name,self);
                }
            })
        ).appendTo(self.select1);
    },
    addItem2 : function (id, name,self) {
        jQuery("<li>").append(
			jQuery('<a />',{text: name}).click(function () {
                self.select2.find('a').each(function(){
					this.removeClass('selected');
				});
				jQuery(this).addClass('selected');

				self.selection2 = id;
                if (self.url3) {
                    self.input3.val("");
					self.input3.focus();
                    self.select3.html("");
                    if (self.chars3 > 0)
                        self.searchHint.html("<p>Indtast minimum " + self.chars3 + " karakterer!</p>");
                    else {
                        self.searchHint.html("");
                        self.text3 = "";
                        self.search3({data:self});
                    }
                }
                else {
                    self.getPosition(name,self);
                }
            })
        ).appendTo(self.select2);
    },
    addItem3 : function (id, name,self) {
        jQuery("<li>").append(
			jQuery('<a />',{text: name}).click(function () {
                self.select3.find('a').each(function(){
					this.removeClass('selected');
				});
				jQuery(this).addClass('selected');

				self.selection3 = id;
                self.getPosition(name, self);
            })
        ).appendTo(self.select3);
    },
    getPosition : function (name, self) {
        if (self.ajax != null) {
            self.ajax.abort();
        }
		self.searchStatus.html("<p>Søger...</p>");
        self.ajax = jQuery.ajax({
            url: self.url.replace("[text]", name).replace("[kommune]", self.kommuneNr).replace("[selection1]", self.selection1).replace("[selection2]", self.selection2).replace("[selection3]", self.selection3),
            dataType: 'jsonp',
            success: function (data) {
                var code = null;
				try{
					code = self.map.projection.getCode();
				}
				catch(err)
				{
					code = self.map.projection;
				}
				var mapProjection=null;
				if(code == "ETRS89.UTM-32N")
					mapProjection = new OpenLayers.Projection("EPSG:25832");
				else
					mapProjection = self.map.projection;
				if (self.x2) {
                    var point1 = new OpenLayers.Geometry.Point(self.getPath(data, self.x1), self.getPath(data, self.y1));
                    var point2 = new OpenLayers.Geometry.Point(self.getPath(data, self.x2), self.getPath(data, self.y2));
                    point1.transform(new OpenLayers.Projection(self.projection), mapProjection);
                    point2.transform(new OpenLayers.Projection(self.projection), mapProjection);
                    var bounds = new OpenLayers.Bounds(point1.x, point1.y, point2.x, point2.y);
                    self.map.zoomToExtent(bounds);
                }
                else {
					var lonlat = new OpenLayers.LonLat(self.getPath(data, self.x1), self.getPath(data, self.y1));
					lonlat.transform(new OpenLayers.Projection(self.projection), mapProjection);
					self.vector.clearMarkers();
					self.vector.addMarker(new OpenLayers.Marker(lonlat,this.icon));
					if(self.zoom)
					{
						var o = self.zoom / 2;
						self.map.zoomToExtent([lonlat.lon - o, lonlat.lat - o, lonlat.lon + o, lonlat.lat + o]);
					}
					else
						self.map.zoomToExtent(self.vector.getDataExtent());
                    /*var point = new OpenLayers.Geometry.Point(self.getPath(data, self.x1), self.getPath(data, self.y1));
                    point.transform(new OpenLayers.Projection(self.projection), self.map.projection);
					self.vector.removeAllFeatures();
                    self.vector.addFeatures([
                        new OpenLayers.Feature.Vector(
                            point,
                            {},
                            {
                                graphicName: 'cross',
                                strokeColor: '#f00',
                                strokeWidth: 2,
                                fillOpacity: 0,
                                pointRadius: 10
                            }
                        )
                    ]);
                    self.map.zoomToExtent(self.vector.getDataExtent());*/
                }
            },
            complete: function () {
				self.searchStatus.html("");
            }
        });

    },
	getPath: function (obj, path) {
		if(obj.length>0)
			obj = obj[0];
		var parts = path.split('.');
		while (parts.length && obj) {
			obj = obj[parts.shift()];
		}
		return obj;
	}
});