import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import { dimension } from './dimension.mjs';
const socket = io();


let tick;
let playersList = [];
let oxygenEntity;
let playerEntity;
let spikeEntity;


const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');


let meImage = new Image();
let otherImage = new Image();
let oxygenImage = new Image();
let spikeImage = new Image();

const init = () => {
  // get images
  meImage.src = 'public/img/star.png';
  otherImage.src = 'public/img/sun.png';
  oxygenImage.src = 'public/img/sweet.png';
  spikeImage.src = 'public/img/cloud.png';
  
  // create user
  socket.on('init', ({ id, players, oxygen, spike }) => {
    console.log(id, players,oxygen,spike);
    oxygenEntity = new Collectible(oxygen);
    playerEntity = players.filter(x => x.id === id)[0];
    playerEntity = new Player(playerEntity);
    spikeEntity = new Player(spike);
  
    playersList = players


    document.onkeydown = e => {
      let  dir = null
      switch(e.keyCode) {
        case 87:
        case 38:
           dir = 'up';
           break;
        case 83:
        case 40:
           dir = 'down';
           break;
        case 65:
        case 37:
           dir = 'left';
           break;
        case 68:
        case 39:
           dir = 'right';
           break;   
      }
      if (dir) {
        playerEntity.movePlayer(dir, 10);
        socket.emit('update', playerEntity);
      }
    }
  
    // update
    socket.on('update', ({players:players,spike:spike,oxygen:oxygen,player:player}) => {
      spikeEntity = new Player(spike)
      playersList = players;
      oxygenEntity = new Collectible(oxygen)
      if (player) {
        if (player.id === playerEntity.id) {
          playerEntity= new Player(player);
        }
      }
      
    });
  
  });
  
  window.requestAnimationFrame(update); 
}

const update = () => {

  context.clearRect(0, 0, canvas.width, canvas.height);

  // Set background color
  context.fillStyle = '#57f281';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Create border for play field
  context.strokeStyle = '#d9ffe3';
  context.strokeRect(dimension.minX, dimension.minY, dimension.arenaSizeX, dimension.arenaSizeY);

  // Controls text
  context.fillStyle = '#d9ffe3';
  context.font = `13px 'Arial'`;
  context.textAlign = 'center';
  context.fillText('Controls', 80, 20);
  context.textAlign = 'center';
  context.fillText('WASD', 80, 40);

  // Game title
  context.font = `40px 'Arial'`;
  context.fillText('Sweet star', 300, 40);

  if (playerEntity) {
    playerEntity.draw(context,meImage);
    context.font = `26px 'Arial'`;
    context.fillText(playerEntity.calculateRank(playersList), 560, 40);
    playersList.forEach((player)=> {
       if (player.id !== playerEntity.id) {
         let p = new Player(player);
         p.draw(context, otherImage);
       }
    });
    if (oxygenEntity) {
      oxygenEntity.draw(context,oxygenImage);
    }
    if (spikeEntity) {
      spikeEntity.draw(context,spikeImage);
    }
  }

 
  tick = requestAnimationFrame(update);
}

init();