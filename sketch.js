let handPose;
let video;
let hands = [];
const TOUCH_THRESHOLD = 30; // Pixel threshold to consider the fingers touching
let drawing = []; // Store drawn lines
let drawingColor = "black"; // Default color for drawing
let isTouching = false; // Track whether fingers were touching previously
let overlayImage;
let isDetecting = false;

const detectionParagraph = document.getElementById("detection");
const drawingCategoryParagraph = document.getElementById("drawing-category");

const randomDrawingCategories = [
	"car",
	"tree",
	"banana",
	"bicycle",
	"sheep",
	"airplane",
	"barn",
	"bell",
	"diamond",
	"donut",
	"ship",
	"skull",
];

const randomDrawingCategory = randomDrawingCategories[Math.floor(Math.random() * randomDrawingCategories.length)];
drawingCategoryParagraph.innerHTML = "Draw a: <b>" + randomDrawingCategory + "</b>";

const squares = [
  { x: 10, y: 10, size: 30, color: "black" },
  { x: 60, y: 10, size: 30, color: "red" },
  { x: 110, y: 10, size: 30, color: "green" },
  { x: 160, y: 10, size: 30, color: "blue" },
  { x: 210, y: 10, size: 30, color: "yellow" },
  { x: 260, y: 10, size: 30, color: "white", label: "eraser" }, // Add eraser square
];

// Function to check if a point is inside a rectangle
function isPointInRect(px, py, rect) {
  return (
    px >= rect.x &&
    px <= rect.x + rect.size &&
    py >= rect.y &&
    py <= rect.y + rect.size
  );
}

function preload() {
  // Load the handPose model
  handPose = ml5.handPose({
    flipped: true,
	maxHands: 1,
  });
  // Load the overlay image
  overlayImage = loadImage("images/whiteboard.jpg");
}

function setup() {
  createCanvas(min(windowWidth, 640), min(windowHeight, 480));
  // Create the webcam video (without displaying it)
  video = createCapture(VIDEO, {
    flipped: true,
  });
  video.size(min(windowWidth, 640), min(windowHeight, 480));
  video.position(0, 0);
  video.hide();
}

function draw() {
  background(0); // Clear the background

  // Reset all square borders
  for (let square of squares) {
    document.querySelector(`.color_square[data-color='${square.color}']`).style.border = "none";
    if (drawingColor == square.color) {
      document.querySelector(`.color_square[data-color='${square.color}']`).style.border = "2px inset black";
    }
  }

  // Draw the overlay image
  image(overlayImage, 0, 0, width, height);

  // Draw stored lines
  for (let i = 1; i < drawing.length; i++) {
    if (drawing[i].newStroke) continue;
    stroke(drawing[i].color); // Use the color associated with the segment
    strokeWeight(2);
    noFill();
    line(drawing[i - 1].x, drawing[i - 1].y, drawing[i].x, drawing[i].y);
  }

  // Draw all the tracked hand points
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    let indexKeypoint = hand.keypoints[8];
    let thumbKeypoint = hand.keypoints[4];

    let touching = checkFingerTouch(indexKeypoint, thumbKeypoint);

    if (touching) {
      // Draw a single circle at the midpoint if touching
      let midX = (indexKeypoint.x + thumbKeypoint.x) / 2;
      let midY = (indexKeypoint.y + thumbKeypoint.y) / 2;

      fill("red");
      noStroke();
      circle(midX, midY, 12);
      if (drawingColor === "white") {
        // Erase lines under the eraser
        drawing = drawing.filter(
          (point) =>
            dist(point.x, point.y, midX, midY) > TOUCH_THRESHOLD || point.newStroke
          );
      } else {
        if (!isTouching) {
          drawing.push({ newStroke: true }); // Mark the start of a new stroke
        }
        drawing.push({
          x: midX,
          y: midY,
          newStroke: false,
          color: drawingColor,
        }); // Store the current drawing color
      }
    } else {
      // Draw separate circles for index finger and thumb
      fill(0, 255, 0);
      noStroke();
      circle(indexKeypoint.x, indexKeypoint.y, 10);
      circle(thumbKeypoint.x, thumbKeypoint.y, 10);
    }
    isTouching = touching;

    // Check if the index finger is on any square
    for (let square of squares) {
      if (!isTouching && isPointInRect(indexKeypoint.x, indexKeypoint.y, square)) {
        drawingColor = square.color;
        document.querySelector(`.color_square[data-color='${square.color}']`).style.border = "2px inset black";
        break;
      }
    }
  }

  if (isDetecting) {
    detectionParagraph.innerText = "Detecting";
	  detectionParagraph.style.color = "green";
  } else {
    detectionParagraph.innerText = "Not detecting";
	  detectionParagraph.style.color = "red";
  }
}

// Call this function to start and stop detection
function toggleDetection() {
  if (isDetecting) {
    handPose.detectStop();
    isDetecting = false;
  } else {
    handPose.detectStart(video, gotHands);
    isDetecting = true;
  }
}

// Callback function for when handPose outputs data
function gotHands(results) {
  hands = results;
}

function checkFingerTouch(indexKeypoint, thumbKeypoint) {
  const distance = dist(
    indexKeypoint.x,
    indexKeypoint.y,
    thumbKeypoint.x,
    thumbKeypoint.y
  );
  return distance < TOUCH_THRESHOLD;
}

function clearBoard() {
  drawing = [];
}

function submitImage() {
  let canvas = document.querySelector("canvas");
  let imageBase64 = canvas.toDataURL("image/png"); // Convert into base64 image
  let img;
  let imageModelURL = "https://teachablemachine.withgoogle.com/models/XyFk6qtMF/";
  let classifier;

  classifier = ml5.imageClassifier(imageModelURL, modelLoaded);

  function modelLoaded() {
    console.log("Model Loaded!");
    img = createImg(imageBase64, "Generated drawing");
    img.hide();
    imageReady();
  }

  function imageReady() {
    classifier.classify(img, gotResults);
  }

  function gotResults(results, error) {
    if (error) {
      console.error(error);
      return;
    }

    console.log(results);

    // Find the label and handle cases where it is not found
    let label = results.find((result) => result.label === randomDrawingCategory);
    let confidence = label ? (label.confidence * 100).toFixed(2) + "%" : "0%";

    let resultsDiv = document.querySelector(".results");
    let resultsContent = resultsDiv.querySelector(".inner-results");
    resultsContent.innerHTML = `
      <h2>Classification Results</h2>
      <p>Label: ${randomDrawingCategory}</p>
      <p>Confidence: ${confidence}</p>
    `;
    resultsDiv.style.display = "block";
  }
}