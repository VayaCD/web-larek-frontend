import { IProductItem } from '../../../types';
import { EventEmitter } from '../Base/events';
import { ProductsApi } from './Api';

export class Products {
    private items: IProductItem[] = [];
    private api: ProductsApi;
    private events: EventEmitter;

    constructor(api: ProductsApi, events: EventEmitter) {
        this.api = api;
        this.events = events;
    }

    async loadProducts(): Promise<IProductItem[]> {
        try {
            this.items = await this.api.getProducts();
            this.events.emit('products:loaded', { products: this.items });
            return this.items;
        } catch (error) {
            console.error('Ошибка загрузки продуктов:', error);
            this.events.emit('products:error', { error });
            throw error;
        }
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
