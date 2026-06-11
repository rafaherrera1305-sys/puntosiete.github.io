let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || {};
let isAdmin = false;

function saveProducts() {
    localStorage.setItem("products", JSON.stringify(products));
}
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function renderProducts() {
    const productList = document.getElementById("productList");
    productList.innerHTML = "";
    products.forEach((p, index) => {
        const div = document.createElement("div");
        div.className = "product";
        div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>$${p.price}</p>
      ${isAdmin ? `
        <div class="actions">
          <button onclick="editProduct(${index})">Editar</button>
          <button onclick="deleteProduct(${index})">Eliminar</button>
        </div>`
                : `
        <div class="actions">
          <button onclick="addToCart(${index})">Agregar al carrito</button>
          ${cart[index] ? `
            <div>
              <button onclick="decreaseQuantity(${index})">-</button>
              <span>${cart[index]}</span>
              <button onclick="increaseQuantity(${index})">+</button>
            </div>` : ""}
        </div>`}
    `;
        productList.appendChild(div);
    });
    updateCartIndicator();
}

function updateCartIndicator() {
    const cartArea = document.getElementById("cartArea");
    const cartIndicator = document.getElementById("cartIndicator");
    let total = 0;
    for (let index in cart) {
        total += products[index].price * cart[index];
    }
    if (total > 0) {
        cartIndicator.textContent = `🛒 Total: $${total}`;
        cartArea.classList.remove("hidden");
    } else {
        cartArea.classList.add("hidden");
    }
    saveCart();
}

// Redirección al checkout con datos del carrito
document.getElementById("checkoutBtn").onclick = () => {
    // Construir resumen del carrito
    const resumen = [];
    let total = 0;

    for (let index in cart) {
        const producto = products[index];
        const cantidad = cart[index];
        const subtotal = producto.price * cantidad;
        total += subtotal;

        resumen.push({
            nombre: producto.name,
            cantidad: cantidad,
            precioUnitario: producto.price,
            subtotal: subtotal
        });
    }

    // Guardar en localStorage para pasar a checkout.html
    localStorage.setItem("checkoutData", JSON.stringify({ productos: resumen, total }));

    // Redirigir
    window.location.href = "checkout.html";
};



function addToCart(index) {
    cart[index] = (cart[index] || 0) + 1;
    renderProducts();
}
function increaseQuantity(index) {
    cart[index]++;
    renderProducts();
}
function decreaseQuantity(index) {
    cart[index]--;
    if (cart[index] <= 0) delete cart[index];
    renderProducts();
}

// Login
const adminLoginBtn = document.getElementById("adminLoginBtn");
const loginModal = document.getElementById("loginModal");
const closeModal = document.getElementById("closeModal");
const loginBtn = document.getElementById("loginBtn");
const adminPanel = document.getElementById("adminPanel");
const logoutBtn = document.getElementById("logoutBtn");

adminLoginBtn.onclick = () => loginModal.style.display = "block";
closeModal.onclick = () => loginModal.style.display = "none";

loginBtn.onclick = () => {
    const password = document.getElementById("adminPassword").value;
    if (password === "1234") {
        isAdmin = true;
        adminPanel.classList.remove("hidden");
        logoutBtn.classList.remove("hidden");
        adminLoginBtn.classList.add("hidden");
        loginModal.style.display = "none";
        renderProducts();
    } else {
        alert("Contraseña incorrecta");
    }
};

logoutBtn.onclick = () => {
    isAdmin = false;
    adminPanel.classList.add("hidden");
    logoutBtn.classList.add("hidden");
    adminLoginBtn.classList.remove("hidden");
    renderProducts();
};

// Agregar producto con imagen desde dispositivo
document.getElementById("addProductBtn").onclick = () => {
    const name = document.getElementById("productName").value.trim();
    const price = parseFloat(document.getElementById("productPrice").value);
    const imageFile = document.getElementById("productImage").files[0];

    if (!name || isNaN(price) || !imageFile) {
        alert("Completa todos los campos");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const imageBase64 = e.target.result;
        products.push({ name, price, image: imageBase64 });
        saveProducts();
        renderProducts();

        document.getElementById("productName").value = "";
        document.getElementById("productPrice").value = "";
        document.getElementById("productImage").value = "";
    };
    reader.readAsDataURL(imageFile);
};

function editProduct(index) {
    const newName = prompt("Nuevo nombre:", products[index].name);
    const newPrice = prompt("Nuevo precio:", products[index].price);
    if (newName && newPrice) {
        products[index].name = newName;
        products[index].price = parseFloat(newPrice);
        saveProducts();
        renderProducts();
    }
}
function deleteProduct(index) {
    if (confirm("¿Seguro que quieres eliminar este producto?")) {
        products.splice(index, 1);
        saveProducts();
        renderProducts();
    }
}

renderProducts();
