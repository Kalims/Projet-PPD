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
//S�lection des boutons
const left = document.getElementById("left");
const right = document.getElementById("right");
const up = document.getElementById("up");
const down = document.getElementById("down")
var show_class = false;
var features = [];
var featuresTest = [];
var targets = [];
left.addEventListener("mousedown", () => { left.clicked = true; });
right.addEventListener("mousedown", () => { right.clicked = true; });
down.addEventListener("mousedown", () => { down.clicked = true; });
up.addEventListener("mousedown", () => { up.clicked = true; });
middle.addEventListener("mousedown", () => { middle.clicked = true; });
left.addEventListener("mouseup", () => { left.clicked = false; });
right.addEventListener("mouseup", () => { right.clicked = false; });
down.addEventListener("mouseup", () => { down.clicked = false; });
up.addEventListener("mouseup", () => { up.clicked = false; });
middle.addEventListener("mouseup", () => { middle.clicked = false; });

//Creation du modele
input = tf.input({batchShape: [null, 1000]});
output = tf.layers.dense({useBias: true, units: 5, activation: 'softmax'}).apply(input);
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
	output = tf.layers.dense({useBias: true, units: 5, activation: 'softmax'}).apply(input);
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
	//Add features to one class if one button is pressed //Ajouter une "fonctionnalit�" a une classe si le boutton est cliqu�
	if (left.clicked){
		console.log("gather left");
		features.push((Array.from(feature.buffer().values)));
		targets.push([1., 0., 0., 0., 0.]);
		featuresTest.push(feature);
	}
	else if (right.clicked){
		console.log("gather right");
		features.push((Array.from(feature.buffer().values)));
		targets.push([0., 1., 0., 0., 0.]);
		featuresTest.push(feature);
	}
	else if (up.clicked){
		console.log("gather up");
		features.push((Array.from(feature.buffer().values)));
		targets.push([0., 0., 1., 0. , 0.]);
		featuresTest.push(feature);
	}
	else if (down.clicked){
		console.log("gather down");
		features.push((Array.from(feature.buffer().values)));
		targets.push([0., 0., 0., 1., 0.]);
		featuresTest.push(feature);
	}
	else if (middle.clicked){
		console.log("gather middle");
		features.push((Array.from(feature.buffer().values)));
		targets.push([0., 0., 0., 0., 1.]);
		featuresTest.push(feature);
	}
}

function showTest() {
	console.log("TEST ");
	const labels = ["Left", "Right", "Up", "Down", "Middle"];

	for ( i=0; i< featuresTest.length; i++) {
		const prediction = model.predict(featuresTest[i]);

		cl = prediction.argMax(1).buffer().values[0];

		console.log("TEST ",cl, labels[cl]);
		console.log("TEST prediction all probability : " + prediction.buffer().values);
		console.log("TEST prediction  : " + prediction.buffer().values[0]);
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

async function app() {
  console.log('Loading mobilenet..');
  //Charger le modele mobilenet
  net = await mobilenet.load();
  //Le modele � bien �t� charg�
  console.log('Sucessfully loaded model');
  await setupWebcam();
  //Attend que la cam�ra soit bien fonctionnel
  while (true) {
	//const result = await net.classify(webcamElement);
	const feature = await net.infer(webcamElement);
	//console.log(feature);
	//console.log(feature.buffer().values);
	add_features(feature);
	//console.log("Prediction", result[0].className);
	//console.log("Probability", result[0].probability);
	if (show_class){
		console.log(model.predict(feature));
		const prediction = model.predict(feature);
		console.log(prediction.buffer().values);
		const labels = ["Left", "Right", "Up", "Down", "Middle"];
		cl = prediction.argMax(1).buffer().values[0];
		console.log(cl, labels[cl]);
	}
	//Attend la prochaine "frame"
	await tf.nextFrame();
  }
}
app();