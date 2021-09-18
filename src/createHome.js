import * as CS from './const.js';
import * as CA from './cache.js';
import {
  showHighScore
} from './showHighScore.js';

export const createHome = () => {
  // Create categories
  for (const category of CS.categories) {
    const $categoryOption = document.createElement('option');
    $categoryOption.dataset.id = `${category}`;
    $categoryOption.className = `category`;
    CA.$formSelectCategory.append($categoryOption);
    const createTextNode = document.createTextNode(category);
    $categoryOption.appendChild(createTextNode);
  }

  // Create difficulties
  for (const difficulty of CS.difficulties) {
    const $difficultyOption = document.createElement('option');
    $difficultyOption.dataset.id = `${difficulty}`;
    $difficultyOption.className = `difficulty`;
    CA.$formSelectDifficulty.append($difficultyOption);
    const createTextNode = document.createTextNode(difficulty);
    $difficultyOption.appendChild(createTextNode);
  }

  // Create Slider
  const Outputvalue = document.createElement('span');
  Outputvalue.innerHTML = CA.$formInputSlider.value;
  CA.$formInputSlider.oninput = function () {
    Outputvalue.innerHTML = this.value;
  };
  CA.$formSliderAmount.append(Outputvalue);

  const $filterButton = document.createElement('button');
  $filterButton.id = 'filter__button';
  $filterButton.innerHTML = 'Start Quiz';
  CA.$form.append($filterButton);

  // call function for creating highscore
  showHighScore();
};
