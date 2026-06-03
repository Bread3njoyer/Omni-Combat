import { Monster } from './monster.js'; 
import { Player } from './player.js';

export function createColiActors(character, difficulty) {
  var actors = [];
  var monsterHealth = 0;
  var playerPos = {
    x : 8,
    y : 4
  }
  var player = new Player(character, playerPos);
  actors.push(player);
  switch (difficulty) {
    case "loot_farm":
      monsterHealth = 20;
      break;
    case "dungeon":
      monsterHealth = 30;
      break;
    case "tpk":
      monsterHealth = 50;
      break;
    default:
      monsterHealth = 30;
      break;
  }

  let monsterPosition = {
    x : 1,
    y : 4
  }
  var monster = new Monster('coliseum', monsterPosition, 1);
  monster.health = monsterHealth;
  actors.push(monster);


  return [actors, 1];
}

export function createColiWalls() {
  var walls = [
    ['w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w'],
    ['w', 'w', 'w', 'n', 'n', 'n', 'n', 'w', 'w', 'w'],
    ['w', 'w', 'n', 'n', 'n', 'n', 'n', 'n', 'w', 'w'],
    ['w', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'w'],
    ['w', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'w'],
    ['w', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'w'],
    ['w', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'w'],
    ['w', 'w', 'n', 'n', 'n', 'n', 'n', 'n', 'w', 'w'],
    ['w', 'w', 'w', 'n', 'n', 'n', 'n', 'w', 'w', 'w'],
    ['w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w']
  ];
  return walls;
}