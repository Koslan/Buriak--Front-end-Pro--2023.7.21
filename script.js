let currentPage = 1;
const itemsPerPage = 10;
let categories = [];

function computeData() {
  categories = ["Сховати", ...new Set(booksData.map((book) => book.category))];
  renderCategories();
  // Initially, don't show any books
  renderBooks([]);
}

function renderCategories() {
  const categoryList = document.getElementById("category-list");
  const allButton = document.querySelector('#category-list button[data-category="all"]');
  if (allButton) {
    allButton.addEventListener("click", () => handleCategoryFilter("all"));
  }
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.classList.add("btn", "btn-light");
    button.textContent = category;
    button.dataset.category = category;
    button.addEventListener("click", () => handleCategoryFilter(category));
    categoryList.appendChild(button);
  });
}

function handleCategoryFilter(category) {
  const categoryButtons = document.querySelectorAll("#category-list button");
  categoryButtons.forEach((button) => {
    if (button.dataset.category === category) {
      button.classList.add("btn-primary");
    } else {
      button.classList.remove("btn-primary");
    }
  });

  middleSectionH2.innerHTML = "Список книг";

  if (category === "all") {
    renderBooks(booksData);
  } else {
    const filteredBooks = booksData.filter((book) => book.category === category);
    renderBooks(filteredBooks);
  }
}

function renderBooks(booksToDisplay) {
  const booksList = document.getElementById("books-list");
  booksList.innerHTML = ""; // Clear previous books

  booksToDisplay
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    .forEach((book) => {
      const card = document.createElement("div");
      card.className = "card mb-3";
      card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${book.title}</h5>
        <h6 class="card-subtitle mb-2 text-muted">${book.author}</h6>
        <p class="card-text">$${book.price}</p>
        <button class="btn btn-primary" onclick="showBookDetails(${book.id})">Деталі</button>
      </div>
    `;
      booksList.appendChild(card);
    });
}

function showBookDetails(id) {
  const book = booksData.find((book) => book.id === id);
  if (book) {
    const bookDetails = document.getElementById("book-details");
    bookDetails.innerHTML = `
      <h5>${book.title}</h5>
      <h6>Від ${book.author}</h6>
      <p>${book.description}</p>
      <p>$${book.price}</p>
      <button class="btn btn-success" onclick="buyBook(${book.id})">Купити</button>
    `;
  }
}

function buyBook(id) {
  const book = booksData.find((book) => book.id === id);
  if (book) {
    const buyingProcess = document.getElementById("buying-process");
    buyingProcess.style.display = "block";

    document.getElementById(
      "book-to-buy"
    ).textContent = `Купити ${book.title} від ${book.author}`;

    const postOfficeSelect = document.getElementById("post-office");
    postOfficeSelect.innerHTML = "";
    for (let i = 1; i <= 100; i++) {
      const option = document.createElement("option");
      option.value = `НП-${i}`;
      option.textContent = `НП-${i}`;
      postOfficeSelect.appendChild(option);
    }

    const form = document.getElementById("buying-form");
    const errorDiv = document.getElementById("order-error");
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const name = document.getElementById("customer-name").value;
      const city = document.getElementById("city").value;
      const postOffice = document.getElementById("post-office").value;
      const payment = document.getElementById("payment").value;
      const quantity = document.getElementById("quantity").value;
      const comment = document.getElementById("comment").value;

      // Validate name using regular expressions
      const nameRegex = /^[a-zA-Zа-яА-Я\s]+$/;
      if (!nameRegex.test(name)) {
        errorDiv.textContent = "Please enter a valid name.";
        return;
      }

      // Validate quantity to be integer
      const quantityRegex = /^\d+$/;
      if (!quantityRegex.test(quantity)) {
        errorDiv.textContent = "Please enter a valid quantity.";
        return;
      }

      // Check if all required fields are filled
      if (!name || !city || !postOffice || !payment || !quantity) {
        errorDiv.textContent = "Please fill all required fields.";
        return;
      }

      errorDiv.textContent = "";

      const orderConfirmation = document.getElementById("order-confirmation");
      orderConfirmation.innerHTML = `
        <h5>Підтвердження замовлення</h5>
        <p>Дякуємо, ${name}, за замовлення!</p>
        <p>Ви замовили ${quantity} примірників "${book.title}" від ${book.author} для доставки в ${city}, поштове відділення ${postOffice}.</p>
        <p>Вибраний спосіб оплати: ${payment === "cod" ? "Накладений платіж" : "Оплата карткою"}.</p>
        <p>Коментарі до замовлення: ${comment}</p>
      `;

      // Create the order object
      const order = {
        id: Date.now(), // Assign a unique ID to the order (You can use any other unique identifier)
        date: new Date().toISOString(),
        price: book.price * parseInt(quantity),
        bookTitle: book.title,
        // Add other relevant order details here
      };

      // Store the order in localStorage
      storeOrderInLocalStorage(order);
    });
  }
}

// Step 1: Display "My Orders" Button
const header = document.querySelector('header');
const myOrdersButton = document.getElementById("my-orders-button");
myOrdersButton.addEventListener("click", displayOrdersList);
myOrdersButton.textContent = 'Мої замовлення';
header.appendChild(myOrdersButton);


function storeOrderInLocalStorage(order) {
  const orders = getOrdersFromLocalStorage();
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));
}


// Step 2: Fetch Orders from localStorage
function getOrdersFromLocalStorage() {
  const orders = JSON.parse(localStorage.getItem('orders'));
  return orders || [];
}

// Step 3: Display Orders List
function displayOrdersList() {
  const orders = getOrdersFromLocalStorage();
  middleSectionH2.innerHTML = "Список Замовлень";
  const buyingProcessElement = document.getElementById("buying-process");
  buyingProcessElement.style.display = "none";
  renderView("orders", orders);
}


// Step 5: Enable Order Deletion
function deleteOrder(orderId) {
  let orders = getOrdersFromLocalStorage();
  orders = orders.filter((order) => order.id !== orderId);
  localStorage.setItem('orders', JSON.stringify(orders));
  displayOrdersList();
}

// Event listener for "Мої замовлення" button click
myOrdersButton.addEventListener('click', displayOrdersList);

// Function to initialize the application
function init() {
  computeData();
}

document.addEventListener("DOMContentLoaded", init);


function renderView(viewMode, data) {
  const booksList = document.getElementById("books-list");
  booksList.innerHTML = ""; // Clear previous data

  if (viewMode === "books") {
    data.forEach((book) => {
      const card = document.createElement("div");
      card.className = "card mb-3";
      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${book.title}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${book.author}</h6>
          <p class="card-text">$${book.price}</p>
        </div>
      `;
      booksList.appendChild(card);
    });
  } else if (viewMode === "orders") {
    data.forEach((order) => {
      const card = document.createElement("div");
      card.className = "card mb-3";
      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">Order ${order.id}</h5>
          <p class="card-text">Date: ${order.date}</p>
          <p class="card-text">Price: $${order.price}</p>
          <p class="card-text">BookName: ${order.bookTitle}</p>
          <button class="btn btn-danger" onclick="deleteOrder(${order.id})">Delete</button>
        </div>
      `;
      booksList.appendChild(card);
    });
  }
}


let booksData = [
  {
    id: 1,
    title: "Убити пересмішника",
    author: "Харпер Лі",
    category: "Художня література",
    year: 1960,
    price: 12.99,
    description:
      "Класичний роман, розташований на Півдні США, який висвітлює расову несправедливість очима молодої дівчини.",
    image:
      "https://www.britishbook.ua/upload/resize_cache/iblock/965/orzkwnmxm268n16uebktklx768hn5e5q/1900_800_174b5ed2089e1946312e2a80dcd26f146/kniga_to_kill_a_mockingbird_50th_anniversary_edition.jpg",
  },
  {
    id: 2,
    title: "1984",
    author: "Джордж Орвелл",
    category: "Художня література",
    year: 1949,
    price: 10.99,
    description:
      "Дистопійний роман, що зображує тоталітарне суспільство, управляється Великим Братом.",
    image: "https://example.com/1984.jpg",
  },
  {
    id: 3,
    title: "Великий Гетсбі",
    author: "Ф. Скотт Фіцджеральд",
    category: "Художня література",
    year: 1925,
    price: 9.99,
    description:
      "Роман, розташований в епоху Яскравих двадцятих років, що досліджує теми багатства, кохання та американської мрії.",
    image: "https://example.com/the-great-gatsby.jpg",
  },
  {
    id: 4,
    title: "Гордість і упередження",
    author: "Джейн Остін",
    category: "Художня література",
    year: 1813,
    price: 8.99,
    description:
      "Класичний роман про романтичні відносини між енергійною Елізабет Беннет і гордовитим містером Дарсі.",
    image: "https://example.com/pride-and-prejudice.jpg",
  },
  {
    id: 5,
    title: "Над пропастью в глухий кут",
    author: "Дж.Д. Селінджер",
    category: "Художня література",
    year: 1951,
    price: 11.99,
    description:
      "Роман про зріління, розповіданий розчарованим підлітком Голденом Колфілдом.",
    image: "https://example.com/the-catcher-in-the-rye.jpg",
  },
  {
    id: 6,
    title: "До маяка",
    author: "Вірджинія Вулф",
    category: "Художня література",
    year: 1927,
    price: 10.99,
    description:
      "Експериментальний роман, що досліджує внутрішні думки і враження персонажів.",
    image: "https://example.com/to-the-lighthouse.jpg",
  },
  {
    id: 7,
    title: "Храбрий новий світ",
    author: "Олдос Гакслі",
    category: "Художня література",
    year: 1932,
    price: 9.99,
    description:
      "Дистопійний роман, розташований у майбутньому суспільстві, де людське розмноження і індивідуальність суворо контролюються.",
    image: "https://example.com/brave-new-world.jpg",
  },
  {
    id: 8,
    title: "Хоббіт, або Туди і Звідти",
    author: "Дж.Р.Р. Толкін",
    category: "Художня література",
    year: 1937,
    price: 12.99,
    description:
      "Фентезі пригодницький роман про Білбо Беггінса і його пошуки відновлення Самотньої гори.",
    image: "https://example.com/the-hobbit.jpg",
  },
  {
    id: 9,
    title: "Володар перснів",
    author: "Дж.Р.Р. Толкін",
    category: "Художня література",
    year: 1954,
    price: 29.99,
    description:
      "Епічна високо-фантастична трилогія, що розповідає про подорож Фродо Беггінса з метою знищення Одного Персня.",
    image: "https://example.com/the-lord-of-the-rings.jpg",
  },
  {
    id: 10,
    title: "Гаррі Поттер і філософський камінь",
    author: "Дж.К. Роулінг",
    category: "Фентезі",
    year: 1997,
    price: 14.99,
    description:
      "Перша книга у серії про Гаррі Поттера, яка розповідає про юного чарівника та його пригоди в Хогвартсі, школі магії та чарівництва.",
    image: "https://example.com/harry-potter-and-the-philosophers-stone.jpg",
  },
  {
    id: 11,
    title: "Хроніки Нарнії",
    author: "К.С. Льюїс",
    category: "Фентезі",
    year: 1950,
    price: 19.99,
    description:
      "Серія фентезі-романів, розташованих у чарівному світі Нарнії, з участю розмовляючих тварин і епічних битв між добром і злом.",
    image: "https://example.com/the-chronicles-of-narnia.jpg",
  },
  {
    id: 12,
    title: "Ферма тварин",
    author: "Джордж Орвелл",
    category: "Художня література",
    year: 1945,
    price: 8.99,
    description:
      "Сатирична новела, що зображує групу фермерських тварин, які повстали проти свого людського фермера, представляючи події, що передували Російській революції.",
    image: "https://example.com/animal-farm.jpg",
  },
  {
    id: 13,
    title: "Панство мух",
    author: "Вільям Голдінг",
    category: "Художня література",
    year: 1954,
    price: 9.99,
    description:
      "Роман про групу хлопчиків, застряглих на безлюдному острові, що досліджує теми цивілізації, дикості та людської природи.",
    image: "https://example.com/lord-of-the-flies.jpg",
  },
  {
    id: 14,
    title: "Фаренгейт 451",
    author: "Рей Бредбері",
    category: "Художня література",
    year: 1953,
    price: 10.99,
    description:
      "Дистопійний роман, розташований у майбутньому суспільстві, де книги заборонені і підпалюються, слідуючи історії пожежника, який починає питати свою роль.",
    image: "https://example.com/fahrenheit-451.jpg",
  },
  {
    id: 15,
    title: "Мобі Дік",
    author: "Герман Мелвілл",
    category: "Художня література",
    year: 1851,
    price: 12.99,
    description:
      "Роман, що досліджує загарблення капітаном Агам Агаром світлої китиці.",
    image: "https://example.com/moby-dick.jpg",
  },
  {
    id: 16,
    title: "Гроздья гніву",
    author: "Джон Стейнбек",
    category: "Художня література",
    year: 1939,
    price: 11.99,
    description:
      "Історія родини Джоадів, яка мігрує з Оклахоми до Каліфорнії під час Великої Депресії.",
    image: "https://example.com/the-grapes-of-wrath.jpg",
  },
  {
    id: 17,
    title: "Старий і море",
    author: "Ернест Хемінгуей",
    category: "Художня література",
    year: 1952,
    price: 9.99,
    description:
      "Новела, що розповідає про боротьбу старого рибалки з величезною певчою рибою в Гольфстрімі.",
    image: "https://example.com/the-old-man-and-the-sea.jpg",
  },
  {
    id: 18,
    title: "Пригоди Аліси в Країні Чудес",
    author: "Льюїс Керролл",
    category: "Фентезі",
    year: 1865,
    price: 8.99,
    description:
      "Чарівна казка про молоду дівчинку на ім'я Аліса, яка падає в кроличу нору і потрапляє в фантастичний світ.",
    image: "https://example.com/alices-adventures-in-wonderland.jpg",
  },
  {
    id: 19,
    title: "Сто років самотності",
    author: "Габріель Гарсія Маркес",
    category: "Художня література",
    year: 1967,
    price: 13.99,
    description:
      "Багатопоколінний роман, який поєднує реальність і магічний реалізм, розповідає історію сім'ї Буендіа в умисленому місті Макондо.",
    image: "https://example.com/one-hundred-years-of-solitude.jpg",
  },
  {
    id: 20

    ,
    title: "Химера 22",
    author: "Джозеф Хеллер",
    category: "Художня література",
    year: 1961,
    price: 10.99,
    description:
      "Сатиричний роман, що зображує абсурдність і марноту війни через досвіди бомбардира ВПС США на літаку B-25.",
    image: "https://example.com/catch-22.jpg",
  },
  {
    id: 21,
    title: "Дванадцять стільців",
    author: "Ілля Ільф та Євген Петров",
    category: "Художня література",
    year: 1928,
    price: 9.99,
    description:
      "Сатиричний роман, що розповідає про пошуки дванадцяти стільців, які містять приховане скарби.",
    image: "https://example.com/the-twelve-chairs.jpg",
  },
  {
    id: 22,
    title: "Маленький принц",
    author: "Антуан де Сент-Екзюпері",
    category: "Художня література",
    year: 1943,
    price: 7.99,
    description:
      "Поетична новела про юного принца, який подорожує з планети на планету, вчиться важливим життєвим урокам.",
    image: "https://example.com/the-little-prince.jpg",
  },
  {
    id: 23,
    title: "Пригоди Гекльберрі Фінна",
    author: "Марк Твен",
    category: "Художня література",
    year: 1884,
    price: 8.99,
    description:
      "Роман-пікареск про пригоди Гекльберрі Фінна і його друга Джима, втіклого раба, під час подорожі по річці Міссісіпі.",
    image: "https://example.com/the-adventures-of-huckleberry-finn.jpg",
  },
  {
    id: 24,
    title: "Однокласники",
    author: "С.Е. Гінтон",
    category: "Художня література",
    year: 1967,
    price: 7.99,
    description:
      "Роман про становлення, що розповідає про суперечки між двома групами, «грізерами» та «сосками», в 1960-х роках в Оклахомі.",
    image: "https://example.com/the-outsiders.jpg",
  },
  {
    id: 25,
    title: "Франкенштейн, або сучасний Прометей",
    author: "Мері Шеллі",
    category: "Художня література",
    year: 1818,
    price: 9.99,
    description:
      "Готичний науково-фантастичний роман, що досліджує наслідки створення штучного життя.",
    image: "https://example.com/frankenstein.jpg",
  },
  {
    id: 26,
    title: "Зов природи",
    author: "Джек Лондон",
    category: "Художня література",
    year: 1903,
    price: 7.99,
    description:
      "Роман, що розповідає про подорож домашнього собаки на ім'я Бак, яка стає псом-тягачем в Юконі під час Клондайкської золотої лихоманки.",
    image: "https://example.com/the-call-of-the-wild.jpg",
  },
  {
    id: 27,
    title: "Віднесена вітром",
    author: "Маргарет Мітчелл",
    category: "Художня література",
    year: 1936,
    price: 12.99,
    description:
      "Історичний роман, розташований на Півдні США під час Громадянської війни і епохи реконструкції.",
    image: "https://example.com/gone-with-the-wind.jpg",
  },
  {
    id: 28,
    title: "Граф Монте-Крісто",
    author: "Александр Дюма",
    category: "Художня література",
    year: 1844,
    price: 11.99,
    description:
      "Пригодницький роман, що розповідає історію Едмонда Дантеса, який прагне помститися тим, хто йому завдав зла.",
    image: "https://example.com/the-count-of-monte-cristo.jpg",
  },
  {
    id: 29,
    title: "Портрет Доріана Грея",
    author: "Оскар Уайльд",
    category: "Художня література",
    year: 1890,
    price: 10.99,
    description:
      "Філософський роман, що розповідає історію Доріана Грея, який продає свою душу, щоб залишатися молодим і красивим, тим часом як його портрет старіє і зловживає.",
    image: "https://example.com/the-picture-of-dorian-gray.jpg",
  },
  {
    id: 30,
    title: "Велика Гончарна Колекція",
    author: "Орхан Памук",
    category: "Художня література",
    year: 1985,
    price: 14.99,
    description:
      "Роман, розташований у Стамбулі, що розповідає історію кераміка по імені Мехмет, який збирає колекцію гончарних посудин.",
    image: "https://example.com/the-museum-of-innocence.jpg",
  },
  {
    id: 31,
    title: "Тихий Дон",
    author: "Михайло Шолохов",
    category: "Художня література",
    year: 1940,
    price: 13.99,
    description:
      "Епічний роман, що розповідає історію козацької родини Мєлєхових під час Першої світової війни і російської громадянської війни.",
    image: "https://example.com/quiet-flows-the-don.jpg",
  },
  {
    id: 32,
    title: "Тіні забутих предків",
    author: "Ксенофонт Залєський",
    category: "Художня література",
    year: 1934,
    price: 11.99,
    description:
      "Історичний роман, що розповідає історію української селянської родини під час Кримської війни.",
    image: "https://example.com/shadows-of-forgotten-ancestors.jpg",
  },
  {
    id: 33,
    title: "Дев'ять історій",
    author: "Джералд Даррелл",
    category: "Автобіографія",
    year: 1954,
    price: 9.99,
    description:
      "Колекція автобіографічних оповідань, що розповідають про дитинство Даррелла на грецькому острові Корфу та його захоплення тваринами.",
    image: "https://example.com/my-family-and-other-animals.jpg",
  },
  {
    id: 34,
    title: "Втеча від замороженого пекла",
    author: "Славомір Равич",
    category: "Автобіографія",
    year: 2004,
    price: 12.99,
    description:
      "Автобіографічна книга, що розповідає про втечу Равича з концтаборів ГУЛАГу та його подорож через Сибір.",
    image: "https://example.com/the-long-walk.jpg",
  },
  {
    id: 35,
    title: "Хіба ревуть воли, як ясла повні?",
    author: "Петро Полтава",
    category: "Гумор",
    year: 1937,
    price: 8.99,
    description:
      "Гумористична книга, що містить веселі оповідання і анекдоти про селянське життя в Україні.",
    image: "https://example.com/hibernate-cows-munchy-hay.jpg",
  },
  {
    id: 36,
    title: "Сутінки",
    author: "Стівені Кінг",
    category: "Жахи",
    year: 1986,
    price: 14.99,
    description:
      "Жахливий роман про сутінки, які оживають у маленькому містечку, приховуючи монстрів.",
    image: "https://example.com/it.jpg",
  },
  {
    id: 37,
    title: "Ніч у лісі",
    author: "Еріх Марія Ремарк",
    category: "Художня література",
    year: 1958,
    price: 10.99,
    description:
      "Роман, що розповідає про зустріч трьох німецьких солдатів і трьох американських солдатів у лісі під час Другої світової війни.",
    image: "https://example.com/a-night-in-lisbon.jpg",
  },
  {
    id: 38,
    title: "Зів'яле листя",
    author: "Уго Бетті",
    category: "Художня література",
    year: 1954,
    price: 9.99,
    description:
      "Роман, що розповідає історію боротьби проти фашизму в Італії під час Другої світової війни.",
    image: "https://example.com/faded-leaves.jpg",
  },
  {
    id: 39,
    title: "Удар кулаком",
    author: "Річард Райт",
    category: "Художня література",
    year: 1940,
    price: 11.99,
    description:
      "Роман, що розповідає історію Афроамериканського хлопця по імені Біггі Томпсон, який бореться з расовою дискримінацією.",
    image: "https://example.com/native-son.jpg",
  },
  {
    id: 40,
    title: "Виправдання",
    author: "Джон Грішем",
    category: "Художня література",
    year: 2010,
    price: 12.99,
    description:
      "Юридичний трилер, що розповідає історію афроамериканського чоловіка, звинуваченого у зґвалтуванні білої жінки, і його адвоката, який відстоює його.",
    image: "https://example.com/the-confession.jpg",
  },
  {
    id: 41,
    title: "Біла ялинка",
    author: "Ернест Гемінгуей",
    category: "Художня література",
    year: 1926,
    price: 9.99,
    description:
      "Роман, що розповідає історію втрати невинності та загибелі молодості під час Першої світової війни.",
    image: "https://example.com/the-sun-also-rises.jpg",
  },
  {
    id: 42,
    title: "Скажене серце",
    author: "Едґар Аллан По",
    category: "Жахи",
    year: 1843,
    price: 8.99,
    description:
      "Жахлива новела, що розповідає історію чоловіка, який вбиває старого чоловіка та приховує його труп під дошкою в підлозі.",
    image: "https://example.com/the-tell-tale-heart.jpg",
  },
  {
    id: 43,
    title: "Дон Кіхот",
    author: "Мігель де Сервантес",
    category: "Художня література",
    year: 1605,
    price: 10.99,
    description:
      "Сатиричний роман, що розповідає історію Дона Кіхота, який вірить, що він лицар й має відновити лицарство.",
    image: "https://example.com/don-quixote.jpg",
  },
  {
    id: 44,
    title: "Тихий американець",
    author: "Ґрем Ґрін",
    category: "Художня література",
    year: 1955,
    price: 11.99,
    description:
      "Шпигунський роман, розташований у В'єтнамі під час Французької індо-китайської війни.",
    image: "https://example.com/the-quiet-american.jpg",
  },
  {
    id: 45,
    title: "Світло, що ми не бачимо",
    author: "Ентоні Дорр",
    category: "Художня література",
    year: 2014,
    price: 13.99,
    description:
      "Історичний роман, що розповідає історію двох дітей під час Другої світової війни, їхню долю, що поступово наближається до зустрічі.",
    image: "https://example.com/all-the-light-we-cannot-see.jpg",
  },
  {
    id: 46,
    title: "Татусеві",
    author: "Марк Твен",
    category: "Художня література",
    year: 1876,
    price: 9.99,
    description:
      "Роман, що розповідає історію Тома Сойєра, хлопчика, який любить розваги і пригоди.",
    image: "https://example.com/tom-sawyer.jpg",
  },
  {
    id: 47,
    title: "Зовнішнє відображення",
    author: "Вірджинія Вульф",
    category: "Художня література",
    year: 1928,
    price: 10.99,
    description:
      "Експериментальний роман, що розповідає історію групи людей протягом одного дня в Лондоні.",
    image: "https://example.com/to-the-lighthouse.jpg",
  },
  {
    id: 48,
    title: "Незламний",
    author: "Лора Гілленбранд",
    category: "Історична література",
    year: 2010,
    price: 12.99,
    description:
      "Історична книга, що розповідає історію Луїса Замперіні, олімпійського бігуна на довгі дистанції , який стає воїном-полоненим під час Другої світової війни.",
    image: "https://example.com/unbroken.jpg",
  },
  {
    id: 49,
    title: "Гаррі Поттер і філософський камінь",
    author: "Джоан Роулінг",
    category: "Фантастика",
    year: 1997,
    price: 9.99,
    description:
      "Фантастичний роман про хлопчика на ім'я Гаррі Поттер, який дізнається, що він є чарівником і навчається в школі чарівництва і чародійства Хогвартс.",
    image: "https://example.com/harry-potter-and-the-philosophers-stone.jpg",
  },
  {
    id: 50,
    title: "Таємниця батька Брауна",
    author: "Гілберт Кіт Честертон",
    category: "Детектив",
    year: 1911,
    price: 8.99,
    description:
      "Детективні оповідання, що розповідають про пригоди священника-детектива отця Брауна.",
    image: "https://example.com/the-innocence-of-father-brown.jpg",
  }
];
