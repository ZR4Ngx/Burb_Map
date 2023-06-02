
const mapImg = new Image();
mapImg.src   = "./town_free/First Asset pack.png" // this have to connect with Map database

const playerImg = new Image();
playerImg.src   = "./char_free/PlayerImg.png" // this have to connect with User Avatar database

const canvasEl = document.getElementById("canvas");
canvasEl.width = window.innerWidth;
canvasEl.height = window.innerHeight;
const canvas = canvasEl.getContext("2d");

const socket = io();

let players = []; // list of User in Server

let waterMap  = [[]]; //store map layer {id , gid} from backend
let groundMap = [[]];
let decalMap  = [[]];   
const TILE_SIZE = 12;

socket.on("connect", () => {
    console.log("connected")
})

socket.on("map", (loadedMap) => {
    groundMap = loadedMap.ground;
    waterMap  = loadedMap.water;
    decalMap  = loadedMap.decal;
});

socket.on("players", (serverPlayers) => {
  players = serverPlayers;

})

const inputs = {
  up:     false,
  down:   false,
  left:   false,
  right:  false
}

window.addEventListener("keydown", (e) => {
  if (e.key === "w") {
    inputs["up"] = true
  }
  else if (e.key === "a") {
    inputs["left"] = true
  }
  else if (e.key === "s") {
    inputs["down"] = true
  }
  else if (e.key === "d") {
    inputs["right"] = true
  }
  socket.emit("inputs", inputs) //send keydown to server
})

window.addEventListener("keyup", (e) => {
  console.log(e.key);
  if (e.key === "w") {
    inputs["up"] = false
  }
  else if (e.key === "a") {
    inputs["left"] = false
  }
  else if (e.key === "s") {
    inputs["down"] = false
  }
  else if (e.key === "d") {
    inputs["right"] = false
  }
  socket.emit("inputs", inputs) //send keyup to server
})

//animate function//
function loop() {     
    canvas.clearRect(0, 0, canvasEl.width, canvasEl.height);
    
    const myPlayer = players.find((player) => player.id === socket.id) // you can change `socket.id` to connect `user_id` in database
    let camera_x = 0;
    let camera_y = 0;
    if (myPlayer) {
      camera_x = parseInt(myPlayer.x - canvasEl.width/2 ) ; //fix camera at your 2D avatar (in middle)
      camera_y = parseInt(myPlayer.y - canvasEl.height/2) ;
    }

    const TILES_IN_ROW = 32 

  // water
  for (let row = 0; row < waterMap.length; row++) {
    for (let col = 0; col < waterMap[0].length; col++) {
      let { id } = waterMap[row][col];
      const imageRow = parseInt(id / TILES_IN_ROW);
      const imageCol = id % TILES_IN_ROW;
      canvas.drawImage(
        mapImg,
        imageCol * TILE_SIZE,
        imageRow * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
        col * TILE_SIZE - camera_x,
        row * TILE_SIZE - camera_y,
        TILE_SIZE,
        TILE_SIZE
      );
    }
  }

  // ground
  for (let row = 0; row < groundMap.length; row++) {
    for (let col = 0; col < groundMap[0].length; col++) {
      let { id } = groundMap[row][col] ?? {id: undefined};
      const imageRow = parseInt(id / TILES_IN_ROW);
      const imageCol = id % TILES_IN_ROW;
      canvas.drawImage(
        mapImg,
        imageCol * TILE_SIZE,
        imageRow * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
        col * TILE_SIZE - camera_x,
        row * TILE_SIZE - camera_y,
        TILE_SIZE,
        TILE_SIZE
      );
    }
  }

  // path
  for (let row = 0; row < decalMap.length; row++) {
    for (let col = 0; col < decalMap[0].length; col++) {
      let { id } = decalMap[row][col] ?? {id: undefined};
      const imageRow = parseInt(id / TILES_IN_ROW);
      const imageCol = id % TILES_IN_ROW;
      canvas.drawImage(
        mapImg,
        imageCol * TILE_SIZE,
        imageRow * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
        col * TILE_SIZE - camera_x,
        row * TILE_SIZE - camera_y,
        TILE_SIZE,
        TILE_SIZE
      );
    }
  }

  for ( const player of players) {
    canvas.drawImage(playerImg, player.x - camera_x, player.y - camera_y, playerImg.width/4, playerImg.height/4);
  }
  
  window.requestAnimationFrame(loop)

}

window.requestAnimationFrame(loop)