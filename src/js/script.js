import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const videoElement = document.querySelector("#video-cam");
const landmarksContainer = document.querySelector("#landmarks");
const loadingIndication = document.querySelector("#loading-indication");
const toggleTrackingButton = document.querySelector("#toggle-tracking");

let handLandmarker;
let trackingActive = false;
let lastVideoTime = -1;
let videoWidth, videoHeight;

initVision();

// init vision
async function initVision() {
  // Init Vision and Landmarker
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm",
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
  });

  return initWebcam();
}

// init webcam
function initWebcam() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoElement.srcObject = stream;

        videoElement.addEventListener("loadeddata", () => {
          videoWidth = videoElement.clientWidth;
          videoHeight = videoElement.clientHeight;

          loadingIndication.textContent = "Models are ready";
          toggleTrackingButton.disabled = false;
        });
      })
      .catch((error) => {
        console.error("Error accessing the camera: ", error);
        alert("Unable to access the camera. Please check your permissions.");
      });
  } else {
    console.log("Your browser does not support getUserMedia API.");
  }
}

// start and stop tracking
toggleTrackingButton.addEventListener("click", () => {
  trackingActive = !trackingActive;

  if (trackingActive) {
    toggleTrackingButton.textContent = "Stop tracking";
    window.requestAnimationFrame(predictWebcam);
  } else {
    toggleTrackingButton.textContent = "Start tracking";
    setTimeout(() => {
      landmarksContainer.innerHTML = "";
    }, 100);
  }
});

// predict the input image
function predictWebcam() {
  let startTimeMs = window.performance.now();
  if (videoElement.currentTime !== lastVideoTime) {
    lastVideoTime = videoElement.currentTime;
    const detections = handLandmarker.detectForVideo(videoElement, startTimeMs);
    processResults(detections);
  }

  if (trackingActive) {
    requestAnimationFrame(predictWebcam);
  }
}

function processResults(detections) {
  landmarksContainer.innerHTML = "";

  if (detections.landmarks && detections.landmarks?.length) {
    detections.landmarks.forEach((hand) => {
      // draw all keypoints
      for (let i = 0; i < hand.length; i++) {
        const landmark = hand[i];

        const x = videoWidth * (1 - landmark.x);
        const y = videoHeight * landmark.y;
        drawKeypoint(x, y, null);
      }
    });
  }
}

function drawKeypoint(x, y, z) {
  const newDiv = document.createElement("div");
  newDiv.classList.add("keypoint");
  newDiv.style.top = `${y}px`;
  newDiv.style.left = `${x}px`;
  landmarksContainer.appendChild(newDiv);
}
