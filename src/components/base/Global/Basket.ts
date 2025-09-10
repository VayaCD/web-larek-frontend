import { IProductItem } from '../../../types';
import { EventEmitter } from '../Base/events';

export class Basket {
    private items: IProductItem[] = [];

    constructor(private eventEmitter: EventEmitter) {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Удаление из корзины
        this.eventEmitter.on('basket:remove', (data: { productId: string }) => {
            console.log('Получено событие basket:remove', data.productId);
            this.removeItem(data.productId);
        });
        this.eventEmitter.on('basket:get-state', 
            (data: { callback: (items: IProductItem[]) => void }) => {
            data.callback(this.items);
        });
    }

    public hasItem(productId: string): boolean {
        return this.items.some(item => item.id === productId);
    }

    public addItem(product: IProductItem): void {
        this.items.push(product);
        this.updateBasket();
    }

    public removeItem(productId: string): void {
        this.items = this.items.filter(item => item.id !== productId);
        this.updateBasket();
    }

    private updateBasket(): void {
        this.eventEmitter.emit('basket:update', { 
            items: this.items, 
            total: this.getTotalPrice() 
        });
    }

    public getItems(): IProductItem[] {
        return this.items;
    }

    public getTotalPrice(): number {
        return this.items.reduce((total, item) => total + (item.price || 0), 0);
    }

    public clear(): void {
        this.items = [];
        this.updateBasket();
    }
}

