import { BOARD, PLAYERS } from '../constants.js';
import { Piece } from './Piece.js';

export class Board {
    constructor() {
        this.grid = [];
        this.reset();
    }

    reset() {
        this.grid = [];
        for (let r = 0; r < BOARD.ROWS; r++) {
            let row = [];
            for (let c = 0; c < BOARD.COLS; c++) {
                row.push(null); 
            }
            this.grid.push(row);
        }
        
        for (let r = 0; r < BOARD.ROWS; r++) {
            for (let c = 0; c < BOARD.COLS; c++) {
                if ((r + c) % 2 !== 0) {
                    if (r < BOARD.PIECE_ROWS) {
                        this.grid[r][c] = new Piece(PLAYERS.DARK);
                    } 
                    else if (r >= BOARD.ROWS - BOARD.PIECE_ROWS) {
                        this.grid[r][c] = new Piece(PLAYERS.LIGHT);
                    }
                }
            }
        }
    }

    getPiece(r, c) { return this.grid[r][c]; }
    setPiece(r, c, piece) { this.grid[r][c] = piece; }
    remove(r, c) { this.grid[r][c] = null; }

    move(fromR, fromC, toR, toC) {
        const piece = this.grid[fromR][fromC];
        this.grid[toR][toC] = piece;
        this.grid[fromR][fromC] = null;
    }

    isValidPosition(r, c) {
        if (r >= 0 && r < BOARD.ROWS && c >= 0 && c < BOARD.COLS) {
            return true;
        } else {
            return false;
        }
    }
}