import { IProductItem } from '../../../types';
import { EventEmitter } from '../Base/events';
import { ProductsApi, IOrder as IOrderData } from './Api';

export interface IOrderFormData {
    payment: 'online' | 'cash';
    address: string;
}

export interface IOrderContacts {
    email: string;
    phone: string;
}

export interface IOrderState {
    items: IProductItem[];
    total: number;
    formData?: IOrderFormData;
    contacts?: IOrderContacts;
    orderId?: string;
}

export class Order {
    private state: IOrderState;
    private api: ProductsApi;
    private events: EventEmitter;

    constructor(api: ProductsApi, events: EventEmitter) {
        this.api = api;
        this.events = events;
        this.state = {
            items: [],
            total: 0
        };
    }

    initOrder(items: IProductItem[], total: number): void {
        this.state = {
            items: [...items],
            total: total
        };
        this.events.emit('order:initialized', { order: this.state });
    }

    updateFormData(formData: IOrderFormData): void {
        this.state.formData = formData;
        this.events.emit('order:form-updated', { formData });
    }

    updateContacts(contacts: IOrderContacts): void {
        this.state.contacts = contacts;
        this.events.emit('order:contacts-updated', { contacts });
    }

    async submitOrder(): Promise<string> {
        if (!this.state.formData || !this.state.contacts) {
            throw new Error('Не все данные заказа заполнены');
        }

        if (this.state.items.length === 0) {
            throw new Error('Корзина пуста');
        }

        const orderData: IOrderData = {
            payment: this.state.formData.payment,
            address: this.state.formData.address,
            email: this.state.contacts.email,
            phone: this.state.contacts.phone,
            total: this.state.total,
            items: this.state.items.map(item => item.id)
        };

        try {
            const response = await this.api.createOrder(orderData);
            this.state.orderId = response.id;
            this.events.emit('order:submitted', { orderId: response.id, order: this.state });
            return response.id;
        } catch (error) {
            console.error('Ошибка отправки заказа:', error);
            this.events.emit('order:error', { error });
            throw error;
        }
    }

    getState(): IOrderState {
        return { ...this.state };
    }

    getItems(): IProductItem[] {
        return [...this.state.items];
    }

    getTotal(): number {
        return this.state.total;
    }

    getOrderId(): string | undefined {
        return this.state.orderId;
    }

    isReadyToSubmit(): boolean {
        return !!(
            this.state.formData &&
            this.state.contacts &&
            this.state.items.length > 0
        );
    }

    clear(): void {
        this.state = {
            items: [],
            total: 0
        };
        this.events.emit('order:cleared');
    }

    hasItems(): boolean {
        return this.state.items.length > 0;
    }
}
