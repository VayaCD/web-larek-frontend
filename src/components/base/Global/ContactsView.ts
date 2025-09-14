import { EventEmitter } from '../Base/events';
import { IProductItem } from '../../../types';

interface ContactsData {
    email: string;
    phone: string;
}

export class ContactsView {
    private contactsData: ContactsData = {
        email: '',
        phone: ''
    };
    private orderData: any = {};
    private basketItems: IProductItem[] = [];
    private totalPrice: number = 0;

    constructor(private eventEmitter: EventEmitter) {}

    updateData(orderData: any, basketItems: IProductItem[], totalPrice: number): void {
        this.orderData = orderData;
        this.basketItems = basketItems;
        this.totalPrice = totalPrice;
        this.contactsData = {
            email: '',
            phone: ''
        };
    }

    public render(): HTMLElement {
        const template = document.querySelector('#contacts') as HTMLTemplateElement;
        const content = template.content.cloneNode(true) as DocumentFragment;
        const element = content.firstElementChild as HTMLElement;

        this.setupEventListeners(element);
        return element;
    }

    private setupEventListeners(element: HTMLElement): void {
        const inputs = element.querySelectorAll('input[type="text"]');
        const emailInput = inputs[0] as HTMLInputElement;
        const phoneInput = inputs[1] as HTMLInputElement;
        const payButton = element.querySelector('.button') as HTMLButtonElement;
        const errorsContainer = element.querySelector('.form__errors') as HTMLElement;

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
            contactsData: this.contactsData
        });
        
        this.eventEmitter.emit('order:submit', {
            orderData: this.orderData,
            contactsData: this.contactsData
        });
    }
}
