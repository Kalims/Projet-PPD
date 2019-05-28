//Initialisation du graphique sur la perte

var lossIncrement = 1;
var ctx = document.getElementById('lossChart').getContext('2d');
var lossChart = new Chart(ctx, {
	type: 'line',
	data: {
		datasets: [{
			label: 'loss',
			borderColor: 'rgb(96, 67, 224)',
		}]
	}
});

//Initialisation du graphique sur l'accurancy
var accurancyIncrement = 1;
var ctx = document.getElementById('accurancyChart').getContext('2d');
var accurancyChart = new Chart(ctx, {
	type: 'line',
	data: {
		datasets: [{
			label: 'accuracy',
			borderColor: 'rgb(67, 224, 95)',
		}]
	}
});

//Fonction qui permet d'ajouter une valeur pour un graphique donn� et un label donn�
function addData(chart, label, data) {
	chart.data.labels.push(label);
	chart.data.datasets.forEach((dataset) => {
		dataset.data.push(data);
	});
	chart.update();
}

//Param�tres de l'entrainement du mod�le
var slideBatchSize = document.getElementById("batchSize");
var slideEpochs = document.getElementById("epochs");
var y = document.getElementById("f");
var y1 = document.getElementById("f1");

slideBatchSize.oninput = function() {
	y.innerHTML = this.value;
}
slideEpochs.oninput = function() {
	y1.innerHTML = this.value;
}

const webcamElement = document.getElementById('webcam');

var show_class = false;
var features = [];
var featuresTest = [];
var targets = [];
var nbClasse;
//var labels = [];

//Creation du modele
input = tf.input({batchShape: [null, 1000]});
output = tf.layers.dense({useBias: true, units: 3, activation: 'softmax'}).apply(input);
model = tf.model({inputs: input, outputs: output});
optimizer = tf.train.adam(0.01);
//Compilation du modele
model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy',metrics:['accuracy']});

//Methode utilis�e pour charger la webcam
async function setupWebcam() {
  return new Promise((resolve, reject) => {
	const navigatorAny = navigator;
	navigator.getUserMedia = navigator.getUserMedia ||
		navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
		navigatorAny.msGetUserMedia;
	//v�rifie que l'utilisateur a autoris� l'utilisation de la webcam
	if (navigator.getUserMedia) {
	  navigator.getUserMedia({video: true},
		stream => {
		  webcamElement.srcObject = stream;
		  webcamElement.addEventListener('loadeddata',  () => resolve(), false); //si le navigateur a charg� la frame actuelle, lance resolve()
		},
		error => reject());
	} else {
	  reject();
	}
  });
}
//Permet de recompiler le mod�le si l'optimizer � �t� modifi�
function modelCompile(){
	input = tf.input({batchShape: [null, 1000]});
	output = tf.layers.dense({useBias: true, units: 3, activation: 'softmax'}).apply(input);
	//Creation du modele
	model = tf.model({inputs: input, outputs: output});
	optimizer = tf.train.adam(1);
	//Compilation du modele
	model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy',metrics:['accuracy']});
}
function show(){
	show_class = true;
}

function train(){
	//Entrainement du modele
	const tf_features = tf.tensor2d(features, shape=[features.length, 1000])
	console.log("test dans methode train");
	console.log(features);
	console.log(targets);
	const tf_targets = tf.tensor(targets);
	model.fit(tf_features, tf_targets, {
	  batchSize: parseInt(document.getElementById("batchSize").value),
	  epochs: parseInt(document.getElementById("epochs").value),
	  callbacks: {
		onBatchEnd: async (batch, logs) => {
		  //Log the cost for every batch that is fed. //Le cout de chaque batch
		  //console.log(logs.loss.toFixed(5));
		  console.log(logs.loss);
		  addData(lossChart,lossIncrement,logs.loss);
		  lossIncrement++;
		  //accurancy
		  console.log(logs.acc);
		  addData(accurancyChart,accurancyIncrement,logs.acc);
		  accurancyIncrement++;
		  await tf.nextFrame();
		}
	  }
	});
}
function add_features(feature){
		console.log("add feature function");
		features.push((Array.from(feature.buffer().values))); // boucle sur chaque image
		featuresTest.push(feature);
}



function showTest() {
	console.log("TEST ");
	//const labels = ["Left", "Right", "Up", "Down", "Middle"];
	const labels = pictures['caracteristiques']['labelsClasses'];
	console.log(labels);
	console.log(featuresTest);

	for ( i=0; i< featuresTest.length; i++) {
		const prediction = model.predict(featuresTest[i]);

		cl = prediction.argMax(1).buffer().values[0];

		console.log("TEST --> all prodict" , prediction,"+ prediction max + label",cl,  labels[cl]);
		console.log("TEST prediction all probability : " + prediction.buffer().values);
		console.log("TEST prediction  : " +  prediction.argMax(1).buffer().values[0]);
		console.log("TEST target", targets[i]);

		indexLabel =0;
		for ( j=0; j<targets[i].length; j++){
			console.log(targets[i][j]);
			if(targets[i][j]==1)
				indexLabel=j;
		}

		res = "Erreur";
		if(labels[indexLabel]==labels[cl])
			res="OK";

		console.log("TEST prediction - ",prediction, " - cl - ", cl);
		console.log("TEST label[cl]  ",labels[cl]);
		console.log("TEST target[i] ",targets[i]);
		console.log("TEST label[j] ",labels[indexLabel], " - j - ", j);

		ajouterLigne(labels[indexLabel], labels[cl], res);
	}
}

function ajouterLigne(label , predict, proba) {

	var tableau = document.getElementById("tableau");
	var ligne = tableau.insertRow(-1);//on a ajouté une ligne

	var colonne1 = ligne.insertCell(0);//on a une ajouté une cellule
	colonne1.innerHTML = label;

	var colonne2 = ligne.insertCell(1);//on ajoute la seconde cellule
	colonne2.innerHTML = predict;

	var colonne3 = ligne.insertCell(2);
	colonne3.innerHTML  = proba;


	if (proba =="Erreur"){
		colonne3.className="fondrouge";
	}
	else
		colonne3.className="fondvert";

}


var pictures = null;

function loadPictures2(){
	console.log('Load2');
	var compteur =0 ;
	console.log(pictures);
	pictures['pictures'].forEach( function (element) {
		var ImageURL = element['base64'];
		var canvas = document.createElement( "canvas");
		canvas.setAttribute("class", element['name']);
		canvas.setAttribute("id", "pictures");
		canvas.width=300;
		canvas.height=300;

		var ctx = canvas.getContext("2d");
		var image = new Image();
		image.onload = function() {
			ctx.drawImage(image, 0, 0);
		}
		image.src = ImageURL;
		//console.log(image);
		document.body.appendChild(canvas);
		console.log(canvas);
	});
	//var pictures=document.getElementsByClassName("pictures");//test is not target

	//document.getElementById('main').getElementsByClassName('test')

	//console.log(res);
	console.log('Load2 fin');
}

//Methode utilis�e pour charger les images
function loadPictures() {
	console.log("fonction load");
	$.ajax({
		type: "GET",
		url:  "http://localhost:80/Projet-PPD/php/uploadImage.php",
		success: function(request){
			console.log("success");
			//pictures=JSON.parse(request.responseText);
			//console.log(pictures);
		},
		error: function(resultat){
			console.log("error");
			console.log(resultat);
		},
		complete: function(request){
			console.log("complete");
			pictures=JSON.parse(request.responseText);
			loadPictures2();
			//labels = pictures['caracteristiques']['labelsClasses'];
			console.log("complete fonction load pictures");
			console.log(pictures);
			//
			//console.log(labels);
		}
	});
	console.log("fin fonction load");

}

function ini_nbClasse(classe){
	nbClasse = classe['caracteristiques']['nbClasse'];
	return nbClasse;
}


function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds){
			break;
		}
	}
}



let image;

loadPictures();

//loadPictures2();

async function app() {
  console.log('Loading mobilenet..');
  //Charger le modele mobilenet
  var net = await mobilenet.load();
  //Le modele � bien �t� charg�
  console.log('Sucessfully loaded model');

  //loadPictures();
  await setupWebcam();
  //ini_nbClasse(pictures);
  //console.log(nbClasse);

	var res = new Array();
	var res2 ;
	var i;
	var j;

	console.log(pictures['caracteristiques']['labelsClasses'].length);
	console.log(pictures['caracteristiques']['labelsClasses'][0]);

	for ( i=0; i < pictures['caracteristiques']['labelsClasses'].length; i++){
		res2 = document.getElementsByClassName(pictures['caracteristiques']['labelsClasses'][i]);
		console.log(res2);
		for (j=0; j < res2.length ; j++){
			//console.log("boucle");
			var result = net.infer(res2[j]);
			//console.log("result boucle 2");
			//console.log(result.buffer().values);
			add_features(result);
			var tab = new Array(pictures.caracteristiques.labelsClasses.length).fill(0);
			tab[i]= 1;
			targets.push(tab);
			//console.log(tab);
		}

	}

  //var compteur =0 ;
  //pictures['pictures'].forEach( function (element) {
	// var ImageURL = element['base64'];

		//var canvas = document.createElement("canvas"+ "_" + compteur +"_" + element['name']);
		//var ctx = canvas.getContext("2d");
		//var image = new Image();
	    //image.src = ImageURL;


	    //image.height=300;
	    //image.width=300;
		//image.onload = function() {
	    //canvas.width = 300;
	    //canvas.height = 300;
	    //console.log(image.src);

	    //ctx.drawImage(image, 0, 0);
		//};
		//console.log("test + context canvas");
		//console.log(image.src);
		//console.log(ctx);

		//const feature = net.infer(image);

	  	//sleep(1000);
	  	//console.log(feature);

		//add_features(feature);




		//console.log(labels);

	//	compteur =0;
	//    pictures['caracteristiques']['labelsClasses'].forEach(function(element2) {
	//    	var tab = new Array(pictures.caracteristiques.labelsClasses.length).fill(0);
	//  	  	if (element2 == element['name'] ){
	//				tab[compteur]= 1;
	//				console.log(tab);
	//				targets.push(tab); //nombre de dossier = nombre de classes
	//			}
	//  	  	else compteur = compteur+1;
	//  })
	//});

  	console.log(features);
  	console.log(targets);

	
  //while (true) {
	//const result = await net.classify(webcamElement);
//	const feature = await net.infer(webcamElement);
	//console.log(feature);
	//console.log(feature.buffer().values);
//	add_features(feature);
//	featuresTest.push(feature);
	//console.log("Prediction", result[0].className);
	//console.log("Probability", result[0].probability);
//	if (show_class){
//		console.log(model.predict(feature));
//		const prediction = model.predict(feature);
//		console.log(prediction.buffer().values);
//		const labels = ["Left", "Right", "Up", "Down", "Middle"];
//		cl = prediction.argMax(1).buffer().values[0];
//		console.log(cl, labels[cl]);
//	}
//	//Attend la prochaine "frame"
//	await tf.nextFrame();
//  }
}
app();