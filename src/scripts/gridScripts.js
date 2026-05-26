// Not sure how to make this class work yet. I know I want to use it to both generate the grid and track both the player and the monsters.
// I've currently got the grid being declared right away, then once the DOM content is loaded, I set the rows and cols, then generate the grid.
// In the future, I'll have to figure out how to make the event listener get information from the previous page so it can be used for several maps and for each class.
class GameState {
  constructor() {
    this.rows = 0;
    this.cols = 0;
    this.gridContainer = null;
    this.playerActor = null;
    this.currentActor = null;
    this.currentAction =  '';
    this.monsters = [];
    this.attackUsed = false;
  }

  generateGrid(character, difficulty, map) {
    this.gridContainer = document.querySelector('.grid-container');
    if (!this.gridContainer) {
      console.error('Grid container not found!');
      return;
    }
    for (let i = 0; i < this.rows * this.cols; i++) {
      const cell = document.createElement('div');
      cell.classList.add('grid-item');
      cell.classList.add('no-action');
      cell.id = `cell-${i}`; // Assigning an ID to each cell for easy reference.
      // I need to add the relevant methods and possibilities before I can make the event listeneners work.
      cell.addEventListener('click', () => {
        if (cell.classList.contains("available-move")) {
          this.takeAction('move', cell);
        } else if (cell.classList.contains("available-attack")) {
          this.takeAction('attack', cell);
        }
      });
      this.gridContainer.appendChild(cell);
    }
    let usedX = [0];
    let usedY = [3];
    let playerPosition = {
    y : 3,
    x : 0
    };
    let player = new Player(character, 100, playerPosition);
    GAMESTATE.addToken(player);
    this.currentActor = player;
    this.playerActor = player;
    var num_monsters = 0
    switch (difficulty) {
      case "loot_farm":
        num_monsters = 2;
        break;
      case "dungeon":
        num_monsters = 3;
        break;
      case "tpk":
        num_monsters = 5;
        break;
      default:
        num_monsters = 1;
        break;
    }
    for (let i = 0; i < num_monsters; i++ ) {
      do {
        var x = Math.floor(Math.random() * (this.cols - 1) + 1);
      } while (usedX.includes(x));
      do {
        var y = Math.floor(Math.random() * (this.rows - 1) + 1);
      } while (usedY.includes(y));
      usedX.push(x);
      usedY.push(y);
      let monsterPosition = {
        x : x,
        y : y
      };
      let monster = new Monster(map, 100, monsterPosition, i+1);
      GAMESTATE.addToken(monster);
      GAMESTATE.monsters.push(monster);
    }
  }

  indexToCell(position) {
    const cellIndex = position.y * this.cols + position.x;
    return document.getElementById(`cell-${cellIndex}`);
  }

  cellToIndex(cell) {
    const index = cell.id;
    const indexNum = index.substring(index.indexOf('-') + 1);
    var x = indexNum % this.cols;
    var y = Math.floor(indexNum / this.cols);
    const position = {
      x : x,
      y : y
    };
    return position;
  }
  // Change params to just a player or monster object.
  addToken(actor) {
    const cell = this.indexToCell(actor.position)
    console.log(cell);
    if (cell) {
      cell.appendChild(actor.token);
    } else {
      console.error('Invalid position for token:', actor.position);
    }
  }

  chebyshevDistance(startPos, endPos) {
    var p1 = Math.abs(startPos.x - endPos.x);
    var p2 = Math.abs(startPos.y - endPos.y);
    return Math.max(p1, p2);
  }

  getPossibleMoves(actor) {
    var range = (actor.movementRange / 5);
    if (range == 0) {
      return [];
    }
    var moves = []
    for (let i = 0; i < this.cols; i++ ) {
      for (let j = 0; j < this.rows; j++ ) {
        let location = {
          x : i,
          y : j
        };
        if (this.chebyshevDistance(actor.position, location) <= range) {
          const cell = this.indexToCell(location);
          if (!cell.querySelector('.monster') && !cell.querySelector('.player')) {
            moves.push(location);
          }
        }
      }
    }
    return moves;
  }

  getPossibleAttacks(actor) {
    var range = (actor.attackRange / 5);
    var attacks = []
    for (let i = 0; i < this.cols; i++ ) {
      for (let j = 0; j < this.rows; j++) {
        let location = {
          x : i,
          y : j
        };
        if (this.chebyshevDistance(actor.position, location) <= range) {
          const cell = this.indexToCell(location);
          if (actor.type != 'monster' && cell.querySelector('.monster')) {
            attacks.push(location);
          } else if (cell.querySelector('player')) {
            attacks.push(location);
          }
        }
      }
    }
    return attacks;
  }

  toggleActions(actionType) {
    this.currentAction = actionType;
    var classToggle = "";
    var actionPos = [];
    var actor = this.currentActor;
    if (actionType == "move") {
      actionPos = this.getPossibleMoves(actor);
      classToggle = "available-move";
    } else if (actionType == "attack") {
      actionPos = this.getPossibleAttacks(actor);
      classToggle = "available-attack";
    }

    actionPos.forEach((pos) => {
      let cell = this.indexToCell(pos);
      cell.classList.toggle(classToggle);
      cell.classList.toggle("no-action");
    });
  }

  takeAction(action, targetCell) {
    this.toggleActions(action);
    if (action == 'move') {
      this.move(targetCell);
    } else if (action == 'attack') {
      this.attack(targetCell);
    }
  }

  //need to take in location of target and actor who is attacking
  attack(targetCell) {
    this.attackUsed = true;
    var actor = this.currentActor;
    var targetPos = this.cellToIndex(targetCell);
    // This should get just the id nuum

    var targetId = targetCell.querySelector('.monster').id;
    var targetIdNum = parseInt(targetId.substring(targetId.indexOf('-') + 1), 10);
    var target = this.monsters[targetIdNum-1];
    var damage = actor.attackDamage[Math.floor(Math.random() * actor.attackDamage.length)];
    target.health -= damage;
    console.log(target.health, damage);
  }

  //need to take in actor who is moving and target location
  move(targetCell) {
    var actor = this.currentActor;
    targetCell.appendChild(actor.token);
    var targetPos = this.cellToIndex(targetCell);
    var distanceTraveled = Math.floor(this.chebyshevDistance(actor.position, targetPos));
    console.log(distanceTraveled);
    actor.position = targetPos;
    actor.movementRange -= distanceTraveled * 5;
    this.toggleActions('move');
  }

  endTurn() {
    var actor = this.currentActor;
    actor.movementRange = 20;
    this.attackUsed = false;
  }
  
}

//Not sure what to put in the player class yet, I need to track player type, health, and position at any given time, but I don't know what else I want in this class.
class Player {
  constructor(type, health, position) {
    this.type = type;
    this.health = health;
    this.position = position;
    this.token = this.createToken();
    this.movementRange = 20;
    if (this.type == "ranger") {
      this.attackRange = 30;
      this.attackDamage = [4, 5, 6, 7, 8, 9, 10, 11];
    } else if (this.type == "wizard") {
      this.attackRange = 15;
      this.attackDamage = [7, 8, 9, 10, 11, 12, 13, 14];
    } else if (this.type == "fighter") {
      this.attackRange = 5;
      this.attackDamage = [10, 11, 12, 13, 14, 15, 16, 17];
    }
  }

  createToken() {
    const player = document.createElement('div');
    player.id = 'player';
    player.classList.add('player');
    const playerToken = document.createElement('img');
    playerToken.id = 'playerToken';
    switch (this.type) {
      case 'fighter':
        playerToken.src = '../assets/characters/Fighter_token.png';
        playerToken.alt = 'Fighter Token';
        break;
      case 'ranger':
        playerToken.src = '../assets/characters/Ranger_token.png';
        playerToken.alt = 'Ranger Token';
        break;
      case 'wizard':
        playerToken.src = '../assets/characters/Wizard_token.png';
        playerToken.alt = 'Wizard Token';
        break;
      default:
        console.error('Unknown player type:', this.type);
        break;
    }
    player.appendChild(playerToken);
    return player;
  }
}

// This isn't used right now and I'm not sure if I want to keep it this way.
// I need to be able to track multiple monsters, but I'm not going to work on that yet.
class Monster {
  constructor(map, health, position, idNumber) {
    this.health = health;
    this.position = position;
    this.idNumber = idNumber;
    if (map == "forest") {
      this.type = "wolf";
    } else if (map == "cave") {
      this.type = "goblin";
    } else if (map == "coliseum") {
      this.type = "minotaur";
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

  //Take turn method
}


// kind of clunky but this should work correctly
function toggleUI() {
  document.getElementById('moveBtn').classList.toggle('hidden');
  document.getElementById('attackBtn').classList.toggle('hidden');
  document.getElementById('endTurnBtn').classList.toggle('hidden');

  document.getElementById('info-text').classList.toggle('hidden');
  document.getElementById('backBtn').classList.toggle('hidden');
}

//Apparently common convention is to use all caps for the global variable.
let GAMESTATE = new GameState();

// I'm not sure when I should leave this, probably after both the player and the monsters have been loaded and placed within the grid.
// Need to add the functionality of reading the query params from the previous page to determine the size of grid, the player type, and the difficulty.
document.addEventListener('DOMContentLoaded', () => {
  // Reading query params
  const urlParams = new URLSearchParams(window.location.search);
  const character = urlParams.get('character');
  const difficulty = urlParams.get('difficulty');
  const path = window.location.pathname;
  const mapName = path.slice(path.lastIndexOf('/') + 1).slice(0, -5);
  let rows = 0;
  let cols = 0;
  if (mapName == "forest") {
    rows = 8; // Number of rows in the grid
    cols = 12 // Number of columns in the grid
  } else if (mapName == "cave") {

  } else if (mapName == "coliseum") {

  }
  GAMESTATE.rows = rows;
  GAMESTATE.cols = cols;
  GAMESTATE.generateGrid(character, difficulty, mapName);

  const moveBtn = document.getElementById('moveBtn');
  const attackBtn = document.getElementById('attackBtn');
  const endTurnBtn = document.getElementById('endTurnBtn');
  const backBtn = document.getElementById('backBtn');
  const controlWindow = document.querySelector('.controls');
  const infoText = document.getElementById('info-text');

  moveBtn.addEventListener("click", () => {
    console.log("move button pressed");
    GAMESTATE.toggleActions('move');
    controlWindow.classList.toggle('info');
    infoText.textContent = `Press any of the green tiles to move your token there!
                            If you don't want to move yet, press the back button.`;
    toggleUI();
  });
  attackBtn.addEventListener('click', () => {
    console.log("attack button pressed");
    // add if logic for when attack is used or not used
    GAMESTATE.toggleActions('attack');
    controlWindow.classList.toggle('info');
    infoText.textContent = `Press any of the red tiles to attack the monster there!
                            If you don't want to attack yet, press the back button.`;
    toggleUI();
  });
  endTurnBtn.addEventListener('click', () => {
    GAMESTATE.endTurn();
    // GAMESTATE.monsters.forEach((monster) => {
    //   monster.takeTurn();
    // });
  });
  backBtn.addEventListener('click', () => {
    GAMESTATE.toggleActions(GAMESTATE.currentAction);
    controlWindow.classList.toggle('info');
    infoText.textContent = ``;
    toggleUI();
  });

});

