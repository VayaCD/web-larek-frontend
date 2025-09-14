import { EventEmitter } from '../Base/events';
import { IOrder as IOrderData } from './Api';

export interface IOrderFormData {
    payment: 'online' | 'cash';
    address: string;
}

export interface IOrderContacts {
    email: string;
    phone: string;
}

export interface IOrderState {
    formData?: IOrderFormData;
    contacts?: IOrderContacts;
    orderId?: string;
}

export class Order {
    private state: IOrderState;
    private events: EventEmitter;

    constructor(events: EventEmitter) {
        this.events = events;
        this.state = {};
    }

    updateFormData(formData: IOrderFormData): void {
        this.state.formData = formData;
        this.validateFormData();
        this.events.emit('order:form-updated', { formData });
    }

    updateContacts(contacts: IOrderContacts): void {
        this.state.contacts = contacts;
        this.validateContacts();
        this.events.emit('order:contacts-updated', { contacts });
    }

    private validateFormData(): void {
        const errors: { [key: string]: string } = {};
        
        if (!this.state.formData?.payment) {
            errors.payment = 'Выберите способ оплаты';
        }
        
        if (!this.state.formData?.address?.trim()) {
            errors.address = 'Введите адрес доставки';
        }
        
        this.events.emit('order:validate', { errors });
    }

    private validateContacts(): void {
        const errors: { [key: string]: string } = {};
        
        if (!this.state.contacts?.email?.trim()) {
            errors.email = 'Введите email';
        } else if (!this.isValidEmail(this.state.contacts.email)) {
            errors.email = 'Введите корректный email';
        }
        
        if (!this.state.contacts?.phone?.trim()) {
            errors.phone = 'Введите телефон';
        } else if (!this.isValidPhone(this.state.contacts.phone)) {
            errors.phone = 'Введите корректный телефон';
        }
        
        this.events.emit('contacts:validate', { errors });
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private isValidPhone(phone: string): boolean {
        const phoneRegex = /^\+?[78][-\(]?\d{3}\)?-?\d{3}-?\d{2}-?\d{2}$/;
        return phoneRegex.test(phone);
    }

    getOrderData(basketItems: string[], total: number): IOrderData {
        if (!this.state.formData || !this.state.contacts) {
            throw new Error('Не все данные заказа заполнены');
        }

        if (basketItems.length === 0) {
            throw new Error('Корзина пуста');
        }

        return {
            payment: this.state.formData.payment,
            address: this.state.formData.address,
            email: this.state.contacts.email,
            phone: this.state.contacts.phone,
            total: total,
            items: basketItems
        };
    }

    setOrderId(orderId: string): void {
        this.state.orderId = orderId;
        this.events.emit('order:submitted', { orderId, order: this.state });
    }

    getState(): IOrderState {
        return { ...this.state };
    }

    getFormData(): IOrderFormData | undefined {
        return this.state.formData;
    }

    getContacts(): IOrderContacts | undefined {
        return this.state.contacts;
    }

    getOrderId(): string | undefined {
        return this.state.orderId;
    }

    isReadyToSubmit(): boolean {
        return !!(
            this.state.formData &&
            this.state.formData.payment &&
            this.state.formData.address?.trim()
        );
    }

    isReadyToSubmitContacts(): boolean {
        return !!(
            this.state.contacts &&
            this.state.contacts.email?.trim() &&
            this.state.contacts.phone?.trim()
        );
    }

    clear(): void {
        this.state = {};
        this.events.emit('order:cleared');
    }
}
