import { EventEmitter } from '../Base/events';

export class OrderView {
    private template: HTMLTemplateElement;
    private container: HTMLElement;
    private paymentButtons: NodeListOf<HTMLButtonElement>;
    private addressInput: HTMLInputElement;
    private nextButton: HTMLButtonElement;
    private errorsContainer: HTMLElement;

    constructor(private eventEmitter: EventEmitter) {
        this.template = document.querySelector('#order') as HTMLTemplateElement;
        
        const content = this.template.content.cloneNode(true) as DocumentFragment;
        this.container = content.firstElementChild as HTMLElement;
        
        this.paymentButtons = this.container.querySelectorAll('.order__buttons button');
        this.addressInput = this.container.querySelector('input[name="address"]') as HTMLInputElement;
        this.nextButton = this.container.querySelector('.order__button') as HTMLButtonElement;
        this.errorsContainer = this.container.querySelector('.form__errors') as HTMLElement;
        
        this.setupEventListeners();
    }

    public render(): HTMLElement {
        return this.container;
    }

    private setupEventListeners(): void {
        this.paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.paymentButtons.forEach(btn => btn.classList.remove('button_alt-active'));
                button.classList.add('button_alt-active');
                this.eventEmitter.emit('order:change', { key: 'payment', value: button.getAttribute('name') });
            });
        });

        this.addressInput.addEventListener('input', () => {
            this.eventEmitter.emit('order:change', { key: 'address', value: this.addressInput.value });
        });

        this.nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.eventEmitter.emit('order:submit');
        });
    }

    public setErrors(errors: string[]): void {
        this.nextButton.disabled = errors.length > 0;
        this.errorsContainer.innerHTML = errors.length > 0 
            ? errors.map(error => `<div class="modal__message modal__message_error">${error}</div>`).join('')
            : '';
    }

    public reset(): void {
        this.paymentButtons.forEach(btn => btn.classList.remove('button_alt-active'));
        
        this.addressInput.value = '';
        
        this.errorsContainer.innerHTML = '';
        this.nextButton.disabled = false;
    }
}
