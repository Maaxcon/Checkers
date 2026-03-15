import { PLAYERS, BOARD } from '../Сonstants.js';
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
        this.#currentTurn = this.#currentTurn === PLAYERS.LIGHT ? PLAYERS.DARK : PLAYERS.LIGHT;
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
        
        if (piece.isKing === false) {
            if (piece.isLight === true && toRow === BOARD.TOP_ROW) { 
                piece.makeKing(); 
                becameKing = true; 
            } else if (piece.isLight === false && toRow === BOARD.BOTTOM_ROW) { 
                piece.makeKing(); 
                becameKing = true; 
            }
        }

        return { wasCapture: wasCapture, becameKing: becameKing };
    }
}