import { PLAYERS, BOARD } from '../constants.js';
import { Board } from './Board.js';

export class GameState {
    #board;
    #currentTurn;
    #multiJumpPiece;
    #winner;

    constructor() {
        this.#board = new Board();
        this.reset();
    }

    clone() {
        const clonedState = new GameState();
        clonedState.restoreFromClone(
            this.#board.clone(),
            this.#currentTurn,
            this.#multiJumpPiece,
            this.#winner
        );
        return clonedState;
    }

    restoreFromClone(clonedBoard, turn, multiJumpPiece, winner) {
        this.#board = clonedBoard;
        this.#currentTurn = turn;
        this.#multiJumpPiece = multiJumpPiece ? { ...multiJumpPiece } : null;
        this.#winner = winner;
    }

    toJSON() {
        return {
            grid: this.#board.grid,
            turn: this.#currentTurn,
            multiJumpPiece: this.#multiJumpPiece,
            winner: this.#winner
        };
    }

    restore(savedData) {
        this.#board.restoreFrom(savedData.grid);
        this.#currentTurn = savedData.turn; 
        this.#multiJumpPiece = savedData.multiJumpPiece || null;        
        this.#winner = savedData.winner || null;
    }

    reset() {
        this.#board.reset();
        this.#currentTurn = PLAYERS.LIGHT;
        this.#multiJumpPiece = null;
        this.#winner = null;
    }

    get board() { return this.#board; } 
    get boardMatrix() { return this.#board.grid; } 
    get currentTurn() { return this.#currentTurn; }
    get multiJumpPiece() { return this.#multiJumpPiece; }
    get winner() { return this.#winner; }

    setWinner(player) { this.#winner = player; }
    setMultiJumpPiece(row, col) { this.#multiJumpPiece = { row, col }; }
    clearMultiJumpPiece() { this.#multiJumpPiece = null; }
    
    switchTurn() {
        if (this.#currentTurn === PLAYERS.LIGHT) {
            this.#currentTurn = PLAYERS.DARK;
        } else {
            this.#currentTurn = PLAYERS.LIGHT;
        }
    }

    executeMove(fromRow, fromCol, toRow, toCol, moveInfo) {
        const piece = this.#board.getPiece(fromRow, fromCol);
        let wasCapture = false;

        this.#board.move(fromRow, fromCol, toRow, toCol);

        if (moveInfo.type === 'capture') {
            this.#board.remove(moveInfo.capturedRow, moveInfo.capturedCol);
            wasCapture = true;
        }

        let becameKing = false;
        
        if (!piece.isKing) {
            if (piece.isLight === true && toRow === BOARD.TOP_ROW) { 
                piece.makeKing(); 
                becameKing = true; 
            } else if (!piece.isLight && toRow === BOARD.BOTTOM_ROW) { 
                piece.makeKing(); 
                becameKing = true; 
            }
        }

        return { wasCapture: wasCapture, becameKing: becameKing };
    }
}