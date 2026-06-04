import { createForestActors } from "./forest.js";
import { createCaveActors, createCaveWalls } from "./cave.js";
import { createColiActors, createColiWalls } from "./coliseum.js";

export class GameState {
  constructor() {
    this.rows = 0;
    this.cols = 0;
    this.gridContainer = null;
    this.playerActor = null;
    this.currentActor = null;
    this.currentAction = "";
    this.monsters = [];
    this.monsterCount = 0;
    this.deadMonsters = 0;
    this.attackUsed = false;
  }

  animateTokenAttack(token, startPos, targetPos) {
    const bumpX = Math.sign(startPos.x - targetPos.x) * 15; // should be 15 px bump
    const bumpY = Math.sign(startPos.y - targetPos.y) * 15;
    token.style.zIndex = "100";

    const animation = token.animate(
      [
        { transform: "translate(0px, 0px)" },
        { transform: `translate(${bumpX}px, ${bumpY}px)`, offset: 0.3 },
        { transform: "translate(0px, 0px)" },
      ],
      {
        duration: 300,
        easing: "ease-in-out",
      },
    );

    animation.onfinish = () => {
      token.style.zIndex = "auto";
    };
  }

  animateTokenMove(token, startCell, endCell) {
    const startRect = token.getBoundingClientRect();
    endCell.appendChild(token);
    const endRect = token.getBoundingClientRect();
    const deltaX = startRect.left - endRect.left;
    const deltaY = startRect.top - endRect.top;

    token.style.transition = "none";
    token.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    token.style.zIndex = "100";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        token.style.transition = "transform 0.4s ease-in-out";
        token.style.transform = `translate(0, 0)`;
        setTimeout(() => {
          token.style.transition = "none";
          token.style.transform = "none";
          token.style.zIndex = "auto";
        }, 400);
      });
    });
  }

  attack(targetCell) {
    this.attackUsed = true;
    var actor = this.currentActor;
    var targetId = targetCell.querySelector(".monster").id;
    var targetIdNum = parseInt(
      targetId.substring(targetId.indexOf("-") + 1),
      10,
    );
    var target = this.monsters[targetIdNum - 1];
    this.animateTokenAttack(actor.token, actor.position, target.position);
    var attackRoll = generateAttack();
    console.log(attackRoll, actor.toHit, target.armor);
    var damage = 0;
    var hit = false;
    if (attackRoll === 20) {
      var damage1 =
        actor.attackDamage[
          Math.floor(Math.random() * actor.attackDamage.length)
        ];
      var damage2 =
        actor.attackDamage[
          Math.floor(Math.random() * actor.attackDamage.length)
        ];
      hit = "crit";
      damage = damage1 + damage2;
    } else if (attackRoll + actor.toHit >= target.armor) {
      damage =
        actor.attackDamage[
          Math.floor(Math.random() * actor.attackDamage.length)
        ];
      hit = true;
    }
    target.health -= damage;
    this.generateCombatLogEntry(
      actor.type,
      `${target.type} ${target.idNumber}`,
      damage,
      hit,
    );
    this.toggleActions("attack");
    if (target.health <= 0) {
      this.removeToken(target);
      this.deadMonsters++;
      this.monsters[targetIdNum - 1] = "dead";
      if (this.deadMonsters === this.monsterCount) {
        this.triggerWin();
      }
    }
  }

  addToken(actor) {
    const cell = this.indexToCell(actor.position);
    // console.log(cell);
    if (cell) {
      cell.appendChild(actor.token);
    } else {
      console.error("Invalid position for token:", actor.position);
    }
  }

  cellToIndex(cell) {
    const index = cell.id;
    const indexNum = index.substring(index.indexOf("-") + 1);
    var x = indexNum % this.cols;
    var y = Math.floor(indexNum / this.cols);
    const position = {
      x: x,
      y: y,
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
    if (this.attackUsed === true) {
      document.getElementById("attackBtn").classList.toggle("hidden");
      this.attackUsed = false;
    }
  }

  generateCombatLogEntry(attacker, attackie, damage, hit) {
    const oldEntry = COMBATLOG.querySelector(".active");
    oldEntry.classList.remove("active");
    const entry = document.createElement("p");
    entry.classList.add("active");
    if (hit) {
      entry.textContent = `${attacker} did ${damage} damage to ${attackie}`;
    } else if (!hit) {
      entry.textContent = `${attacker} missed ${attackie} with their attack`;
    } else {
      entry.textContent = `${attacker} crit ${attackie} for ${damage}!`;
    }
    COMBATLOG.appendChild(entry);
    COMBATLOG.scrollTop = COMBATLOG.scrollHeight;
  }

  generateGrid(character, difficulty, map) {
    this.gridContainer = document.querySelector(".grid-container");
    if (!this.gridContainer) {
      console.error("Grid container not found!");
      return;
    }
    var walls = [];
    switch (map) {
      case "forest":
        var [actors, numMonsters] = createForestActors(character, difficulty);
        break;
      case "cave":
        var [actors, numMonsters] = createCaveActors(character, difficulty);
        walls = createCaveWalls();
        break;
      case "coliseum":
        var [actors, numMonsters] = createColiActors(character, difficulty);
        walls = createColiWalls();
        break;
      default:
        var [actors, numMonsters] = [[], 0];
        walls = [];
        break;
    }
    for (let i = 0; i < this.rows * this.cols; i++) {
      const cell = document.createElement("div");
      cell.classList.add("grid-item");
      cell.classList.add("no-action");
      cell.id = `cell-${i}`; // Assigning an ID to each cell for easy reference.
      cell.addEventListener("click", () => {
        if (cell.classList.contains("available-move")) {
          this.takeAction("move", cell);
        } else if (cell.classList.contains("available-attack")) {
          this.takeAction("attack", cell);
        }
      });
      if (walls.length !== 0) {
        var cellPos = this.cellToIndex(cell);
        if (walls[cellPos.y][cellPos.x] === "w") {
          cell.classList.add("wall");
        }
      }
      this.gridContainer.appendChild(cell);
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
    var attacks = [];
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        let location = {
          x: i,
          y: j,
        };
        if (this.chebyshevDistance(actor.position, location) <= range) {
          const cell = this.indexToCell(location);
          if (actor.type != "monster" && cell.querySelector(".monster")) {
            attacks.push(location);
          } else if (cell.querySelector("player")) {
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
    var moves = [];
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        let location = {
          x: i,
          y: j,
        };
        if (this.chebyshevDistance(actor.position, location) <= range) {
          const cell = this.indexToCell(location);
          if (
            !cell.querySelector(".monster") &&
            !cell.classList.contains("wall")
          ) {
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
    var startCell = this.indexToCell(actor.position);
    this.animateTokenMove(actor.token, startCell, targetCell);
    var targetPos = this.cellToIndex(targetCell);
    var distanceTraveled = Math.floor(
      this.chebyshevDistance(actor.position, targetPos),
    );
    actor.position = targetPos;
    actor.movementRange -= distanceTraveled;
    PLAYERMOVEMENT.textContent = actor.movementRange;
    this.toggleActions("move");
  }

  removeToken(actor) {
    const cell = this.indexToCell(actor.position);
    if (cell) {
      cell.replaceChildren();
    } else {
      console.error("No token present at ", cell);
    }
  }

  takeAction(action, targetCell) {
    this.toggleActions(action);
    if (action === "move") {
      this.move(targetCell);
    } else if (action === "attack") {
      this.toggleActions(action);
      CONTROLWINDOW.classList.toggle("info");
      INFOTEXT.textContent = ``;
      this.attack(targetCell);
      toggleUI();
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
    document.getElementById("popup-modal-loss").style.display = "block";
  }

  triggerWin() {
    document.getElementById("popup-modal-win").style.display = "block";
  }
}

function toggleUI() {
  document.getElementById("moveBtn").classList.toggle("hidden");
  if (GAMESTATE.attackUsed === false) {
    document.getElementById("attackBtn").classList.toggle("hidden");
  }
  document.getElementById("endTurnBtn").classList.toggle("hidden");

  document.getElementById("info-text").classList.toggle("hidden");
  document.getElementById("backBtn").classList.toggle("hidden");
}

export function generateAttack() {
  var rolls = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  ];
  return rolls[Math.floor(Math.random() * 20)];
}

//Apparently common convention is to use all caps for the global variable.
let GAMESTATE = new GameState();
window.GAMESTATE = GAMESTATE;
const CONTROLWINDOW = document.querySelector(".controls");
const INFOTEXT = document.getElementById("info-text");
const COMBATLOG = document.querySelector(".log");
const PLAYERHEALTH = document.getElementById("player-health");
window.PLAYERHEALTH = PLAYERHEALTH;
const PLAYERMOVEMENT = document.getElementById("player-movement");

document.addEventListener("DOMContentLoaded", () => {
  // Reading query params
  const urlParams = new URLSearchParams(window.location.search);
  const character = urlParams.get("character");
  const difficulty = urlParams.get("difficulty");
  const path = window.location.pathname;
  const mapName = path.slice(path.lastIndexOf("/") + 1).slice(0, -5);
  let rows = 0;
  let cols = 0;
  if (mapName === "forest") {
    rows = 8;
    cols = 12;
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

  const moveBtn = document.getElementById("moveBtn");
  const attackBtn = document.getElementById("attackBtn");
  const endTurnBtn = document.getElementById("endTurnBtn");
  const backBtn = document.getElementById("backBtn");
  const restartBtns = document.querySelectorAll(".restartBtn");
  const returnBtns = document.querySelectorAll(".returnBtn");

  moveBtn.addEventListener("click", () => {
    GAMESTATE.toggleActions("move");
    CONTROLWINDOW.classList.toggle("info");
    INFOTEXT.textContent = `Press any of the green tiles to move your token there!
                            If you don't want to move yet, press the back button.`;
    toggleUI();
  });
  attackBtn.addEventListener("click", () => {
    if (GAMESTATE.attackUsed === true) {
      CONTROLWINDOW.classList.toggle("info");
      INFOTEXT.textContent = `You've used your attack this turn.
                              You'll get another during your next turn.`;
      toggleUI();
    } else {
      GAMESTATE.toggleActions("attack");
      CONTROLWINDOW.classList.toggle("info");
      INFOTEXT.textContent = `Press any of the red tiles to attack the monster there!
                              If you don't want to attack yet, press the back button.`;
      toggleUI();
    }
  });
  endTurnBtn.addEventListener("click", () => {
    GAMESTATE.endTurn();
    var aliveMonsters = GAMESTATE.monsters.filter((mon) => mon !== "dead");
    aliveMonsters.forEach((monster, index) => {
      GAMESTATE.currentAction = null;S
      setTimeout(
        () => {
          GAMESTATE.currentActor = monster;
          monster.takeTurn();
        },
        500 + index * 800,
      );
    });
    setTimeout(
      () => {
        GAMESTATE.currentActor = GAMESTATE.playerActor;
      },
      500 + GAMESTATE.monsters.length * 800,
    );
  });
  backBtn.addEventListener("click", () => {
    // if (GAMESTATE.attackUsed != true) {
    //   GAMESTATE.toggleActions(GAMESTATE.currentAction);
    // }
    GAMESTATE.toggleActions(GAMESTATE.currentAction);
    GAMESTATE.currentAction = null;
    CONTROLWINDOW.classList.toggle("info");
    INFOTEXT.textContent = ``;
    toggleUI();
  });
  restartBtns.forEach((button) => {
    button.addEventListener("click", () => {
      window.location.reload();
    });
  });
  returnBtns.forEach((button) => {
    button.addEventListener("click", () => {
      let urlPrefix =
        window.location.origin +
        window.location.pathname.replace(
          `/src/pages/${mapName}.html`,
          "/index.html",
        );
      window.location.href = urlPrefix;
    });
  });
});
