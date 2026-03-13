import { CheckersModel } from './models/CheckersModel.js';
import { CheckersView } from './view/View.js';
import { CheckersController } from './Controller/Controller.js';

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector(".root");
    
    const model = new CheckersModel();
    const view = new CheckersView(root);
    const controller = new CheckersController(model, view);
});