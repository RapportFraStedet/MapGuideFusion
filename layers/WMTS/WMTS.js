/*
Copyright 2012, MapGuideForm user group, Frederikssund Kommune and Helsingør Kommune - att. Anette Poulsen and Erling Kristensen

This file is part of "RapportFraStedet".
"RapportFraStedet" is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.
"RapportFraStedet" is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
You should have received a copy of the GNU General Public License along with "RapportFraStedet". If not, see <http://www.gnu.org/licenses/>.
 */

/***************************************************************************
 * Class: Fusion.Layers.WMTS
 *
 * Implements the map layer for WMTS mapping services.
 */

Fusion.Layers.WMTS = OpenLayers.Class(Fusion.Layers, {
		arch : 'WMTS',
		sActiveLayer : null,
		selectionType : 'INTERSECTS',
		bSelectionOn : false,
		oSelection : null,
		
		initialize : function (map, mapTag, isMapWidgetLayer) {
			// console.log('Generic.initialize');
			Fusion.Layers.prototype.initialize.apply(this, arguments);
			
			this._sMapname = mapTag.layerOptions['name'] ? mapTag.layerOptions['name'] : 'wmts layer';
			
			this.minScale = mapTag.layerOptions.minScale ? mapTag.layerOptions.minScale : 1;
			this.maxScale = mapTag.layerOptions.maxScale ? mapTag.layerOptions.maxScale : 'auto';
			var scaleRange = new Fusion.Layers.ScaleRange({
					minScale : this.minScale,
					maxScale : this.maxScale
				},
					Fusion.Constant.LAYER_RASTER_TYPE);
			
			rootOpts = {
				layerName : this._sMapname,
				resourceId : this.sMapResourceId,
				selectable : false,
				editable : false,
				layerTypes : [Fusion.Constant.LAYER_RASTER_TYPE],
				minScale : this.minScale,
				maxScale : this.maxScale,
				scaleRanges : [scaleRange],
				parentGroup : map.layerRoot,
				displayInLegend : this.bDisplayInLegend,
				expandInLegend : this.bExpandInLegend,
				legendLabel : this._sMapname,
				uniqueId : 'layerRoot',
				visible : true,
				actuallyVisible : true
				//TODO: set other opts for group initialization as required
			};
			this.layerRoot = new Fusion.Layers.Layer(rootOpts, this);
			//this.layerRoot = new Fusion.Layers.Group(rootOpts,this);
			if (isMapWidgetLayer) {
				this.loadMap(this.sMapResourceId);
			}
		},
		
		loadMap : function (resourceId) {
			this.bMapLoaded = false;
			
			this.triggerEvent(Fusion.Event.LAYER_LOADING);
			if (this.bIsMapWidgetLayer) {
				this.mapWidget._addWorker();
			}
			
			//remove this layer if it was already created
			if (this.oLayerOL) {
				this.oLayerOL.events.unregister("loadstart", this, this.loadStart);
				this.oLayerOL.events.unregister("loadend", this, this.loadEnd);
				this.oLayerOL.events.unregister("loadcancel", this, this.loadEnd);
				this.oLayerOL.destroy();
				this.oLayerOL = null;
			}
			
			OpenLayers.ProxyHost = "../../../lib/OpenLayers/proxy.cgi?url=";
			//this.oLayerOL = new OpenLayers.Layer.WMTS(this.mapTag.layerOptions);
			this.mapTag.layerOptions.url = this.mapTag.layerOptions.url.replace(/%26/gi, '&')
				var self = this;
			OpenLayers.Request.GET({
				url : this.mapTag.layerOptions.url,
				params : {
					SERVICE : "WMTS",
					VERSION : "1.0.0",
					REQUEST : "GetCapabilities"
				},
				success : function (request) {
					var doc = request.responseXML;
					if (!doc || !doc.documentElement) {
						doc = request.responseText;
					}
					var format = new OpenLayers.Format.WMTSCapabilities();
					var capabilities = format.read(doc);
					self.oLayerOL = format.createLayer(capabilities, self.mapTag.layerOptions);
					self.oLayerOL.url = self.mapTag.layerOptions.url;
					self.oLayerOL.events.register("loadstart", self, self.loadStart);
					self.oLayerOL.events.register("loadend", self, self.loadEnd);
					self.oLayerOL.events.register("loadcancel", self, self.loadEnd);
					self.oLayerOL.options.resolutions = new Array(self.oLayerOL.matrixIds.length);
					for (var i = 0; i < self.oLayerOL.matrixIds.length; i++) {
						self.oLayerOL.options.resolutions[i] = self.oLayerOL.matrixIds[i].scaleDenominator * 0.00028;
					}
					self.oLayerOL.options.maxExtent = capabilities.contents.tileMatrixSets[self.mapTag.layerOptions.matrixSet].bounds;
					self.oLayerOL.maxExtent = self.oLayerOL.options.maxExtent;
					//this is to distinguish between a regular map and an overview map
					if (self.bIsMapWidgetLayer) {
						self.mapWidget.addMap(self);
						self.mapWidget._removeWorker();
					}
					
					//this.triggerEvent(Fusion.Event.LAYER_LOADED);
					window.setTimeout(OpenLayers.Function.bind(self.asyncTrigger, self), 1);
				},
				failure : function () {
					alert("Trouble getting capabilities doc");
					OpenLayers.Console.error.apply(OpenLayers.Console, arguments);
				}
			});
		},
		
		asyncTrigger : function () {
			this.bMapLoaded = true;
			this.triggerEvent(Fusion.Event.LAYER_LOADED);
		},
		
		//TBD: this function not yet converted for OL
		reloadMap : function () {
			
			this.loadMap(this.sResourceId);
			this.mapWidget.triggerEvent(Fusion.Event.MAP_RELOADED);
			this.drawMap();
		},
		
		drawMap : function () {
			if (!this.bMapLoaded) {
				return;
			}
			this.oLayerOL.mergeNewParams(params);
		},
		
		showLayer : function (layer, noDraw) {
			this.processLayerEvents(layer, true);
			if (!noDraw) {
				this.oLayerOL.setVisibility(true);
			}
		},
		
		hideLayer : function (layer, noDraw) {
			this.processLayerEvents(layer, false);
			if (!noDraw) {
				this.oLayerOL.setVisibility(false);
			}
		},
		
		showGroup : function (group, noDraw) {
			this.processGroupEvents(group, true);
		},
		
		hideGroup : function (group, noDraw) {
			this.processGroupEvents(group, false);
		},
		
		refreshLayer : function (layer) {
			this.drawMap();
		},
		
		getLegendImageURL : function (fScale, layer, style, defaultIcon) {
			//var url = null; //TODO: provide a generic icon url
			return defaultIcon;
		},
		
		getSessionID : function () {
			return '';
		},
		
		getLinkParams : function () {
			var queryParams = {};
			queryParams.layerType = this.layerType; //need this? and one for this.mapTag.layerOptions.type?
			
			return queryParams;
		}
		
	});
