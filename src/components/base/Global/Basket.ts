import { IProductItem } from '../../../types';
import { EventEmitter } from '../Base/events';

export class Basket {
    private items: IProductItem[] = [];

    constructor(private eventEmitter: EventEmitter) {}

    public hasItem(productId: string): boolean {
        return this.items.some(item => item.id === productId);
    }

    public addItem(product: IProductItem): void {
        this.items.push(product);
        this.eventEmitter.emit('basket:changed');
    }

    public removeItem(productId: string): void {
        this.items = this.items.filter(item => item.id !== productId);
        this.eventEmitter.emit('basket:changed');
    }

    public getItems(): IProductItem[] {
        return this.items;
    }

    public getTotalPrice(): number {
        return this.items.reduce((total, item) => total + (item.price || 0), 0);
    }

    public clear(): void {
        this.items = [];
        this.eventEmitter.emit('basket:changed');
    }
}

