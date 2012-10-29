/**
 * Fusion.Widget.QuickPlot
 * Copyright 2012, MapGuideForm user group, Frederikssund Kommune and Helsingør Kommune - att. Anette Poulsen and Erling Kristensen
  
 * This file is part of "RapportFraStedet". 
 * "RapportFraStedet" is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.
 * "RapportFraStedet" is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with "RapportFraStedet". If not, see <http://www.gnu.org/licenses/>.

 */

/*****************************************************************************
 * Class: Fusion.Widget.QuickPlot
 * This widget provides a quick way to print a certain region of map in a good quality
 * **********************************************************************/

Fusion.require("widgets/QuickPlotFlyout/MapCapturer.js");
Fusion.require("widgets/QuickPlotFlyout/PreviewDialog.js");

Fusion.Widget.QuickPlotFlyout = OpenLayers.Class(Fusion.Widget, {
		uiClass : Jx.Button,
		dialog : null,
		sFeatures : 'menubar=no,location=no,resizable=no,status=no',
		options : {},
		
		initializeWidget : function (widgetTag) {
			this.mapCapturer = new OpenLayers.Control.MapCapturer(this.getMap());
			this.getMap().oMapOL.addControl(this.mapCapturer);
			
			var json = widgetTag.extension;
			
			this.sTarget = json.Target ? json.Target[0] : "PrintPanelWindow";
			this.sBaseUrl = Fusion.getFusionURL() + 'widgets/QuickPlotFlyout/QuickPlotPanel.php';
			
			this.additionalParameters = [];
			if (json.AdditionalParameter) {
				for (var i = 0; i < json.AdditionalParameter.length; i++) {
					var p = json.AdditionalParameter[i];
					var k = p.Key[0];
					var v = p.Value[0];
					this.additionalParameters.push(k + '=' + encodeURIComponent(v));
				}
			}
			
		},
		
		activate : function () {
			if (!this.dialog) {
				var url = this.sBaseUrl;
				var widgetLayer = this.getMapLayer();
				var taskPaneTarget = Fusion.getWidgetById(this.sTarget);
				var pageElement = $(this.sTarget);
				
				var params = [];
				params.push('locale=' + Fusion.locale);
				params.push('session=' + widgetLayer.getSessionID());
				params.push('mapname=' + widgetLayer.getMapName());
				
				if (taskPaneTarget || pageElement) {
					params.push('popup=false');
				} else {
					params.push('popup=true');
				}
				
				params = params.concat(this.additionalParameters);
				
				if (url.indexOf('?') < 0) {
					url += '?';
				} else if (url.slice(-1) != '&') {
					url += '&';
				}
				
				url += params.join('&');
				
				if (taskPaneTarget) {
					taskPaneTarget.setContent(url);
				} else {
					if (pageElement) {
						pageElement.src = url;
					} else {
						var self = this;
						var content = document.createElement('iframe');
						jQuery(content).css({
							height : '280px',
							'border-style' : 'none',
							width : '270px',
							margin : '0',
							padding : '0'
						});
						content.src = url;
						this.dialog = new Jx.Dialog({
								label : this.widgetTag.label,
								width : 300,
								height : 340,
								resize : false,
								id : 'printAdvanced',
								content : content,
								modal: false
							});
					}
				}
			}
			this.dialog.addEvent("close", this.closed.bind(this));
			this.dialog.show();
		},
		closed: function()
		{
			this.mapCapturer.disable();
		},
		/***************************************************************************************
		 * The dialogContentLoadedCallback is used to submit the Quick Plot panel's parameters to the preview iframe
		 ***************************************************************************************/
		preview : function (dialogConentLoadedCallback, printDpi) {
			var map = this.getMapLayer();
			var capture = this.mapCapturer.getCaptureBox();
			var normalizedCapture = this.mapCapturer.getNormalizedCapture();
			var vertices = capture.geometry.getVertices();
			this.options.printDpi = printDpi;
			var options = {
				mapInfo : {
					sessionID : map.getSessionID(),
					name : map.getMapName()
				},
				captureInfo : {
					topLeftCs : {
						x : vertices[3].x,
						y : vertices[3].y
					},
					bottomRightCs : {
						x : vertices[1].x,
						y : vertices[1].y
					},
					paperSize : {
						w : this.mapCapturer.paperSize.w,
						h : this.mapCapturer.paperSize.h
					},
					scaleDenominator : this.mapCapturer.scaleDenominator,
					rotation : this.mapCapturer.rotation,
					center : capture.geometry.getCentroid(),
					params1 : capture.params,
					params2 : normalizedCapture.params
				},
				params : this.options
			};
			
			if (!this.previewDialog) {
				this.previewDialog = new PreviewDialog(options);
			} else {
				this.previewDialog.mapInfo = options.mapInfo;
				this.previewDialog.captureInfo = options.captureInfo;
				this.previewDialog.params = options.params;
			}
			
			this.previewDialog.open(dialogConentLoadedCallback);
		},
		
		cancelPreview : function () {
			this.previewDialog.cancel();
		},
		
		printPreview : function () {
			this.previewDialog.print();
		},
		
		previewInnerLoaded : function () {
			this.previewDialog.previewInnerLoaded();
		}
	});
