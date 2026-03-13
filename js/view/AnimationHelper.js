export class AnimationHelper {
    
    static movePiece(piece, endCell, onComplete) {
        const startRect = piece.getBoundingClientRect();
        const endRect = endCell.getBoundingClientRect();

        const deltaX = endRect.left - startRect.left + (endRect.width - startRect.width) / 2;
        const deltaY = endRect.top - startRect.top + (endRect.height - startRect.height) / 2;

        piece.style.transition = 'transform 0.4s ease-in-out';
        piece.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        piece.style.zIndex = '1000';


        piece.addEventListener('transitionend', () => {
            onComplete();
        });
    }
}