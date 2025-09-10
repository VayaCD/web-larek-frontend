export class Modal {
    element: HTMLElement;
    private closeButton: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
        
        this.closeButton = this.element.querySelector('.modal__close') as HTMLElement;
        if (!this.closeButton) {
            throw new Error('Кнопка закрытия не найдена в модальном окне');
        }

        this.closeButton.addEventListener('click', () => this.close());
        this.setupOutsideClickHandler();
    }

    private setupOutsideClickHandler(): void {
        this.element.addEventListener('click', (event: MouseEvent) => {
            if (event.target === this.element) {
                this.close();
            }
        });
    }

    close(): void {
        this.element.classList.remove('modal_active');
    }

    open(): void {
        this.element.classList.add('modal_active');
    }
}