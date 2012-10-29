/**
 * Fusion.Widget.RapportFraStedet
 *
 * $Id: RapportFraStedet.js 2 2011-04-04 21:44:26Z rune $
 *
 * Copyright 2012, MapGuideForm user group, Frederikssund Kommune and Helsingør Kommune - att. Anette Poulsen and Erling Kristensen
  
 * This file is part of "RapportFraStedet". 
 * "RapportFraStedet" is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.
 * "RapportFraStedet" is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with "RapportFraStedet". If not, see <http://www.gnu.org/licenses/>.
 */

/********************************************************************
* Class: Fusion.Widget.RapportFraStedet
*
* RapportFraStedet widget to redline and report forms data.
*
* **********************************************************************/

Fusion.Widget.RapportFraStedet = OpenLayers.Class(Fusion.Widget, {
    //uiClass: Jx.Button.Flyout,
	activeControl:null,
	content: null,
	vectorLayer: null,
	navigation: null,
	modify: null,
	editingPoint: null,
	editingPath: null,
	editingPolygon: null,
	//Jx Buttons
	navigationButton: null,
	modifyButton: null,
	pointButton: null,
	pathButton: null,
	polygonButton: null,	
	panelUrl: null,
	taskPaneWin: null,
	//panel: null,
    markers: null,
	icon: null,
	useTaskPane: false, 
	iframe: null,
	panIcon: null,
	pointIcon: null,
	pathIcon: null,
	polygonIcon: null,
	modifyIcon: null,
	d3: null,
	geometryId: null,
	geometryType:null,
	crosshairMarker:null,
	crosshairLayer:null,
	crosshairIcon:null,
	create:false,
	/*setUiObject: function(uiObj) {
		this.uiObj=uiObj;
		Fusion.Widget.prototype.setUiObject.apply(this, [uiObj]);
		var topToolbar = new Jx.Toolbar({id: 'ToolbarDraw', position: 'top'});
		uiObj.options.content = new Jx.Panel({
            label: this.widgetTag.label,
            width: 300,
            height: 300,
            collapse: false,
			toolbars: [topToolbar]
        });
		//uiObj.loadContent(uiObj.content);
		uiObj.addEvents({'open': (function(e) { this.onOpen(e); }).bind(this)});
    },*/
	onOpen: function(flyout) {
	},
/*
 * Constructor: RapportFraStedet
 *
 * Parameters:
 *
 * widgetTag - JSON node for this widget from the Application definition
 *
 */
    initializeWidget: function(widgetTag) {
		//Proj4js.defs["EPSG:25832"] = "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs";
		var url = Fusion.getFusionURL();
		this.asCursor = ['auto'];
        this.panIcon =  url + widgetTag.location + 'RapportFraStedet/pan_off.png';
		this.pointIcon =  url + widgetTag.location + 'RapportFraStedet/draw_point_off.png';
		this.pathIcon =  url + widgetTag.location + 'RapportFraStedet/draw_line_off.png';
		this.polygonIcon =  url + widgetTag.location + 'RapportFraStedet/draw_polygon_off.png';
		this.modifyIcon =  url + widgetTag.location + 'RapportFraStedet/add_point_off.png';
		var json = widgetTag.extension;
		this.panelUrl = json.Url;
		if(json.useTaskPane)
			this.useTaskPane = true;
		if(json.type && json.type.length>0)
			this.geometryType = json.type[0];
		var mapWidget = Fusion.getWidgetById("Map");
		var map = mapWidget.oMapOL;
		this.markers = new OpenLayers.Layer.Markers( "Markers" );
		map.addLayer(this.markers);
		var size = new OpenLayers.Size(21,25);
		var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
		this.icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png',size,offset);
		this.crosshairLayer = new OpenLayers.Layer.Markers("Crosshairs Layer");
		map.addLayer(this.crosshairLayer);
		var size = new OpenLayers.Size(100, 100);
		var offset = new OpenLayers.Pixel(-50, -50);
		this.crosshairIcon = new OpenLayers.Icon(url + widgetTag.location + 'RapportFraStedet/crosshair.png', size, offset);
		// create vector layer
		//var vector = new OpenLayers.Layer.Vector('Redline Layer');
		var colorDefault = "#ff6600";
		var colorSelect = "#ff9900";
		var colorTemporary = "#ff3300";
		var vector = new OpenLayers.Layer.Vector('Redline Layer', {
        styleMap: new OpenLayers.StyleMap({
            "default": new OpenLayers.Style(null, {
                rules: [
                    new OpenLayers.Rule({
                        symbolizer: {
                            "Point": {
                                pointRadius: 10,
                                graphicName: "circle",
                                fillColor: "white",
                                fillOpacity: 0.25,
                                strokeWidth: 3,
                                strokeOpacity: 1,
                                strokeColor: colorDefault
                            },
                            "Line": {
                                strokeWidth: 3,
                                strokeOpacity: 1,
                                strokeColor: colorDefault
                            },
                            "Polygon": {
                                strokeWidth: 3,
                                strokeOpacity: 1,
                                fillColor: colorDefault,
                                strokeColor: colorDefault
                            }
                        }
                    })
                ]
            }),
            "select": new OpenLayers.Style(null, {
                rules: [
                    new OpenLayers.Rule({
                        symbolizer: {
                            "Point": {
                                pointRadius: 10,
                                graphicName: "circle",
                                fillColor: "white",
                                fillOpacity: 0.25,
                                strokeWidth: 3,
                                strokeOpacity: 1,
                                strokeColor: colorSelect
                            },
                            "Line": {
                                strokeWidth: 3,
                                strokeOpacity: 1,
                                strokeColor: colorSelect
                            },
                            "Polygon": {
                                strokeWidth: 3,
                                strokeOpacity: 1,
                                fillColor: colorSelect,
                                strokeColor: colorSelect
                            }
                        }
                    })
                ]
            }),
            "temporary": new OpenLayers.Style(null, {
                rules: [
                    new OpenLayers.Rule({
                        symbolizer: {
                            "Point": {
                                graphicName: "circle",
                                pointRadius: 10,
                                fillColor: "white",
                                fillOpacity: 0.25,
                                strokeWidth: 3,
                                strokeColor: colorTemporary
                            },
                            "Line": {
                                pointRadius: 10,
                                strokeWidth: 3,
                                strokeOpacity: 1,
                                strokeColor: colorTemporary
                            },
                            "Polygon": {
                                strokeWidth: 3,
                                strokeOpacity: 1,
                                strokeColor: colorTemporary,
                                fillColor: colorTemporary
                            }
                        }
                    })
                ]
            })
        })
    });
		vector.events.register('featuremodified', this, this.featureModified);
		vector.events.register('beforefeatureadded', this, this.featureModified);

		map.events.register('move',this,this.move);

		this.vectorLayer = vector;
		map.addLayer(vector);

		this.modify = new OpenLayers.Control.ModifyFeature(
			vector, {
				"displayClass": "olControlModifyFeature",
				"title": "Ret tegning"
			}
		);
		map.addControl(this.modify);
		this.modifyButton = new Jx.Button({
            tooltip: 'Ret tegning',
			image: this.modifyIcon,			
            onClick: OpenLayers.Function.bind(this.modifyFeature, this)
        });
		this.editingPoint = new OpenLayers.Control.DrawFeature(
			vector, 
			OpenLayers.Handler.Point, {
				"displayClass": "olControlDrawFeaturePoint",
				"title": "Tegn et punkt"
			}
		);
		map.addControl(this.editingPoint);
		//this.editingPoint.events.register('featureadded', this, this.pointAdded);
		this.pointButton = new Jx.Button({
            tooltip: 'Tegn et punkt',
			image: this.pointIcon,
            onClick: OpenLayers.Function.bind(this.drawPoint, this)
        });
		this.editingPath = new OpenLayers.Control.DrawFeature(
			vector, 
			OpenLayers.Handler.Path, {
				"displayClass": "olControlDrawFeaturePath",
				"title": "Tegn en linie"
			}
		);
		map.addControl(this.editingPath);
		this.pathButton = new Jx.Button({
            tooltip: 'Tegn en linie', 
			image: this.pathIcon,
            onClick: OpenLayers.Function.bind(this.drawPath, this)
        });
		this.editingPolygon = new OpenLayers.Control.DrawFeature(
			vector,
			OpenLayers.Handler.Polygon, {
				"displayClass": "olControlDrawFeaturePolygon",
				"title": "Tegn en polygon"
			}
		);
		map.addControl(this.editingPolygon);
		this.polygonButton = new Jx.Button({
            tooltip: 'Tegn en polygon',
			image: this.polygonIcon,
            onClick: OpenLayers.Function.bind(this.drawPolygon, this)
        });
		this.navigation = new OpenLayers.Control.Navigation({
				"displayClass": "olControlNavigation",
				"title": "Naviger"
			}
		);
		map.addControl(this.navigation);
		this.navigationButton = new Jx.Button({
            tooltip: 'Panorér', 
			image: this.panIcon,
            onClick: OpenLayers.Function.bind(this.navigate, this)
        });
        var iframeName = this.name+'_IFRAME';
        this.iframe = document.createElement('iframe');
        new Jx.Layout(this.iframe);
        this.iframe.setAttribute('name', iframeName);
        this.iframe.setAttribute('id', iframeName);
        this.iframe.setAttribute('frameborder', 0);
        this.iframe.style.border = '0px solid #fff';
        this.domObj.appendChild(this.iframe);
		this.oTaskPane = new Jx.Panel({
            hideTitle: true,
            content: this.iframe
        });
        //$(this.domObj).addClass('taskPanePanel');
        //Fusion.addWidgetStyleSheet(widgetTag.location + 'TaskPane/TaskPane.css');*/
        this.domObj.appendChild(this.oTaskPane.domObj);
        //we need to trigger an initial resize after the panel
        //is added to the DOM
        this.oTaskPane.domObj.resize();
		
		Proj4js.defs["EPSG:25832"] = "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs";
		Proj4js.defs["EPSG:4095"] = "+proj=tmerc +lat_0=0 +lon_0=11.75 +k=0.99998 +x_0=600000 +y_0=-5000000 +ellps=GRS80 +units=m +no_defs";
		
        this.getMap().registerForEvent(Fusion.Event.MAP_LOADED, OpenLayers.Function.bind(this.setInitialContent, this));

        //this.enable();
    },
	removeAllFeatures: function(event){
		if(this.activeControl)
			this.activeControl.deactivate();
		this.getMap().setCursor(this.asCursor);
		this.vectorLayer.removeAllFeatures();
	},
	featureModified: function (object) {
		var map = this.getMap().oMapOL;
		var geometrySRS = this.taskPaneWin.document.getElementById("Form_SRS").value;
		var geometry = this.taskPaneWin.document.getElementById("Geometri");
		var code = null;
		try{
			code = map.projection.getCode();
		}
		catch(err)
		{
			code = map.projection;
		}
		var mapProjection=null;
		if(code == "ETRS89.UTM-32N")
			mapProjection = new OpenLayers.Projection("EPSG:25832");
		else
			mapProjection = map.projection;
		var dest = new OpenLayers.Projection(geometrySRS);
		var olGeometry = object.feature.geometry.clone();
		var oltGeometry = olGeometry.transform(mapProjection,dest);
		geometry.value=oltGeometry;
	},
	gup: function(name){
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		var regexS = "[\\?&]"+name+"=([^&#]*)";
		var regex = new RegExp( regexS );
		var results = regex.exec( window.location.href );
		if( results == null )
			return "";
		else
			return results[1];
	},
    setInitialContent: function() {
		var map = this.getMap();
		var url = this.panelUrl[0];
		var viewId = this.gup("id");
		var formId = this.gup("formId");
		var itemId = this.gup("itemId");
		if(viewId){
			url = url.substring(0,url.lastIndexOf('/')+1) + viewId;
			if(formId){
				url = url + "?formId=" + formId;
				if(itemId){
					url = url + "&itemId="+itemId;
				}
			}
		}
		this.iframe.src = url;
		this.iframe.taskPaneId = this.widgetTag.name;
		this.taskPaneWin = this.iframe.contentWindow;
		//this.setTools();
    },
	
	displayStatus: function() {
		this.navigation.activate();
		var vertices = this.vectorLayer.features[0].geometry.getVertices();
		var s = "";
		for (var i = 0; i < vertices.length; i++) {
			s = s + vertices[i].x + "," + vertices[i].y + ","
		}
		var geometry = this.taskPaneWin.document.getElementById(this.geometryId);
		geometry.value=s;
		var srs	= this.taskPaneWin.document.getElementById("Form_SRS");
		var map = this.getMap().oMapOL;
		srs.value=map.projection.projCode;
	},
	navigate: function() {
		if(this.activeControl)
			this.activeControl.deactivate();
		this.activeControl = this.navigation;
		this.activeControl.activate();
	},
    drawPoint: function() {
		
		this.removeAllFeatures();
		//this.navigation.activate();
		this.activeControl = this.editingPoint;
		this.activeControl.activate();
	},
    drawPath: function() {
		this.removeAllFeatures();
		//this.navigation.activate();
		this.activeControl = this.editingPath;
		this.activeControl.activate();
	},
    drawPolygon: function() {
		this.removeAllFeatures();
		//this.navigation.activate();
		this.activeControl = this.editingPolygon;
		this.activeControl.activate();
	},
    modifyFeature: function() {
		//this.getMap().setCursor(this.asCursor);
		//this.navigation.activate();
		if(this.activeControl)
			this.activeControl.deactivate();
		this.getMap().setCursor(this.asCursor);
		this.activeControl = this.modify;
		this.activeControl.activate();
	},
	removeTools: function(){
		this.create=false;
		//var map = this.getMap().oMapOL;
		//map.removeControl(this.panel);
		if(this.d3)
			this.d3.close();
	},
	setTools: function(){
		this.create=true;
		var toolbar = new Jx.Toolbar({position:'top'});
		//var map = this.getMap().oMapOL;
		//map.removeControl(this.panel);
		var width = 0;
		var width3 = 120;
		var width4 = 144;
		var width5 = 168;
		// add controls to the map
		//this.panel = new OpenLayers.Control.Panel();
		switch(this.geometryType){
			case "1":
			/*	this.panel.addControls([
					this.navigation,
					this.editingPoint,
					this.modify
				]);*/
				toolbar.add(
					this.navigationButton,
					this.pointButton,
					this.modifyButton
				);
				width=width3;
				break;
			case "2":
					/*this.panel.addControls([
					this.navigation,
					this.editingPath,
					this.modify
				]);*/
				toolbar.add(
					this.navigationButton,
					this.pathButton,
					this.modifyButton
				);
				width=width3;
				break;
			case "3":
				/*this.panel.addControls([
					this.navigation,
					this.editingPoint,
					this.editingPath,
					this.modify
				]);*/
				toolbar.add(
					this.navigationButton,
					this.pointButton,
					this.pathButton,
					this.modifyButton
				);
				width=width4;
				break;
			case "4":
					/*this.panel.addControls([
					this.navigation,
					this.editingPolygon,
					this.modify
				]);*/
				toolbar.add(
					this.navigationButton,
					this.polygonButton,
					this.modifyButton
				);
				width=width3;
				break;
			case "5":
					/*this.panel.addControls([
					this.navigation,
					this.editingPoint,
					this.editingPolygon,
					this.modify
				]);*/
				toolbar.add(
					this.navigationButton,
					this.pointButton,
					this.polygonButton,
					this.modifyButton
				);
				width=width4;
				break;
			case "6":
				/*this.panel.addControls([
					this.navigation,
					this.editingPath,
					this.editingPolygon,
					this.modify
				]);*/
				toolbar.add(
					this.navigationButton,
					this.pathButton,
					this.polygonButton,
					this.modifyButton
				);
				width=width4;
				break;
			case "7":
					/*this.panel.addControls([
					this.navigation,
					this.editingPoint,
					this.editingPath,
					this.editingPolygon,
					this.modify
				]);*/
				toolbar.add(
					this.navigationButton,
					this.pointButton,
					this.pathButton,
					this.polygonButton,
					this.modifyButton
				);
				width=width5;
				break;
		}
		//map.addControl(this.panel);
		
        if(this.gemetryType!="0" || this.gemetryType!="-1")
		{
			if(this.d3)
			{
				this.d3.close();
			}
			this.d3 = new Jx.Dialog({
				label: 'Rediger',
				modal: false,
				close: false,
				collapse: false,
				horizontal: 'center center',
				vertical: 'center center',
				width: width,
				height: 70,
				toolbars: [toolbar]
			});
			this.d3.open();
		}
		var self = this;
		if(navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function (object) {
						var position = self.taskPaneWin.document.getElementById("Position");
						if(position)
							position.value="POINT(" + object.coords.longitude + " " + object.coords.latitude + ")";
						var accuracy = self.taskPaneWin.document.getElementById("Accuracy");
						if(accuracy)
							accuracy.value=object.coords.accuracy;
                    },
                    function (error) {
                    },
                    {
                        enableHighAccuracy: true,
                        maximumAge: 0,
                        timeout: 10000
                    }
                );
            }
	},
	
	clearMarker: function() {
		if(this.markers.markers.length > 0){
			this.markers.removeMarker(this.markers.markers[0]);
		}
	},
	clearLayer: function() {
		this.vectorLayer.removeAllFeatures();
	},
	pan: function(data){
		var map = this.getMap().oMapOL;
		var lon = data.X;
		var lat = data.Y;
		var lonlat = new OpenLayers.LonLat(lon, lat);
		var source = new OpenLayers.Projection(data.SRS);
		var code = null;
		try{
			code = map.projection.getCode();
		}
		catch(err)
		{
			code = map.projection;
		}
		var mapProjection=null;
		if(code == "ETRS89.UTM-32N")
			mapProjection = new OpenLayers.Projection("EPSG:25832");
		else
			mapProjection = map.projection;
		lonlat.transform(mapProjection,dest);
		this.markers.addMarker(new OpenLayers.Marker(lonlat,this.icon));
		map.zoomToScale(500);
		//map.zoomTo(50);
		map.panTo(lonlat);
	},
	createGeometry: function(){
		this.vectorLayer.removeAllFeatures();
		var map = this.getMap().oMapOL;
		var geometry = this.taskPaneWin.document.getElementById("Geometri").value;
		if(geometry!="")
		{
			var code = null;
			try{
				code = map.projection.getCode();
			}
			catch(err)
			{
				code = map.projection;
			}
			var mapProjection=null;
			if(code == "ETRS89.UTM-32N")
				mapProjection = new OpenLayers.Projection("EPSG:25832");
			else
				mapProjection = map.projection;
			var geometrySRS = this.taskPaneWin.document.getElementById("Form_SRS").value;
			var source = new OpenLayers.Projection(geometrySRS);
			var olGeometry = OpenLayers.Geometry.fromWKT(geometry);
			var oltGeometry = olGeometry.transform(source,mapProjection);
			var feature = new OpenLayers.Feature.Vector(oltGeometry);
			map.zoomToExtent(oltGeometry.getBounds().scale(1.1));
			this.vectorLayer.addFeatures([feature]);
		}
	},
	move: function () {
		if(this.geometryType=="0"){
			var map = this.getMap().oMapOL;
			var extent = map.getExtent();
			if(this.crosshairMarker)
				this.crosshairLayer.removeMarker(this.crosshairMarker);
			this.crosshairMarker = new OpenLayers.Marker(new OpenLayers.LonLat(extent.left + (extent.right - extent.left) / 2, extent.bottom + (extent.top - extent.bottom) / 2), this.crosshairIcon);
			this.crosshairLayer.addMarker(this.crosshairMarker);
			if(this.create)
			{
				var geometry = this.taskPaneWin.document.getElementById("Geometri");
				if(geometry)
				{
					var code = null;
					try{
						code = map.projection.getCode();
					}
					catch(err)
					{
						code = map.projection;
					}
					var mapProjection=null;
					if(code == "ETRS89.UTM-32N")
						mapProjection = new OpenLayers.Projection("EPSG:25832");
					else
						mapProjection = map.projection;
					var geometrySRS = this.taskPaneWin.document.getElementById("Form_SRS").value;
					var dest = new OpenLayers.Projection(geometrySRS);
					var olGeometry = new OpenLayers.Geometry.Point(extent.left + (extent.right - extent.left) / 2, extent.bottom + (extent.top - extent.bottom) / 2);
					var oltGeometry = olGeometry.transform(mapProjection,dest);
					geometry.value=oltGeometry;
				}
			}
		}
	}	
});
