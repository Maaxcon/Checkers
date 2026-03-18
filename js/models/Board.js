import { BOARD, PLAYERS } from '../constants.js';
import { Piece } from './Piece.js';

export class Board {
    #grid;
    constructor() {
        this.#grid = [];
        this.reset();
    }

    get grid() { return this.#grid; }

    reset() {
        this.#grid = [];
        for (let row = 0; row < BOARD.ROWS; row++) {
            let gridRow = [];
            for (let col = 0; col < BOARD.COLS; col++) {
                gridRow.push(null); 
            }
            this.#grid.push(gridRow);
        }
        
        for (let row = 0; row < BOARD.ROWS; row++) {
            for (let col = 0; col < BOARD.COLS; col++) {
                if ((row + col) % 2 !== 0) {
                    if (row < BOARD.PIECE_ROWS) {
                        this.#grid[row][col] = new Piece(PLAYERS.DARK);
                    } 
                    else if (row >= BOARD.ROWS - BOARD.PIECE_ROWS) {
                        this.#grid[row][col] = new Piece(PLAYERS.LIGHT);
                    }
                }
            }
        }
    }

    getPiece(row, col) { return this.#grid[row][col]; }
    setPiece(row, col, piece) { this.#grid[row][col] = piece; }
    remove(row, col) { this.#grid[row][col] = null; }

    move(fromRow, fromCol, toRow, toCol) {
        const piece = this.#grid[fromRow][fromCol];
        this.#grid[toRow][toCol] = piece;
        this.#grid[fromRow][fromCol] = null;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < BOARD.ROWS && col >= 0 && col < BOARD.COLS;
    }


    restoreFrom(savedGrid) {
        const newGrid = [];
        for (let row = 0; row < BOARD.ROWS; row++) {
            let gridRow = [];
            for (let col = 0; col < BOARD.COLS; col++) {
                const savedPiece = savedGrid[row][col];
                
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
        this.#grid = newGrid; 
    }
}