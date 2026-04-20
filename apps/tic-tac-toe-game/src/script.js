let currentPlayer = "x";
let squares = document.querySelectorAll(".square");
let winner;

document.querySelector("#player").textContent = currentPlayer;

for (let [_idx, square] of squares.entries()) {
  // print square numbers
  // square.textContent = idx;

  square.addEventListener("click", (ev) => {
    let el = ev.target;

    if (winner || el.textContent) {
      return;
    }

    el.textContent = currentPlayer;

    winner = checkWinner();
    if (winner) {
      document.querySelector("#winner").textContent = currentPlayer;
    }

    togglePlayer();
    document.querySelector("#player").textContent = currentPlayer;
  });
}

function togglePlayer() {
  currentPlayer = currentPlayer === "x" ? "o" : "x";
}

function checkWinner() {
  // all probabelities
  let wins = [
    // rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    // cols
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    // diagonals
    [0, 4, 8],
    [2, 4, 6],
  ];

  let board = [...squares].map((el) => el.textContent);

  for (let win of wins) {
    if (board[win[0]] && win.every((el) => board[el] === board[win[0]])) {
      return currentPlayer;
    }
  }

  if ([...squares].every((el) => el.textContent)) {
    alert("Draw");
  }
}

document.querySelector("#reset").addEventListener("click", (_ev) => {
  winner = null;
  currentPlayer = "x";

  for (let square of squares) {
    square.textContent = null;
  }

  document.querySelector("#player").textContent = currentPlayer;
  document.querySelector("#winner").textContent = null;
});
