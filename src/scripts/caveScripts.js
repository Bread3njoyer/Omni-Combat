import { Monster } from './monsterScripts.js'; 
import { Player } from './playerScripts.js';

export function createCaveActors(character, difficulty) {
  var num_goblins = 4;
  var monsterDamage = []
  var selectedCols = 8;
  var selectedRows = 6;
  var actors = [];

  var playerPos = {
    x : 7,
    y : 4
  }
  var usedX = [7];
  var usedY = [4];
  var player = new Player(character, playerPos);
  actors.push(player);
  switch (difficulty) {
    case "loot_farm":
      monsterDamage = [1,2,3,4,5,6];
      break;
    case "dungeon":
      monsterDamage = [3,4,5,6,7,8];
      break;
    case "tpk":
      monsterDamage = [6,7,8,9,10,11];
      break;
    default:
      monsterDamage = [3,4,5,6,7,8];
      break;
  }

  for (let i = 0; i < num_goblins; i++ ) {
    do {
      var x = Math.floor(Math.random() * (selectedCols - 1));
      if (x > 3) {
        x += 7;
      }
    } while (usedX.includes(x));
    do {
      var y = Math.floor(Math.random() * (selectedRows - 1) + 2);
    } while (usedY.includes(y));
    usedX.push(x);
    usedY.push(y);
    var monsterPosition = {
      x : x,
      y : y
    };
    var monster = new Monster('cave', monsterPosition, i+1);
    monster.attackDamage = monsterDamage;
    actors.push(monster);
  }

  return [actors, num_goblins];
}

export function createCaveWalls() {
  
}