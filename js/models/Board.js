import { BOARD, PLAYERS } from '../constants.js';

export class Board {
    #grid;

    constructor() {
        this.reset();
    }

    reset() {
        this.#grid = [];
        for (let row = 0; row < BOARD.ROWS; row++) {
            const rowData = [];
            for (let col = 0; col < BOARD.COLS; col++) {
                if ((row + col) % 2 !== 0) {
                    if (row < BOARD.PIECE_ROWS) {
                        rowData.push(PLAYERS.DARK); 
                    } 
                    else if (row >= BOARD.ROWS - BOARD.PIECE_ROWS) {
                        rowData.push(PLAYERS.LIGHT); 
                    } 
                    else {
                        rowData.push(PLAYERS.EMPTY);
                    }
                } else {
                    rowData.push(PLAYERS.EMPTY);
                }
            }
            this.#grid.push(rowData);

        }
        
    }

    get state() { return this.#grid; }

    getPiece(row, col) {
        if (!this.isValidPosition(row, col)) return null;
        return this.#grid[row][col];
    }

    setPiece(row, col, piece) {
        if (this.isValidPosition(row, col)) {
            this.#grid[row][col] = piece;
        }
    }

    move(fromR, fromC, toR, toC) {
        const piece = this.getPiece(fromR, fromC);
        this.setPiece(toR, toC, piece);
        this.setPiece(fromR, fromC, PLAYERS.EMPTY);
    }

    remove(row, col) {
        this.setPiece(row, col, PLAYERS.EMPTY);
    }

    isValidPosition(row, col) {
        return row >= 0 && row < BOARD.ROWS && col >= 0 && col < BOARD.COLS;
    }
}