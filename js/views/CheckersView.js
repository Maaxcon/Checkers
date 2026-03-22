import { PLAYERS, GAME_RESULTS } from '../constants.js';
import { HistoryView } from './components/HistoryView.js';
import { TimerView } from './components/TimerView.js';
import { BoardView } from './components/BoardView.js';

export class CheckersView {
    #root; 
    #winMessage; 
    #winText;
    
    #boardView;
    #historyView; 
    #timerView; 

    #onRestartClick; 
    #onUndoClick;

    constructor(root) {
        this.#root = root;
        this.#createLayout();
    }

    get historyView() {
        return this.#historyView;
    }

    get timerView() {
        return this.#timerView;
    }

    #createLayout() {
        this.#root.innerHTML = '';
        
        const gameContainer = document.createElement("div");
        gameContainer.className = "game-container"; 

        const main = document.createElement("main");
        main.className = "game-section"; 
        
        this.#boardView = new BoardView();

        this.#winMessage = document.createElement("div");
        this.#winMessage.className = "win-message";
        this.#winMessage.style.display = "none";

        this.#winText = document.createElement("h3");
        this.#winText.className = "win-title";

        const btn = document.createElement("button");
        btn.textContent = "Play Again";
        btn.className = "btn-restart";
        btn.onclick = () => this.#onRestartClick?.();

      
        const undoBtn = document.createElement("button");
        undoBtn.textContent = "Undo ↩";
        undoBtn.className = "btn-undo"; 
        undoBtn.onclick = () => this.#onUndoClick?.();


        this.#winMessage.append(this.#winText, btn);
        main.append(undoBtn, this.#boardView.element, this.#winMessage);

        this.#timerView = new TimerView(main);

        gameContainer.append(main);
        
        this.#historyView = new HistoryView(gameContainer);

        this.#root.append(gameContainer);

    }

    bindUndoClick(handler) { this.#onUndoClick = handler; }
    bindSquareClick(handler) { this.#boardView.bindSquareClick(handler); }
    bindRestartClick(handler) { this.#onRestartClick = handler; }
    bindDragStart(handler) { this.#boardView.bindDragStart(handler); }
    bindDrop(handler) { this.#boardView.bindDrop(handler); }

    updateKeyboardCursor(cursor) {
        this.#boardView.updateKeyboardCursor(cursor);
    }

    renderBoard(boardData, selectedCell = null, validMoves = [], currentPlayer = PLAYERS.LIGHT, historyHighlight = null) {
        this.#boardView.renderBoard(boardData, selectedCell, validMoves, currentPlayer, historyHighlight);
    }

    animateMove(fromRow, fromCol, toRow, toCol, onAnimationComplete) {
        this.#boardView.animateMove(fromRow, fromCol, toRow, toCol, onAnimationComplete);
    }

    hideSelectionAndHighlights() {
        this.#boardView.hideSelectionAndHighlights();
    }

    showWinner(id, reason = null) {
        const isTimeout = reason === GAME_RESULTS.TIMEOUT;
        this.#winText.textContent = isTimeout ? "Time's up!" : `${id === PLAYERS.LIGHT ? "White" : "Black"} Wins!`;
        this.#winMessage.style.display = "flex";
        this.#boardView.setInteractive(false);
    }

    hideWinner() {
        this.#winMessage.style.display = "none";
        this.#boardView.setInteractive(true);
    }
}
