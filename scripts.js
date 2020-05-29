//mostly coded along with Wes on this one 

const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const bg = document.querySelector('.canvasbg');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const blip = document.querySelector('.blip');

//lower the volume of the blip
blip.volume = 0.2;

//get the webcam video
function getVideo() {
	navigator.mediaDevices.getUserMedia({video: true, audio: false}) //returns a promise which we can call .video on
	.then(localMediaStream => {
		console.log(localMediaStream);
		video.srcObject = localMediaStream; //set video source to be localMediaStream. createObjectURL() did not work for me
		video.play();
	})
	.catch(err => {
		console.error(`Hey! You denied the webcam. In order to see this project at work, you will need to enablke it.`, err);
	});
}

getVideo();

//paint stills from the webcam onto the canvas

function paintToCanvas() {
	const width = video.videoWidth;
	const height = video.videoHeight;
	canvas.width = width;
	canvas.height = height;

	return setInterval(() => {

		ctx.drawImage(video, 0, 0, width, height); //takes an image or video element
		// take pixels out
		let pixels = ctx.getImageData(0, 0, width, height);
		// mess with them
		// pixels = redEffect(pixels); 
		// pixels = rgbSplit(pixels);
		// ctx.globalAlpha = 0.1;
		// put them back
		pixels = greenScreen(pixels);
		ctx.putImageData(pixels, 0, 0);
	}, 16);
}

//take photo function
function takePhoto() {
	// play sound
	blip.currentTime = 0;
	blip.play();
	//take data out of the canvas
	const data = canvas.toDataURL('image/jpeg');
	// console.log(data); jpeg image
	const link = document.createElement('a');
	link.href = data;
	link.setAttribute('download', 'cool_person');
	link.innerHTML = `<img src="${data}" alt="Cool person">`;
	strip.insertBefore(link, strip.firstChild);
}

// red effect function
function redEffect(pixels) {
	for (let i = 0; i < pixels.data.length; i+=4) {
		pixels.data[i + 0] = pixels.data[i + 0] + 100;//r
		pixels.data[i + 1] = pixels.data[i + 1] - 100;//g
		pixels.data[i + 2] = pixels.data[i + 2] * 0.9;//b
	}
	return pixels;
}

//rgb split effect
function rgbSplit(pixels) {
	for (let i = 0; i < pixels.data.length; i+=4) {
		pixels.data[i - 122] = pixels.data[i + 0];//r
		pixels.data[i + 200] = pixels.data[i + 1];//g
		pixels.data[i - 50] = pixels.data[i + 2];//b
	}
	return pixels;
}

//green screen
function greenScreen(pixels) {
  const levels = {};

  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {
      // take it out!
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;
}

video.addEventListener('canplay', paintToCanvas); //once webcam video works, it will emit an avent called canplay
