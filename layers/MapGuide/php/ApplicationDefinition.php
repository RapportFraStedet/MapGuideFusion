<?php
/**
 * LoadMap
 *
 * $Id: LoadMap.php 2324 2011-01-21 07:12:29Z hubu $
 *
 * Copyright (c) 2007, DM Solutions Group Inc.
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

/*****************************************************************************
 * Purpose: get map initial information
 *****************************************************************************/

include(dirname(__FILE__).'/../../../common/php/Utilities.php');
include('Common.php');
if(InitializationErrorOccurred())
{
    DisplayInitializationErrorText();
    exit;
}
include('Utilities.php');


try
{

    // Get a runtime map from a map definition
    if (isset($_REQUEST['appid']))
    {
        $appid = $_REQUEST['appid'];
        $resourceID = new  MgResourceIdentifier($appid);
		$content = $resourceService->GetResourceContent($resourceID);
        $xmldoc = DOMDocument::loadXML(ByteReaderToString($content));
    }

    header('Content-type: application/json');
    header('X-JSON: true');

    //echo var2json($mapObj);
	echo $_GET['callback'] . '('.xml2json($xmldoc).')';
}
catch (MgException $e)
{
  echo "ERROR: " . $e->GetExceptionMessage() . "\n";
  echo $e->GetDetails() . "\n";
  echo $e->GetStackTrace() . "\n";
}

exit;

?>
