export class Player {
  constructor(type, position) {
    this.type = type;
    this.health = 0;
    this.position = position;
    this.token = this.createToken();
    this.movementRange = 4;
    let portrait = document.getElementById('character-portrait');
    let portraitLabel = document.getElementById('portrait-label');
    let playerDamage = document.getElementById('player-damage');
    let playerRange = document.getElementById('player-range');
    let playerAttack = document.getElementById('player-attack');
    let playerArmor = document.getElementById('player-armor');
    // make this a switch
    switch (this.type) {
      case 'ranger':
        this.attackRange = 9;
        this.toHit = 7;
        this.armor = 15;
        this.health = 30;
        this.attackDamage = [5, 6, 7, 8, 9, 10, 11, 12];
        window.PLAYERHEALTH.textContent = 30;
        portrait.src = "../assets/characters/Ranger.png";
        portrait.alt = "Ranger Protrait";
        portraitLabel.textContent = "Class: Ranger";
        playerDamage.textContent = "1d8+4";
        playerRange.textContent = "45ft";
        playerAttack.textContent = "Longbow";
        playerArmor.textContent = this.armor;
        break;
      case 'wizard':
        this.attackRange = 6;
        this.toHit = 6;
        this.armor = 13;
        this.health = 30;
        this.attackDamage = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
        window.PLAYERHEALTH.textContent = 30;
        portrait.src = "../assets/characters/Wizard.png";
        portrait.alt = "Wizard Protrait";
        portraitLabel.textContent = "Class: Wizard";
        playerDamage.textContent = "2d10";
        playerRange.textContent = "30ft";
        playerAttack.textContent = "Firebolt";
        playerArmor.textContent = this.armor;
        break;
      case 'fighter':
        this.attackRange = 1;
        this.toHit = 8;
        this.armor = 18;
        this.health = 50;
        this.attackDamage = [7,8,9,10,11,12,13,14,15,16,17];
        window.PLAYERHEALTH.textContent = 50;
        portrait.src = "../assets/characters/Fighter.png";
        portrait.alt = "Fighter Protrait";
        portraitLabel.textContent = "Class: Fighter";
        playerDamage.textContent = "2d6+5";
        playerRange.textContent = "5ft";
        playerAttack.textContent = "Greatsword";
        playerArmor.textContent = this.armor;
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