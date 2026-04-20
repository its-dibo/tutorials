let currentPlayer = "x";
let board = [null, null, null, null, null, null, null, null, null];
let squares = document.querySelectorAll(".square");
let winner;

document.querySelector("#player").textContent = currentPlayer;

for (let square of squares) {
  // print square numbers
  // square.textContent = square.dataset.idx;

  square.addEventListener("click", (ev) => {
    let el = ev.target,
      idx = el.dataset.idx;

    if (winner || el.textContent) {
      return;
    }

    board[idx] = currentPlayer;
    el.textContent = currentPlayer;

    el.disabled = true;

    winner = checkWinner();
    if (winner) {
      document.querySelector("#winner").textContent = currentPlayer;
      squares.forEach((el) => {
        el.disabled = true;
      });
    }

    togglePlayer();
    document.querySelector("#player").textContent = currentPlayer;

    console.log(board);
  });
}

function togglePlayer() {
  currentPlayer = currentPlayer === "x" ? "o" : "x";
}

function checkWinner() {
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

  for (let win of wins) {
    if (
      board[win[0]] !== null &&
      win.every((el) => board[el] === board[win[0]])
    ) {
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
    square.disabled = false;
  }

  document.querySelector("#player").textContent = currentPlayer;
  document.querySelector("#winner").textContent = null;

  board = board.map((_el) => null);
});
