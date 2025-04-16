// Определение возможных комбо
const validCombos = [
    { soup: true, main: true, salad: true, drink: true },  // Комбо 1
    { soup: true, main: true, drink: true },               // Комбо 2
    { soup: true, salad: true, drink: true },             // Комбо 3
    { main: true, salad: true, drink: true },             // Комбо 4
    { main: true, drink: true }                           // Комбо 5
];

// Функция проверки соответствия заказа одному из комбо
function checkCombo(order) {
    return validCombos.some(combo => {
        return Object.keys(combo).every(item => {
            if (combo[item]) return order[item];
            return true;
        });
    });
}

// Функция создания и отображения уведомления
function showNotification(message) {
    // Создаем overlay для уведомления
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';

    // Создаем контейнер уведомления
    const notification = document.createElement('div');
    notification.className = 'notification';

    // Создаем текст уведомления
    const text = document.createElement('p');
    text.textContent = message;
    notification.appendChild(text);

    // Создаем кнопку закрытия
    const button = document.createElement('button');
    button.textContent = 'Окей';
    button.onclick = () => {
        overlay.remove();
    };
    notification.appendChild(button);

    // Добавляем элементы в DOM
    overlay.appendChild(notification);
    document.body.appendChild(overlay);
}

// Функция определения недостающих блюд
function getMissingItems(order) {
    if (Object.values(order).every(v => !v)) {
        return 'Ничего не выбрано. Выберите блюда для заказа';
    }

    if (!order.drink && (order.soup || order.main || order.salad)) {
        return 'Выберите напиток';
    }

    if (order.soup && !order.main && !order.salad) {
        return 'Выберите главное блюдо/салат/стартер';
    }

    if (order.salad && !order.soup && !order.main) {
        return 'Выберите суп или главное блюдо';
    }

    if ((order.drink || order.dessert) && !order.main && !order.soup) {
        return 'Выберите главное блюдо';
    }

    return null;
}

// Обработчик отправки формы
document.querySelector('form').addEventListener('submit', function(e) {
    const order = {
        soup: !!document.getElementById('soup').value,
        main: !!document.getElementById('main').value,
        salad: !!document.getElementById('salad').value,
        drink: !!document.getElementById('drink').value,
        dessert: !!document.getElementById('dessert').value
    };

    const missingItems = getMissingItems(order);
    
    if (missingItems || !checkCombo(order)) {
        e.preventDefault();
        if (missingItems) {
            showNotification(missingItems);
        }
    }
}); 