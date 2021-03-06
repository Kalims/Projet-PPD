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
	output = tf.layers.dense({useBias: true, units: ini_nbClasse(), activation: 'softmax'}).apply(input);
	//Creation du modele
	model = tf.model({inputs: input, outputs: output});	
	
	var tauxApp = document.getElementById("tauxApp").value;
	var e = document.getElementById("optimizer-select");
	var opt = e.options[e.selectedIndex].value;
	
	switch (opt) {
	  case 'sgd':
		optimizer = tf.train.sgd(tauxApp);
		break;
	  case 'RMSProp':
		optimizer = tf.train.rmsprop(tauxApp);
		break;
	  case 'Momentum':
		optimizer = tf.train.momentum(tauxApp);
		break;
	  case 'Adagrad':
		optimizer = tf.train.adagrad(tauxApp);
		break;
	  case 'Ftrl':
		optimizer = tf.train.ftrl(tauxApp);
		break;
	  case 'ProximalAdaGrad':
		optimizer = tf.train.proximaladagrad(tauxApp);
		break;
	  case 'Nesterov':
		optimizer = tf.train.nesterov(tauxApp);
		break;
	  default:
		optimizer = tf.train.adam(tauxApp);
	}
	
	//Compilation du modele
	model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy',metrics:['accuracy']});
}
function show(){
	show_class = true;
}

function train(){
	//Entrainement du modele
	modelCompile();
	const tf_features = tf.tensor2d(features, shape=[features.length, 1000])
	console.log("test dans methode train");
	const tf_targets = tf.tensor(targets);
	model.fit(tf_features, tf_targets, {
	  batchSize: parseInt(document.getElementById("batchSize").value),
	  epochs: parseInt(document.getElementById("epochs").value),
	  callbacks: {
		onBatchEnd: async (batch, logs) => {
		  //Log the cost for every batch that is fed. //Le cout de chaque batch
		  addData(lossChart,lossIncrement,logs.loss);
		  lossIncrement++;
		  //accurancy
		  addData(accurancyChart,accurancyIncrement,logs.acc);
		  accurancyIncrement++;
		  await tf.nextFrame();
		}
	  }
	});
	init_prediction_tab();
}

function init_prediction_tab(){
	var pred = document.getElementById('pred');
	pred.innerHTML = "";
	var tab = "";
	for ( i=0; i < pictures['caracteristiques']['labelsClasses'].length; i++){
		tab = tab + '<div class="nom btn btn-dark">'+pictures['caracteristiques']['labelsClasses'][i]+' : <div class="badge badge-light" id='+pictures['caracteristiques']['labelsClasses'][i]+'>0</div></div>';
	}
	pred.innerHTML = tab;
}

function add_features(feature){
	console.log("add feature function");
	features.push((Array.from(feature.buffer().values))); // boucle sur chaque image
	featuresTest.push(feature);
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}


function showTest() {
	console.log("function ShwoTest begin ");
	const labels = pictures['caracteristiques']['labelsClasses'];
	for ( i=0; i< featuresTest.length / 4 ; i++) {
		random = getRandomInt(featuresTest.length)
		const prediction = model.predict(featuresTest[random]);
		cl = prediction.argMax(1).buffer().values[0];

		console.log("TEST --> all prodict" , prediction,"+ prediction max + label",cl,  labels[cl]);
		console.log("TEST prediction all probability : " + prediction.buffer().values);
		console.log("TEST prediction  : " +  prediction.argMax(1).buffer().values[0]);
		console.log("TEST target", targets[i]);

		var indexLabel = 0;
		for ( j=0; j< targets[random].length; j++){
			console.log(targets[random][j]);
			if(targets[random][j]==1)
				indexLabel=j;
		}

		res = "Erreur";
		if(labels[indexLabel]==labels[cl])
			res="OK";

		console.log("TEST prediction - ",prediction, " - cl - ", cl);
		console.log("TEST label[cl]  ",labels[cl]);
		console.log("TEST target[random] ",targets[random]);
		console.log("TEST label[j] ",labels[indexLabel], " - j - ", j);
		ajouterLigne(labels[indexLabel], labels[cl], res);
	}
	console.log("function ShowTest end ");
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
	if (proba =="Erreur"){colonne3.className="fondrouge";}
	else colonne3.className="fondvert";
}


var pictures = null;

function loadPictures2(){
	console.log('Load2 function Begin');
	var minDiv = document.getElementById('min');

	pictures['pictures'].forEach( function (element) {
		var ImageURL = element['base64'];
		var canvas = document.createElement( "canvas");
		canvas.setAttribute("class", element['name']);
		canvas.setAttribute("id", "pictures");
		canvas.setAttribute("style", "display:none");
		canvas.width=300;
		canvas.height=300;
		var ctx = canvas.getContext("2d");
		var image = new Image();
		image.onload = function() {
			ctx.drawImage(image, 0, 0);
		}
		image.src = ImageURL;
		document.body.appendChild(canvas);

		// miniature
		var canvasMin = document.createElement( "canvas");
		canvasMin.setAttribute("class", "miniature-pictures");
		canvasMin.width=90;
		canvasMin.height=90;
		var ctxMin = canvasMin.getContext("2d");
		var image = new Image();
		image.onload = function() {
			ctxMin.drawImage(image, 0,0, 90, 90);
		}
		image.src = ImageURL;
		minDiv.appendChild(canvasMin);
	});
	console.log('Load2 function end');
}

//Methode utilis�e pour charger les images
function loadPictures() {
	console.log("fonction load");
	$.ajax({
		type: "GET",
		url:  "http://localhost:80/Projet-PPD/php/uploadImage.php",
		success: function(request){
			console.log("success");
		},
		error: function(resultat){
			console.log("error");
		},
		complete: function(request){
			pictures=JSON.parse(request.responseText);
			loadPictures2();
			console.log("LoadPicture function : complete ! ");
		}
	});
}

function ini_nbClasse(){
	nbClasse = pictures['caracteristiques']['nbClasse'];
	return nbClasse;
}

function modelSave(){
	model.save('downloads://my-model');
}

function addToPredTab(id){
	var div = document.getElementById(id);
	var number = parseInt($('#'+id).text());
	div.innerHTML = number + 1;
}

loadPictures();

async function app() {
  console.log('Loading mobilenet..');
  //Charger le modele mobilenet
  var net = await mobilenet.load();
  //Le modele � bien �t� charg�
  console.log('Sucessfully loaded model');

  await setupWebcam();

	var res2 ;
	var i;
	var j;
	
	for ( i=0; i < pictures['caracteristiques']['labelsClasses'].length; i++){
		res2 = document.getElementsByClassName(pictures['caracteristiques']['labelsClasses'][i]);
		for (j=0; j < res2.length ; j++){
			var result = net.infer(res2[j]);
			add_features(result);
			var tab = new Array(pictures.caracteristiques.labelsClasses.length).fill(0);
			tab[i]= 1;
			targets.push(tab);
		}

	}

  while (true) {
	//const result = await net.classify(webcamElement);
	const feature = await net.infer(webcamElement);
	if (show_class){
		const prediction = model.predict(feature);
		//console.log(prediction.buffer().values);
		cl = prediction.argMax(1).buffer().values[0];
		var classPredi = pictures.caracteristiques.labelsClasses[cl];
		document.getElementById("prediction").innerHTML = classPredi;
		addToPredTab(classPredi);
	}
	//Attend la prochaine "frame"
	await tf.nextFrame();
  }
}
app();