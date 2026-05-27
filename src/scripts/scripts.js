// Does this need to live in an event listener that happens as the user hits the start button?
document.getElementById('start-button').addEventListener('click', () => {
  const characterSelectForm = document.forms['character-select'];
  const mapSelectForm = document.forms['map-select'];
  const difficultySelectForm = document.forms['difficulty-select'];

  // I think this gets the "value" tag from the input that the user selects, which is set to the matching choice.
  const selectedCharacter = characterSelectForm.elements['character'].value;
  const selectedMap = mapSelectForm.elements['map'].value;
  const selectedDifficulty = difficultySelectForm.elements['difficulty'].value;

  // Thought it would be smart to make sure they don't nuke my code by not selecting something.
  // Not sure what would happen if they didn't but I want to be safe.
  if (!selectedCharacter || !selectedMap || !selectedDifficulty) {
    alert('Please make a selection for character, map, and difficulty before starting the game.');
    return;
  }
  let urlPrefix = window.location.origin + window.location.pathname.replace('index.html', '');
  // I'm using query params, not sure if this is better or worse than local storage but this should work.
  let urlFull = `${urlPrefix}src/pages/${selectedMap}.html?character=${selectedCharacter}&difficulty=${selectedDifficulty}`;
  window.location.href = urlFull;
});