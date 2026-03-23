import { PLAYERS, GAME_RESULTS } from '../constants.ts';
import { HistoryView } from './components/HistoryView.ts';
import { TimerView } from './components/TimerView.ts';
import { BoardView } from './components/BoardView.ts';
import type { Player } from '../constants.ts';
import type { BoardGrid, GameOverReason, HistoryHighlight, Move, Position } from '../types.ts';

export class CheckersView {
    #root: HTMLElement;
    #winMessage!: HTMLDivElement;
    #winText!: HTMLHeadingElement;
    
    #boardView!: BoardView;
    #historyView!: HistoryView;
    #timerView!: TimerView;

    #onRestartClick: (() => void) | null = null;
    #onUndoClick: (() => void) | null = null;

    constructor(root: HTMLElement) {
        this.#root = root;
        this.#createLayout();
    }

    get historyView(): HistoryView {
        return this.#historyView;
    }

    get timerView(): TimerView {
        return this.#timerView;
    }

    #createLayout(): void {
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

    bindUndoClick(handler: () => void): void { this.#onUndoClick = handler; }
    bindSquareClick(handler: (row: number, col: number) => void): void { this.#boardView.bindSquareClick(handler); }
    bindRestartClick(handler: () => void): void { this.#onRestartClick = handler; }
    bindDragStart(handler: (row: number, col: number) => void): void { this.#boardView.bindDragStart(handler); }
    bindDrop(handler: (row: number, col: number) => void): void { this.#boardView.bindDrop(handler); }

    updateKeyboardCursor(cursor: Position | null): void {
        this.#boardView.updateKeyboardCursor(cursor);
    }

    renderBoard(
        boardData: BoardGrid,
        selectedCell: Position | null = null,
        validMoves: Move[] = [],
        currentPlayer: Player = PLAYERS.LIGHT,
        historyHighlight: HistoryHighlight | null = null
    ): void {
        this.#boardView.renderBoard(boardData, selectedCell, validMoves, currentPlayer, historyHighlight);
    }

    animateMove(fromRow: number, fromCol: number, toRow: number, toCol: number, onAnimationComplete: () => void): void {
        this.#boardView.animateMove(fromRow, fromCol, toRow, toCol, onAnimationComplete);
    }

    hideSelectionAndHighlights(): void {
        this.#boardView.hideSelectionAndHighlights();
    }

    showWinner(id: Player, reason: GameOverReason = null): void {
        const isTimeout = reason === GAME_RESULTS.TIMEOUT;
        this.#winText.textContent = isTimeout ? "Time's up!" : `${id === PLAYERS.LIGHT ? "White" : "Black"} Wins!`;
        this.#winMessage.style.display = "flex";
        this.#boardView.setInteractive(false);
    }

    hideWinner(): void {
        this.#winMessage.style.display = "none";
        this.#boardView.setInteractive(true);
    }
}
