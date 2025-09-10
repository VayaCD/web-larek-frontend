import { Modal } from './Modal';
import { EventEmitter } from '../Base/events';
import { IProductItem } from '../../../types';

interface OrderData {
    paymentMethod: 'online' | 'cash' | null;
    address: string;
}

export class OrderModal extends Modal {
    private orderData: OrderData = {
        paymentMethod: null,
        address: ''
    };

    constructor(
        element: HTMLElement, 
        private eventEmitter: EventEmitter, 
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
        const template = document.querySelector('#order') as HTMLTemplateElement;
        const content = template.content.cloneNode(true) as DocumentFragment;

        const modalContent = this.element.querySelector('.modal__content');
        if (modalContent) {
            modalContent.innerHTML = '';
            modalContent.appendChild(content);
        }
    }

    private setupEventListeners(): void {
        const paymentButtons = this.element.querySelectorAll('.order__buttons button');
        const addressInput = this.element.querySelector('input[name="address"]') as HTMLInputElement;
        const nextButton = this.element.querySelector('.order__button') as HTMLButtonElement;
        const errorsContainer = this.element.querySelector('.form__errors') as HTMLElement;

paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                paymentButtons.forEach(btn => btn.classList.remove('button_alt-active'));
                button.classList.add('button_alt-active');
                
                const paymentMethod = button.getAttribute('name');
                console.log('Selected payment method:', paymentMethod);
                
                if (paymentMethod === 'card') {
                    this.orderData.paymentMethod = 'online';
                } else if (paymentMethod === 'cash') {
                    this.orderData.paymentMethod = 'cash';
                } else {
                    console.error('Invalid payment method:', paymentMethod);
                }
                
                console.log('Payment method set to:', this.orderData.paymentMethod);
                this.validateForm(nextButton, errorsContainer);
            });
        });

        if (addressInput) {
            addressInput.addEventListener('input', () => {
                this.orderData.address = addressInput.value.trim();
                this.validateForm(nextButton, errorsContainer);
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.validateForm(nextButton, errorsContainer)) {
                    console.log('Order step1 complete with:', {
                        orderData: this.orderData,
                        basketItems: this.basketItems,
                        totalPrice: this.totalPrice
                    });
                    
                    this.eventEmitter.emit('order:step1-complete', {
                        ...this.orderData,
                        basketItems: this.basketItems,
                        totalPrice: this.totalPrice
                    });
                }
            });
        }
    }

    private validateForm(nextButton: HTMLButtonElement, errorsContainer: HTMLElement): boolean {
        const errors: string[] = [];

        if (!this.orderData.paymentMethod) {
            errors.push('Выберите способ оплаты');
        }

        if (!this.orderData.address) {
            errors.push('Введите адрес доставки');
        }

        nextButton.disabled = errors.length > 0;

        if (errorsContainer) {
            errorsContainer.innerHTML = errors.length > 0 
                ? errors.map(error => `<div class="modal__message modal__message_error">${error}</div>`).join('')
                : '';
        }

        return errors.length === 0;
    }
}