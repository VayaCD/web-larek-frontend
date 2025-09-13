export class Modal {
    element: HTMLElement;
    private closeButton: HTMLElement;
    private originalBodyStyle: string;
    private modalContent: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
        
        this.closeButton = this.element.querySelector('.modal__close') as HTMLElement;
        if (!this.closeButton) {
            throw new Error('Кнопка закрытия не найдена в модальном окне');
        }

        this.modalContent = this.element.querySelector('.modal__content') as HTMLElement;
        if (!this.modalContent) {
            throw new Error('Контент модального окна не найден');
        }

        this.closeButton.addEventListener('click', () => this.close());
        this.setupOutsideClickHandler();
        this.originalBodyStyle = '';
    }

    private setupOutsideClickHandler(): void {
        this.element.addEventListener('click', (event: MouseEvent) => {
            if (event.target === this.element) {
                this.close();
            }
        });
    }

    private disableBodyScroll(): void {
        const scrollY = window.scrollY;
        this.originalBodyStyle = document.body.style.cssText;
        
        document.body.style.cssText = `
            position: fixed;
            top: -${scrollY}px;
            left: 0;
            width: 100%;
            overflow: hidden;
        `;
    }

    private enableBodyScroll(): void {
        document.body.style.cssText = this.originalBodyStyle;
        
        const scrollY = document.body.style.top;
        if (scrollY) {
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
    }

    close(): void {
        this.element.classList.remove('modal_active');
        this.enableBodyScroll();
    }

    open(): void {
        this.element.classList.add('modal_active');
        this.disableBodyScroll();
    }

    setContent(content: HTMLElement | DocumentFragment): void {
        this.modalContent.innerHTML = '';
        this.modalContent.appendChild(content);
    }

    clearContent(): void {
        this.modalContent.innerHTML = '';
    }

    getContent(): HTMLElement {
        return this.modalContent;
    }
}