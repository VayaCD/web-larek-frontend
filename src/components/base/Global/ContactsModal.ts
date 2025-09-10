import { Modal } from './Modal';
import { EventEmitter } from '../Base/events';
import { IProductItem } from '../../../types';

interface ContactsData {
    email: string;
    phone: string;
}

export class ContactsModal extends Modal {
    private contactsData: ContactsData = {
        email: '',
        phone: ''
    };

    constructor(
        element: HTMLElement, 
        private eventEmitter: EventEmitter, 
        private orderData: any,
        private basketItems: IProductItem[], 
        private totalPrice: number
    ) {
        super(element);
    }

    public show(): void {
        this.render();
        this.open();
        this.setupEventListeners();
    }

    private render(): void {
        const template = document.querySelector('#contacts') as HTMLTemplateElement;
        const content = template.content.cloneNode(true) as DocumentFragment;

        const modalContent = this.element.querySelector('.modal__content');
        if (modalContent) {
            modalContent.innerHTML = '';
            modalContent.appendChild(content);
        }
    }

    private setupEventListeners(): void {
        const emailInput = this.element.querySelector('input[name="email"]') as HTMLInputElement;
        const phoneInput = this.element.querySelector('input[name="phone"]') as HTMLInputElement;
        const payButton = this.element.querySelector('.button') as HTMLButtonElement;
        const errorsContainer = this.element.querySelector('.form__errors') as HTMLElement;

        if (emailInput) {
            emailInput.addEventListener('input', () => {
                this.contactsData.email = emailInput.value.trim();
                this.validateForm(payButton, errorsContainer);
            });
        }

        if (phoneInput) {
            phoneInput.addEventListener('input', () => {
                this.contactsData.phone = phoneInput.value.trim();
                this.validateForm(payButton, errorsContainer);
            });
        }

        if (payButton) {
            payButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.validateForm(payButton, errorsContainer)) {
                    this.completeOrder();
                }
            });
        }
    }

    private validateForm(payButton: HTMLButtonElement, errorsContainer: HTMLElement): boolean {
        const errors: string[] = [];

        if (!this.contactsData.email) {
            errors.push('Введите email');
        } else if (!this.isValidEmail(this.contactsData.email)) {
            errors.push('Введите корректный email');
        }

        if (!this.contactsData.phone) {
            errors.push('Введите телефон');
        } else if (!this.isValidPhone(this.contactsData.phone)) {
            errors.push('Введите корректный телефон');
        }

        payButton.disabled = errors.length > 0;

        if (errorsContainer) {
            errorsContainer.innerHTML = errors.length > 0 
                ? errors.map(error => `<div class="modal__message modal__message_error">${error}</div>`).join('')
                : '';
        }

        return errors.length === 0;
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private isValidPhone(phone: string): boolean {
        const phoneRegex = /^\+?[78][-\(]?\d{3}\)?-?\d{3}-?\d{2}-?\d{2}$/;
        return phoneRegex.test(phone);
    }

    private completeOrder(): void {
        console.log('Complete order with:', {
            orderData: this.orderData,
            contactsData: this.contactsData,
            items: this.basketItems,
            total: this.totalPrice
        });
        
        this.eventEmitter.emit('order:success', {
            orderData: this.orderData,
            contactsData: this.contactsData,
            items: this.basketItems,
            total: this.totalPrice
        });
    }
}