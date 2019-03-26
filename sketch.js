//On veut minimiser les ecarts entre les points et la droite
//x=hauteur
//y=largeur
//Si on créer "une nouvelle largeur", on veut prédire le poids de celui ci, par rapport aux points et a la droite existante
//le dataset : des x et des y
//On se focus sur la distance vertical des points par rapport à la droite
// y = mx + b (m=pente , b=ordonné à l'origine)
	//ce sont ces valeurs que l'on va changer pour minimiser la perte

let x_vals = []; //Liste des points de l'axe x
let y_vals = []; //Liste des points de l'axe y

let m, b;

const learningRate = 0.1; //vitesse d'apprentissage
const optimizer = tf.train.sgd(learningRate); //Le type d'optimisation utilisée, ici "sgd"

function setup(){
	createCanvas(400,400); // Le bloc pour dessiner
	m = tf.variable(tf.scalar(random(1))); //permet de créer un nombre aléatoire entre 0 et 1, créer un scalaire puis créer un tensor modifiable contenant le scalaire
	b = tf.variable(tf.scalar(random(1)));
}

//Fonction qui permet de calculer l'erreur, le but etant de la réduire le plus possible grace à l'optimizer
function loss(pred,labels){
	//mean squared error = la moyenne des écarts des differents points par rapport à la courbe
	return pred.sub(labels).square().mean(); 
}

//Fonction de prediction, permet de calculer : y = mx + b
function predict(x){
	const xs = tf.tensor1d(x);
	const ys = xs.mul(m).add(b);	
	return ys;
}

//Permet de créer un nouveau point et donc de mettre à jour la liste des points, se déclenche lorsque l'on clique sur le canvas
function mousePressed(){
	let x = map(mouseX, 0, width, 0, 1); //permet de transformer une valeur d’une plage de valeur à une autre plage de valeur. Car on veut les valeurs entre 0 et 1 = plus petites
	let y = map(mouseY, 0, height, 1, 0); //permet de transformer une valeur d’une plage de valeur à une autre plage de valeur.  Car on veut les valeurs entre 0 et 1 = plus petites
	x_vals.push(x);
	y_vals.push(y);
}

function draw(){
	
	//tidy permet de gérer la mémoire
	tf.tidy(()=>{
		//S'execute uniquement si l'utilisateur a bien créer des points
		if(x_vals.length>0){
			//Créer un tensor de 1 dimension a partir des valeurs y
			const ys = tf.tensor1d(y_vals);
			//Predit, calcul la perte puis l'optimise
			optimizer.minimize(()=> loss(predict(x_vals),ys));
		}
	});
	
	background(0);
	stroke(255); //Couleur du point
	
	//Permet de creer tous les nouveaux points du graph (en permanance)
	for(let i = 0; i < x_vals.length; i++){
		let px = map(x_vals[i], 0, 1, 0, width);
		let py = map(y_vals[i], 0, 1, height, 0);
		point(px,py);
	}
	
	const lineX = [0,1]; //Tableau
	const ys=tf.tidy(()=> predict(lineX)); // ?
	let lineY = ys.dataSync(); 	//Tensor
	ys.dispose(); //Memoire management
	
	//Création de la droite

	let x1 = map(lineX[0], 0, 1, 0, width); // 1ere valeur x pour créer la droite
	let x2 = map(lineX[1], 0, 1, 0, width); // 2eme valeur x pour créer la droite
	
	let y1 = map(lineY[0], 0, 1, height, 0); // 1ere valeur y pour créer la droite
	let y2 = map(lineY[1], 0, 1, height, 0); //2eme valeur y pour créer la droite
	strokeWeight(2); //Epaisseur droite
	
	line(x1,y1,x2,y2);

	//Vérifie le nombre de tensor dans la mémoire
	console.log(tf.memory().numTensors);
}

