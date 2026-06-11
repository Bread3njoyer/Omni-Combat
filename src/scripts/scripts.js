const whoBtn = document.getElementById('whoBtn');
const startContainer = document.getElementById('start');
const whoNextBtn = document.getElementById('whoNextBtn');
const whoContainer = document.getElementById('who');
const whereNextBtn = document.getElementById('whereNextBtn');
const whereContainer = document.getElementById('where');
const howNextBtn = document.getElementById('howNextBtn');
const howContainer = document.getElementById('how');
const endContainer = document.getElementById('end');
const rewriteBtn = document.getElementById('rewriteBtn');
const playerNameInput = document.getElementById('player-name');
const characterSelectForm = document.forms['character-select'];
const mapSelectForm = document.forms['map-select'];
const difficultySelectForm = document.forms['difficulty-select'];
let selectedCharacter = "";
let selectedMap = "";
let selectedDifficulty = "";
let playerName = "";

function writeStory() {
  const storyBlock = document.getElementById('story-text');
  let story = "";
  switch (selectedCharacter) {
    case "wizard":
      story += `You're a young student of the arcane, named ${playerName}, 
                who set out on an adventure. Something along the way went wrong
                and now you're waking up in a`;
      break;
    case "ranger":
      story += `You're a sly, observant hunter, named ${playerName}. 
                You've spent most your life on adventures like this one. 
                But now you're waking up in an unfamiliar `;
      break;
    case "fighter":
      story += `You're a grizzled warrior, named ${playerName}. 
                You've fought more battles than you can count, 
                but never once have you awoken in a `;
      break;
  }
  switch (selectedMap) {
    case "forest":
      story += `forest. It has a damp, musty smell and the grass is wet with morning dew. 
                Although it seems peaceful, something sets your mind on edge. `;
      break;
    case "cave":
      story += `dark cave. You have no idea how you got here, but as you wake up, 
                you hear a chattering in the distance that sets your mind racing. `;
      break;
    case "coliseum":
      story += `coliseum. The roaring of a crowd pulls you from your slumber and you wonder how you got here.
                As you look around, you see the gate opposite you open and the crowd's shouts grow louder. `;
      break;
  }
  switch (selectedDifficulty) {
    case "loot_farm":
      story += `However, you aren't fazed. Your whole life has brought you to this moment, 
                and you aren't going to fail now. Bring on the challenge.`;
      break;
    case "dungeon":
      story += `You've felt this way before: butterflies in the stomach and an accelerating heart rate. 
                You're not scared, but you have a healthy respect for the creatures of this world.
                You prepare for a hard fought battle.`;
      break;
    case "tpk":
      story += `You are worried. This wasn't what you were expecing and you aren't prepared. 
                You steady yourself but you know that it will take a miracle to get out of this alive.`;
      break;
  }
  storyBlock.textContent = story;
}

whoBtn.addEventListener('click', () => {
  whoContainer.classList.remove('hidden');
  whoContainer.classList.add('fade-in')
});

whoNextBtn.addEventListener('click', () => {
  selectedCharacter = characterSelectForm.elements['character'].value;
  playerName = playerNameInput.value;
  if (!selectedCharacter || !playerName) {
    alert("Please make a selection for character before moving on");
    return;
  }
  startContainer.classList.add('fade-out');
  whoContainer.classList.add('fade-out');
  setTimeout(() => {
    startContainer.classList.add('hidden');
    whoContainer.classList.add('hidden');
    whereContainer.classList.remove('hidden');
    whereContainer.classList.add('fade-in');
  }, 1000);
  
});

whereNextBtn.addEventListener('click', () => {
  selectedMap = mapSelectForm.elements['map'].value;
  if (!selectedMap) {
    alert("Please make a selection for location before moving on");
    return;
  }
  whereContainer.classList.add('fade-out');
  setTimeout(() => {
    whereContainer.classList.add('hidden');
    howContainer.classList.remove('hidden');
    howContainer.classList.add('fade-in');
  }, 1000);
});

howNextBtn.addEventListener('click', () => {
  selectedDifficulty = difficultySelectForm.elements['difficulty'].value;
  if (!selectedDifficulty) {
    alert("Please make a selection for challenge before moving on");
    return;
  }
  howContainer.classList.add('fade-out');
  writeStory();
  setTimeout(() => {
    howContainer.classList.add('hidden');
    endContainer.classList.remove('hidden');
    endContainer.classList.add('fade-in');
  }, 1000);

});

rewriteBtn.addEventListener('click', () => {
  console.log("button pressed");
  characterSelectForm.reset();
  mapSelectForm.reset();
  difficultySelectForm.reset();
  playerNameInput.value='';
  window.location.reload()
});

document.getElementById('startBtn').addEventListener('click', () => {
  let urlPrefix = window.location.origin + window.location.pathname.replace('index.html', '');
  let urlFull = `${urlPrefix}src/pages/${selectedMap}.html?name=${playerName}&character=${selectedCharacter}&difficulty=${selectedDifficulty}`;
  window.location.href = urlFull;
});