import {
  readToSessionStorage
} from './storage.js';
import * as CA from './cache.js';

export const showAnswer = () => {
  // Get quistions and selected answers from sessions storage
  const questionsStorage = readToSessionStorage('Questions');
  const answersFromUser = readToSessionStorage('answerUser');
  questionsStorage.forEach((arrayItem, index) => {
    // get keys and values from answers object
    const arrValuesAnswer = Object.values(arrayItem.answers);
    const arrKeysAnswer = Object.keys(arrayItem.answers);

    let correctAnswer;
    arrKeysAnswer.forEach((keys, index) => {
      // loop through keys with and index
      if (keys === arrayItem.correct_answer) {
        // if the key is equal to the correct answer
        // then get the value with the same index as the index from key.
        correctAnswer = arrValuesAnswer[index];
      }
    });

    // Create HTML for displaying answers
    const answer = answersFromUser.map((a) => {
      if (a.validation === 'correct') {
        return `
          <p class="green">Correct!</p>
          <p>Your Answer: ${a.answer}</p>
        `;
      }
      if (a.validation === 'wrong') {
        return `
          <p class="red">Wrong!</p>
          <p>Your Answer: ${a.answer}</p>
          <p>Correct answer: ${correctAnswer}</p>
        `;
      }
    });

    // Create HTML for the questions
    CA.$overview.innerHTML += `
      <li>
        <div class="questionStorage">${arrayItem.question}</div>
        <div class="answerStorage">${answer[index]}</div>
      </li>`;
  });
};
