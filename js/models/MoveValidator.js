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

    static getPlayerMoveStatus(gameState) {
        let hasRegularMoves = false;

        for (let row = 0; row < BOARD.ROWS; row++) {
            for (let col = 0; col < BOARD.COLS; col++) {
                const piece = gameState.board.getPiece(row, col);
                
                if (this.isCurrentPlayerPiece(gameState, piece)) {
                    const moves = MoveEngine.getMovesForPiece(gameState.board, row, col);
                    
                    if (moves.some(move => move.type === 'capture')) {
                        return { hasCaptures: true, hasMoves: true };
                    }

                    if (moves.length > 0) {
                        hasRegularMoves = true;
                    }
                }
            }
        }

        return { hasCaptures: false, hasMoves: hasRegularMoves };
    }

    static playerHasAnyCaptures(gameState) {
        return this.getPlayerMoveStatus(gameState).hasCaptures;
    }

    static getValidMoves(gameState, row, col, hasGlobalCaptures = null) {
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
        const mustCapture = hasGlobalCaptures !== null 
            ? hasGlobalCaptures 
            : this.playerHasAnyCaptures(gameState);

        if (mustCapture) {
            return allMoves.filter(move => move.type === 'capture');
        }

        return allMoves;
    }

    static calculateWinner(gameState) {
        const status = this.getPlayerMoveStatus(gameState);

        if (!status.hasMoves) {
            return gameState.currentTurn === PLAYERS.LIGHT ? PLAYERS.DARK : PLAYERS.LIGHT;
        }

        return null; 
    }
}
