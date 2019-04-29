<?php
    	
$rawData = $_POST['imgBase64'];
echo test;
$filteredData = explode(',', $rawData);
$unencoded = base64_decode($filteredData[1]);

 $datime = date("Y-m-d-H.i.s", time() ) ; # - 3600*7

//$userid  = $_POST['userid'] ;

// name & save the image file 
$fp = fopen('../data/'.$datime.'-.jpg', 'w');
fwrite($fp, $unencoded);
fclose($fp);
  
?>