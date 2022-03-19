const board = document.getElementById("board");
const digits = document.getElementById("digits");
const rules = document.getElementById("rules");

const checkBtn = document.getElementById("checkBtn");
const uncheckBtn = document.getElementById("uncheckBtn");
const resetBtn = document.getElementById("resetBtn");
const solveBtn = document.getElementById("solveBtn");
const visualizeBtn = document.getElementById("visualizeBtn");
const rulesBtn = document.getElementById("rulesBtn");
const playBtn = document.getElementById("playBtn");

let numberSelected = "";
let solverTimeout;
let visualize = false;
let isSolved = false;

let sudokuBoard = [
	"--74916-5",
	"2---6-3-9",
	"-----7-1-",
	"-586----4",
	"--3----9-",
	"--62--187",
	"9-4-7---2",
	"67-83----",
	"81--45---",
];

let solution = [
	"387491625",
	"241568379",
	"569327418",
	"758619234",
	"123784596",
	"496253187",
	"934176852",
	"675832941",
	"812945763",
];

//Filling the board
sudokuBoard.forEach((row, ind) => {
	for (let i in row) {
		const tile = document.createElement("div");
		tile.setAttribute("id", `${ind}${i}`);
		tile.classList.add("tile");
		tile.innerHTML = row[i] === "-" ? "" : row[i];
		if (row[i] !== "-") tile.classList.add("tile-filled");

		tile.addEventListener("click", () => {
			if (isSolved) return;
			if (row[i] !== "-") return;
			let value = numberSelected === "0" ? "" : numberSelected;
			tile.innerHTML = value;
		});

		board.appendChild(tile);
	}
});

//Filling the digits
for (let i = 0; i <= 9; i++) {
	const number = document.createElement("div");
	number.setAttribute("id", `number-${i}`);
	number.classList.add("number");
	number.innerHTML = i;

	number.addEventListener("click", () => {
		if (numberSelected) {
			let prevSelected = document.getElementById(`number-${numberSelected}`);
			prevSelected.classList.remove("tile-filled");
		}
		numberSelected = number.innerHTML;
		number.classList.add("tile-filled");

		console.log(numberSelected);
	});

	digits.appendChild(number);
}

//Check function
checkBtn.addEventListener("click", () => {
	console.log("Check btn pressed");
	const tiles = board.children;
	for (let i = 0; i < tiles.length; i++) {
		const tile = tiles[i];
		if (tile.classList.contains("tile-filled")) continue;

		if (tile.innerHTML === "") continue;
		const val = tile.innerHTML;
		let [r, c] = tile.id.split("");
		r = parseInt(r);
		c = parseInt(c);

		if (val === solution[r][c]) tile.classList.add("right");
		else tile.classList.add("wrong");
	}
});

//Uncheck function
uncheckBtn.addEventListener("click", () => uncheckTiles());

function uncheckTiles() {
	const tiles = board.children;
	for (let i = 0; i < tiles.length; i++) {
		tiles[i].classList.remove("right");
		tiles[i].classList.remove("wrong");
	}
}

//reset the board
resetBtn.addEventListener("click", () => resetBoard());

function resetBoard() {
	clearInterval(solverTimeout);
	const tiles = board.children;
	for (let i = 0; i < tiles.length; i++) {
		const tile = tiles[i];
		if (!tile.classList.contains("tile-filled")) tile.innerHTML = "";
		tile.classList.remove("right-border");
		tile.classList.remove("wrong-border");
	}
	uncheckTiles();
	isSolved = false;
}

solveBtn.addEventListener("click", () => {
	if (isSolved) return;
	visualize = false;
	uncheckTiles();
	resetBoard();
	sudokuSolver();
	isSolved = true;
});

visualizeBtn.addEventListener("click", () => {
	if (isSolved) return;
	visualize = true;
	uncheckTiles();
	resetBoard();
	sudokuSolver();
	isSolved = true;
});

//Sudoko Solver
async function sudokuSolver() {
	const tiles = board.children;
	const tilesBoard = [];
	let row = [];
	for (let i = 0; i < tiles.length; i++) {
		row.push(tiles[i]);
		if ((i + 1) % 9 == 0) {
			tilesBoard.push(row);
			row = [];
		}
	}

	let i = 0;
	let j = 0;
	let k = 0;
	while (i < 9) {
		while (j < 9) {
			console.log(`i : ${i} j : ${j} k : ${k}`);
			if (tilesBoard[i][j].classList.contains("tile-filled")) {
				console.log("In tiles filled with j " + j);
				j++;
				continue;
			}

			k = parseInt(
				tilesBoard[i][j].innerHTML === "" ? "0" : tilesBoard[i][j].innerHTML
			);

			if (k == 9) {
				tilesBoard[i][j].innerHTML = "";
				if (visualize) {
					tilesBoard[i][j].classList.add("wrong-border");
					tilesBoard[i][j].classList.remove("right-border");
				}
				if (j > 0) j--;
				else {
					j = 8;
					i--;
				}
				while (tilesBoard[i][j].classList.contains("tile-filled")) {
					if (j > 0) j--;
					else {
						j = 8;
						i--;
					}
				}
			}

			while (++k < 10) {
				if (visualize)
					await new Promise(
						(resolve) => (solverTimeout = setTimeout(resolve, 50))
					);
				tilesBoard[i][j].innerHTML = k;

				if (visualize) {
					tilesBoard[i][j].classList.add("right-border");
					tilesBoard[i][j].classList.remove("wrong-border");
				}
				if (checker(i, j)) {
					j++;
					break;
				}
			}
		}
		i++;
		j = 0;
	}

	function checker(i, j) {
		return rowChecker(i, j) && colChecker(i, j) && boxChecker(i, j);
	}

	function rowChecker(i, j) {
		for (let r = 0; r < 9; r++) {
			if (r == j) continue;
			if (tilesBoard[i][r].innerHTML == tilesBoard[i][j].innerHTML)
				return false;
		}
		return true;
	}

	function colChecker(i, j) {
		for (let c = 0; c < 9; c++) {
			if (c == i) continue;
			if (tilesBoard[c][j].innerHTML == tilesBoard[i][j].innerHTML)
				return false;
		}
		return true;
	}

	function boxChecker(i, j) {
		let rs = i - (i % 3);
		let cs = j - (j % 3);

		let re = rs + 3;
		let ce = cs + 3;
		console.log(`rs : ${rs} re : ${re} cs : ${cs} ce : ${ce}`);
		for (rs; rs < re; rs++) {
			for (cs; cs < ce; cs++) {
				if (rs == i && cs == j) continue;
				if (tilesBoard[rs][cs].innerHTML == tilesBoard[i][j].innerHTML)
					return false;
			}
		}

		return true;
	}
}

playBtn.addEventListener("click", () => (rules.style.display = "none"));
rulesBtn.addEventListener("click", () => (rules.style.display = "flex"));
