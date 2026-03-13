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
    setMultiJumpPiece(r, c) { this.#multiJumpPiece = { r, c }; }
    clearMultiJumpPiece() { this.#multiJumpPiece = null; }
    
    switchTurn() {
        this.#currentTurn = this.#currentTurn === PLAYERS.LIGHT ? PLAYERS.DARK : PLAYERS.LIGHT;
    }

    
    executeMove(fromR, fromC, toR, toC, moveInfo) {
        const piece = this.#board.getPiece(fromR, fromC);
        let wasCapture = false;

        this.#board.move(fromR, fromC, toR, toC);

        if (moveInfo.type === 'capture') {
            this.#board.remove(moveInfo.capturedR, moveInfo.capturedC);
            wasCapture = true;
        }

        let becameKing = false;
        
     
        if (piece.isKing === false) {
            if (piece.isLight === true && toR === 0) { 
                piece.makeKing(); 
                becameKing = true; 
            } else if (piece.isLight === false && toR === BOARD.ROWS - 1) { 
                piece.makeKing(); 
                becameKing = true; 
            }
        }

        return { wasCapture: wasCapture, becameKing: becameKing };
    }
}