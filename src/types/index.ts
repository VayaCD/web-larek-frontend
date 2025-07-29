export type TOrderPayment = 'cash' | 'card';

export interface IOrder {
	items: IProduct[];
	payment: TOrderPayment;
	address: string;
	email: string;
	phone: string;
}

export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

export type TOrderStep = 'shipment' | 'contacts';

export interface IAppState {
    preview: IProduct;
	basket: Set<IProduct>;
	products: IProduct[];
	order: IOrder;
}