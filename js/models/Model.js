import { BOARD, PLAYERS } from '../constants.js';
import { Board } from './Board.js';
import { MoveEngine } from './MoveEngine.js';

export class CheckersModel {
    #board;
    #currentTurn;
    #multiJumpPiece; 
    #winner; 

    constructor() {
        this.#board = new Board(); 
        this.resetGame(); 
    }

    resetGame() {
        this.#board.reset();
        this.#currentTurn = PLAYERS.LIGHT;
        this.#multiJumpPiece = null;
        this.#winner = null;
    }

    get board() { return this.#board.state; }
    get currentTurn() { return this.#currentTurn; }
    get multiJumpPiece() { return this.#multiJumpPiece; }
    get winner() { return this.#winner; } 

    #isCurrentPlayerPiece(piece) {
        if (this.#currentTurn === PLAYERS.LIGHT) return piece === PLAYERS.LIGHT || piece === PLAYERS.LIGHT_KING;
        return piece === PLAYERS.DARK || piece === PLAYERS.DARK_KING;
    }

    #getCapturesForPiece(row, col) {
        const moves = MoveEngine.getMovesForPiece(this.#board, row, col);
        return moves.filter(m => m.type === 'capture');
    }

    #playerHasAnyCaptures() {
        for (let r = 0; r < BOARD.ROWS; r++) {
            for (let c = 0; c < BOARD.COLS; c++) {
                if (this.#isCurrentPlayerPiece(this.#board.getPiece(r, c))) {
                    if (this.#getCapturesForPiece(r, c).length > 0) return true;
                }
            }
        }
        return false;
    }

    getValidMoves(row, col) {
        if (this.#winner) return []; 
        if (!this.#isCurrentPlayerPiece(this.#board.getPiece(row, col))) return [];

        if (this.#multiJumpPiece && (this.#multiJumpPiece.r !== row || this.#multiJumpPiece.c !== col)) {
            return []; 
        }

        let moves = MoveEngine.getMovesForPiece(this.#board, row, col);
        
        if (this.#playerHasAnyCaptures()) {
            moves = moves.filter(m => m.type === 'capture');
        }

        return moves;
    }

    checkWinCondition() {
        let hasMoves = false;
        for (let r = 0; r < BOARD.ROWS; r++) {
            for (let c = 0; c < BOARD.COLS; c++) {
                if (this.#isCurrentPlayerPiece(this.#board.getPiece(r, c))) {
                    if (this.getValidMoves(r, c).length > 0) {
                        hasMoves = true;
                        break; 
                    }
                }
            }
            if (hasMoves) break;
        }

        if (!hasMoves) {
            this.#winner = this.#currentTurn === PLAYERS.LIGHT ? PLAYERS.DARK : PLAYERS.LIGHT;
        }
    }

    movePiece(fromR, fromC, toR, toC, moveInfo) {
        let piece = this.#board.getPiece(fromR, fromC);
        let wasCapture = false;

        this.#board.move(fromR, fromC, toR, toC);

        if (moveInfo.type === 'capture') {
            this.#board.remove(moveInfo.capturedR, moveInfo.capturedC);
            wasCapture = true;
        }

        let becameKing = false;
        if (piece === PLAYERS.LIGHT && toR === 0) { 
            this.#board.setPiece(toR, toC, PLAYERS.LIGHT_KING); 
            becameKing = true; 
        }
        if (piece === PLAYERS.DARK && toR === BOARD.ROWS - 1) { 
            this.#board.setPiece(toR, toC, PLAYERS.DARK_KING); 
            becameKing = true; 
        }

        if (wasCapture && !becameKing) {
            if (this.#getCapturesForPiece(toR, toC).length > 0) {
                this.#multiJumpPiece = { r: toR, c: toC };
                return false; 
            }
        }

        this.#multiJumpPiece = null;
        this.#currentTurn = this.#currentTurn === PLAYERS.LIGHT ? PLAYERS.DARK : PLAYERS.LIGHT;
        this.checkWinCondition();
        
        return true; 
    }
}