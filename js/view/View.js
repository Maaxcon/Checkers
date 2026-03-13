import { BOARD, PLAYERS, CSS } from '../constants.js';
import { AnimationHelper } from './AnimationHelper.js';

export class CheckersView {
    #root; #boardElement; #onSquareClick; #onRestartClick; #winMessage; #winText;

    constructor(root) {
        this.#root = root;
        this.#createLayout();
    }

    #createLayout() {
        this.#root.innerHTML = '';
        const main = document.createElement("main");
        main.className = "game-section";
        
        this.#boardElement = document.createElement("div");
        this.#boardElement.className = CSS.BOARD;

        this.#winMessage = document.createElement("div");
        this.#winMessage.className = "win-message";
        this.#winMessage.style.display = "none";
        this.#winText = document.createElement("h3");
        
        const btn = document.createElement("button");
        btn.textContent = "Play Again";
        btn.className = "btn-restart";
        btn.onclick = () => this.#onRestartClick?.();

        this.#winMessage.append(this.#winText, btn);
        main.append(this.#boardElement, this.#winMessage);
        this.#root.append(main);

        this.#boardElement.onclick = (e) => {
            const cell = e.target.closest(`.${CSS.CELL}`);
            if (cell) this.#onSquareClick?.(parseInt(cell.dataset.row), parseInt(cell.dataset.col));
        };
    }

    bindSquareClick(h) { this.#onSquareClick = h; }
    bindRestartClick(h) { this.#onRestartClick = h; }



    renderBoard(boardData, selectedCell = null, validMoves = []) {
        this.#boardElement.innerHTML = ''; 

   
        this.#boardElement.style.gridTemplateColumns = `repeat(${BOARD.COLS}, var(--square-size))`;
        this.#boardElement.style.gridTemplateRows = `repeat(${BOARD.ROWS}, var(--square-size))`;


        for (let r = 0; r < BOARD.ROWS; r++) {
            for (let c = 0; c < BOARD.COLS; c++) {
                const cell = document.createElement('div');
                cell.classList.add(CSS.CELL);

                if ((r + c) % 2 === 0) {
                    cell.classList.add(CSS.CELL_WHITE);
                } else {
                    cell.classList.add(CSS.CELL_BLACK);
                }
                
                cell.dataset.row = r;
                cell.dataset.col = c;

                const pieceObj = boardData[r][c]; 

                if (pieceObj !== null) {
                    const checker = document.createElement('div');
                    checker.classList.add(CSS.CHECKER);

                    if (pieceObj.player === PLAYERS.LIGHT) {
                        checker.classList.add(CSS.CHECKER_LIGHT);
                    } else {
                        checker.classList.add(CSS.CHECKER_DARK);
                    }

                    if (pieceObj.isKing === true) {
                        checker.classList.add(CSS.CHECKER_KING);
                    }

                    cell.appendChild(checker);
                }

                let isHighlighted = false;
                for (let i = 0; i < validMoves.length; i++) {
                    if (validMoves[i].r === r && validMoves[i].c === c) {
                        isHighlighted = true;
                        break; 
                    }
                }

                if (isHighlighted === true) {
                    cell.classList.add(CSS.HIGHLIGHT);
                }
                if (selectedCell !== null) {
                    if (selectedCell.r === r && selectedCell.c === c) {
                        cell.classList.add(CSS.SELECTED);
                    }
                }

                
                this.#boardElement.append(cell);
            }
        }
    }

    animateMove(fR, fC, tR, tC, done) {
        const piece = this.#boardElement.querySelector(`[data-row="${fR}"][data-col="${fC}"] .${CSS.CHECKER}`);
        const target = this.#boardElement.querySelector(`[data-row="${tR}"][data-col="${tC}"]`);
        if (piece && target) AnimationHelper.movePiece(piece, target, done);
        else done();
    }

    hideSelectionAndHighlights() {
        this.#boardElement.querySelectorAll('.is-selected, .is-highlighted').forEach(el => {
            el.classList.remove('is-selected', 'is-highlighted');
        });
    }

    showWinner(id) {
        this.#winText.textContent = `${id === PLAYERS.LIGHT ? "White" : "Black"} Wins!`;
        this.#winMessage.style.display = "flex";
        this.#boardElement.style.pointerEvents = "none";
    }

    hideWinner() {
        this.#winMessage.style.display = "none";
        this.#boardElement.style.pointerEvents = "auto";
    }
}