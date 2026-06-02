import {createForestActors} from './forestScripts.js';
import {createCaveActors, createCaveWalls} from './caveScripts.js';
import {createColiActors, createColiWalls} from './coliseumScripts.js';

export class GameState {
  constructor() {
    this.rows = 0;
    this.cols = 0;
    this.gridContainer = null;
    this.playerActor = null;
    this.currentActor = null;
    this.currentAction =  '';
    this.monsters = [];
    this.monsterCount = 0;
    this.deadMonsters = 0;
    this.attackUsed = false;
  }

  attack(targetCell) {
    this.attackUsed = true;
    var actor = this.currentActor;
    var targetId = targetCell.querySelector('.monster').id;
    var targetIdNum = parseInt(targetId.substring(targetId.indexOf('-') + 1), 10);
    var target = this.monsters[targetIdNum-1];
    var damage = actor.attackDamage[Math.floor(Math.random() * actor.attackDamage.length)];
    target.health -= damage;
    this.generateCombatLogEntry(actor.type, `${target.type} ${target.idNumber}`, damage);
    this.toggleActions('attack');
    if (target.health <= 0) {
      this.removeToken(target);
      this.deadMonsters++;
      this.monsters[targetIdNum-1] = 'dead';
      if (this.deadMonsters === this.monsterCount) {
        this.triggerWin();
      }
    }

  }

  addToken(actor) {
    const cell = this.indexToCell(actor.position)
    // console.log(cell);
    if (cell) {
      cell.appendChild(actor.token);
    } else {
      console.error('Invalid position for token:', actor.position);
    }
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

  chebyshevDistance(startPos, endPos) {
    var p1 = Math.abs(startPos.x - endPos.x);
    var p2 = Math.abs(startPos.y - endPos.y);
    return Math.max(p1, p2);
  }

  endTurn() {
    var actor = this.currentActor;
    PLAYERMOVEMENT.textContent = 4;
    actor.movementRange = 4;
    this.attackUsed = false;
  }

  generateCombatLogEntry(attacker, attackie, damage) {
    const oldEntry = COMBATLOG.querySelector('.active');
    oldEntry.classList.remove('active');
    const entry = document.createElement('p');
    entry.classList.add('active');
    entry.textContent = `${attacker} did ${damage} damage to ${attackie}`;
    COMBATLOG.appendChild(entry);
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
      cell.addEventListener('click', () => {
        if (cell.classList.contains("available-move")) {
          this.takeAction('move', cell);
        } else if (cell.classList.contains("available-attack")) {
          this.takeAction('attack', cell);
        }
      });
      this.gridContainer.appendChild(cell);
    }

    switch (map) {
      case 'forest':
        var [actors, numMonsters] = createForestActors(character, difficulty);
        break;
      case 'cave':
        var [actors, numMonsters] = createCaveActors(character, difficulty);
        var wallLocations = createCaveWalls();
        break;
      case 'coliseum':
        var [actors, numMonsters] = createColiActors(character, difficulty);
        var wallLocations = createColiWalls();
        break;
      default:
        var [actors, numMonsters] = [[], 0];
        break;
    }
    this.monsterCount = numMonsters;
    this.playerActor = actors[0];
    this.currentActor = this.playerActor;
    actors.forEach((actor, index) => {
        GAMESTATE.addToken(actor);
        if (index != 0) {
          GAMESTATE.monsters.push(actor);
        }
    });
  }

  getPossibleAttacks(actor) {
    var range = actor.attackRange;
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

  getPossibleMoves(actor) {
    var range = actor.movementRange;
    if (range === 0) {
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

  indexToCell(position) {
    const cellIndex = position.y * this.cols + position.x;
    return document.getElementById(`cell-${cellIndex}`);
  }

  move(targetCell) {
    var actor = this.currentActor;
    targetCell.appendChild(actor.token);
    var targetPos = this.cellToIndex(targetCell);
    var distanceTraveled = Math.floor(this.chebyshevDistance(actor.position, targetPos));
    actor.position = targetPos;
    actor.movementRange -= distanceTraveled;
    PLAYERMOVEMENT.textContent = actor.movementRange;
    this.toggleActions('move');
  }

  removeToken(actor) {
    const cell = this.indexToCell(actor.position);
      if (cell) {
        cell.replaceChildren();
      } else {
        console.error('No token present at ', cell);
      }
  }

  takeAction(action, targetCell) {
    this.toggleActions(action);
    if (action === 'move') {
      this.move(targetCell);
    } else if (action === 'attack') {
      this.toggleActions(action);
      CONTROLWINDOW.classList.toggle('info');
      INFOTEXT.textContent = ``;
      toggleUI();
      this.attack(targetCell);
    }
  }

  toggleActions(actionType) {
    this.currentAction = actionType;
    var classToggle = "";
    var actionPos = [];
    var actor = this.currentActor;
    if (actionType === "move") {
      actionPos = this.getPossibleMoves(actor);
      classToggle = "available-move";
    } else if (actionType === "attack") {
      actionPos = this.getPossibleAttacks(actor);
      classToggle = "available-attack";
    }

    actionPos.forEach((pos) => {
      let cell = this.indexToCell(pos);
      cell.classList.toggle(classToggle);
      cell.classList.toggle("no-action");
    });
  }

  triggerLoss() {
    togglePopup(document.getElementById('popup-modal-loss'));
  }

  triggerWin() {
    togglePopup(document.getElementById('popup-modal-win'));
  }
  
}

function togglePopup(modal) {
  modal.style.display = (modal.style.display === "block") ? "none" : "block";
}

function toggleUI() {
  document.getElementById('moveBtn').classList.toggle('hidden');
  document.getElementById('attackBtn').classList.toggle('hidden');
  document.getElementById('endTurnBtn').classList.toggle('hidden');

  document.getElementById('info-text').classList.toggle('hidden');
  document.getElementById('backBtn').classList.toggle('hidden');
}

//Apparently common convention is to use all caps for the global variable.
let GAMESTATE = new GameState();
window.GAMESTATE = GAMESTATE;
const CONTROLWINDOW = document.querySelector('.controls');
const INFOTEXT = document.getElementById('info-text');
const COMBATLOG = document.querySelector('.log');
const PLAYERHEALTH = document.getElementById('player-health');
window.PLAYERHEALTH = PLAYERHEALTH;
const PLAYERMOVEMENT = document.getElementById('player-movement');

document.addEventListener('DOMContentLoaded', () => {
  // Reading query params
  const urlParams = new URLSearchParams(window.location.search);
  const character = urlParams.get('character');
  const difficulty = urlParams.get('difficulty');
  const path = window.location.pathname;
  const mapName = path.slice(path.lastIndexOf('/') + 1).slice(0, -5);
  let rows = 0;
  let cols = 0;
  if (mapName === "forest") {
    rows = 8; 
    cols = 12 
  } else if (mapName === "cave") {
    rows = 10;
    cols = 15;
  } else if (mapName === "coliseum") {
    rows = 10;
    cols = 10;
  }
  GAMESTATE.rows = rows;
  GAMESTATE.cols = cols;
  GAMESTATE.generateGrid(character, difficulty, mapName);

  const moveBtn = document.getElementById('moveBtn');
  const attackBtn = document.getElementById('attackBtn');
  const endTurnBtn = document.getElementById('endTurnBtn');
  const backBtn = document.getElementById('backBtn');
  const restartBtns = document.querySelectorAll('.restartBtn');
  const returnBtns = document.querySelectorAll('.returnBtn');


  moveBtn.addEventListener("click", () => {
    GAMESTATE.toggleActions('move');
    CONTROLWINDOW.classList.toggle('info');
    INFOTEXT.textContent = `Press any of the green tiles to move your token there!
                            If you don't want to move yet, press the back button.`;
    toggleUI();
  });
  attackBtn.addEventListener('click', () => {
    if (GAMESTATE.attackUsed === true) {
      CONTROLWINDOW.classList.toggle('info');
      INFOTEXT.textContent = `You've used your attack this turn.
                              You'll get another during your next turn.`;
      toggleUI();
    } else {
      GAMESTATE.toggleActions('attack');
      CONTROLWINDOW.classList.toggle('info');
      INFOTEXT.textContent = `Press any of the red tiles to attack the monster there!
                              If you don't want to attack yet, press the back button.`;
      toggleUI();
    }
  });
  endTurnBtn.addEventListener('click', () => {
    GAMESTATE.endTurn();
    GAMESTATE.monsters.forEach((monster) => {
      GAMESTATE.currentAction = null;
      if (monster !== 'dead') {
        GAMESTATE.currentActor = monster;
        setTimeout(monster.takeTurn(), 500);
      }
    });
    GAMESTATE.currentActor = GAMESTATE.playerActor;

  });
  backBtn.addEventListener('click', () => {
    if (GAMESTATE.attackUsed != true) {
      GAMESTATE.toggleActions(GAMESTATE.currentAction);
    }
    GAMESTATE.currentAction = null;
    CONTROLWINDOW.classList.toggle('info');
    INFOTEXT.textContent = ``;
    toggleUI();
  });
  restartBtns.forEach(button => {
    button.addEventListener('click', () => {
      window.location.reload();
    });
  });
  returnBtns.forEach(button => {
    button.addEventListener('click', () => {
      let urlPrefix = window.location.origin + window.location.pathname.replace(`/src/pages/${mapName}.html`, '/index.html');
      window.location.href = urlPrefix;
    });
  });
});

