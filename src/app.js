import * as CS from './const.js';
import * as CA from './cache.js';
import {
  readFromStorage, writeToStorage, writeToSessionStorage, readToSessionStorage,
} from './storage.js';
import { createHome } from './createHome.js';
import { showHighScore } from './showHighScore.js';
import { showAnswer } from './showAnswer.js';

const app = {
  async init() {
    this.counter = null;
    this.timer;
    this.score = 0;
    this.activeQuestionId = null;
    this.topThreeHighScores = 3;
    this.answer = [];
    this.btnSelectedAnswer = [];

    // DOM funcionality
    this.registerListeners();
    createHome();
    this.showQuestion();
    this.selectOneAnswer();
    this.selectMultipleAnswer();
    this.startTimer();
    this.scoreCounter();
    this.saveScore();
    showHighScore();
    showAnswer();
  },

  registerListeners() {
    // submit event on form; when form submitted => quiz starts
    CA.$form.addEventListener('submit', (e) => {
      e.preventDefault();

      // puqh new history item when form is submitted
      history.pushState(null, null, null);

      CA.$btnHighscores.classList.add('hidden');
      CA.$quitQuiz.classList.remove('hidden');

      // create formData object and get values for filtering QUIZ-API
      const formData = new FormData(CA.$form);
      const categoryData = `&category=${formData.get('category')}`;
      const difficultyData = `&difficulty=${formData.get('difficulty')}`;
      const sliderData = `&limit=${formData.get('slider')}`;

      // Sent data from FORMDATA to fetch and start quiz
      this.fetch(categoryData, difficultyData, sliderData);
      this.startQuiz();
    });

    // click event on next button
    CA.$nextButton.addEventListener('click', (e) => {
      CA.$nextButton.classList.add('hidden');
      CA.$timeUp.classList.add('hidden');

      // get the next active question by doing a find method on the data from fetch
      const nextQuestion = this.data.find((question, index) => {
        /// if the previous question is equal to the current question return true
        if (this.data[index - 1] && this.activeQuestionId === this.data[index - 1].id) {
          return true;
        }
      });

      if (nextQuestion) {
        // set id new question
        this.activeQuestionId = nextQuestion.id;
        this.counter++;

        // make new question visible
        document.querySelector('.question:not(.hidden)').classList.add('hidden');
        document.querySelector(`.question[data-id='${this.activeQuestionId}']`).classList.remove('hidden');
        document.querySelector('.question__index').innerHTML = this.counter;

        // get the total questions user has selected
        const questionAmount = document.querySelector('.question__amount').innerHTML;
        // if the counter for the question is equel to the total question minus 1
        // change button innertext.
        if (this.counter > questionAmount - 1) {
          CA.$nextButton.innerHTML = 'Finish Quiz';
        }
      } else {
        // hide question screen and make end screen visible
        // write the score and the selected answers to storage.
        CA.$questionScreen.classList.add('hidden');
        document.querySelector('.countdown__timer').classList.add('hidden');
        CA.$quitQuiz.classList.add('hidden');
        CA.$endScreenContainer.classList.remove('hidden');
        CA.$finalScore.innerHTML = this.score;
        writeToStorage('Lastscore', this.score);
        this.highscore = readFromStorage('highscore');
        writeToSessionStorage('answerUser', this.answer);
        showAnswer();
      }

      // when the next button is clicked reset timer and start
      clearInterval(this.timer);
      this.startTimer(10);
    });

    window.addEventListener('popstate', (e) => {
      // toggle visibility when back or forward history gets pressed
      CA.$form.classList.toggle('hidden');
      CA.$questionScreen.classList.toggle('hidden');
      CA.$countDownTimer.classList.toggle('hidden');
      // reload page
      location.reload();
    });

    // click event when clicked trigger function saveScore
    CA.$btnSaveHighScore.addEventListener('click', e => this.saveScore(e));

    // home button reload the page
    CA.$btnGoHome.addEventListener('click', (e) => {
      e.preventDefault();
      location.reload();
    });

    // when text is typed in input field, save button can be clicked
    // when there is no text in input field, save button cannot be clicked
    CA.$username.addEventListener('keyup', (e) => {
      CA.$btnSaveHighScore.classList.remove('disable');
    });

    // toggle visiblity
    CA.$btnHighscores.addEventListener('click', (e) => {
      CA.$highscoresList.classList.toggle('hidden');
      CA.$form.classList.toggle('hidden');
    });

    // if user wants to quit quiz, page will reload
    // resulting in going back to the start screen
    CA.$quitQuiz.addEventListener('click', (e) => {
      location.reload();
    });
  },

  async fetch(categoryData, difficultyData, sliderData) {
    let fetchUrl;
    // if formData value is equal to all
    // there will be no category param in fetchurl
    // if formData value is not equal to all
    // the the category the user choose will be added in fetch url
    if (categoryData === '&category=All') {
      fetchUrl = `${CS.QUIZ_API + difficultyData + sliderData}`;
    } else if (categoryData !== '&category=All') {
      fetchUrl = `${CS.QUIZ_API + categoryData + difficultyData + sliderData}`;
    }

    // get data from api
    const response = await fetch(fetchUrl);
    const result = await response.json();
    this.data = result;

    // write the used question to session storage for the end screen
    writeToSessionStorage('Questions', this.data);
    this.showQuestion();
    // start timer
    this.startTimer(10);
  },

  startQuiz() {
    // start quiz and set counter question to 1 for the firstquestion
    this.counter = 1;
    CA.$form.classList.add('hidden');
    CA.$questionScreen.classList.remove('hidden');
    CA.$countDownTimer.classList.remove('hidden');
  },

  showQuestion() {
    // iterate through every question
    for (const [index, question] of this.data.entries()) {
      // set first question id as active id
      if (index === 0) {
        this.activeQuestionId = question.id;
      }

      // Create HTML for question screen
      const multipleCorrectAnswers = question.multiple_correct_answers;
      const containerQuestions = document.createElement('div');
      containerQuestions.className = `question ${index === 0 ? '' : 'hidden'}`;
      containerQuestions.dataset.id = question.id;
      containerQuestions.dataset.multipleAnswers = multipleCorrectAnswers;
      CA.$questionScreen.append(containerQuestions);
      // if there are multiple answers correct for one question
      // then show a message to the user
      if (containerQuestions.dataset.multipleAnswers === 'true') {
        const multipleAnswerWarning = document.createElement('p');
        multipleAnswerWarning.innerHTML = 'More than one answer possible';
        const multipleAnswerQuestion = document.querySelectorAll('[data-multiple-answers="true"]');
        multipleAnswerQuestion.forEach((q) => {
          q.appendChild(multipleAnswerWarning);
        });
      }

      const $currentQuestion = document.createElement('h2');
      $currentQuestion.innerHTML = question.question;
      containerQuestions.append($currentQuestion);
      const $answersList = document.createElement('ul');
      $answersList.className = 'answers__list';
      containerQuestions.append($answersList);

      // make a object and array so iteration is possible
      const answersArray = Object.values(question.answers);
      const correctAnswerArray = Object.values(question.correct_answers);
      const mcCorrectKeyArray = Object.keys(question.correct_answers);

      for (let i = 0; i < answersArray.length; i++) {
        // loop throug answer choices and create html to display choices
        const item = document.createElement('li');
        item.dataset.id = correctAnswerArray[i];
        item.dataset.mcKey = mcCorrectKeyArray[i] + correctAnswerArray[i];
        item.className = 'answers';
        item.innerHTML = `${answersArray[i] === null ? item.classList.add('hidden') : answersArray[i].replace('<', '&lt;').replace('>', '&gt;')}`;
        $answersList.appendChild(item);
        // set event listener for questions with multiple correct answers
        // set event listener for questions with only one correct answer
        if (containerQuestions.dataset.multipleAnswers === 'true') {
          item.addEventListener('click', (event) => {
            // push selected answer data
            this.btnSelectedAnswer.push(event.target.dataset.mcKey);
            this.selectMultipleAnswer(event);
          });
        } else {
          item.addEventListener('click', (e) => {
            // when one answer is selected clear timer
            clearInterval(this.timer);
            this.selectOneAnswer(e);
          });
        }
      }
    }

    // Create HTML for displaying amount total questions
    const $questionsAmount = document.createElement('p');
    $questionsAmount.className = 'question__amount__text';
    CA.$questionScreen.append($questionsAmount);
    const questionAmount = this.data.length;
    $questionsAmount.innerHTML = `<span class="question__index">${this.counter}</span> / <span class="question__amount">${questionAmount}</span>`;
  },

  selectOneAnswer(e) {
    // get id selected answer and add class to selected answer
    const btnSelectedAnswer = e.target.dataset.id;
    e.target.classList.add('selected');

    // if data selected answer equals to true it means the user got the question right
    // add points to score counter and push object to array
    // which contains the answers and if it is correct or not
    if (btnSelectedAnswer === 'true') {
      this.scoreCounter(CS.addScoreCorrectAnswer);
      const answer = {
        validation: 'correct',
        answer: e.target.innerHTML,
      };
      this.answer.push(answer);
    } else {
      // if selected is not equal to true, the selected answer is wrong
      // push object to array
      // which contains the answers and if it is correct or not
      const answer = {
        validation: 'wrong',
        answer: e.target.innerHTML,
      };
      this.answer.push(answer);
    }

    // Toggle visibility
    document.querySelector('#questions__btn').classList.remove('hidden');
    document.querySelector('.question:not(.hidden)').classList.add('disable');
  },

  /*
  ------------------------------------------------------------------------------------

  Niet klaar geraakt met het valideren en doorsturen van de geselecteerde antwoorden
  Bij vragen die meerdere antwoorden kunnen hebben.

  ------------------------------------------------------------------------------------
  */

  selectMultipleAnswer(event) {
    // get questions from storage
    // check the current question
    const mcAnswers = readToSessionStorage('Questions');
    const userAnswer = mcAnswers[this.counter - 1];

    // toggle selected class when answer is clicked
    event.target.classList.toggle('selected');
    // show next button when an answer is clicked
    document.querySelector('#questions__btn').classList.remove('hidden');
  },

  startTimer(time) {
    const $countDownTimer = document.querySelector('.countdown__timer');
    const $nextButton = document.querySelector('#questions__btn');

    // Set countdown timer
    this.timer = setInterval(timer, 1000);

    function timer() {
      $countDownTimer.innerHTML = `<span>Time left ${time}s</span>`;
      time--;
      if (time < 0) {
        // if time is up then reset timer for next question and ..
        // show user : time is up
        // disable click event on choices so the user can no longer clicked after time has reached 0
        clearInterval(this.timer);
        $countDownTimer.innerHTML = 'Time is up!';
        $nextButton.classList.remove('hidden');
        document.querySelector('.question:not(.hidden)').classList.add('disable');
        CA.$timeUp.classList.remove('hidden');
      }
    }
  },

  scoreCounter(number) {
    // if answer is correct score updates
    this.score += number;
  },

  saveScore(e) {
    e.preventDefault();
    // set score and given username to object
    const score = {
      score: this.score,
      name: CA.$username.value,
    };
    // push object to array
    this.highscore.push(score);
    // sort scores from high to low
    this.highscore.sort((a, b) => b.score - a.score);
    // scores lower than top 3 are deleted
    this.highscore.splice(3);
    // if the score is higher than a previous one
    // write to local storage and reload page so the user can play again
    writeToStorage('highscore', this.highscore);
    location.reload();
  },

};
app.init();
