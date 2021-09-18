import * as CA from './cache.js';
import {
  readFromStorage
} from './storage.js';

export const showHighScore = () => {
  // Read highscore from local storage and create html for list with highscores 
  const highscore = readFromStorage('highscore');
  CA.$highscoresList.innerHTML = highscore.map(arrayItem => `<li class="highscore__list__item">${arrayItem.name} - ${arrayItem.score}</li>`).join('');
};
