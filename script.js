const STDOUT      = document.getElementById("output").innerHTML;
const CONFIG_SCALE = 1000;
let print   = function(str) {document.getElementById("output").innerHTML += str; };
let println = function(str) {print(str + "<br>"); };
let clear = function(str) {document.getElementById("output").innerHTML = ""};

let decay;
let dispersion;
let sink;
let canvas;
let context;

// INITIALIZE. Called before the main app loop begins.
function init () {
  attachListeners();
  initGui();
  configurePhysics();
  tileBuildListener();

  // Set up canvas
  canvas = document.getElementById("main");
  context = canvas.getContext("2d");
}

// MAIN LOOP. Performs repeated drawing and ripple calculations.
function mainLoop () {
  setTimeout(function (){

    tileDecay();
    draw();

    mainLoop();
  }, 50);
}

// ATTACH EVENT LISTENERS
function attachListeners() {
  document.getElementById("main").onmousemove          = mouseMoveListener;
  document.getElementById("configTiles").oninput       = tileBuildListener;
  document.getElementById("configDecay").oninput       = configurePhysics;
  document.getElementById("configDispersion").oninput  = configurePhysics;
  document.getElementById("configSink").oninput        = configurePhysics;
}

// Updates tiles in response to mouse movement.
function mouseMoveListener(event){
  let tileW = canvas.width  / tiles.length;
  let tileH = canvas.height / tiles[0].length;
  tiles[Math.floor(event.x / tileW)][Math.floor(event.y / tileH)] = 1;
}

function tileBuildListener(){
  let numberOfTiles = document.getElementById("configTiles").value;
  buildTiles(numberOfTiles,numberOfTiles);
}

function initGui() {
  document.getElementById("configDecay").value      += 0;
  document.getElementById("configDispersion").value += 0;
  document.getElementById("configSink").value       += 0;
}

// Configures variables that scale physics calculations.
function configurePhysics() {
  decay      = document.getElementById("configDecay").value      / CONFIG_SCALE;
  dispersion = document.getElementById("configDispersion").value / CONFIG_SCALE;
  sink       = document.getElementById("configSink").value       / CONFIG_SCALE;
}

// Assembles 2d array of tiles.
function buildTiles(width, height) {
  tiles = [];

  for (i = 0; i < width; i++) {
    tiles[i] = [];
    for (j = 0; j < height; j++) {
      tiles[i][j] = 0;
    }
  }
}

// Iterates through tiles and applies decay and ripple effects.
function tileDecay() {
  let tileW = canvas.width / tiles.length;
  let tileH = canvas.height / tiles[0].length;

  for (i = 0; i < tiles.length; i++) {
    for (j = 0; j < tiles[i].length; j++) {
      // Decay the tile's value
      if (tiles[i][j] > 0) {
        let decayAmt = tiles[i][j] * decay;
        tiles[i][j] -= decayAmt;

        tileRipple(i, j, decayAmt);
      }
    }
  }
}

// Ripple to neighbors
function tileRipple(srcX, srcY, decayAmt) {
  for (k = srcX-1; k <= srcX+1; k++){
      for (l = srcY-1; l <= srcY+1; l++){

        if (l * k < 0
         || k >= tiles.length
         || l >= tiles[0].length
         || (k == srcX && l == srcY)) {
        } else {
          let difference = tiles[k][l] - tiles[srcX][srcY];

          if (difference < 0) {
            tiles[k][l] += decayAmt * (difference * -1 ) * dispersion;
            tiles[k][l] %= 1;
          }

        }
      }
    // }
  }
}

// Redraws the canvas
function draw() {
  let tileW = canvas.width / tiles.length;
  let tileH = canvas.height / tiles[0].length;

  context.clearRect(0,0,canvas.width,canvas.height);
  for (i = 0; i < tiles.length; i++) {
    for (j = 0; j < tiles[i].length; j++) {
      context.beginPath();
      context.fillStyle = getColor(tiles[i][j]);
      context.rect(
        (tileW * i) + (tileW * tiles[i][j] * sink / 2)
       ,(tileH * j) + (tileH * tiles[i][j] * sink / 2)
       ,tileW - (tileW * tiles[i][j] * sink) - 1
       ,tileH - (tileH * tiles[i][j] * sink) - 1
       );
      context.fill();


    }
  }
}

// Returns a color code in hex string format.
function getColor(value) {
  exp = 1;
  value *= 10;
  let coarse = Math.floor((value % 16) * exp);
  let fine   = Math.floor((((value - coarse) * 10) % 16) * exp);
  return ("#" + (coarse).toString(16)
         + "" + (fine).toString(16)
         + "CC"
         // + "" + (10 + Math.round(coarse/2)).toString(16)
         // + "" + (10 + Math.round(fine/2)).toString(16)
         + "" + (coarse).toString(16)
         + "" + (fine).toString(16));
}


init();
mainLoop();
