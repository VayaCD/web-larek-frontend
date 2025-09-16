export class GalleryView {
    private gallery: HTMLElement;

    constructor() {
        this.gallery = document.querySelector('.gallery') as HTMLElement;
        
        if (!this.gallery) {
            throw new Error('Gallery element not found');
        }
    }

    public renderCards(cards: HTMLElement[]): void {
        if (!Array.isArray(cards)) {
            return;
        }
        
        this.gallery.innerHTML = '';
        
        cards.forEach(card => {
            this.gallery.appendChild(card);
        });
    }
}
