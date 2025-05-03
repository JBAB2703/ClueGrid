// Toggle this to true when testing; false for daily lock
const DEV_MODE = true;

// Utilities
function getTodayKey() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

function getTodayIndex() {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = today - start;
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));
  return day % wordCluePairs.length;
}

// Get today's word and clue
const todayIndex = getTodayIndex();
const { word: todaysWordRaw, clue: todaysClue } = wordCluePairs[todayIndex];
const todaysWord = todaysWordRaw.toUpperCase();

// DOM elements
const clueEl = document.getElementById("clue");
const boardEl = document.getElementById("board");
const formEl = document.getElementById("guess-form");
const inputEl = document.getElementById("guess-input");
const messageEl = document.getElementById("message");
const winCountEl = document.getElementById("win-count");
const lossCountEl = document.getElementById("loss-count");

// Display the clue
clueEl.textContent = todaysClue;

// Local storage
if (DEV_MODE) {
  localStorage.removeItem("cluegridStats");
}

const stats = JSON.parse(localStorage.getItem("cluegridStats")) || {
  wins: 0,
  losses: 0,
  lastPlayed: null
};

function updateStatsDisplay() {
  winCountEl.textContent = stats.wins;
  lossCountEl.textContent = stats.losses;
}

// Check if user already played today
const todayKey = getTodayKey();

if (!DEV_MODE && stats.lastPlayed === todayKey) {
  updateStatsDisplay();
  lockGame("You've already played today! Come back tomorrow.");
} else {
  startGame();
}

function lockGame(msg) {
  formEl.style.display = "none";
  messageEl.textContent = msg;
}

function startGame() {
  let guesses = [];

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const guess = inputEl.value.toUpperCase().trim();
    inputEl.value = "";

    if (guess.length !== 5) {
      showMessage("Guess must be 5 letters.");
      return;
    }

    if (guesses.includes(guess)) {
      showMessage("Already guessed that.");
      return;
    }

    guesses.push(guess);
    renderGuess(guess);

    if (guess === todaysWord) {
      stats.wins++;
      stats.lastPlayed = todayKey;
      localStorage.setItem("cluegridStats", JSON.stringify(stats));
      updateStatsDisplay();
      showMessage("✅ You got it!");
      lockGame("Come back tomorrow for a new word.");
    } else if (guesses.length >= 5) {
      stats.losses++;
      stats.lastPlayed = todayKey;
      localStorage.setItem("cluegridStats", JSON.stringify(stats));
      updateStatsDisplay();
      showMessage(`❌ Out of guesses. The word was ${todaysWord}. Try again tomorrow.`);
      lockGame("Try again tomorrow.");
    } else {
      showMessage(`Incorrect. ${5 - guesses.length} guesses left.`);
    }
  });
}

function renderGuess(guess) {
  const div = document.createElement("div");
  div.className = "guess-row";

  for (let i = 0; i < guess.length; i++) {
    const span = document.createElement("span");
    span.className = "letter-box";

    const letter = guess[i];
    span.textContent = letter;

    if (letter === todaysWord[i]) {
      span.classList.add("correct");
    } else if (todaysWord.includes(letter)) {
      span.classList.add("close");
    } else {
      span.classList.add("wrong");
    }

    div.appendChild(span);
  }

  boardEl.appendChild(div);
}

function showMessage(msg) {
  messageEl.textContent = msg;
}

const toggle = document.getElementById("darkModeToggle");
const body = document.body;

// Restore previous mode
if (localStorage.getItem("cluegridDark") === "true") {
  body.classList.add("dark");
  toggle.checked = true;
}

toggle.addEventListener("change", () => {
  if (toggle.checked) {
    body.classList.add("dark");
    localStorage.setItem("cluegridDark", "true");
  } else {
    body.classList.remove("dark");
    localStorage.setItem("cluegridDark", "false");
  }
});
