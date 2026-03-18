import { PLAYERS, BOARD } from '../constants.js';
import { MoveEngine } from './MoveEngine.js';

export class MoveValidator {
    
    static isCurrentPlayerPiece(gameState, piece) {
        if (piece === null) return false;
        return piece.player === gameState.currentTurn;
    }

    static getCapturesForPiece(gameState, row, col) {
        const allMoves = MoveEngine.getMovesForPiece(gameState.board, row, col);
        return allMoves.filter(move => move.type === 'capture');
    }

    static playerHasAnyCaptures(gameState) {
        for (let row = 0; row < BOARD.ROWS; row++) {
            for (let col = 0; col < BOARD.COLS; col++) {
                const piece = gameState.board.getPiece(row, col);

                if (this.isCurrentPlayerPiece(gameState, piece)) {
                    const captures = this.getCapturesForPiece(gameState, row, col);
                    if (captures.length > 0) {
                        return true; 
                    }
                }
            }                   
        }
        return false;
    }

    static getValidMoves(gameState, row, col) {
        if (gameState.winner) return []; 
        const piece = gameState.board.getPiece(row, col);
        if (!this.isCurrentPlayerPiece(gameState, piece)) return []; 

        const lockedPiece = gameState.multiJumpPiece;
        if (lockedPiece) {
            const isClickingAnotherPiece = (lockedPiece.row !== row || lockedPiece.col !== col);
            if (isClickingAnotherPiece) {
                return []; 
            }
        }
      
        const allMoves = MoveEngine.getMovesForPiece(gameState.board, row, col);
      
        if (this.playerHasAnyCaptures(gameState)) {
            return allMoves.filter(move => move.type === 'capture');
        }

        return allMoves;
    }

    static calculateWinner(gameState) {
        for (let row = 0; row < BOARD.ROWS; row++) {
            for (let col = 0; col < BOARD.COLS; col++) {
                const piece = gameState.board.getPiece(row, col);

                if (this.isCurrentPlayerPiece(gameState, piece)) {
                    const validMoves = this.getValidMoves(gameState, row, col);
                    if (validMoves.length > 0) {
                        return null; 
                    }
                }
            }
        }

        return gameState.currentTurn === PLAYERS.LIGHT ? PLAYERS.DARK : PLAYERS.LIGHT;
    }
}