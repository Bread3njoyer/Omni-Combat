import { GameState } from './gridScripts.js';


export class Monster {
  constructor(map, position, idNumber) {
    this.health = 0;
    this.position = position;
    this.idNumber = idNumber;
    this.type = null;
    this.attackRange = 0;
    this.attackDamage = [];
    // make this a switch
    switch (map) {
      case 'forest':
        this.type = 'wolf';
        this.health = 15;
        this.attackRange = 3;
        this.attackDamage = [3,4,5,6,7,8];
        this.movementRange = 5;
        break;
      case 'cave':
        this.type = 'goblin';
        this.health = 20;
        this.attackRange = 3;
        this.attackDamage = [3,4,5,6,7,8];
        this.movementRange = 3;
        break;
      case 'coliseum':
        this.type = 'minotaur';
        this.health = 50;
        this.attackRange = 1;
        this.attackDamage = [3,4,5,6,7,8];
        this.movementRange = 4;
        break;
      default:
        break;
    }
    this.token = this.createToken(idNumber);
  }

  createToken() {
    const monster = document.createElement('div');
    monster.id = `monster-${this.idNumber}`;
    monster.classList.add('monster');
    const monsterToken = document.createElement('img');
    monsterToken.id = `monsterToken-${this.idNumber}`;
    monsterToken.classList.add("monster-token");
    switch (this.type) {
      case 'goblin':
        monsterToken.src = '../assets/monsters/Goblin_token.png';
        monsterToken.alt = 'Goblin Token';
        break;
      case 'wolf':
        monsterToken.src = '../assets/monsters/Wolf_token.png';
        monsterToken.alt = 'Wolf Token';
        break;
      case 'minotaur':
        monsterToken.src = '../assets/monsters/Minotaur_token.png';
        monsterToken.alt = 'Minotaur Token';
        break;
      default:
        console.error('Unknown player type:', this.type);
        break;
    }
    monster.appendChild(monsterToken);
    return monster;
  }
  
  getClosestPlayerTile(playerPos) {
    const directions = [
        {x: 0, y: -this.attackRange}, {x: 0, y: this.attackRange}, {x: -this.attackRange, y: 0}, {x: this.attackRange, y: 0},
        {x: -this.attackRange, y: -this.attackRange}, {x: this.attackRange, y: -this.attackRange}, {x: -this.attackRange, y: this.attackRange}, {x: this.attackRange, y: this.attackRange}
      ];
      var bestPos = {
        x : 0,
        y : 0,
        g : 100
      };
    directions.forEach((dir) => {
      var neighborX = playerPos.x + dir.x;
      var neighborY = playerPos.y + dir.y;
      if (neighborX < 0 || neighborX >= window.GAMESTATE.cols || neighborY < 0 || neighborY >= window.GAMESTATE.rows) return;
      var cell = window.GAMESTATE.indexToCell({x: neighborX, y: neighborY});
      if (cell && (cell.querySelector('.monster') || cell.querySelector('.wall'))) return;
      var g = window.GAMESTATE.chebyshevDistance(this.position, {x: neighborX, y: neighborY});
      if (g < bestPos.g) {
        bestPos.x = neighborX;
        bestPos.y = neighborY;
        bestPos.g = g;
      }
    });

    return bestPos;
  }

  takeTurn() {
    var playerPos = window.GAMESTATE.playerActor.position;
    this.makeMove(playerPos);
  }

  //This is the pathfinding algorithm, credit to Logan for the name.
  calebStar(startPos, endPos) {
    var tempPos = startPos;
    tempPos.partent = null;
    endPos.parent = null;
    var depth = this.movementRange;
    let visited = [];
    let queue = [tempPos];
    // const cellIndex = position.y * window.GAMESTATE.cols + position.x;
    const directions = [
      {x: 0, y: -1}, {x: 0, y: 1}, {x: 1, y: 0}, {x: -1, y: 0},
      {x: 1, y: -1}, {x: 1, y: -1}, {x: -1, y: 1}, {x: 1, y: 1}
    ];
    while (queue.length > 0) {
      var bestG = 100;
      var bestPos = {x : -1, y : -1}
      var currentPos = queue.shift();
      if ((currentPos.x === endPos.x && currentPos.y === endPos.y) || depth == 0) {
        var path = [];
        let curr = currentPos;
        while (curr.parent) {
          path.push({x : curr.x, y: curr.y});
          curr = curr.parent;
        }
        return path.reverse();
      }
      directions.forEach((dir)=> {
        var neighborX = currentPos.x + dir.x;
        var neighborY = currentPos.y + dir.y;
        if (neighborX < 0 || neighborX >= window.GAMESTATE.cols || neighborY < 0 || neighborY >= window.GAMESTATE.rows) {
          visited.push({x : neighborX, y : neighborY, parent: currentPos});
          return;
        }
        var cell = window.GAMESTATE.indexToCell({x: neighborX, y: neighborY});
        if (cell && (cell.querySelector('.monster') || cell.querySelector('.wall'))) {
          visited.push({x : neighborX, y : neighborY, parent: currentPos});
          return;
        }
        if (!visited.find(pos  => pos.x === neighborX && pos.y === neighborY)) {
          visited.push({x : neighborX, y : neighborY});
          var g = window.GAMESTATE.chebyshevDistance({x: neighborX, y: neighborY}, endPos);
          if (g < bestG) {
            bestG = g;
            bestPos = {x : neighborX, y : neighborY, parent : currentPos};
          }
        }
      })
      queue.push(bestPos);
      depth--;  
    }
  }


  makeMove(playerPos) {
    const startPos = this.position;
    const targetPos = this.getClosestPlayerTile(playerPos);
    const path = this.calebStar(startPos, targetPos);
    const finalPos = {x : path.at(-1).x, y : path.at(-1).y};
    const finalCell = window.GAMESTATE.indexToCell(finalPos);
    console.log(targetPos);
    finalCell.appendChild(this.token);
    this.position = finalPos;
  }

}