import { PLAYERS } from '../constants.js';

export class Piece {
    constructor(playerType) {
        this.player = playerType; 
        this.isKing = false;      
    }

    get isLight() {
        if (this.player === PLAYERS.LIGHT) {
            return true;
        } else {
            return false;
        }
    }

    get moveDirections() {
        if (this.isKing === true) {
            return [-1, 1]; 
        } else {
            if (this.isLight === true) {
                return [-1]; 
            } else {
                return [1];  
            }
        }
    }

    isOpponent(otherPiece) {
        if (otherPiece === null) {
            return false;
        }
        if (this.player !== otherPiece.player) {
            return true;
        } else {
            return false;
        }
    }

    makeKing() {
        this.isKing = true;
    }
}