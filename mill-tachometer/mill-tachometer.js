let capture;
let referenceColor;
const colorTolerance = 50;
let detectionFrameX, detectionFrameY;
let isMeasuring = false;
let rotationCount = 0;
let rpm = 0;
let numberOfBlades = 3; // standaard 3 wieken
let bladeDetectionCount = 0;
let startTime = 0;
let ellapsedTime = 0;
let lastFrameDetected = false;
let firstDetection = false;

// Knoppen
const buttonWidth = 150;
const buttonHeight = 40;
let startButtonX, startButtonY;
let stopButtonX, stopButtonY;
let colorButtonX, colorButtonY;
let colorPreviewX;
let startButtonActive = true;
let colorButtonActive = true;

// Wiek selector knoppen
const bladeButtonWidth = 40;
let blade2ButtonX, blade3ButtonX, blade4ButtonX, bladeButtonY;

function setup() {
  let canvas = createCanvas(640, 480);
  canvas.parent("canvas-container");

  // Camera setup
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();

  // Detectiekader in het midden van het scherm
  detectionFrameX = width / 2 - 25;
  detectionFrameY = height / 2 - 25;

  // Standaard referentiekleur (rood)
  referenceColor = color(255, 0, 0);

  // Knoppen positioneren
  startButtonX = 20;
  startButtonY = height - 60;
  stopButtonX = startButtonX + buttonWidth + 20;
  stopButtonY = startButtonY;
  colorButtonX = stopButtonX + buttonWidth + 20;
  colorButtonY = startButtonY;
  colorPreviewX = colorButtonX + buttonWidth + 10;

  setupBladeOptionButtons();
}

function draw() {
  // Toon camera beeld
  image(capture, 0, 0, width, height);

  // Voor kleurdetectie
  let bladeDetected = false;
  let averageColor = calculateAverageColor();

  // Vergelijk met referentiekleur
  let colorDifference = dist(
    red(averageColor),
    green(averageColor),
    blue(averageColor),
    red(referenceColor),
    green(referenceColor),
    blue(referenceColor)
  );

  bladeDetected = colorDifference < colorTolerance;

  // Teken detectiekader
  noFill();
  if (bladeDetected) {
    // Bereken inverse kleur
    let rInverse = 255 - red(referenceColor);
    let gInverse = 255 - green(referenceColor);
    let bInverse = 255 - blue(referenceColor);
    stroke(rInverse, gInverse, bInverse);
  } else {
    stroke(255);
  }
  rect(detectionFrameX, detectionFrameY, 50, 50);

  if (isMeasuring) {
    handleMeasurement(bladeDetected);
  }

  // Update verstreken tijd
  if (isMeasuring && firstDetection) {
    ellapsedTime = (millis() - startTime) / 1000.0;
  }

  // Toon informatie
  displayInfo();

  // Teken knoppen
  drawButtons();
  drawBladeOptionButtons();
}

function calculateAverageColor() {
  let rTotal = 0,
    gTotal = 0,
    bTotal = 0;
  let pixels = 0;

  capture.loadPixels();
  for (let x = detectionFrameX; x < detectionFrameX + 50; x++) {
    for (let y = detectionFrameY; y < detectionFrameY + 50; y++) {
      let index = 4 * (y * width + x);
      rTotal += capture.pixels[index];
      gTotal += capture.pixels[index + 1];
      bTotal += capture.pixels[index + 2];
      pixels++;
    }
  }

  return color(rTotal / pixels, gTotal / pixels, bTotal / pixels);
}

function handleMeasurement(bladeDetected) {
  if (bladeDetected && !lastFrameDetected) {
    if (!firstDetection) {
      startTime = millis();
      firstDetection = true;
    } else {
      bladeDetectionCount++;
      if (bladeDetectionCount >= numberOfBlades) {
        rotationCount++;
        bladeDetectionCount = 0;
        rpm = (rotationCount / ellapsedTime) * 60;
      }
    }
  }
  lastFrameDetected = bladeDetected;
}

function displayInfo() {
  fill(0, 160);
  noStroke();
  rect(10, 10, 200, 115);
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text("Rotaties: " + rotationCount, 25, 30);
  text("RPM: " + rpm.toFixed(1), 25, 55);
  text("Wieken: " + numberOfBlades, 25, 80);
  if (firstDetection) {
    text("Tijd: " + ellapsedTime.toFixed(1) + " s", 25, 105);
  }
}

function drawButtons() {
  // Start knop
  if (startButtonActive) {
    fill(0, 255, 0);
  } else {
    fill(100);
  }
  rect(startButtonX, startButtonY, buttonWidth, buttonHeight);
  fill(0);
  textAlign(CENTER, CENTER);
  text(
    "Start Meting",
    startButtonX + buttonWidth / 2,
    startButtonY + buttonHeight / 2
  );

  // Stop knop
  if (!startButtonActive) {
    fill(255, 0, 0);
  } else {
    fill(100);
  }
  rect(stopButtonX, stopButtonY, buttonWidth, buttonHeight);
  fill(0);
  text(
    "Stop Meting",
    stopButtonX + buttonWidth / 2,
    stopButtonY + buttonHeight / 2
  );

  // Kleurdetectieknop
  if (colorButtonActive) {
    fill(200, 200, 255);
  } else {
    fill(100);
  }
  rect(colorButtonX, colorButtonY, buttonWidth, buttonHeight);
  fill(0);
  text(
    "Bepaal Kleur",
    colorButtonX + buttonWidth / 2,
    colorButtonY + buttonHeight / 2
  );

  // Kleurweergave
  stroke(0);
  fill(referenceColor);
  rect(colorPreviewX, colorButtonY, buttonHeight, buttonHeight);
}

function setupBladeOptionButtons() {
  bladeButtonY = 10;
  blade2ButtonX = width - 150;
  blade3ButtonX = width - 100;
  blade4ButtonX = width - 50;
}

function drawBladeOptionButtons() {
  textAlign(CENTER, CENTER);
  textSize(16);

  // 2 wieken knop
  if (numberOfBlades == 2) {
    fill(200, 200, 255);
  } else {
    fill(150);
  }
  rect(blade2ButtonX, bladeButtonY, bladeButtonWidth, buttonHeight);
  fill(0);
  text(
    "2",
    blade2ButtonX + bladeButtonWidth / 2,
    bladeButtonY + buttonHeight / 2
  );

  // 3 wieken knop
  if (numberOfBlades == 3) {
    fill(200, 200, 255);
  } else {
    fill(150);
  }
  rect(blade3ButtonX, bladeButtonY, bladeButtonWidth, buttonHeight);
  fill(0);
  text(
    "3",
    blade3ButtonX + bladeButtonWidth / 2,
    bladeButtonY + buttonHeight / 2
  );

  // 4 wieken knop
  if (numberOfBlades == 4) {
    fill(200, 200, 255);
  } else {
    fill(150);
  }
  rect(blade4ButtonX, bladeButtonY, bladeButtonWidth, buttonHeight);
  fill(0);
  text(
    "4",
    blade4ButtonX + bladeButtonWidth / 2,
    bladeButtonY + buttonHeight / 2
  );
}

function mousePressed() {
  // Start knop
  if (
    mouseX > startButtonX &&
    mouseX < startButtonX + buttonWidth &&
    mouseY > startButtonY &&
    mouseY < startButtonY + buttonHeight &&
    startButtonActive
  ) {
    startMeasurement();
  }
  // Stop knop
  if (
    mouseX > stopButtonX &&
    mouseX < stopButtonX + buttonWidth &&
    mouseY > stopButtonY &&
    mouseY < stopButtonY + buttonHeight &&
    !startButtonActive
  ) {
    stopMeting();
  }
  // Kleur bepaal knop
  if (
    mouseX > colorButtonX &&
    mouseX < colorButtonX + buttonWidth &&
    mouseY > colorButtonY &&
    mouseY < colorButtonY + buttonHeight &&
    colorButtonActive
  ) {
    determineReferenceColor();
  }

  // Wiek selectie knoppen
  if (
    !isMeasuring &&
    mouseY > bladeButtonY &&
    mouseY < bladeButtonY + buttonHeight
  ) {
    if (mouseX > blade2ButtonX && mouseX < blade2ButtonX + bladeButtonWidth) {
      numberOfBlades = 2;
    } else if (
      mouseX > blade3ButtonX &&
      mouseX < blade3ButtonX + bladeButtonWidth
    ) {
      numberOfBlades = 3;
    } else if (
      mouseX > blade4ButtonX &&
      mouseX < blade4ButtonX + bladeButtonWidth
    ) {
      numberOfBlades = 4;
    }
  }
}

function startMeasurement() {
  isMeasuring = true;
  startButtonActive = false;
  colorButtonActive = false;
  rotationCount = 0;
  bladeDetectionCount = 0;
  rpm = 0;
  ellapsedTime = 0;
  firstDetection = false;
  startTime = 0;
}

function stopMeting() {
  isMeasuring = false;
  startButtonActive = true;
  colorButtonActive = true;
}

function setKleurTolerantie(tolerantie) {
  colorTolerance = tolerantie;
}

function determineReferenceColor() {
  let averageColor = calculateAverageColor();
  referenceColor = averageColor;
}
