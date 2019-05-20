<?php

$datadirectory= 'C://wamp64/www/Projet-PPD/data/';

$dirNam = scandir($datadirectory , 1 );
foreach ($dirNam as $i ) {
	
	$directory = 'C://wamp64/www/Projet-PPD/data/'.$i;
	echo($directory);
	if ( ! is_dir($directory)) {
		exit('Invalid diretory path');
	}

	$files = array();
	foreach(scandir($directory) as $file){
		if (!'.' === $file  && !'..' === $file ){
		$files[] = $file;
		}
	}
	
	foreach($files as $file){
		echo($file);
	}
}

?>