import { Monster } from './monsterScripts.js'; 
import { Player } from './playerScripts.js';

export function createForestActors(character, difficulty) {
  var num_wolves = 0;
  var damageMult = 0;
  var rightCols = 6;
  var rows = 8;
  var actors = [];

  var playerPos = {
    x : 0,
    y : 3
  }
  var usedX = [0];
  var usedY = [3];
  var player = new Player(character, playerPos);
  actors.push(player);
  switch (difficulty) {
    case "loot_farm":
      num_wolves = 2;
      damageMult = 1.2;
      break;
    case "dungeon":
      num_wolves = 3;
      damageMult = 1.3;
      break;
    case "tpk":
      num_wolves = 5;
      damageMult = 1.5;
      break;
    default:
      num_wolves = 2;
      break;
  }

  for (let i = 0; i < num_wolves; i++ ) {
    do {
      var x = Math.floor(Math.random() * (rightCols - 1) + 6);
    } while (usedX.includes(x));
    do {
      var y = Math.floor(Math.random() * (rows - 1) + 1);
    } while (usedY.includes(y));
    usedX.push(x);
    usedY.push(y);
    var monsterPosition = {
      x : x,
      y : y
    };
    var monster = new Monster('forest', monsterPosition, i+1);
    actors.push(monster);
  }

  return actors;
}