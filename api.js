// URL API для загрузки блюд
const API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';

// Функция для отображения уведомлений
function showNotification(message) {
    // Удаляем существующее уведомление, если оно есть
    const existingOverlay = document.querySelector('.notification-overlay');
    if (existingOverlay) {
        document.body.removeChild(existingOverlay);
    }

    // Создаем новый overlay для уведомления
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    
    // Создаем контейнер уведомления
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    // Создаем текст уведомления
    const text = document.createElement('p');
    text.textContent = message;
    
    // Создаем кнопку закрытия
    const button = document.createElement('button');
    button.textContent = 'Хорошо';
    button.onclick = () => document.body.removeChild(overlay);
    
    // Добавляем элементы в DOM
    notification.appendChild(text);
    notification.appendChild(button);
    overlay.appendChild(notification);
    document.body.appendChild(overlay);
}

// Функция для загрузки данных о блюдах
async function loadDishes() {
    try {
        console.log('Начинаем загрузку данных...');
        const response = await fetch(API_URL);
        console.log('Ответ получен:', response);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const dishes = await response.json();
        console.log('Данные получены:', dishes);
        
        // Преобразуем данные в нужный формат
        const formattedDishes = dishes.map(dish => ({
            keyword: dish.keyword,
            name: dish.name,
            price: dish.price,
            category: dish.category === 'main-course' ? 'main' : dish.category,
            count: dish.count,
            image: dish.image, // используем URL изображения как есть
            kind: dish.kind === 'veg' ? 'vegetarian' : dish.kind // преобразуем 'veg' в 'vegetarian'
        }));

        // Сохраняем данные в глобальной переменной menuItems
        window.menuItems = formattedDishes;
        
        // Обновляем опции в select элементах
        updateSelectOptions(formattedDishes);
        
        // Вызываем функцию отрисовки меню
        renderMenu();
        
        // Инициализируем обработчики событий
        initializeEventHandlers();
        
        return formattedDishes;
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        showNotification('Произошла ошибка при загрузке данных: ' + error.message);
    }
}

// Функция обновления опций в select элементах
function updateSelectOptions(dishes) {
    const selects = {
        soup: document.getElementById('soup'),
        main: document.getElementById('main'),
        salad: document.getElementById('salad'),
        drink: document.getElementById('drink'),
        dessert: document.getElementById('dessert')
    };

    // Очищаем и обновляем каждый select
    Object.entries(selects).forEach(([category, select]) => {
        if (!select) return;

        // Сохраняем первую опцию (placeholder)
        const placeholder = select.options[0];
        select.innerHTML = '';
        select.appendChild(placeholder);

        // Добавляем новые опции
        const categoryDishes = dishes.filter(dish => dish.category === category);
        categoryDishes.forEach(dish => {
            const option = document.createElement('option');
            option.value = dish.keyword;
            option.textContent = dish.name;
            select.appendChild(option);
        });
    });
}

// Функция для отрисовки меню
function renderMenu() {
    // Сортировка по алфавиту
    const sortedMenu = [...menuItems].sort((a, b) => a.name.localeCompare(b.name, 'ru'));

    // Объект с соответствиями категорий и их DOM-элементов
    const categories = {
        soup: document.querySelector('#soups .menu-items'),
        main: document.querySelector('#main-dishes .menu-items'),
        salad: document.querySelector('#salads .menu-items'),
        drink: document.querySelector('#drinks .menu-items'),
        dessert: document.querySelector('#desserts .menu-items')
    };

    // Очищаем все контейнеры
    Object.values(categories).forEach(container => {
        if (container) container.innerHTML = '';
    });

    // Группируем блюда по категориям
    const groupedItems = {};
    Object.keys(categories).forEach(category => {
        groupedItems[category] = sortedMenu
            .filter(item => item.category === category)
            .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    });

    // Отрисовываем блюда
    Object.entries(groupedItems).forEach(([category, items]) => {
        const container = categories[category];
        if (!container) return;

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'menu-item';
            card.setAttribute('data-dish', item.keyword);
            card.setAttribute('data-kind', item.kind);

            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}" width="150">
                <p>${item.name}</p>
                <p>${item.count}</p>
                <p>${item.price} ₽</p>
                <button type="button">Добавить</button>
            `;

            container.appendChild(card);
        });
    });
}

// Функция инициализации обработчиков событий
function initializeEventHandlers() {
    // Обработчики для фильтров
    document.querySelectorAll('.filters').forEach(filterContainer => {
        filterContainer.addEventListener('click', e => {
            if (!e.target.classList.contains('filter-btn')) return;
            
            const kind = e.target.getAttribute('data-kind');
            const section = e.target.closest('section');
            const items = section.querySelectorAll('.menu-item');
            
            if (e.target.classList.contains('active')) {
                items.forEach(item => item.style.display = '');
                e.target.classList.remove('active');
            } else {
                filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                items.forEach(item => {
                    item.style.display = item.getAttribute('data-kind') === kind ? '' : 'none';
                });
            }
        });
    });

    // Обновляем обработчики выбора блюд
    updateSelectHandlers();
}

// Функция обновления обработчиков выбора блюд
function updateSelectHandlers() {
    const selectSoup = document.getElementById('soup');
    const selectMain = document.getElementById('main');
    const selectSalad = document.getElementById('salad');
    const selectDrink = document.getElementById('drink');
    const selectDessert = document.getElementById('dessert');

    const priceBlock = document.createElement('div');
    priceBlock.className = 'order-total';
    if (!document.querySelector('.order-total')) {
        selectDessert.parentNode.appendChild(priceBlock);
    }

    function getSelectedDish(category, value) {
        return menuItems.find(d => d.category === category && d.keyword === value);
    }

    function updateSelectOptionText(select, category) {
        Array.from(select.options).forEach(option => {
            if (!option.value) return; // пропускаем плейсхолдер
            const dish = getSelectedDish(category, option.value);
            if (dish) {
                option.textContent = `${dish.name}  ${dish.price}₽`;
            }
        });
    }

    function updateTotal() {
        updateSelectOptionText(selectSoup, 'soup');
        updateSelectOptionText(selectMain, 'main');
        updateSelectOptionText(selectSalad, 'salad');
        updateSelectOptionText(selectDrink, 'drink');
        updateSelectOptionText(selectDessert, 'dessert');

        const soup = getSelectedDish('soup', selectSoup.value);
        const main = getSelectedDish('main', selectMain.value);
        const salad = getSelectedDish('salad', selectSalad.value);
        const drink = getSelectedDish('drink', selectDrink.value);
        const dessert = getSelectedDish('dessert', selectDessert.value);
        
        let total = 0;
        if (soup) total += soup.price;
        if (main) total += main.price;
        if (salad) total += salad.price;
        if (drink) total += drink.price;
        if (dessert) total += dessert.price;
        
        const priceBlock = document.querySelector('.order-total');
        if (priceBlock) {
            if (total > 0) {
                priceBlock.textContent = `Итого: ${total} ₽`;
            } else {
                priceBlock.textContent = '';
            }
        }
    }

    [selectSoup, selectMain, selectSalad, selectDrink, selectDessert].forEach(select => {
        select.addEventListener('change', updateTotal);
    });

    // Обработчики для карточек блюд
    document.querySelectorAll('.menu-items').forEach(section => {
        section.addEventListener('click', e => {
            const card = e.target.closest('.menu-item');
            if (!card) return;
            const keyword = card.getAttribute('data-dish');
            const dish = menuItems.find(d => d.keyword === keyword);
            if (!dish) return;
            
            if (dish.category === 'soup') selectSoup.value = dish.keyword;
            if (dish.category === 'main') selectMain.value = dish.keyword;
            if (dish.category === 'salad') selectSalad.value = dish.keyword;
            if (dish.category === 'drink') selectDrink.value = dish.keyword;
            if (dish.category === 'dessert') selectDessert.value = dish.keyword;
            
            updateTotal();
        });
    });

    updateTotal();
}

// Загружаем данные при загрузке страницы
document.addEventListener('DOMContentLoaded', loadDishes); 