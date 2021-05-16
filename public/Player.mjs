import { dimension } from './dimension.mjs';

class Player {
  constructor({x, y, score, id}) {
    this.x = x
    this.y = y
    this.score = score
    this.id = id
    this.radius = 30
  }

  movePlayer(dir, speed) {
    switch(dir) {
      case 'up':
        this.y  = Math.max(dimension.minY+this.radius, this.y - speed);
        break;
      case 'down':
        this.y  = Math.min(dimension.maxY-this.radius, this.y + speed);
        break;
      case 'left':
        this.x  = Math.max(dimension.minX+this.radius, this.x - speed);
        break;
      case 'right':
        this.x  = Math.min(dimension.maxX-this.radius, this.x + speed);
        break;
    }
  }

  draw(context,img){
    context.drawImage(img, this.x-this.radius, this.y-this.radius, 2*this.radius, 2*this.radius);
  }

  collision(item) {
    var dx = this.x - item.x;
    var dy = this.y - item.y;
    var d = Math.sqrt(dx * dx + dy * dy)
    return d < this.radius + item.radius 
  }

  calculateRank(arr) {
    arr.sort((a, b) => a.score < b.score ? -1 : 1) 
    for (let i = 0; i < arr.length; i ++){
      if (arr[i].id == this.id){
        return `Rank: ${i + 1} / ${arr.length}`
      }
    }
  }

  // calculateRank(arr) {
  //   const sort = arr.sort((a, b) => b.score - a.score);
  //   let position = 0
  //   sort.forEach((player, index) => {
  //     if(this.id === player.id) position = index+1;
  //   });

  //   return `Rank: ${position} / ${arr.length}`;
  // }
}
try {
  module.exports = Player;
} catch(e) {}

export default Player;
