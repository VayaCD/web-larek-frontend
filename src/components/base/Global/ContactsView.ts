import { EventEmitter } from '../Base/events';

export class ContactsView {
    private template: HTMLTemplateElement;
    private container: HTMLElement;
    private emailInput: HTMLInputElement;
    private phoneInput: HTMLInputElement;
    private payButton: HTMLButtonElement;
    private errorsContainer: HTMLElement;

    constructor(private eventEmitter: EventEmitter) {
        this.template = document.querySelector('#contacts') as HTMLTemplateElement;
        
        const content = this.template.content.cloneNode(true) as DocumentFragment;
        this.container = content.firstElementChild as HTMLElement;
        
        const inputs = this.container.querySelectorAll('input[type="text"]');
        this.emailInput = inputs[0] as HTMLInputElement;
        this.phoneInput = inputs[1] as HTMLInputElement;
        this.payButton = this.container.querySelector('.button') as HTMLButtonElement;
        this.errorsContainer = this.container.querySelector('.form__errors') as HTMLElement;
        
        this.setupEventListeners();
    }

    public render(): HTMLElement {
        return this.container;
    }

    private setupEventListeners(): void {
        this.emailInput.addEventListener('input', () => {
            this.eventEmitter.emit('contacts:change', { key: 'email', value: this.emailInput.value });
        });

        this.phoneInput.addEventListener('input', () => {
            this.eventEmitter.emit('contacts:change', { key: 'phone', value: this.phoneInput.value });
        });

        this.payButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.eventEmitter.emit('contacts:submit');
        });
    }

    public setErrors(errors: string[]): void {
        this.payButton.disabled = errors.length > 0;
        this.errorsContainer.innerHTML = errors.length > 0 
            ? errors.map(error => `<div class="modal__message modal__message_error">${error}</div>`).join('')
            : '';
    }

    public reset(): void {
        this.emailInput.value = '';
        this.phoneInput.value = '';
        
        this.errorsContainer.innerHTML = '';
        this.payButton.disabled = false;
    }
}
