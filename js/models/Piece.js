import { PLAYERS, DIRECTIONS } from '../constants.js';

export class Piece {
    constructor(playerType) {
        this.player = playerType; 
        this.isKing = false;      
    }

    get isLight() {
        return this.player === PLAYERS.LIGHT;
    }

    get moveDirections() {
        if (this.isKing === true) {
            return [DIRECTIONS.UP, DIRECTIONS.DOWN]; 
        } else {
            if (this.isLight === true) {
                return [DIRECTIONS.UP]; 
            } else {
                return [DIRECTIONS.DOWN];  
            }
        }
    }

    isOpponent(otherPiece) {
        if (otherPiece === null) return false;
        return this.player !== otherPiece.player;
    }

    makeKing() {
        this.isKing = true;
    }
}