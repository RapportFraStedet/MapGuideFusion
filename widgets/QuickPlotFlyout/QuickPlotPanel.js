/**
 * Copyright (C) 2010 Autodesk, Inc. All rights reserved.
 */

function restoreUI()
{
    setAdvancedOptionsUI(false);
    
    // Read the last used options
    lastPaperSize = parent.Cookie.read("QuickPlotLastUsedPaperSize");
    lastScale     = parent.Cookie.read("QuickPlotLastUsedScaling");
    lastDPI       = parent.Cookie.read("QuickPlotLastUsedDPI");
    
    if (lastPaperSize != null)
    {
        document.getElementById("PaperList").value   = lastPaperSize;
    }
    
    if (lastScale != null)
    {
        document.getElementById("ScalingList").value = lastScale;
    }
    
    if (lastDPI != null)
    {
        document.getElementById("DPIList").value     = lastDPI;
    }
}

function setAdvancedOptionsUI(enabled)
{
    document.getElementById("PaperList").disabled   = !enabled;
    document.getElementById("ScalingList").disabled = !enabled;
    document.getElementById("DPIList").disabled     = !enabled;
    
    var mapCapturer = parent.Fusion.getWidgetsByType("QuickPlotFlyout")[0].mapCapturer;
    
    if (enabled)
    {
        mapCapturer.enable();
        drawCaptureBox();
    }
    else
    {
        mapCapturer.disable();
    }
}

function generatePlot()
{
    var widget      = parent.Fusion.getWidgetsByType("QuickPlotFlyout")[0];
    var mapCapturer = widget.mapCapturer;

    if (!advancedOptionsOn())
    {
        // Get paper size. Use the last used paper size by default
        mapCapturer.setSize(getPaperSize(), getScale());
        
    }
    
    widget.preview(submitForm, getPrintDpi());
}

function submitForm(windowName)
{
    var form = document.getElementById("Form1");
    form.target = windowName;
    // Save the advanced options to a cookie
    var cookieDuration = 365;
    parent.Cookie.write("QuickPlotLastUsedPaperSize", document.getElementById("PaperList").value, {duration:cookieDuration});
    parent.Cookie.write("QuickPlotLastUsedScaling", document.getElementById("ScalingList").value, {duration:cookieDuration});
    parent.Cookie.write("QuickPlotLastUsedDPI", document.getElementById("DPIList").value, {duration:cookieDuration});
    form.submit();
}


function advancedOptionsOn()
{
    var o = document.getElementById("AdvancedOptionsCheckBox");
    if (o && o.checked)
    {
        return true;
    }
    
    return false;
}

function getPaperSize()
{
    var value = document.getElementById("PaperList").value.split(",");
    var size = {w: parseFloat(value[0]), h: parseFloat(value[1])};

    if (!advancedOptionsOn())
    {
        // Calculate the paper size to make sure it has a same ratio with the viweport
        var map        = parent.Fusion.getWidgetById("Map");
        var paperRatio = size.w / size.h;
        var viewSize   = map.getSize();
        var viewRatio  = viewSize.w / viewSize.h;

        if (paperRatio > viewRatio)
        {
            size.w     = size.h * viewRatio;
        }
        else
        {
            size.h     = size.w / viewRatio;
        }
    }

    return size;
}

function getScale()
{
    var scale = 0;
    if (advancedOptionsOn())
    {
        scale = document.getElementById("ScalingList").value;
    }
    else
    {
        var map        = parent.Fusion.getWidgetById("Map");
        var paperSize  = getPaperSize();
        var viewerSize = map.getCurrentExtents().getSize();
        var factor     = map.getMetersPerUnit();
        
        if (paperSize.w / paperSize.h > viewerSize.w / viewerSize.h)
        {
            scale = viewerSize.h * factor * 1000 / paperSize.h;
        } 
        else
        {
            scale = viewerSize.w * factor * 1000 / paperSize.w;
        }
    }

    scale = parseInt(scale);
    // Set the value to a hidden field so that it could be sent by POST method
    // We cannot rely on the ScalingList.value because we have to handle also the viewport print 
    document.getElementById("ScaleDenominator").value = scale;
    
    return scale;
}

function getPrintDpi()
{
    return document.getElementById("DPIList").value;
}

function drawCaptureBox()
{
    var mapCapturer = parent.Fusion.getWidgetsByType("QuickPlotFlyout")[0].mapCapturer;
    mapCapturer.setSize(getPaperSize(), getScale());
}
