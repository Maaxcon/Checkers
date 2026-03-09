import { ROW, COL } from '../constants.js';

//  основна розмітку: секцію, заголовок і саму дошку
export function createLayout(root) {
    const section_board = document.createElement("section");
    const title_board = document.createElement("h2");
    const board = document.createElement("div");

    section_board.classList.add("game-section");
    title_board.classList.add("game-section__title");
    board.classList.add("board");

    title_board.textContent = "Checkers";

    root.append(section_board);
    section_board.append(title_board);
    section_board.append(board);

    return { section_board, board };
}

 // генерує масив з початковим розташуванням шашок (0 - пусто 1 - білі, 2 - чорні )
export function generateBoardData() {
    const boardData2 = [];
    for (let i = 0; i < ROW; i++) {
        for (let j = 0; j < COL; j++) {
            if ((i + j) % 2 !== 0) {
                if (i < 3) boardData2.push(1);
                else if (i > 4) boardData2.push(2);
                else boardData2.push(0);
            } else {
                boardData2.push(0);
            }
        }
    }
    return boardData2;
}

// 64 клітинки дошки (чорні та білі квадрати)
export function renderSquares(board) {
    for (let i = 0; i < ROW; i++) {
        for (let j = 0; j < COL; j++) {
            const square = document.createElement("div");
            square.classList.add("board__cell");
            square.classList.add((i + j) % 2 === 0 ? 'board__cell--white' : "board__cell--black");
            board.append(square);
        }
    }
}

    // розставляємо шашки по клітинках на основі згенерованого масиву
export function renderCheckers(boardData2) {
    const all_square = document.querySelectorAll(".board__cell");
    all_square.forEach((el, index) => {
        let className = "";
        const checker = document.createElement("button");
        checker.classList.add("checker");

        if (boardData2[index] === 1) className = "checker--light";
        if (boardData2[index] === 2) className = "checker--dark";

        if (className) {
            checker.classList.add(className);
            el.append(checker);
        }
    });
}

  // додаємо кліки по шашках, щоб вони виділялись при натисканні
export function setupListeners() {
    let checkers = document.querySelectorAll(".checker");
    checkers.forEach(el => {
        el.addEventListener("click", () => {
            checkers.forEach(all => {
                all.classList.remove("is-selected");
            });
            el.classList.add("is-selected");
        });
    });
}