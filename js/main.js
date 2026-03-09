import { createMenu, createMenuInGame } from './components/menu.js';
import { createLayout, generateBoardData, renderSquares, renderCheckers, setupListeners } from './components/board.js';
import { startTimer } from './components/timer.js';

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector(".root");

    // Головна функція, яка збирає гру 
    function initApp(menu) {
        const { section_board, board } = createLayout(root);
        const boardData2 = generateBoardData();
        renderSquares(board);
        createMenuInGame(section_board, menu, root, initApp); 
        renderCheckers(boardData2);
        setupListeners();
        startTimer(section_board);
    }

    createMenu(root, initApp);
});