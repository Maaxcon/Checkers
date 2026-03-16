import { CheckersModel } from './models/CheckersModel.js';
import { CheckersView } from './views/CheckersView.js';
import { CheckersController } from './controllers/CheckersController.js';

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector(".root");
    
    const model = new CheckersModel();
    const view = new CheckersView(root);
    const controller = new CheckersController(model, view);
});