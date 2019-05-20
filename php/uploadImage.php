<?php

$datadirectory= 'C://wamp64/www/Projet-PPD/data/';

$dirNam = scandir($datadirectory , 1 );
foreach ($dirNam as $i ) {
	if ('.' !== $i  && '..' !== $i ){
		$directory = 'C://wamp64/www/Projet-PPD/data/'.$i;

		if ( ! is_dir($directory)) {
			exit('Invalid diretory path');
		}
		
		$files = array();
		foreach(scandir($directory) as $file){
			if ('.' !== $file  && '..' !== $file ){
				$files[$i]["name"] = $file;
				
				$path = $directory.'/'.$file;
				$type = pathinfo($path, PATHINFO_EXTENSION);
				$data = file_get_contents($path);
				$base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
				
				$files[$i]["base64"] = $base64;
			}
		}
		
		print_r($files);
	}
}

?>