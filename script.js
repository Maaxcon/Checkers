document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector(".root");
    const row = 8;
    const col = 8;
    let timerInterval; 

    //  основна розмітку: секцію, заголовок і саму дошку
    function createLayout() {
        const section_board = document.createElement("section");
        const title_board = document.createElement("h2");
        const board = document.createElement("div");

        section_board.classList.add("game-section");
        title_board.classList.add("game-section__title");
        board.classList.add("board");

        title_board.textContent = "Checkers";

        root.append(section_board);
        section_board.append(title_board);
        section_board.append(board);

        return { section_board, board };
    }

    // генерує масив з початковим розташуванням шашок (0 - пусто 1 - білі, 2 - чорні )
    function generateBoardData() {
        const boardData2 = [];
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                if ((i + j) % 2 !== 0) {
                    if (i < 3) boardData2.push(1);
                    else if (i > 4) boardData2.push(2);
                    else boardData2.push(0);
                } else {
                    boardData2.push(0);
                }
            }
        }
        return boardData2;
    }

    // 64 клітинки дошки (чорні та білі квадрати)
    function renderSquares(board) {
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                const square = document.createElement("div");
                square.classList.add("board__cell");
                square.classList.add((i + j) % 2 === 0 ? 'board__cell--white' : "board__cell--black");

                board.append(square);
            }
        }
    }

    // розставляємо шашки по клітинках на основі згенерованого масиву
    function renderCheckers(boardData2) {
        const all_square = document.querySelectorAll(".board__cell");
        all_square.forEach((el, index) => {
            let className = "";
            const checker = document.createElement("button");
            checker.classList.add("checker");

            if (boardData2[index] === 1) className = "checker--light";
            if (boardData2[index] === 2) className = "checker--dark";

            if (className) {
                checker.classList.add(className);
                el.append(checker);
            }
        });
    }

    // додаємо кліки по шашках, щоб вони виділялись при натисканні
    function setupListeners() {
        let checkers = document.querySelectorAll(".checker");
        checkers.forEach(el => {
            el.addEventListener("click", () => {
                checkers.forEach(all => {
                    all.classList.remove("is-selected");
                });
                el.classList.add("is-selected");
            });
        });
    }

    //  запускає таймер на 20 секунд для кожного ходу
    function startTimer(section_board) {
        const container = document.createElement("div");
        container.classList.add("game-info");

        const timer = document.createElement("div");
        timer.classList.add("game-info__timer");

        const turnText = document.createElement("div");
        turnText.classList.add("game-info__turn");

        section_board.append(container);
        container.append(turnText);
        container.append(timer);

        let seconds = 20;
        let currentTurn = "White";

        turnText.textContent = `${currentTurn} turn`;
        timer.textContent = `00:${seconds}`;


        timerInterval = setInterval(() => {
            const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
            const secs = String(seconds % 60).padStart(2, "0");
            timer.textContent = `${mins}:${secs}`;

            if (seconds === 0) {
                currentTurn = currentTurn === "White" ? "Black" : "White";
                turnText.textContent = `${currentTurn} turn`;
                seconds = 20;
            }

            seconds--;
        }, 1000);
    }

    // менюшка над дошкою під час гри 
    function createMenuInGame(section_board, menu) {
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
                    clearInterval(timerInterval); 
                    section_board.remove(); 
                    root.append(menu);      
                }
                else if (item.action === "restart") {
                    clearInterval(timerInterval); 
                    section_board.remove();      
                    initApp(menu);                
                }
            });

            menuContainer.append(btn);
        });

        section_board.prepend(menuContainer); 
    }

    // перше головне меню з кнопкою грати
    function createMenu() {
        const menu = document.createElement("div");
        menu.classList.add("menu");

        const title = document.createElement("h1");
        title.classList.add('menu__title')
        title.textContent = "Checkers Game";

        const playBtn = document.createElement("button");
        playBtn.textContent = "Грати";
        playBtn.classList.add("menu__btn");

        playBtn.addEventListener("click", () => {
            menu.remove();      
            initApp(menu); 
        });

        menu.append(title, playBtn);
        root.append(menu);
    }

    // запуск гри
    function initApp(menu) {
        const { section_board, board } = createLayout();
        const boardData2 = generateBoardData();
        renderSquares(board);
        createMenuInGame(section_board, menu); 
        renderCheckers(boardData2);
        setupListeners();
        startTimer(section_board);
    }

    createMenu();
});