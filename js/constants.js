export const BOARD = {
    ROWS: 8,       
    COLS: 8,       
    
    get PIECE_ROWS() {
        return Math.floor((this.ROWS - 2) / 2);
    }
};
export const PLAYERS = {
    EMPTY: 0,
    LIGHT: 1, 
    DARK: 2,
    LIGHT_KING: 3, 
    DARK_KING: 4   
};

export const CSS = {
    BOARD: 'board',
    CELL: 'board__cell',
    CELL_BLACK: 'board__cell--black',
    CELL_WHITE: 'board__cell--white',
    CHECKER: 'checker',
    CHECKER_LIGHT: 'checker--light',
    CHECKER_DARK: 'checker--dark',
    CHECKER_KING: 'checker--king',
    SELECTED: 'is-selected',
    HIGHLIGHT: 'is-highlighted' 
};