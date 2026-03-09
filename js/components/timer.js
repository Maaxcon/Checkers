let timerInterval;

// менюшка над дошкою під час гри 
export function startTimer(section_board) {
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

export function stopTimer() {
    console.log(timerInterval)
    clearInterval(timerInterval);
}