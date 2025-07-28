# Проектная работа "Веб-ларек"
git@github.com:VayaCD/web-larek-frontend.git

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные
Название товара
Описание товара
Цена товара
Категория товара
Изображение товара
Способ оплаты
Адрес доставки
Почта
Телефон

## Объекты
Товар
Данные покупателя --> Действия:
						Выбор оплаты и адреса
						Указание почты и телефона
						Очистка данных

## Коллекции
Каталог товаров --> Действия:
						Заполнить каталог
						Получиь каталог
Корзина с товарами --> Действия:
						Добавлять корзину
						Удалять из корзины
						Очищать корзину
						Получить список
						
## Компоненты
Карточка товара
Форма

## Model-View-Controller
1. Главная страница		   -->
2. Модальное окно товара   --> --> Карточка товара ---> Модель товара
3. Модальное окно корзины  -->

1. Модальное окно форма оплаты	   --> 
										--> Форма ---> Данные покупателя
2. Модальное окно форма контактов  -->

## Базовые типы
Для описания возможных способов оплаты заказа используется тип `TOrderPayment`:

```ts
type TOrderPayment = 'cash' | 'card';
```

Для описания заказа используется интерфейс `IOrder`:

```ts
interface IOrder {
	items: IProduct[];
	payment: TOrderPayment;
	address: string;
	email: string;
	phone: string;
}
```

Для описания товара используется интерфейс `IProduct`:

```ts
interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}
```

В качестве набора HTTP методов использует тип `TApiPostMethods`:

```ts
type TApiPostMethods = 'POST' | 'PUT' | 'DELETE'
```
		## Модели данных (Model)

### Класс `AppState`

Модель данных приложения. По сути является неким глобальным хранилищем данных с набором методов для контролирования 
общего процесса работы приложения (добавление товаров в корзину, детальный просмотр товара, заполнение полей заказа и тд). В данном случае выполняет роль распределителя между товарами, корзиной и заказом

Содержит поля интерфейса `IAppState`:

```ts
interface IAppState {
	preview: IProduct;
	basket: Set<IProduct>;
	products: IProduct[];
	order: IOrder;
}
```

Имеет базовый набор методов для управления приложением:

```ts
// Установка этапа оформления заказа
setStep(value: TOrderStep) {}

// Установка поля заказа
setOrderField(field: keyof IOrder, value: unknown) {}

// Проверка валидности текущего заказа
getOrderIsValid() {}

// Получение ошибок текущего заказа
getOrderErrors() {}

// Получение полей заказа в виде для взаимодействия с API
getOrderInvoice() {}

// Инициализация нового заказа
initOrder() {}

// Сброс всех полей заказа
resetOrder() {}

// Установка товаров каталога
setProductsItems(value: IProduct[]) {}

// Проверка на наличие товара в корзине
getBasketIsContains(id: string) {}

// Добавление товара в корзину
addBasketItem(value: IProduct) {}

// Удаление товара из корзины
removeBasketItem(id: string) {}

// Сброс текущего состояния корзины
resetBasket() {}

// Инициализация корзины
initBasket() {}

// Получение цены позиций в корзине
getBasketPrice() {}

// Установка текущего просматриваемого элемента
setPreview(value: IProduct) {}
```

Доступные события для использования объектом класса `EventEmitter` описаны перечислением `AppStateEvents`:

```ts
enum AppStateEvents {
	// Событие возникающее при изменении списка товаров каталога
	PRODUCTS_UPDATE = 'products:update',
	// Событие возникающее при изменении preview
	PREVIEW_UPDATE = 'preview:update',
	// Событие возникающее при инициализации корзины
	BASKET_INIT = 'basket:init',
	// Событие возникающее при изменении товаров в корзине
	BASKET_UPDATE = 'basket:update',
	// Событие возникающее при сбросе корзины
	BASKET_RESET = 'basket:reset',
	// Событие возникающее при изменении этапа заказа
	ORDER_STEP = 'order:step',
	// Событие возникающее при изменении поля заказа
	ORDER_UPDATE = 'order:update',
	// Событие возникающее при сбросе заказа
	ORDER_RESET = 'order:reset',
}
```

- Событие `PRODUCTS_UPDATE` возникает при вызове метода `setProductsItems` и в качестве данных 
передает объект с полем `data`, поле `data` - объект, содержит поле `items` - текущий список элементов каталога (каждый элемент списка реализует интерфейс `IProduct`)

- Событие `PREVIEW_UPDATE` возникает при вызове метода `setPreview` и в качестве данных 
передает объект с полем `data`, поле `data` - объект, содержит поле `item` - текущий просматриваемый товар (товар реализует интерфейс `IProduct`)

- Событие `BASKET_INIT` возникает при вызове метода `initBasket` и в качестве данных 
передает объект с полем `data`, поле `data` - объект, содержит поле `items` - текущий список элементов корзины (каждый элемент списка реализует интерфейс `IProduct`)

- Событие `BASKET_UPDATE` возникает при вызове методов `addBasketItem` и `removeBasketItem` и в качестве данных 
передает объект с полем `data`, поле `data` - объект, содержит поле `items` - текущий список элементов корзины (каждый элемент списка реализует интерфейс `IProduct`)

- Событие `BASKET_RESET` возникает при вызове метода `resetBasket` и в качестве данных 
передает объект с полем `data`, поле `data` - объект, содержит поле `items` - текущий список элементов корзины (каждый элемент списка реализует интерфейс `IProduct`)

- Событие `ORDER_STEP` возникает при вызове метода `setStep` и в качестве данных 
передает объект с полем `data`, поле `data` - объект, содержит поле `step` - текущий этап оформления заказа (шаг принадлежит типу `TOrderStep`)

- Событие `ORDER_UPDATE` возникает при вызове метода `setOrderField` и в качестве данных 
передает объект с полем `data`, поле `data` - объект, содержит поле `field` - поле заказа (поле является ключем интерфейса `IOrder`) и поле `value` - значение поля заказа

- Событие `ORDER_RESET` возникает при вызове метода `resetOrder`, не содержит передаваемых данных


		## Отображения (View)

### Глобальные компоненты 

Данный набор компонентов необходим для работы со страницей

#### Класс `Page` 

Отображение самой страницы. Контролирует возможность скроллинга 

Наследуется от `View`. При рендеринге использует поля типа `TPageRenderArgs`:

```ts
type TPageRenderArgs = {
	isLocked: boolean;
};
```

#### Класс `Header`

Отображение хедера страницы. Содержит отображение счетчика корзины, а также предоставляет возможность по клику на иконку корзины совершать определенные действия

Наследуется от `View`. При рендеринге использует поля типа `THeaderRenderArgs`:

```ts
type THeaderRenderArgs = {
	counter: number;
};
```

Доступный список событий описан типом `THeaderEventHandlers`:

```ts
type THeaderEventHandlers = {
	onClick?: (args: { _event: MouseEvent }) => void;
};
```

#### Класс `Modal`

Отображение модального окна. Предоставляет методы для открытия и закрытия модального окна страницы, а также контролирует собственное содержимое

Наследуется от `View`. При рендеринге использует поля типа `TModalRenderArgs`:

```ts
type TModalRenderArgs<T extends object> = {
	content: TViewNested<T>;
};
```

Имеет базовый набор методов для управления активностью модального окна:

```ts
// Открыть модальное окно
open() {}
// Закрыть модальное окно
close() {}
```

Доступные события для использования объектом класса `EventEmitter` описаны перечислением `ModalEvents`:

```ts
enum ModalEvents {
	// Закрытие модального окна
	CLOSE = 'modal:close',
	// Открытие модального окна
	OPEN = 'modal:open',
}
```

- Событие `CLOSE` возникает при вызове метода `open`, не содержит передаваемых данных

- Событие `OPEN` возникает при вызове метода `close`, не содержит передаваемых данных

#### Класс `Form` 

Отображение формы. Контролирует отображение ошибок валидации формы, предоставляет возможности по прослушиванию событий отправки формы, а также внесения изменений в поля формы 

Наследуется от `View`. При рендеринге использует поля типа `TFormRenderArgs`:

```ts
type TFormRenderArgs = {
	isDisabled: boolean;
	errors: string[];
};
```

Доступный список событий описан типом `TFormEventHandlers`:

```ts
type TFormEventHandlers = {
	onSubmit?: (args: { _event: SubmitEvent }) => void;
	onInput?: (args: {
		_event: InputEvent;
		field: string;
		value: unknown;
	}) => void;
};
```

		### Компоненты корзины

Данный набор компонентов необходим для работы с пользовательской корзиной 

#### Класс `Basket`

Отображение корзины. Содержит набор позиций корзины, общую сумму позиций, а также предоставляет возможность совершения действий по клику на кнопку оформления

Наследуется от `View`. При рендеринге использует поля типа `TBasketRenderArgs`:

```ts
type TBasketRenderArgs<T extends object> = {
	items: TViewNested<T>[];
	price: string;
	isDisabled: boolean;
};
```

Доступный список событий описан типом `TBasketEventHandlers`:

```ts
type TBasketEventHandlers = {
	onClick?: (args: { _event: MouseEvent }) => void;
};
```

#### Класс `BasketItem`

Отображение позиции в корзине. Отображает характеристики товара позиции, предоставляет возможность совершать действия по клику на иконку удаления позиции

Наследуется от `View`. При рендеринге использует поля типа `TBasketItemRenderArgs`:

```ts
type TBasketItemRenderArgs = {
	index: number;
	title: string;
	price: string;
};
```

Доступный список событий описан типом `TBasketItemEventHandlers`:

```ts
type TBasketItemEventHandlers = {
	onClick?: (args: { _event: MouseEvent }) => void;
};
```

		### Компоненты заказа 

Данный набор компонентов необходим для работы с пользовательским заказов 

#### Класс `OrderShipment`

Отображение формы заказа с полями способ оплаты, адрес доставки. Наследует возможности компонента формы, управляет состоянием полей способа оплаты и адреса доставки, предоставляет возможность при отправке формы совершать определенные действия

Наследуется от `Form`. При рендеринге использует поля типа `TOrderShipmentRenderArgs`:

```ts
type TOrderShipmentRenderArgs = {
	payment: string;
	address: string;
} & TFormRenderArgs;
```

Использует список событий типа `TFormEventHandlers`

#### Класс `OrderContacts`

Отображение формы заказа с полями email, телефон. Наследует возможности компонента формы, управляет состоянием полей email и адреса телефона, предоставляет возможность при отправке формы совершать определенные действия

Наследуется от `Form`. При рендеринге использует поля типа `TOrderContactsRenderArgs`:

```ts
type TOrderContactsRenderArgs = {
	email: string;
	phone: string;
} & TFormRenderArgs
```

Использует список событий типа `TFormEventHandlers`

#### Класс `OrderSuccess`

Отображение успешности оформления заказа. Содержит информацию о потраченных ресурсах при успешном оформлении заказа

Наследуется от `View`. При рендеринге использует поля типа `TOrderSuccessRenderArgs`:

```ts
type TOrderSuccessRenderArgs = {
	description: string;
};
```

Доступный список событий описан типом `TOrderSuccessEventHandlers`:

```ts
type TOrderSuccessEventHandlers = {
	onClick?: (args: { _event: MouseEvent }) => void;
};
```

		### Компоненты товаров

Данный набор компонентов необходим для работы с отображением товаров магазина

#### Класс `Products`

Отображение списка товаров. Содержит набор текущих товаров магазина

Наследуется от `View`. При рендеринге использует поля типа `TProductsRenderArgs`:

```ts
type TProductsRenderArgs<T extends object> = {
	items: TViewNested<T>[];
};
```

#### Класс `Product`

Отображение товара. Содержит частичные характеристики товара, а также предоставляет возможность по клику на товар совершать определенные действия

Наследуется от `View`. При рендеринге по умолчанию использует поля типа `TProductRenderArgs`:

```ts
type TProductRenderArgs = Pick<IProduct, 'image' | 'title' | 'category'> & {
	price: string;
	color: string | null;
};
```

Доступный список событий по умолчанию описан типом `TProductEventHandlers`:

```ts
type TProductEventHandlers = {
	onClick?: (args: { _event: MouseEvent }) => void;
}
```

#### Класс `ProductPreview`

Детальное отображение товара. Содержит полные характеристики товара, а также предоставляет возможность по клику на кнопку совершать определенные действия

Наследуется от `Product`. При рендеринге использует поля типа `TProductPreviewRenderArgs`:

```ts
type TProductPreviewRenderArgs = {
	description: string;
	buttonText: string;
	isDisabled: boolean;
} & TProductRenderArgs
```

Использует список событий типа `TProductEventHandlers`