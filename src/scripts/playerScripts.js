export class Player {
  constructor(type, position) {
    this.type = type;
    this.health = 0;
    this.position = position;
    this.token = this.createToken();
    this.movementRange = 4;
    // make this a switch
    switch (this.type) {
      case 'ranger':
        this.attackRange = 6;
        this.health = 30;
        this.attackDamage = [4, 5, 6, 7, 8, 9, 10, 11];
        break;
      case 'wizard':
        this.attackRange = 3;
        this.health = 30;
        this.attackDamage = [7, 8, 9, 10, 11, 12, 13, 14];  
        break;
      case 'fighter':
        this.attackRange = 1;
        this.health = 50;
        this.attackDamage = [10, 11, 12, 13, 14, 15, 16, 17];
        break;
      default:
        console.error('Unknown player type:', this.type);
        break;
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