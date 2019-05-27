<?php

header('Access-Control-Allow-Origin: *');

class picture {
    var $name;
    var $base64;

 function setbase64($base64){
             $this->base64 = $base64;
 }

 function setname($name){
          $this->name = $name;
 }

}

class pictureCaract {
    var $nbClasse;
    var $labelsClasses = array();

 function setnbClasse($nbClasse){
             $this->nbClasse = $nbClasse;
 }

 function setlabelsClasses($labelsClasses){
          $this->labelsClasses = $labelsClasses;
 }

  function addlabelsClasses($labelsClasses){
           array_push($this->labelsClasses , $labelsClasses);
  }

}


$datadirectory= 'C://wamp64/www/Projet-PPD/data/';

$dirNam = scandir($datadirectory);
//$dirNam = scandir($datadirectory , 1 );
$personPicture = array();
$files = array();
$results = array();
$picturesCaracteristics = new pictureCaract();
 $compteur = 0;

foreach($dirNam as $subDir){
    if('.' !== $subDir && '..'!== $subDir){
        $newDir = scandir($datadirectory . $subDir);
        $picturesCaracteristics->addlabelsClasses($subDir);
        $compteur = $compteur +1;
                        $picturesCaracteristics->setnbClasse($compteur);

        foreach($newDir as $file){
            if ('.' !== $file  && '..' !== $file ){
                $path = $datadirectory . $subDir . '/'.$file;
                $pic = new picture();
                $pic->setname($subDir);
                $type = pathinfo($path, PATHINFO_EXTENSION);
                $data = file_get_contents($path);
                $base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
                $pic->setbase64($base64);
                array_push($personPicture, $pic);
                //print_r($pic);
            }
        }
    }
}
print_r(json_encode(array('pictures' => $personPicture, 'caracteristiques' => $picturesCaracteristics)));
?>