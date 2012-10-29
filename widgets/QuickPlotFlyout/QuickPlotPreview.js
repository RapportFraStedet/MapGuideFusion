/**
 * Copyright (C) 2010 Autodesk, Inc. All rights reserved.
 */

function innerLoaded()
{
    if (parent.Fusion)
    {
        parent.Fusion.getWidgetsByType("QuickPlotFlyout")[0].previewInnerLoaded();
    }
}

function printIt()
{
    parent.Fusion.getWidgetsByType("QuickPlotFlyout")[0].printPreview();
}

function cancelPreview()
{
    parent.Fusion.getWidgetsByType("QuickPlotFlyout")[0].cancelPreview();
}

function doPrint()
{
    window.focus();
    window.print();
}
