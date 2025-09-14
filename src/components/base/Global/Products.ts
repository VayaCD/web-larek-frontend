import { IProductItem } from '../../../types';
import { EventEmitter } from '../Base/events';

export class Products {
    private items: IProductItem[] = [];
    private events: EventEmitter;

    constructor(events: EventEmitter) {
        this.events = events;
    }

    setProducts(products: IProductItem[]): void {
        this.items = products;
        this.events.emit('products:loaded', { products: this.items });
    }

    getProducts(): IProductItem[] {
        return this.items;
    }

    getProductById(id: string): IProductItem | undefined {
        return this.items.find(product => product.id === id);
    }

    getProductsByCategory(category: string): IProductItem[] {
        return this.items.filter(product => product.category === category);
    }

    getCategories(): string[] {
        const categories = new Set(this.items.map(product => product.category));
        return Array.from(categories);
    }

    isLoaded(): boolean {
        return this.items.length > 0;
    }

    getCount(): number {
        return this.items.length;
    }
}
