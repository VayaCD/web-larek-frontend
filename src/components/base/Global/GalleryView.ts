import { Card } from './Card';
import { IProductItem } from '../../../types';
import { EventEmitter } from '../Base/events';

export class GalleryView {
    private gallery: HTMLElement;

    constructor(private eventEmitter: EventEmitter) {
        this.gallery = document.querySelector('.gallery') as HTMLElement;
        
        if (!this.gallery) {
            throw new Error('Gallery element not found');
        }
    }

    public renderProducts(products: IProductItem[]): void {
        if (!Array.isArray(products)) {
            console.error('Invalid API response format:', products);
            return;
        }
        
        this.gallery.innerHTML = '';
        
        products.forEach(product => {
            const card = new Card(product, this.eventEmitter);
            this.gallery.appendChild(card.getElement());
        });
    }
}
