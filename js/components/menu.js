import { stopTimer } from './timer.js';

// менюшка над дошкою під час гри 
export function createMenuInGame(section_board, menu, root, initAppCallback) {
    const menuContainer = document.createElement("div");
    menuContainer.classList.add("game-menu__container");

    const menuItems = [
        { text: "Menu", action: "menu" },
        { text: "Pause", action: "pause" },
        { text: "Restart", action: "restart" }
    ];

    menuItems.forEach(item => {
        const btn = document.createElement("button");
        btn.classList.add("menu__btn");
        btn.dataset.action = item.action;
        btn.textContent = item.text;

        btn.addEventListener("click", () => {
            if (item.action === "menu" || item.action === "pause") {
                stopTimer(); 
                section_board.remove(); 
                root.append(menu);      
            }
            else if (item.action === "restart") {
                stopTimer(); 
                section_board.remove();      
                initAppCallback(menu); 
            }
        });

        menuContainer.append(btn);
    });

    section_board.prepend(menuContainer); 
}

  // перше головне меню з кнопкою грати
export function createMenu(root, initAppCallback) {
    const menu = document.createElement("div");
    menu.classList.add("menu");

    const title = document.createElement("h1");
    title.classList.add('menu__title');
    title.textContent = "Checkers Game";

    const playBtn = document.createElement("button");
    playBtn.textContent = "Грати";
    playBtn.classList.add("menu__btn");

    playBtn.addEventListener("click", () => {
        menu.remove();      
        initAppCallback(menu); 
    });

    menu.append(title, playBtn);
    root.append(menu);
}