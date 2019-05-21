const webcamElement = document.getElementById('webcam');
const snap = document.getElementById("snap");

snap.addEventListener("mousedown", () => { snap.clicked = true; });
snap.addEventListener("mouseup", () => { snap.clicked = false; });

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

function savepicture(){
	document.getElementById("snap").addEventListener("click", function() {
		canvas.getContext("2d").drawImage(webcam, 0, 0, 300, 300);
	 var firstname = document.getElementById("firstname").value;
		var dataUrl = document.getElementById("save").href = canvas.toDataURL("image/jpeg", 1.0);
		console.log(dataUrl);
            $.ajax({
              type: "POST",
              url: "http://localhost:80/Projet-PPD/php/downloadFile.php",
              data: { 
				 imgBase64: dataUrl,
				 firstname: firstname
              },
			  success: function(){
				  console.log("save Image successful")
			  }
		});
	});
}

async function app() {
  console.log('Loading mobilenet..');
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');
  await setupWebcam();
}
app();