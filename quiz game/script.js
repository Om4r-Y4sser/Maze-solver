const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const startButton = document.getElementById("start-btn");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const currentQuestionSpan = document.getElementById("current-question");
const totalQuestionsSpan = document.getElementById("total-questions");
const scoreSpan = document.getElementById("score");
const finalScoreSpan = document.getElementById("final-score");
const maxScoreSpan = document.getElementById("max-score");
const resultMessage = document.getElementById("result-message");
const restartButton = document.getElementById("restart-btn");
const progressBar = document.getElementById("progress");

const quizQuestions = [
  {
    question: "Who is known as the father of the computer?",
    answers: [
      { text: "Alan Turing", correct: false },
      { text: "Charles Babbage", correct: true },
      { text: "Bill Gates", correct: false },
      { text: "Steve Jobs", correct: false },
    ],
  },
  {
    question: "What does HTML stand for?",
    answers: [
      { text: "Hyper Trainer Marking Language", correct: false },
      { text: "Hyper Text Markup Language", correct: true },
      { text: "High Tech Modern Language", correct: false },
      { text: "Home Tool Management Language", correct: false },
    ],
  },
  {
    question: "Which company developed the programming language Java?",
    answers: [
      { text: "Oracle", correct: false },
      { text: "Sun Microsystems", correct: true },
      { text: "Microsoft", correct: false },
      { text: "IBM", correct: false },
    ],
  },
  {
    question: "In binary, what number does 1011 represent?",
    answers: [
      { text: "9", correct: false },
      { text: "10", correct: false },
      { text: "11", correct: true },
      { text: "12", correct: false },
    ],
  },
  {
    question: "What is the main function of RAM in a computer?",
    answers: [
      { text: "Permanent storage", correct: false },
      { text: "Process graphics", correct: false },
      { text: "Store temporary data", correct: true },
      { text: "Connect to the internet", correct: false },
    ],
  },
  {
    question: "Which of these is NOT an operating system?",
    answers: [
      { text: "Linux", correct: false },
      { text: "Windows", correct: false },
      { text: "Photoshop", correct: true },
      { text: "macOS", correct: false },
    ],
  },
  {
    question: "What does 'GPU' stand for?",
    answers: [
      { text: "General Processing Unit", correct: false },
      { text: "Graphical Processing Unit", correct: true },
      { text: "Global Programming Utility", correct: false },
      { text: "Game Power Unit", correct: false },
    ],
  },
  {
    question: "Which protocol is used to send emails?",
    answers: [
      { text: "FTP", correct: false },
      { text: "SMTP", correct: true },
      { text: "HTTP", correct: false },
      { text: "IP", correct: false },
    ],
  },
  {
    question: "What year was the first iPhone released?",
    answers: [
      { text: "2005", correct: false },
      { text: "2007", correct: true },
      { text: "2008", correct: false },
      { text: "2010", correct: false },
    ],
  },
  {
    question: "Which of these is a backend programming language?",
    answers: [
      { text: "CSS", correct: false },
      { text: "Python", correct: true },
      { text: "HTML", correct: false },
      { text: "React", correct: false },
    ],
  },
];

// quiz state
let currentQuestionIndex = 0;
let score = 0;
let answersDisabled = false;

totalQuestionsSpan.textContent = quizQuestions.length;
maxScoreSpan.textContent = quizQuestions.length;

startButton.addEventListener("click", startQuiz);
restartButton.addEventListener("click", restartQuiz);

function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  scoreSpan.textContent = 0;

  startScreen.classList.remove("active");
  quizScreen.classList.add("active");

  showQuestion();
}

function showQuestion() {
  answersDisabled = false;

  const currentQuestion = quizQuestions[currentQuestionIndex];
  currentQuestionSpan.textContent = currentQuestionIndex + 1;

  const progressPercent = (currentQuestionIndex / quizQuestions.length) * 100;
  progressBar.style.width = progressPercent + "%";

  questionText.textContent = currentQuestion.question;
  answersContainer.innerHTML = "";

  currentQuestion.answers.forEach((answer) => {
    const button = document.createElement("button");
    button.textContent = answer.text;
    button.classList.add("answer-btn");
    button.dataset.correct = answer.correct;
    button.addEventListener("click", selectAnswer);
    answersContainer.appendChild(button);
  });
}

function selectAnswer(event) {
  if (answersDisabled) return;

  answersDisabled = true;
  const selectedButton = event.target;
  const isCorrect = selectedButton.dataset.correct === "true";

  Array.from(answersContainer.children).forEach((button) => {
    if (button.dataset.correct === "true") {
      button.classList.add("correct");
    } else {
      button.classList.add("incorrect");
    }
  });

  if (isCorrect) {
    score++;
    scoreSpan.textContent = score;
  }

  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
      showQuestion();
    } else {
      showResults();
    }
  }, 1000);
}

function showResults() {
  quizScreen.classList.remove("active");
  resultScreen.classList.add("active");
  finalScoreSpan.textContent = score;

  const percentage = (score / quizQuestions.length) * 100;
  if (percentage === 100) {
    resultMessage.textContent = "Perfect! You're a tech genius!";
  } else if (percentage >= 80) {
    resultMessage.textContent = "Awesome job! You know your tech!";
  } else if (percentage >= 60) {
    resultMessage.textContent = "Pretty good! Keep learning!";
  } else if (percentage >= 40) {
    resultMessage.textContent = "Not bad! Brush up on your tech skills!";
  } else {
    resultMessage.textContent = "Keep studying! Tech is the future!";
  }
}

function restartQuiz() {
  resultScreen.classList.remove("active");
  startQuiz();
}
