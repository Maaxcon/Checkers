import { PLAYERS, DIRECTIONS } from '../constants.js';

export class Piece {
    #player
    #isKing
    constructor(playerType) {
        this.#player = playerType; 
        this.#isKing = false;      
    }

    get player() { return this.#player; }
    get isKing() { return this.#isKing; }

    get isLight() {
        return this.#player === PLAYERS.LIGHT;
    }

    get moveDirections() {
        if (this.#isKing) {
            return [DIRECTIONS.UP, DIRECTIONS.DOWN]; 
        } else {
            if (this.isLight) {
                return [DIRECTIONS.UP]; 
            } else {
                return [DIRECTIONS.DOWN];  
            }
        }
    }

    isOpponent(otherPiece) {
        if (otherPiece === null) return false;
        return this.#player !== otherPiece.player;
    }

    makeKing() {
        this.#isKing = true;
    }

    toJSON() {
        return {
            player: this.#player,
            isKing: this.#isKing
        };
    }
}