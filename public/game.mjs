import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import { dimension } from './dimension.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

let meImage = new Image()
let otherImage = new Image()
let collectImage = new Image()
let tick; // to avoid uncaught errors
let player;
var playerList = [];
var lantern;

const init = () => {
    meImage.src = 'public/img/player.png'
    otherImage.src = 'public/img/enemy.png'
    collectImage.src = 'public/img/collect.png'

    socket.on('init',  ({id:id, players: players, collect: collect}) => {
        player = players.filter(x => x.id == id)[0]
        player = new Player(player)
        lantern = new Collectible(collect)
        playerList = players

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
              player.movePlayer(dir, 30);
              socket.emit('player', player);
            }
        }

        socket.on('update', ({players: players, collect:collect, changed:changed}) => {
            playerList = players
            lantern = new Collectible(collect)

            if (changed){
                if (player.id === changed.id) {
                    player = new Player(changed)
                }
            }
        });

    });

    window.requestAnimationFrame(update)
}

const update = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#1c4966';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = '#45b6fe';
    context.strokeRect(dimension.minX, dimension.minY, dimension.arenaSizeX, dimension.arenaSizeY);

    context.fillStyle = '#45b6fe';
    

    context.font = `40px 'Modak'`;
    context.fillText('Collect Lantern', 300, 40);

    if (player) {
        context.font = `13px 'Press Start 2P'`;
        context.textAlign = 'center';
        context.fillText('Score', 80, 20);
        context.textAlign = 'center';
        context.fillText(`${player.radius}`, 80, 45);


        player.draw(context, meImage);
        context.font = `26px 'Modak'`;
        context.fillText(player.calculateRank(playerList), 560, 40);

        playerList.forEach( x => {
            if (x.id !== player.id){
                let p = new Player(x);
                p.draw(context, otherImage)
            }
        })


        if (lantern){
            lantern.draw(context, collectImage)
        }

    }

    requestAnimationFrame(update)


}

init()
