// Массив допустимых комбинаций блюд
const validCombos = [
    { soup: 1, main: 1, salad: 1, drink: 1 },  // Комбо 1
    { soup: 1, main: 1, drink: 1 },            // Комбо 2
    { main: 1, salad: 1, drink: 1 },           // Комбо 3
    { soup: 1, main: 1 },                      // Комбо 4
    { main: 1, drink: 1 }                      // Комбо 5
];

// Проверка соответствия заказа одному из комбо
function checkCombo(order) {
    return validCombos.some(combo => {
        return Object.keys(combo).every(type => {
            return order[type] === combo[type];
        });
    });
}

// Функция создания и отображения уведомления
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

// Проверка корректности заказа
function getMissingItems(order) {
    const totalItems = Object.values(order).reduce((sum, count) => sum + count, 0);
    
    if (totalItems === 0) {
        return "Пожалуйста, выберите блюда для заказа";
    }

    // Проверяем каждое комбо и находим, какое ближе всего к текущему заказу
    let bestComboMatch = null;
    let minMissing = Infinity;
    
    validCombos.forEach(combo => {
        const missing = [];
        Object.entries(combo).forEach(([type, required]) => {
            if (!order[type]) {
                missing.push(type);
            }
        });
        
        if (missing.length < minMissing) {
            minMissing = missing.length;
            bestComboMatch = { combo, missing };
        }
    });

    if (bestComboMatch) {
        const typeNames = {
            soup: "суп",
            main: "главное блюдо",
            salad: "салат",
            drink: "напиток"
        };

        if (bestComboMatch.missing.length > 0) {
            const missingNames = bestComboMatch.missing
                .map(type => typeNames[type])
                .join(" и ");
            return `Для полного комбо не хватает: ${missingNames}`;
        }
    }
    
    if (!checkCombo(order)) {
        return "Выбранные блюда не соответствуют ни одному из доступных комбо. Пожалуйста, проверьте состав комбо и попробуйте снова.";
    }
    
    return null;
}

// Обработчик отправки формы
document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const order = {
        soup: 0,
        main: 0,
        salad: 0,
        drink: 0,
        dessert: 0
    };
    
    // Собираем данные о выбранных блюдах из select элементов
    const selectElements = {
        soup: document.getElementById('soup'),
        main: document.getElementById('main'),
        salad: document.getElementById('salad'),
        drink: document.getElementById('drink'),
        dessert: document.getElementById('dessert')
    };

    // Проверяем выбранные значения
    Object.entries(selectElements).forEach(([type, select]) => {
        if (select.value) {
            order[type] = 1;
        }
    });
    
    const errorMessage = getMissingItems(order);
    if (errorMessage) {
        showNotification(errorMessage);
        return;
    }
    
    // Если всё в порядке, показываем сообщение об успехе
    showNotification("Ваш заказ успешно оформлен!");
}); 