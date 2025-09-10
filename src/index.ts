import './scss/styles.scss';
import { Modal } from './components/base/Global/Modal';
import { ProductsApi, IOrder } from './components/base/Global/Api';
import { Card } from './components/base/Global/Card';
import { EventEmitter } from './components/base/Base/events';
import { PreviewModal } from './components/base/Global/PreviewModal';
import { IProductItem } from './types';
import { BasketModal } from './components/base/Global/BasketModal';
import { Basket } from './components/base/Global/Basket';
import { OrderModal } from './components/base/Global/OrderModal';
import { ContactsModal } from './components/base/Global/ContactsModal';
import { SuccessModal } from './components/base/Global/SuccessModal';


// Инициализация API
const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
const events = new EventEmitter();
const api = new ProductsApi(API_URL);

// Инициализация корзины
const basket = new Basket(events);

// Инициализация модальных окон
const previewModal = new PreviewModal(document.querySelector('#modal-container') as HTMLElement, events);
const basketModal = new BasketModal(document.querySelector('#basket-modal') as HTMLElement, events);
const orderModal = new OrderModal(document.querySelector('#order-modal') as HTMLElement, events, [], 0);
const contactsModal = new ContactsModal(document.querySelector('#contacts-modal') as HTMLElement, events, {}, [], 0);
const successModal = new SuccessModal(document.querySelector('#success-modal') as HTMLElement, events);
let currentOrderData: any = {};
let currentBasketItems: IProductItem[] = [];
let currentTotalPrice: number = 0;

events.on('card:click', (data: { data: IProductItem }) => {
    previewModal.show(data.data);
});
// Обработка добавления в корзину из модалки предпросмотра
events.on('product:add-to-basket', (data: { product: IProductItem }) => {
    basket.addItem(data.product);
});

events.on('basket:get-state', (data: { callback: (items: IProductItem[]) => void }) => {
    data.callback(basket.getItems());
});

// Обработка клика по кнопке корзины в шапке
const basketButton = document.querySelector('.header__basket');
if (basketButton) {
    basketButton.addEventListener('click', () => {
        basketModal.show();
    });
}

// Оформление заказа из корзины
events.on('basket:checkout', (data: { items: IProductItem[], total: number }) => {
    currentBasketItems = data.items;
    currentTotalPrice = data.total;
    console.log('Basket checkout:', { items: currentBasketItems, total: currentTotalPrice });
    basketModal.close();
    orderModal.show();
});

// Завершение первого шага заказа
events.on('order:step1-complete', (orderData: any) => {
    currentOrderData = { ...orderData };
    console.log('Order step1 complete:', currentOrderData);
    orderModal.close();
    
    const contactsModal = new ContactsModal(
        document.querySelector('#contacts-modal') as HTMLElement,
        events,
        currentOrderData,
        currentBasketItems, 
        currentTotalPrice  
    );
    contactsModal.show();
});

// Успешное оформления заказа
events.on('order:success', async (data: any) => {
    try {
        console.log('Order success data:', data);
        
        if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
            throw new Error('Корзина пуста. Невозможно оформить заказ.');
        }

        const itemIds = data.items.map((item: IProductItem) => {
            if (!item.id) {
                console.error('Item without ID:', item);
                throw new Error('Товар без ID обнаружен в корзине');
            }
            return item.id;
        });

        console.log('Item IDs to send:', itemIds);

        const order: IOrder = {
            payment: data.orderData.paymentMethod,
            email: data.contactsData.email,
            phone: data.contactsData.phone,
            address: data.orderData.address,
            total: data.total,
            items: itemIds
        };

        console.log('Sending order to server:', JSON.stringify(order, null, 2));

        // Отправка заказа на сервер
        const response = await api.createOrder(order);
        console.log('Order created successfully:', response);
        
        basket.clear();
        console.log('Basket cleared after successful order');

        // Закрытие модалки контактов и показ успеха
        contactsModal.close();
        successModal.show(data.total);
        
    } catch (error) {
        console.error('Failed to create order:', error);
        alert('Произошла ошибка при оформлении заказа: ' + error);
    }
});

// Полное завершение заказа
events.on('order:complete', () => {
    basket.clear();
    successModal.close();
    currentOrderData = {};
});

// Загрузка и отображение карточек
function initProducts() {
    const gallery = document.querySelector('.gallery');
    if (!gallery) {
        console.error('Gallery element not found');
        return;
    }

    api.getProducts()
        .then(products => {
            if (!Array.isArray(products)) {
                console.error('Invalid API response format:', products);
                return;
            }
            
            products.forEach(product => {
                const card = new Card(product, events);
                gallery.appendChild(card.getElement());
            });
        })
        .catch(error => {
            console.error('Подробности ошибки:', {
                message: error.message,
                status: error.status,
                url: API_URL + '/product'
            });
        });
}

// Инициализация модальных окон
const modalElements = document.querySelectorAll('.modal');
modalElements.forEach(modalElement => {
    new Modal(modalElement as HTMLElement);
});

// Загрузка продуктов
initProducts();

