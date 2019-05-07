<?php
    	
$rawData = $_POST['imgBase64'];
$firstname = $_POST['firstname'];
$filteredData = explode(',', $rawData);
$unencoded = base64_decode($filteredData[1]);
$datime = date("Y-m-d-H.i.s", time() ) ; # - 3600*7

//$userid  = $_POST['userid'] ;

// name & save the image file 
if(!file_exists('../data/'.$firstname)){
	mkdir('../data/'.$firstname, 0700);
}
$fp = fopen('../data/'.$firstname.'/'.$firstname.$datime.'-.jpg', 'w');
fwrite($fp, $unencoded);
fclose($fp);
  
?>