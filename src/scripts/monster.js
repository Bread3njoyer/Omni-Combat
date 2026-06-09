import { generateAttack } from "./grid.js";

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
      case "forest":
        this.type = "wolf";
        this.health = 15;
        this.attackRange = 1;
        this.attackDamage = [3, 4, 5, 6, 7, 8];
        this.movementRange = 5;
        this.toHit = 4;
        this.armor = 12;
        break;
      case "cave":
        this.type = "goblin";
        this.health = 20;
        this.attackRange = 3;
        this.movementRange = 3;
        this.armor = 14;
        break;
      case "coliseum":
        this.type = "minotaur";
        this.health = 50;
        this.attackRange = 1;
        this.attackDamage = [8, 9, 10, 11, 12, 13, 14, 15];
        this.movementRange = 4;
        this.toHit = 6;
        this.armor = 17;
        break;
      default:
        break;
    }
    this.token = this.createToken();
  }

  createToken() {
    const monster = document.createElement("div");
    monster.id = `monster-${this.idNumber}`;
    monster.classList.add("monster");
    const monsterToken = document.createElement("img");
    monsterToken.id = `monsterToken-${this.idNumber}`;
    monsterToken.classList.add("monster-token");
    switch (this.type) {
      case "goblin":
        monsterToken.src = "../assets/monsters/Goblin_token.png";
        monsterToken.alt = "Goblin Token";
        break;
      case "wolf":
        monsterToken.src = "../assets/monsters/Wolf_token.png";
        monsterToken.alt = "Wolf Token";
        break;
      case "minotaur":
        monsterToken.src = "../assets/monsters/Minotaur_token.png";
        monsterToken.alt = "Minotaur Token";
        break;
      default:
        console.error("Unknown player type:", this.type);
        break;
    }
    monster.appendChild(monsterToken);
    return monster;
  }

  getClosestPlayerTile(playerPos) {
    const dirs = [];
    for (let i = -this.attackRange; i <= this.attackRange; i++) {
      for (let j = -this.attackRange; j <= this.attackRange; j++) {
        if (Math.abs(i) === this.attackRange || Math.abs(j) === this.attackRange) {
          dirs.push({x : i, y : j});
        }
      }
    }
    console.log(dirs);
    var bestPos = {
      x: 0,
      y: 0,
      g: 100,
    };
    var haveFound = false;
    dirs.forEach((dir) => {
      var neighborX = playerPos.x + dir.x;
      var neighborY = playerPos.y + dir.y;
      if (
        neighborX < 0 ||
        neighborX > window.GAMESTATE.cols -1 ||
        neighborY < 0 ||
        neighborY > window.GAMESTATE.rows -1
      )
        return;
      var cell = window.GAMESTATE.indexToCell({ x: neighborX, y: neighborY });
      if (
        cell &&
        (cell.querySelector(".monster") || cell.classList.contains("wall"))
      ) {
        console.log(this.idNumber, "dir:", dir);
        return;
      }
      var g = window.GAMESTATE.chebyshevDistance(this.position, {
        x: neighborX,
        y: neighborY,
      });
      if (g < bestPos.g) {
        bestPos.x = neighborX;
        bestPos.y = neighborY;
        bestPos.g = g;
        haveFound = true;
      }
    });

    if (haveFound) {
      return bestPos;
    } else {
      return null;
    }
    
  }

  takeTurn() {
    this.makeMove();
    setTimeout(() => {
      this.makeAttack();
    }, 400);
  }

  //This is the pathfinding algorithm, credit to Logan for the name.
  // Closer to BFS than A* but I think it uses the idea of G from A*.
  calebStar(startPos, endPos) {
    var tempPos = startPos;
    tempPos.partent = null;
    endPos.parent = null;
    var depth = this.movementRange;
    let visited = [];
    let queue = [tempPos];
    // const cellIndex = position.y * window.GAMESTATE.cols + position.x;
    const directions = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: -1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
      { x: 1, y: 1 },
    ];
    while (queue.length > 0) {
      var bestG = 100;
      var bestPos = { x: -1, y: -1 };
      var currentPos = queue.shift();
      if (
        (currentPos.x === endPos.x && currentPos.y === endPos.y) ||
        depth == 0
      ) {
        var path = [];
        let curr = currentPos;
        while (curr.parent) {
          path.push({ x: curr.x, y: curr.y });
          curr = curr.parent;
        }
        return path.reverse();
      }
      directions.forEach((dir) => {
        var neighborX = currentPos.x + dir.x;
        var neighborY = currentPos.y + dir.y;
        if (
          neighborX < 0 ||
          neighborX > window.GAMESTATE.cols ||
          neighborY < 0 ||
          neighborY > window.GAMESTATE.rows
        ) {
          visited.push({ x: neighborX, y: neighborY, parent: currentPos });
          return;
        }
        var cell = window.GAMESTATE.indexToCell({ x: neighborX, y: neighborY });
        if (
          cell &&
          (cell.querySelector(".monster") || cell.classList.contains("wall"))
        ) {
          visited.push({ x: neighborX, y: neighborY, parent: currentPos });
          return;
        }
        if (
          !visited.find((pos) => pos.x === neighborX && pos.y === neighborY)
        ) {
          visited.push({ x: neighborX, y: neighborY });
          var g = window.GAMESTATE.chebyshevDistance(
            { x: neighborX, y: neighborY },
            endPos,
          );
          if (g < bestG) {
            bestG = g;
            bestPos = { x: neighborX, y: neighborY, parent: currentPos };
          }
        }
      });
      queue.push(bestPos);
      depth--;
    }
  }

  makeMove() {
    const playerPos = window.GAMESTATE.playerActor.position;
    if (
      window.GAMESTATE.chebyshevDistance(playerPos, this.position) ===
      this.attackRange
    ) {
      return;
    }
    const startPos = this.position;
    const targetPos = this.getClosestPlayerTile(playerPos);
    if (targetPos === null) {
      console.log("no move");
      return;
    }
    console.log("target: ", targetPos);
    const path = this.calebStar(startPos, targetPos);
    console.log(path);
    const finalPos = { x: path.at(-1).x, y: path.at(-1).y };
    const startCell = window.GAMESTATE.indexToCell(startPos);
    const finalCell = window.GAMESTATE.indexToCell(finalPos);
    if (finalCell === null) {
      return;
    }
    window.GAMESTATE.animateTokenMove(this.token, startCell, finalCell);
    this.position = finalPos;
    console.log(this.idNumber, this.position);
  }

  makeAttack() {
    const player = window.GAMESTATE.playerActor;
    var range = this.attackRange;
    if (
      window.GAMESTATE.chebyshevDistance(this.position, player.position) <=
      range
    ) {
      window.GAMESTATE.animateTokenAttack(
        this.token,
        this.position,
        player.position,
      );
      var attackRoll = generateAttack();
      // console.log(attackRoll, this.toHit, player.armor);
      var damage = 0;
      var hit = false;
      if (attackRoll === 20) {
        var damage1 =
          this.attackDamage[
            Math.floor(Math.random() * this.attackDamage.length)
          ];
        var damage2 =
          this.attackDamage[
            Math.floor(Math.random() * this.attackDamage.length)
          ];
        hit = "crit";
        damage = damage1 + damage2;
      } else if (attackRoll + this.toHit >= player.armor) {
        damage =
          this.attackDamage[
            Math.floor(Math.random() * this.attackDamage.length)
          ];
        hit = true;
      }
      player.health -= damage;
      window.PLAYERHEALTH.textContent = player.health;
      if (player.health <= 0) {
        window.GAMESTATE.triggerLoss();
      }
      var attacker = `${this.type} ${this.idNumber}`;
      window.GAMESTATE.generateCombatLogEntry(
        attacker,
        player.type,
        damage,
        hit,
      );
    }
  }
}
