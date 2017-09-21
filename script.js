var stdout = document.getElementById("output").innerHTML;
let print   = function(str) {document.getElementById("output").innerHTML += str; };
let println = function(str) {print(str + "<br>"); };
let clear = function(str) {document.getElementById("output").innerHTML = ""};

// Ripple config
let decay = 0.08;
let dispersion = 2;
let sink = 0.7;

// Set up canvas
let canvas = document.getElementById("main");
let context = canvas.getContext("2d");
let mouseEvent;

let testShade = 15;


let tiles = [];

for (i = 0; i < 50; i++) {
  tiles[i] = [];
  for (j = 0; j < 50; j++) {
    tiles[i][j] = 0;
  }
}

function mainLoop () {
  setTimeout(function (){

    ripple();
    draw();

    mainLoop();
  }, 50);
}


function ripple() {
  let tileW = canvas.width / tiles.length;
  let tileH = canvas.height / tiles[0].length;

  for (i = 0; i < tiles.length; i++) {
    for (j = 0; j < tiles[i].length; j++) {
      // Decay the tile's value
      if (tiles[i][j] > 0) {
        let decayAmt = tiles[i][j] * decay;
        tiles[i][j] -= decayAmt;

        // Ripple to neighbors
        for (k = i-1; k <= i+1; k++){
          if (k >= 0 && k < tiles.length) {
            for (l = j-1; l <= j+1; l++){
              if (l >= 0 && l < tiles[0].length && !(k == i && l == j)) {

                let difference = tiles[k][l] - tiles[i][j];

                if (difference < 0) {
                  tiles[k][l] += decayAmt * (difference * -1 ) * dispersion;
                  tiles[k][l] %= 1;
                }

              }
            }
          }
        }

      }
    }
  }
}

function draw() {
  let tileW = canvas.width / tiles.length;
  let tileH = canvas.height / tiles[0].length;

  context.clearRect(0,0,canvas.width,canvas.height);
  for (i = 0; i < tiles.length; i++) {
    for (j = 0; j < tiles[i].length; j++) {
      context.beginPath();
      context.fillStyle = getShade(tiles[i][j]);
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

function getShade(value) {
  exp = 1 - Math.sqrt(1);
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

document.getElementById("main").onmousemove = function(event){
  let tileW = canvas.width  / tiles.length;
  let tileH = canvas.height / tiles[0].length;

  tiles[Math.floor(event.x / tileW)][Math.floor(event.y / tileH)] = 1;

  clear();
  print();
};

mainLoop();

print("test");
