export class HistoryView {
    #panel;
    #list;
    #onHistoryItemClick;

    constructor(container) {
        this.#createLayout(container);
    }

    #createLayout(container) {
        this.#panel = document.createElement("aside");
        this.#panel.className = "history-panel";
        
        const title = document.createElement("h3");
        title.className = "history-title";
        title.textContent = "Move History";
        
        this.#list = document.createElement("ul");
        this.#list.className = "history-list";
        
        this.#panel.append(title, this.#list);
        container.append(this.#panel);
    }

    bindClick(handler) {
        this.#onHistoryItemClick = handler;
    }

    render(moveLog = []) {
        if (!moveLog) return;
        
        const listItems = moveLog.map((move, index) => {
            const li = document.createElement("li");
            li.className = "history-item";
            const moveNum = Math.floor(index / 2) + 1;
            const prefix = index % 2 === 0 ? `${moveNum}.White ` : `${moveNum}.Black `;
            
            li.textContent = `${prefix}${move.notation}`;
            
            li.onclick = () => this.#onHistoryItemClick?.(move.from, move.to);
            
            return li;
        });
        
        this.#list.replaceChildren(...listItems);
        
        this.#panel.scrollTop = this.#panel.scrollHeight;
    }
}