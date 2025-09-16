import './scss/styles.scss';
import { Modal } from './components/base/Global/Modal';
import { ProductsApi, IOrder } from './components/base/Global/Api';
import { EventEmitter } from './components/base/Base/events';
import { PreviewView } from './components/base/Global/PreviewView';
import { IProductItem } from './types';
import { BasketView } from './components/base/Global/BasketView';
import { Basket } from './components/base/Global/Basket';
import { OrderView } from './components/base/Global/OrderView';
import { ContactsView } from './components/base/Global/ContactsView';
import { SuccessView } from './components/base/Global/SuccessView';
import { BasketItem } from './components/base/Global/BasketItem';
import { HeaderView } from './components/base/Global/HeaderView';
import { GalleryView } from './components/base/Global/GalleryView';
import { Card } from './components/base/Global/Card';
import { Products } from './components/base/Global/Products';
import { Order } from './components/base/Global/Order';

const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
const events = new EventEmitter();
const api = new ProductsApi(API_URL);
const basket = new Basket(events);
const products = new Products(events);
const order = new Order(events);
const modal = new Modal(document.querySelector('#modal-container') as HTMLElement);

const previewView = new PreviewView(events);
const basketView = new BasketView(events);
const successView = new SuccessView(events);
const galleryView = new GalleryView();
const orderView = new OrderView(events);
const contactsView = new ContactsView(events);
const headerView = new HeaderView(events);


events.on('card:click', (data: { productId: string }) => {
    const product = products.getProductById(data.productId);
    if (!product) return;
    
    const items = basket.getItems();
    const isInBasket = items.some(item => item.id === product.id);
    
    previewView.setContent(product);
    previewView.setButtonState(isInBasket);
    const content = previewView.render();
    modal.setContent(content);
    modal.open();
});

events.on('basket:add', (data: { product: IProductItem }) => {
    basket.addItem(data.product);
});

events.on('basket:remove', (data: { productId: string }) => {
    basket.removeItem(data.productId);
});

document.addEventListener('basket:remove', (event: CustomEvent) => {
    events.emit('basket:remove', { productId: event.detail.productId });
});

events.on('basket:clear', () => {
    basket.clear();
});

events.on('basket:changed', () => {
    updateBasketState();
});

events.on('basket:request-list-update', () => {
    const basketItems = basket.getItems();
    const total = basketItems.reduce((sum, item) => sum + (item.price || 0), 0);
    
    const itemElements = basketItems.map((item, index) => {
        const basketItem = new BasketItem();
        basketItem.setContent(item, index);
        return basketItem.render();
    });
    
    basketView.setList(itemElements, total);
    
    if (modal.isOpen() && modal.getContent().querySelector('.basket')) {
        const content = basketView.render();
        modal.setContent(content);
    }
});


function updateBasketState(): void {
    const items = basket.getItems();
    headerView.updateBasketCounter(items.length);
    events.emit('basket:request-list-update');
}


events.on('product:add-to-basket', (data: { productId: string }) => {
    const product = products.getProductById(data.productId);
    if (product) {
        events.emit('basket:add', { product });
    }
});

events.on('basket:get-state', (data: { callback: (items: IProductItem[]) => void }) => {
    data.callback(basket.getItems());
});

events.on('header:basket-click', () => {
    const content = basketView.render();
    modal.setContent(content);
    modal.open();
});

events.on('basket:checkout', () => {
    const items = basket.getItems();
    const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
    modal.close();
    
    const content = orderView.render();
    modal.setContent(content);
    modal.open();
});


events.on('order:change', (data: { key: string; value: string }) => {
    if (data.key === 'payment') {
        const paymentType = data.value === 'card' ? 'online' : data.value === 'cash' ? 'cash' : '';
        order.updateFormData({
            payment: paymentType as 'online' | 'cash',
            address: order.getFormData()?.address || ''
        });
    } else if (data.key === 'address') {
        order.updateFormData({
            payment: order.getFormData()?.payment || 'online',
            address: data.value
        });
    }
});

events.on('order:validate', (data: { errors: { [key: string]: string } }) => {
    const errorMessages = Object.values(data.errors);
    orderView.setErrors(errorMessages);
});

events.on('order:submit', () => {
    modal.close();
    
    const content = contactsView.render();
    modal.setContent(content);
    modal.open();
});

events.on('contacts:change', (data: { key: string; value: string }) => {
    const currentContacts = order.getContacts();
    order.updateContacts({
        email: data.key === 'email' ? data.value : (currentContacts?.email || ''),
        phone: data.key === 'phone' ? data.value : (currentContacts?.phone || '')
    });
});

events.on('contacts:validate', (data: { errors: { [key: string]: string } }) => {
    const errorMessages = Object.values(data.errors);
    contactsView.setErrors(errorMessages);
});

events.on('contacts:submit', () => {
    events.emit('order:final-submit', {
        contactsData: order.getContacts()
    });
});

events.on('order:final-submit', async (data: any) => {
    try {
        
        const basketItems = basket.getItems();
        const basketTotal = basketItems.reduce((sum, item) => sum + (item.price || 0), 0);
        const basketItemIds = basketItems.map(item => item.id);
        
        const formData = order.getFormData();
        const contacts = order.getContacts();
        
        if (!formData || !contacts) {
            throw new Error('Не все данные заказа заполнены');
        }
        
        const orderData = {
            payment: formData.payment,
            address: formData.address,
            email: contacts.email,
            phone: contacts.phone,
            total: basketTotal,
            items: basketItemIds
        };
        
        const response = await api.createOrder(orderData);
        const orderId = response.id;
        
        order.setOrderId(orderId);
        
        basket.clear();
        order.clear();

        modal.close();
        successView.setContent(basketTotal);
        const content = successView.render();
        modal.setContent(content);
        modal.open();
        
    } catch (error) {
        alert('Произошла ошибка при оформлении заказа: ' + error);
    }
});

events.on('order:complete', () => {
    modal.close();
});

events.on('modal:close', () => {
    modal.close();
});

async function initProducts() {
    try {
        const loadedProducts = await api.getProducts();
        
        products.setProducts(loadedProducts);
        
        const cards = createProductCards(loadedProducts);
        
        galleryView.renderCards(cards);
    } catch (error) {
    }
}

function createProductCards(products: IProductItem[]): HTMLElement[] {
    return products.map(product => {
        const card = new Card(events);
        card.render(product);
        return card.getElement();
    });
}

initProducts();

