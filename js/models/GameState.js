import { PLAYERS, BOARD } from '../constants.js';
import { Board } from './Board.js';
import { Piece } from './Piece.js'; 

export class GameState {
    #board;
    #currentTurn;
    #multiJumpPiece;
    #winner;

    constructor() {
        this.#board = new Board();
        this.reset();
    }

    restore(savedData) {
        const newGrid = [];
        for (let row = 0; row < BOARD.ROWS; row++) {
            let gridRow = [];
            for (let col = 0; col < BOARD.COLS; col++) {
                const savedPiece = savedData.grid[row][col];
                
                if (savedPiece !== null) {
                    const alivePiece = new Piece(savedPiece.player);
                    if (savedPiece.isKing) alivePiece.makeKing();
                    gridRow.push(alivePiece);
                } else {
                    gridRow.push(null);
                }
            }
            newGrid.push(gridRow);
        }

        this.#board.grid = newGrid;
        this.#currentTurn = savedData.turn;
        this.#multiJumpPiece = null; 
        this.#winner = null;
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