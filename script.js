const CONFIG_SCALE       = 1000;
const DEFAULT_NUM_TILES  = 15;
const DEFAULT_DECAY      = 100;
const DEFAULT_DISPERSION = 2000;
const DEFAULT_SINK       = 800;

let decay;
let dispersion;
let sink;
let canvas;
let context;
let tileW;
let tileH;

// Nests all repeated animation functions
function mainLoop () {
  setTimeout(function (){
    calculateTileDimensions();
    decayTiles();
    drawTiles();
    mainLoop();
  }, 50);
}

// Called before the main app loop begins.
function init () {
  attachListeners();
  initGuiDefaults();
  configurePhysics();
  buildTiles();

  // Set up canvas
  canvas = document.getElementById("main");
  context = canvas.getContext("2d");
}

// Set default GUI values.
function initGuiDefaults() {
  document.getElementById("configTiles").value      = DEFAULT_NUM_TILES;
  document.getElementById("configDecay").value      = DEFAULT_DECAY;
  document.getElementById("configDispersion").value = DEFAULT_DISPERSION;
  document.getElementById("configSink").value       = DEFAULT_SINK;
}

// Configures variables that scale physics calculations.
function configurePhysics() {
  decay      = document.getElementById("configDecay").value      / CONFIG_SCALE;
  dispersion = document.getElementById("configDispersion").value / CONFIG_SCALE;
  sink       = document.getElementById("configSink").value       / CONFIG_SCALE;
}

// Adds event listeners to DOM elements
function attachListeners() {
  document.getElementById("main").onmousemove          = disturbTiles;
  document.getElementById("configTiles").oninput       = buildTiles;
  document.getElementById("configDecay").oninput       = configurePhysics;
  document.getElementById("configDispersion").oninput  = configurePhysics;
  document.getElementById("configSink").oninput        = configurePhysics;
}

// Calculates the width and height of the tiles
function calculateTileDimensions() {
  tileW  = canvas.width / tiles.length;
  tileH  = canvas.height / tiles[0].length;
}

// Redraws the canvas
function drawTiles() {
  // Clear the canvas
  context.clearRect(0,0,canvas.width,canvas.height);

  // Loop through each tile
  for (x = 0; x < tiles.length; x++) {
    for (y = 0; y < tiles[x].length; y++) {

      // Calculate necessary values for the current
      let tileValue  = tiles[x][y];
      let sinkScale  = tileValue * tileW * sink;
      let sinkOffset = sinkScale / 2;
      let tileX      = x * tileW + sinkOffset;
      let tileY      = y * tileW + sinkOffset;
      let tileWidth  = tileW - sinkScale - 1;
      let tileHeight = tileH - sinkScale - 1;

      // Draw the current tile
      context.beginPath   ();
      context.fillStyle = getColor(tileValue);
      context.rect        (tileX, tileY, tileWidth, tileHeight);
      context.fill        ();
    }
  }
}

// Iterates through tiles and applies decay and ripple effects.
function decayTiles() {
  for (i = 0; i < tiles.length; i++) {
    for (j = 0; j < tiles[i].length; j++) {
      // Decay the tile's value
      if (tiles[i][j] > 0) {
        let decayAmt = tiles[i][j] * decay;
        tiles[i][j] -= decayAmt;

        rippleTiles(i, j, decayAmt);
      }
    }
  }
}

// Ripple to neighbors
function rippleTiles(srcX, srcY, decayAmt) {

  // Determines whether or not a target tile is within bounds
  function isInBounds(x, y, centerX, centerY, length) {
    return (y >= 0 && x >= 0                    // Is the target within bounds?
        &&  x < length                          // ""
        &&  y < length                          // ""
        && (x != centerX && y != centerY));      // Is target != src?
  }

  // Loop through all tiles within 1 space of current tile
  for (destX = srcX-1; destX <= srcX+1; destX++){
    for (destY = srcY-1; destY <= srcY+1; destY++){

      // If tile is within bounds...
      if (isInBounds(destX, destY, srcX, srcY, tiles.length)) {

        // Apply ripple
        let difference = tiles[destX][destY] - tiles[srcX][srcY];
        if (difference < 0) {
          tiles[destX][destY] += decayAmt * (difference * -1 ) * dispersion;
          tiles[destX][destY] %= 1;
        }
      }

    }
  }
}

// Returns a color code in hex string format.
function getColor(value) {
  value = Math.sqrt(value) * 255;

  // Small RGB-hex string converter taken from Stack Overflow 
  function componentToHex(c) {
      let hex = (Math.round(c)).toString(16);
      return hex.length == 1 ? "0" + hex : hex;
  }

  // Return color code as hex string
  return "#" + componentToHex( value )
             + componentToHex( value / 3 + 170 )
             + componentToHex( value );
}

// Updates tiles in response to mouse movement.
function disturbTiles(event){
  // Get the X and Y indicies for the tile under the mouse cursor
  let x = Math.floor(event.x * tiles.length    / canvas.width);
  let y = Math.floor(event.y * tiles[0].length / canvas.height);

  // Update that tile.
  tiles[x][y] = 1;
}

// Initializes and rebuilds the 2d array of tiles
function buildTiles(){
  // Reference the GUI to find out how many tiles we need
  let numTiles = document.getElementById("configTiles").value;
  tiles = [];

  // Process each element in array
  for (i = 0; i < numTiles; i++) { 
    tiles[i] = [];               // Reset second dimension of tiles array.
    for (j = 0; j < numTiles; j++) {
      tiles[i][j] = 0;
    }
  }
}

init();
mainLoop();
