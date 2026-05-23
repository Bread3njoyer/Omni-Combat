// Not sure how to make this class work yet. I know I want to use it to both generate the grid and track both the player and the monsters.
// I've currently got the grid being declared right away, then once the DOM content is loaded, I set the rows and cols, then generate the grid.
// In the future, I'll have to figure out how to make the event listener get information from the previous page so it can be used for several maps and for each class.
class Grid {
  constructor() {
    this.rows = 0;
    this.cols = 0;
    this.gridContainer = null;
  }

  generateGrid() {
    this.gridContainer = document.querySelector('.grid-container');
    if (!this.gridContainer) {
      console.error('Grid container not found!');
      return;
    }
    for (let i = 0; i < this.rows * this.cols; i++) {
      const cell = document.createElement('div');
      cell.classList.add('grid-item');
      cell.id = `cell-${i}`; // Assigning an ID to each cell for easy reference.
      this.gridContainer.appendChild(cell);
    }
  }

  addToken(token, position) {
    const cellIndex = position.y * this.cols + position.x; // Calculate the index based on row and column.
    const cell = document.getElementById(`cell-${cellIndex}`);
    if (cell) {
      cell.appendChild(token);
    } else {
      console.error('Invalid position for token:', position);
    }
  }
}


//Not sure what to put in the player class yet, I need to track player type, health, and position at any given time, but I don't know what else I want in this class.
class Player {
  constructor(type, health, position) {
    this.type = type;
    this.health = health;
    this.position = position;
    this.token = this.createToken();
    this.movementRange = 30;
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
    constructor(type, health, position, idNumber) {
        this.type = type;
        this.health = health;
        this.position = position;
        this.token = this.createToken(idNumber);
    }

    createToken(idNumber) {
        const monster = document.createElement('div');
        monster.id = `monster-${idNumber}`;
        monster.classList.add('monster');
        const monsterToken = document.createElement('img');
        monsterToken.src = '../assets/MonsterToken.png';
        monsterToken.alt = 'Monster Token';
        monsterToken.id = `monsterToken-${idNumber}`;
        monster.appendChild(monsterToken);
        return monster;
    }
}

//Apparently common convention is to use all caps for the global variable.
let GRID = new Grid();

// I'm not sure when I should leave this, probably after both the player and the monsters have been loaded and placed within the grid.
// Need to add the functionality of reading the query params from the previous page to determine the size of grid, the player type, and the difficulty.
document.addEventListener('DOMContentLoaded', () => {
  // Reading query params
  const urlParams = new URLSearchParams(window.location.search);
  const character = urlParams.get('character');
  const difficulty = urlParams.get('difficulty');

  // Making the grid. This will change as I add the grid to each map.
  let rows = 8; // Number of rows in the grid
  let cols = 12 // Number of columns in the grid
  GRID.rows = rows;
  GRID.cols = cols;
  GRID.generateGrid();
  let playerPosition = {
    y : 4,
    x : 0
  }
  let player = new Player(character, 100, playerPosition);
  GRID.addToken(player.token, playerPosition);
});