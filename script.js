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

function addData(chart, label, data) {
	chart.data.labels.push(label);
	chart.data.datasets.forEach((dataset) => {
		dataset.data.push(data);
	});
	chart.update();
}

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
//Sélection des boutons
const left = document.getElementById("left");
const right = document.getElementById("right");
const up = document.getElementById("up");
const down = document.getElementById("down")
var show_class = false;
var features = [];
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
	//Input
	input = tf.input({batchShape: [null, 1000]});
	//Output
	output = tf.layers.dense({useBias: true, units: 5, activation: 'softmax'}).apply(input);
	//Creation du modele
	model = tf.model({inputs: input, outputs: output});
	//Optimiser
	//console.log("test : "+document.getElementById("optimizer").value);
	optimizer = tf.train.adam(0.01);
	//Compilation du modele
	model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy',metrics:['accuracy']});
//Methode utilisée pour charger la webcam
async function setupWebcam() {
  return new Promise((resolve, reject) => {
	const navigatorAny = navigator;
	navigator.getUserMedia = navigator.getUserMedia ||
		navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
		navigatorAny.msGetUserMedia;
	if (navigator.getUserMedia) {
	  navigator.getUserMedia({video: true},
		stream => {
		  webcamElement.srcObject = stream;
		  webcamElement.addEventListener('loadeddata',  () => resolve(), false);
		},
		error => reject());
	} else {
	  reject();
	}
  });
}
function modelCompile(){
	//Input
	input = tf.input({batchShape: [null, 1000]});
	//Output
	output = tf.layers.dense({useBias: true, units: 5, activation: 'softmax'}).apply(input);
	//Creation du modele
	model = tf.model({inputs: input, outputs: output});
	//Optimiser
	//console.log("test : "+document.getElementById("optimizer").value);
	optimizer = tf.train.adam(1);
	//Compilation du modele
	model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy',metrics:['accuracy']});
}
function show(){
	show_class = true;
}
function train(){
	//Entrainement du modele
	console.log("Train");
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
	//Add features to one class if one button is pressed //Ajouter une "fonctionnalité" a une classe si le boutton est cliqué
	if (left.clicked){
		console.log("gather left");
		features.push(feature);
		targets.push([1., 0., 0., 0., 0.]);
	}
	else if (right.clicked){
		console.log("gather right");
		features.push(feature);
		targets.push([0., 1., 0., 0., 0.]);
	}
	else if (up.clicked){
		console.log("gather up");
		features.push(feature);
		targets.push([0., 0., 1., 0. , 0.]);
	}
	else if (down.clicked){
		console.log("gather down");
		features.push(feature);
		targets.push([0., 0., 0., 1., 0.]);
	}
	else if (middle.clicked){
		console.log("gather middle");
		features.push(feature);
		targets.push([0., 0., 0., 0., 1.]);
	}
}
async function app() {
  console.log('Loading mobilenet..');
  //Charger le modele mobilenet
  net = await mobilenet.load();
  //Le modele à bien été chargé
  console.log('Sucessfully loaded model');
  await setupWebcam();
  //Attend que la caméra soit bien fonctionnel
  while (true) {
	//const result = await net.classify(webcamElement);
	const feature = await net.infer(webcamElement);
	//console.log(feature);
	//console.log(feature.buffer().values);
	add_features(Array.from(feature.buffer().values));
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