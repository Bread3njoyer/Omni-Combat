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
        this.gridContainer = document.getElementById('grid-container');
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
        // The next two lines will need to be changed to be dynamic based on player type in the future.
        playerToken.src = '../assets/FighterToken.png';
        playerToken.alt = 'Figher Token';
        playerToken.id = 'playerToken';
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
document.addEventListener('DOMContentLoaded', () => {
    let rows = 8; // Number of rows in the grid
    let cols = 12 // Number of columns in the grid
    GRID.rows = rows;
    GRID.cols = cols;
    GRID.generateGrid();
    let playerPosition = {
        y : 4,
        x : 0
    }
    let player = new Player('Fighter', 100, playerPosition);
    GRID.addToken(player.token, playerPosition);
});