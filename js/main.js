
/*
  Aotearoa Adventure Gear
  BIT703 Assessment 2
  Home page JavaScript
*/

"use strict";

/* =========================================
   TASK 3 - CART DATA VALIDATION
========================================= */

const validProductPrices = {
    "alpine-pack": 189,
    "camping-tent": 349,
    "hiking-boots": 229,
    "sleeping-bag": 159,
    "water-bottle": 49,
    "headlamp": 79
};

function validateCartItem(item) {

    if (!item || typeof item !== "object") {
        return false;
    }

    const quantity = Number(item.quantity);
    const price = Number(item.price);

    // Product must exist in the catalogue.
    if (!Object.prototype.hasOwnProperty.call(
        validProductPrices, item.id
    )) {
        return false;
    }

    // Quantity must be a whole number between 1 and 20.
    if (!Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 20) {
        return false;
    }

    // Price must be valid, non-negative and match the catalogue.
    if (!Number.isFinite(price) ||
        price < 0 ||
        price !== validProductPrices[item.id]) {
        return false;
    }

    return true;
}


// Product catalogue used by the home page.
// Other pages will use the same product IDs.

const products = [
    {
        id: "alpine-pack",
        name: "Alpine Explorer Backpack",
        price: 189
    },
    {
        id: "camping-tent",
        name: "Southern Cross Camping Tent",
        price: 349
    },
    {
        id: "hiking-boots",
        name: "Summit Hiking Boots",
        price: 229
    },
    {
        id: "sleeping-bag",
        name: "Alpine Thermal Sleeping Bag",
        price: 159
    },
    {
        id: "water-bottle",
        name: "Trail Water Bottle",
        price: 49
    }
];

// Update the cart item count.
// We will implement the full cart on the Cart page.

function updateCartCount() {
    const countElement = document.getElementById("cartCount");

    if (!countElement) {
        return;
    }

    try {
        const cart = JSON.parse(
            localStorage.getItem("aagCart") || "[]"
        );

        if (!Array.isArray(cart)) {
            countElement.textContent = "0";
            return;
        }

        const count = cart.reduce((total, item) => {
            return total + (Number(item.quantity) || 0);
        }, 0);

        countElement.textContent = count;
    } catch (error) {
        countElement.textContent = "0";
    }
}

// Newsletter email validation.
// This is a local demonstration only.

const newsletterForm = document.getElementById("newsletterForm");

if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const emailInput = document.getElementById("newsletterEmail");
        const message = document.getElementById("newsletterMessage");

        const email = emailInput.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            message.textContent =
                "Please enter a valid email address.";
            message.style.color = "#b42318";
            emailInput.setAttribute("aria-invalid", "true");
            return;
        }

        emailInput.removeAttribute("aria-invalid");
        message.textContent =
            "Email validated successfully. This is a demo form; no subscription was sent.";
        message.style.color = "#276749";

        newsletterForm.reset();
    });
}

// Search products by name.
// Redirects to the Shop page with the search term.

const siteSearch = document.getElementById("siteSearch");

if (siteSearch) {
    siteSearch.addEventListener("submit", function (event) {
        event.preventDefault();

        const searchInput = document.getElementById("searchInput");
        const searchTerm = searchInput.value.trim();

        if (searchTerm.length === 0) {
            searchInput.focus();
            return;
        }

        window.location.href =
            "shop.html?search=" + encodeURIComponent(searchTerm);
    });
}

// Initialise page

document.addEventListener("DOMContentLoaded", function () {
    updateCartCount();
});

/* =========================================
   SHOP PAGE - SEARCH AND CATEGORY FILTERS
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const shopSearchForm = document.getElementById("shopSearchForm");
    const shopSearchInput = document.getElementById("shopSearchInput");
    const shopProducts = document.querySelectorAll(".shop-product");
    const categoryLinks = document.querySelectorAll(
    ".category-card[data-category], .category-shop-button[data-category]"
);
    const browseAllButton = document.getElementById("browseAllButton");
    const noResultsMessage = document.getElementById("shopNoResults");

    // Only run this code on the Shop page.
    if (!shopSearchForm || !shopSearchInput) {
        return;
    }

    // Filter products by search term and category.
    function filterProducts(searchTerm = "", category = "all") {

        const search = searchTerm.toLowerCase().trim();
        let visibleCount = 0;

        shopProducts.forEach(function (product) {

            const productName =
                (product.dataset.name || "").toLowerCase();

            const productCategory =
                (product.dataset.category || "").toLowerCase();

            const matchesSearch =
                productName.includes(search);

            const matchesCategory =
                category === "all" ||
                productCategory === category;

            if (matchesSearch && matchesCategory) {
                product.hidden = false;
                product.style.display = "";
                visibleCount++;
            } else {
                product.hidden = true;
                product.style.display = "none";
            }
        });

        if (noResultsMessage) {
            noResultsMessage.hidden = visibleCount !== 0;
        }
    }

    // Search when the Submit button is clicked.
    shopSearchForm.addEventListener("submit", function (event) {
        event.preventDefault();

        filterProducts(shopSearchInput.value, "all");

        document.getElementById("shopProducts")
            .scrollIntoView({ behavior: "smooth" });
    });

    // Filter products when a category is selected.
    categoryLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {
            event.preventDefault();

            const selectedCategory = link.dataset.category;

            shopSearchInput.value = "";
            filterProducts("", selectedCategory);

            document.getElementById("shopProducts")
                .scrollIntoView({ behavior: "smooth" });
        });
    });

    // Browse All resets the product filters.
    if (browseAllButton) {
        browseAllButton.addEventListener("click", function (event) {
            event.preventDefault();

            shopSearchInput.value = "";
            filterProducts("", "all");
        });
    }

    // Read searches coming from the Home page.
    const urlParameters = new URLSearchParams(window.location.search);
    const initialSearch = urlParameters.get("search");

    if (initialSearch) {
        shopSearchInput.value = initialSearch;
        filterProducts(initialSearch, "all");
    } else {
        filterProducts("", "all");
    }

});

/* =========================================
   PRODUCT DETAIL PAGE
   Dynamic products and Add to Cart
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const productName = document.getElementById("detailProductName");
    const productImage = document.getElementById("detailProductImage");
    const productPrice = document.getElementById("detailProductPrice");
    const productDescription = document.getElementById("detailProductDescription");
    const productRating = document.getElementById("detailProductRating");
    const productModel = document.getElementById("productModel");
    const productQuantity = document.getElementById("productQuantity");
    const addToCartButton = document.getElementById("addToCartButton");
    const cartMessage = document.getElementById("addToCartMessage");
    const similarProducts = document.getElementById("similarProducts");

    // Only run on the Product Detail page.
    if (!productName || !addToCartButton) {
        return;
    }

    // Product information for all six products.
    const productCatalogue = [
        {
            id: "alpine-pack",
            name: "Alpine Explorer Backpack",
            price: 189,
            image: "images/product-backpack.jpg",
            rating: 4,
            description: "A durable and comfortable hiking backpack, designed for exploring the mountains, forests and trails of Aotearoa New Zealand."
        },
        {
            id: "camping-tent",
            name: "Southern Cross Camping Tent",
            price: 349,
            image: "images/product-tent.jpg",
            rating: 5,
            description: "A practical camping tent offering reliable shelter and comfort for weekend camping trips and outdoor adventures."
        },
        {
            id: "hiking-boots",
            name: "Summit Hiking Boots",
            price: 229,
            image: "images/product-boots.jpg",
            rating: 4,
            description: "Supportive hiking boots with durable construction, suitable for trails, bush walks and outdoor adventures."
        },
        {
            id: "sleeping-bag",
            name: "Alpine Thermal Sleeping Bag",
            price: 159,
            image: "images/product-sleepingbag.jpg",
            rating: 4,
            description: "A warm and comfortable sleeping bag for camping trips, overnight stays and outdoor exploration."
        },
        {
            id: "water-bottle",
            name: "Trail Water Bottle",
            price: 49,
            image: "images/product-bottle.jpg",
            rating: 5,
            description: "A reusable stainless steel water bottle designed to keep you hydrated while hiking, camping or travelling."
        },
        {
            id: "headlamp",
            name: "Explorer Headlamp",
            price: 79,
            image: "images/product-headlamp.jpg",
            rating: 4,
            description: "A compact LED headlamp that provides hands-free lighting for camping, evening walks and outdoor activities."
        }
    ];

    // Read the product ID from the URL.
    const urlParams = new URLSearchParams(window.location.search);
    const requestedId = urlParams.get("id") || "alpine-pack";

    const selectedProduct = productCatalogue.find(function (product) {
        return product.id === requestedId;
    });

    // Handle invalid product links.
    if (!selectedProduct) {
        productName.textContent = "Product not found";
        productDescription.textContent =
            "Sorry, this product is unavailable. Please return to the Shop page.";
        productPrice.textContent = "";
        productImage.hidden = true;
        addToCartButton.disabled = true;
        productModel.disabled = true;
        productQuantity.disabled = true;
        return;
    }

    // Display selected product information.
    document.title = selectedProduct.name + " | Aotearoa Adventure Gear";

    productName.textContent = selectedProduct.name;
    productImage.src = selectedProduct.image;
    productImage.alt = selectedProduct.name;
    productPrice.textContent = "$" + selectedProduct.price.toFixed(2);
    productDescription.textContent = selectedProduct.description;

    const stars = "★".repeat(selectedProduct.rating) +
                  "☆".repeat(5 - selectedProduct.rating);

    productRating.textContent = stars;
    productRating.setAttribute(
        "aria-label",
        selectedProduct.rating + " out of 5 stars"
    );

    // Show three other products as recommendations.
    const recommendations = productCatalogue
        .filter(function (product) {
            return product.id !== selectedProduct.id;
        })
        .slice(0, 3);

    if (similarProducts) {
        similarProducts.innerHTML = "";

        recommendations.forEach(function (product) {

            const article = document.createElement("article");
            article.className = "similar-product";

            const imageLink = document.createElement("a");
            imageLink.href = "product.html?id=" +
                encodeURIComponent(product.id);

            const image = document.createElement("img");
            image.src = product.image;
            image.alt = product.name;
            imageLink.appendChild(image);

            const details = document.createElement("div");

            const nameLink = document.createElement("a");
            nameLink.href = imageLink.href;

            const heading = document.createElement("h3");
            heading.textContent = product.name;
            nameLink.appendChild(heading);

            const rating = document.createElement("span");
            rating.className = "rating";
            rating.textContent =
                "★".repeat(product.rating) +
                "☆".repeat(5 - product.rating);
            rating.setAttribute(
                "aria-label",
                product.rating + " out of 5 stars"
            );

            const price = document.createElement("p");
            price.textContent = "$" + product.price.toFixed(2);

            details.appendChild(nameLink);
            details.appendChild(rating);
            details.appendChild(price);

            article.appendChild(imageLink);
            article.appendChild(details);

            similarProducts.appendChild(article);
        });
    }

    // Add selected product to the shopping cart.
    addToCartButton.addEventListener("click", function () {

        const model = productModel.value;
        const quantity = Number(productQuantity.value);

        if (!model) {
            cartMessage.textContent = "Please select a model.";
            cartMessage.style.color = "#b42318";
            productModel.focus();
            return;
        }

        if (!Number.isInteger(quantity) ||
            quantity < 1 || quantity > 20) {

            cartMessage.textContent =
                "Please enter a quantity between 1 and 20.";
            cartMessage.style.color = "#b42318";
            productQuantity.focus();
            return;
        }

        try {
            const savedCart = JSON.parse(
                localStorage.getItem("aagCart") || "[]"
            );

            const cart = Array.isArray(savedCart) ? savedCart : [];

            const existingItem = cart.find(function (item) {
                return item.id === selectedProduct.id &&
                       item.model === model;
            });

            
if (existingItem) {

    const updatedQuantity =
        Number(existingItem.quantity) + quantity;

    if (!Number.isInteger(updatedQuantity) ||
        updatedQuantity > 20) {

        cartMessage.textContent =
            "You can only add up to 20 of the same product and model.";

        cartMessage.style.color = "#b42318";
        productQuantity.focus();
        return;
    }

    existingItem.quantity = updatedQuantity;

} else {

                cart.push({
                    id: selectedProduct.id,
                    name: selectedProduct.name,
                    price: selectedProduct.price,
                    image: selectedProduct.image,
                    model: model,
                    quantity: quantity
                });
            }

            localStorage.setItem("aagCart", JSON.stringify(cart));

            cartMessage.textContent =
                quantity + " × " + selectedProduct.name +
                " added to your cart!";

            cartMessage.style.color = "#276749";

            // Refresh the number beside Your Cart.
            updateCartCount();

        } catch (error) {
            cartMessage.textContent =
                "Unable to save your cart. Please check your browser settings.";
            cartMessage.style.color = "#b42318";
        }
    });

});

/* =========================================
   SHOPPING CART PAGE
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const cartItemsContainer = document.getElementById("cartItems");

    // Only run on the Cart page.
    if (!cartItemsContainer) {
        return;
    }

    const emptyMessage = document.getElementById("emptyCartMessage");
    const subtotalElement = document.getElementById("cartSubtotal");
    const shippingElement = document.getElementById("cartShipping");
    const gstElement = document.getElementById("cartGST");
    const totalElement = document.getElementById("cartTotal");
    const shippingMessage = document.getElementById("freeShippingMessage");
    const nextButton = document.getElementById("cartNextButton");
    const cancelButton = document.getElementById("cartCancelButton");
    const pageMessage = document.getElementById("cartPageMessage");
    const couponButton = document.getElementById("applyCouponButton");
    const couponMessage = document.getElementById("couponMessage");

    const SHIPPING_FEE = 15;
    const FREE_SHIPPING_THRESHOLD = 600;
    const GST_RATE = 0.15;

    let cart = [];

    
// Read saved cart and reject invalid product data.
try {
    const storedCart = JSON.parse(
        localStorage.getItem("aagCart") || "[]"
    );

    if (Array.isArray(storedCart)) {

        const validCart = storedCart.filter(validateCartItem);

        cart = validCart;

        // Save the cleaned cart if invalid items were found.
        if (validCart.length !== storedCart.length) {
            localStorage.setItem(
                "aagCart",
                JSON.stringify(validCart)
            );
        }

    } else {
        cart = [];
    }

} catch (error) {
    cart = [];
}


    // Display NZ currency.
    function formatCurrency(amount) {
        return "$" + amount.toFixed(2);
    }

    // Save cart and update header count.
    function saveCart() {
        try {
            localStorage.setItem("aagCart", JSON.stringify(cart));
            updateCartCount();
            return true;
        } catch (error) {
            pageMessage.textContent =
                "Unable to save cart changes in this browser.";
            return false;
        }
    }

    // Calculate totals.
    function calculateTotals() {
        const subtotal = cart.reduce(function (sum, item) {
            return sum + Number(item.price) * Number(item.quantity);
        }, 0);

        const shipping = subtotal === 0
            ? 0
            : subtotal > FREE_SHIPPING_THRESHOLD
                ? 0
                : SHIPPING_FEE;

        // Product prices include GST.
        // Calculate GST portion of the order total.
        const total = subtotal + shipping;
        const gstIncluded = total * GST_RATE / (1 + GST_RATE);

        subtotalElement.textContent = formatCurrency(subtotal);
        shippingElement.textContent =
            shipping === 0 && subtotal > 0
                ? "FREE"
                : formatCurrency(shipping);

        gstElement.textContent = formatCurrency(gstIncluded);
        totalElement.textContent = formatCurrency(total);

        if (subtotal === 0) {
            shippingMessage.textContent = "";
        } else if (subtotal > FREE_SHIPPING_THRESHOLD) {
            shippingMessage.textContent =
                "Congratulations! Your order qualifies for free shipping.";
        } else {
            const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

            shippingMessage.textContent =
                "Spend more than " +
                formatCurrency(remaining) +
                " extra to qualify for free shipping.";
        }
    }

    // Build a single cart item using safe DOM methods.
    function createCartItem(item, index) {

        const article = document.createElement("article");
        article.className = "cart-item";

        // Product image and link.
        const imageLink = document.createElement("a");
        imageLink.href =
            "product.html?id=" + encodeURIComponent(item.id);

        const image = document.createElement("img");
        image.className = "cart-item-image";
        image.src = item.image;
        image.alt = item.name;

        imageLink.appendChild(image);

        // Product details.
        const details = document.createElement("div");

        const nameLink = document.createElement("a");
        nameLink.href = imageLink.href;

        const name = document.createElement("h3");
        name.className = "cart-item-name";
        name.textContent = item.name;

        nameLink.appendChild(name);

        const model = document.createElement("p");
        model.className = "cart-item-model";
        model.textContent = "Model: " + item.model;

        const price = document.createElement("p");
        price.className = "cart-item-price";
        price.textContent = formatCurrency(Number(item.price));

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "cart-remove-button";
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", function () {
            cart.splice(index, 1);
            saveCart();
            renderCart();
        });

        details.appendChild(nameLink);
        details.appendChild(model);
        details.appendChild(price);
        details.appendChild(removeButton);

        // Quantity input.
        const controls = document.createElement("div");
        controls.className = "cart-item-controls";

        const quantityLabel = document.createElement("label");
        quantityLabel.className = "visually-hidden";
        quantityLabel.textContent =
            "Quantity for " + item.name;

        const quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.className = "cart-item-quantity";
        quantityInput.min = "1";
        quantityInput.max = "20";
        quantityInput.step = "1";
        quantityInput.value = item.quantity;

        const quantityId = "cartQuantity" + index;
        quantityInput.id = quantityId;
        quantityLabel.htmlFor = quantityId;

        quantityInput.addEventListener("change", function () {
            const newQuantity = Number(quantityInput.value);

            if (!Number.isInteger(newQuantity) ||
                newQuantity < 1 ||
                newQuantity > 20) {

                pageMessage.textContent =
                    "Quantity must be between 1 and 20.";

                quantityInput.value = item.quantity;
                return;
            }

            pageMessage.textContent = "";
            cart[index].quantity = newQuantity;
            saveCart();
            renderCart();
        });

        controls.appendChild(quantityLabel);
        controls.appendChild(quantityInput);

        article.appendChild(imageLink);
        article.appendChild(details);
        article.appendChild(controls);

        return article;
    }

    // Render all cart items.
    function renderCart() {
        cartItemsContainer.replaceChildren();

        cart.forEach(function (item, index) {
            cartItemsContainer.appendChild(
                createCartItem(item, index)
            );
        });

        const isEmpty = cart.length === 0;

        emptyMessage.hidden = !isEmpty;
        nextButton.disabled = isEmpty;

        calculateTotals();
        updateCartCount();
    }

    // Continue to shipping.
    nextButton.addEventListener("click", function () {
        if (cart.length === 0) {
            pageMessage.textContent =
                "Please add a product before continuing.";
            return;
        }

        window.location.href = "shipping.html";
    });

    // Cancel checkout.
    cancelButton.addEventListener("click", function () {
        const confirmed = window.confirm(
            "Are you sure you want to cancel and clear your shopping cart?"
        );

        if (!confirmed) {
            return;
        }

        cart = [];
        saveCart();
        window.location.href = "shop.html";
    });

    // Coupon demonstration.
    couponButton.addEventListener("click", function () {
        couponMessage.textContent =
            "Coupon discounts are not available in this demo.";
    });

    // Initial display.
    renderCart();

});

/* =========================================
   SHIPPING DETAILS PAGE
   BIT703 Assessment 2
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const shippingForm = document.getElementById("shippingForm");

    // Only run on the Shipping Details page.
    if (!shippingForm) {
        return;
    }

    const summaryProducts = document.getElementById("shippingSummaryProducts");
    const subtotalElement = document.getElementById("shippingSubtotal");
    const shippingElement = document.getElementById("shippingCost");
    const gstElement = document.getElementById("shippingGST");
    const totalElement = document.getElementById("shippingTotal");
    const standardDeliveryLabel = document.getElementById("standardDeliveryLabel");
    const formMessage = document.getElementById("shippingFormMessage");
    const cancelButton = document.getElementById("shippingCancelButton");

    const STANDARD_SHIPPING = 15;
    const EXPRESS_SHIPPING = 20;
    const FREE_SHIPPING_THRESHOLD = 600;
    const GST_RATE = 0.15;

    let cart = [];

    try {
        const savedCart = JSON.parse(
            localStorage.getItem("aagCart") || "[]"
        );

        
cart = Array.isArray(savedCart)
    ? savedCart.filter(validateCartItem)
    : [];

    } catch (error) {
        cart = [];
    }

    function formatCurrency(amount) {
        return "$" + amount.toFixed(2);
    }

    // Calculate product subtotal.
    function getSubtotal() {
        return cart.reduce(function (sum, item) {
            return sum + Number(item.price) * Number(item.quantity);
        }, 0);
    }

    // Calculate delivery cost.
    function getDeliveryCost() {
        const subtotal = getSubtotal();

        if (subtotal === 0) {
            return 0;
        }

        const selectedMethod = shippingForm.querySelector(
            'input[name="deliveryMethod"]:checked'
        );

        if (selectedMethod && selectedMethod.value === "express") {
            return EXPRESS_SHIPPING;
        }

        return subtotal > FREE_SHIPPING_THRESHOLD
            ? 0
            : STANDARD_SHIPPING;
    }

    // Display the products in the order summary.
    function renderSummaryProducts() {

        summaryProducts.replaceChildren();

        cart.forEach(function (item) {

            const article = document.createElement("article");
            article.className = "shipping-summary-product";

            const image = document.createElement("img");
            image.src = item.image;
            image.alt = item.name;

            const details = document.createElement("div");

            const name = document.createElement("h3");
            name.textContent = item.name;

            const model = document.createElement("small");
            model.textContent =
                "Model: " + item.model +
                " | Qty: " + item.quantity;

            const price = document.createElement("p");
            price.textContent = formatCurrency(
                Number(item.price) * Number(item.quantity)
            );

            details.appendChild(name);
            details.appendChild(model);
            details.appendChild(price);

            article.appendChild(image);
            article.appendChild(details);

            summaryProducts.appendChild(article);
        });
    }

    // Update the order summary.
    function updateShippingSummary() {

        const subtotal = getSubtotal();
        const shipping = getDeliveryCost();
        const total = subtotal + shipping;

        // GST is included in displayed prices.
        const gstIncluded = total * GST_RATE / (1 + GST_RATE);

        subtotalElement.textContent = formatCurrency(subtotal);

        shippingElement.textContent =
            subtotal > 0 && shipping === 0
                ? "FREE"
                : formatCurrency(shipping);

        gstElement.textContent = formatCurrency(gstIncluded);
        totalElement.textContent = formatCurrency(total);

        standardDeliveryLabel.textContent =
            subtotal > FREE_SHIPPING_THRESHOLD
                ? "Free Shipping"
                : "Standard Shipping — $15";
    }

    // Display initial cart summary.
    renderSummaryProducts();
    updateShippingSummary();

    // Update totals when delivery option changes.
    const deliveryOptions = shippingForm.querySelectorAll(
        'input[name="deliveryMethod"]'
    );

    deliveryOptions.forEach(function (option) {
        option.addEventListener("change", updateShippingSummary);
    });

    // Restore previously entered shipping details.
    try {
        const savedDetails = JSON.parse(
            sessionStorage.getItem("aagShippingDetails") || "null"
        );

        if (savedDetails) {
            [
                "firstName",
                "lastName",
                "address1",
                "address2",
                "country",
                "city",
                "postcode",
                "phone"
            ].forEach(function (fieldName) {

                const field = shippingForm.elements.namedItem(fieldName);

                if (field && savedDetails[fieldName]) {
                    field.value = savedDetails[fieldName];
                }
            });

            if (savedDetails.deliveryMethod) {
                const savedMethod = shippingForm.querySelector(
                    'input[name="deliveryMethod"][value="' +
                    savedDetails.deliveryMethod + '"]'
                );

                if (savedMethod) {
                    savedMethod.checked = true;
                }
            }

            updateShippingSummary();
        }

    } catch (error) {
        // Continue with an empty form if saved data is unavailable.
    }

    // Validate individual fields.
    function validateField(field) {

        const existingError = field.parentElement.querySelector(
            ".field-error"
        );

        if (existingError) {
            existingError.remove();
        }

        field.classList.remove("is-invalid");
        field.removeAttribute("aria-invalid");

        // HTML5 validation: required, minlength, pattern, etc.
        if (!field.checkValidity()) {

            let message = "Please enter a valid value.";

            if (field.validity.valueMissing) {
                message = "This field is required.";
            } else if (field.validity.tooShort) {
                message = "Please enter more characters.";
            } else if (field.validity.patternMismatch) {
                message = field.id === "postcode"
                    ? "Enter a valid four-digit NZ postcode."
                    : "Please use the required format.";
            }

            showFieldError(field, message);
            return false;
        }

        // Additional JavaScript validation.
        const value = field.value.trim();

        if (field.required && value.length === 0) {
            showFieldError(field, "This field cannot be blank.");
            return false;
        }

        if (field.id === "phone") {
            const normalisedPhone = value.replace(/[\s()+-]/g, "");

            if (!/^\d{8,12}$/.test(normalisedPhone)) {
                showFieldError(
                    field,
                    "Enter a valid phone number using 8–12 digits."
                );
                return false;
            }
        }

        if (field.id === "postcode" && !/^\d{4}$/.test(value)) {
            showFieldError(
                field,
                "Enter a valid four-digit NZ postcode."
            );
            return false;
        }

        return true;
    }

    // Display a validation message beside a field.
    function showFieldError(field, message) {

        field.classList.add("is-invalid");
        field.setAttribute("aria-invalid", "true");

        const error = document.createElement("span");
        error.className = "field-error";
        error.textContent = message;

        field.parentElement.appendChild(error);
    }

    // Validate when the user leaves a field.
    const fields = shippingForm.querySelectorAll(
        ".shipping-field input, .shipping-field select"
    );

    fields.forEach(function (field) {

        field.addEventListener("blur", function () {
            if (field.value.trim() !== "" || field.required) {
                validateField(field);
            }
        });

        field.addEventListener("input", function () {
            if (field.classList.contains("is-invalid")) {
                validateField(field);
            }
        });

        field.addEventListener("change", function () {
            if (field.classList.contains("is-invalid")) {
                validateField(field);
            }
        });
    });

    // Submit form.
    shippingForm.addEventListener("submit", function (event) {

        event.preventDefault();
        formMessage.textContent = "";

        if (cart.length === 0) {
            formMessage.textContent =
                "Your shopping cart is empty. Please add a product first.";
            return;
        }

        let isValid = true;
        let firstInvalidField = null;

        fields.forEach(function (field) {

            if (!validateField(field)) {
                isValid = false;

                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
            }
        });

        if (!isValid) {
            formMessage.textContent =
                "Please correct the highlighted fields before continuing.";

            firstInvalidField.focus();
            return;
        }

        // Save shipping details for the Payment page.
        const shippingDetails = {
            firstName: document.getElementById("firstName").value.trim(),
            lastName: document.getElementById("lastName").value.trim(),
            address1: document.getElementById("address1").value.trim(),
            address2: document.getElementById("address2").value.trim(),
            country: document.getElementById("country").value,
            city: document.getElementById("city").value.trim(),
            postcode: document.getElementById("postcode").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            deliveryMethod: shippingForm.querySelector(
                'input[name="deliveryMethod"]:checked'
            ).value
        };

        try {
            sessionStorage.setItem(
                "aagShippingDetails",
                JSON.stringify(shippingDetails)
            );

            // Continue to Payment Options.
            window.location.href = "payment.html";

        } catch (error) {
            formMessage.textContent =
                "Unable to save shipping details. Please check your browser settings.";
        }
    });

    // Cancel returns to the Shopping Cart without clearing it.
    cancelButton.addEventListener("click", function () {
        window.location.href = "cart.html";
    });

});

/* =========================================
   PAYMENT OPTIONS PAGE
   BIT703 Assessment 2
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const paymentForm = document.getElementById("paymentForm");

    // Only run on the Payment Options page.
    if (!paymentForm) {
        return;
    }

    const summaryProducts =
        document.getElementById("paymentSummaryProducts");

    const subtotalElement =
        document.getElementById("paymentSubtotal");

    const shippingElement =
        document.getElementById("paymentShipping");

    const gstElement =
        document.getElementById("paymentGST");

    const totalElement =
        document.getElementById("paymentTotal");

    const cardFields =
        document.getElementById("cardPaymentFields");

    const formMessage =
        document.getElementById("paymentFormMessage");

    const successMessage =
        document.getElementById("paymentSuccess");

    const cancelButton =
        document.getElementById("paymentCancelButton");

    const payNowButton =
        document.getElementById("payNowButton");

    const STANDARD_SHIPPING = 15;
    const EXPRESS_SHIPPING = 20;
    const FREE_SHIPPING_THRESHOLD = 600;
    const GST_RATE = 0.15;

    let cart = [];
    let shippingDetails = null;

    // Retrieve saved shopping cart.
    try {
        const savedCart = JSON.parse(
            localStorage.getItem("aagCart") || "[]"
        );

        
cart = Array.isArray(savedCart)
    ? savedCart.filter(validateCartItem)
    : [];

    } catch (error) {
        cart = [];
    }

    // Retrieve shipping details.
    try {
        shippingDetails = JSON.parse(
            sessionStorage.getItem("aagShippingDetails") || "null"
        );
    } catch (error) {
        shippingDetails = null;
    }

    function formatCurrency(amount) {
        return "$" + amount.toFixed(2);
    }

    // Calculate the product subtotal.
    function getSubtotal() {
        return cart.reduce(function (sum, item) {
            return sum +
                Number(item.price) * Number(item.quantity);
        }, 0);
    }

    // Calculate shipping using the same rules
    // as the Cart and Shipping Details pages.
    function getShippingCost() {

        const subtotal = getSubtotal();

        if (subtotal === 0) {
            return 0;
        }

        if (shippingDetails &&
            shippingDetails.deliveryMethod === "express") {
            return EXPRESS_SHIPPING;
        }

        return subtotal > FREE_SHIPPING_THRESHOLD
            ? 0
            : STANDARD_SHIPPING;
    }

    // Display the products in the order summary.
    function renderPaymentProducts() {

        summaryProducts.replaceChildren();

        cart.forEach(function (item) {

            const article = document.createElement("article");
            article.className = "shipping-summary-product";

            const image = document.createElement("img");
            image.src = item.image;
            image.alt = item.name;

            const details = document.createElement("div");

            const name = document.createElement("h3");
            name.textContent = item.name;

            const model = document.createElement("small");
            model.textContent =
                "Model: " + item.model +
                " | Qty: " + item.quantity;

            const price = document.createElement("p");
            price.textContent = formatCurrency(
                Number(item.price) * Number(item.quantity)
            );

            details.appendChild(name);
            details.appendChild(model);
            details.appendChild(price);

            article.appendChild(image);
            article.appendChild(details);

            summaryProducts.appendChild(article);
        });
    }

    // Display subtotal, shipping, GST and total.
    function updatePaymentSummary() {

        const subtotal = getSubtotal();
        const shipping = getShippingCost();
        const total = subtotal + shipping;

        // GST is already included in the prices.
        const gstIncluded = total * GST_RATE / (1 + GST_RATE);

        subtotalElement.textContent = formatCurrency(subtotal);

        shippingElement.textContent =
            subtotal > 0 && shipping === 0
                ? "FREE"
                : formatCurrency(shipping);

        gstElement.textContent = formatCurrency(gstIncluded);
        totalElement.textContent = formatCurrency(total);
    }

    // Show or hide demonstration card fields.
    function updatePaymentMethod() {

        const selectedMethod = paymentForm.querySelector(
            'input[name="paymentMethod"]:checked'
        );

        const usingCard =
            selectedMethod && selectedMethod.value === "card";

        cardFields.hidden = !usingCard;

        // Clear any previous error message.
        formMessage.textContent = "";
    }

    // Listen for payment method changes.
    const paymentMethods = paymentForm.querySelectorAll(
        'input[name="paymentMethod"]'
    );

    paymentMethods.forEach(function (method) {
        method.addEventListener(
            "change",
            updatePaymentMethod
        );
    });

    // Display the order summary.
    renderPaymentProducts();
    updatePaymentSummary();
    updatePaymentMethod();

    // Prevent checkout with missing information.
    if (cart.length === 0) {
        formMessage.textContent =
            "Your cart is empty. Please add products before checkout.";

        payNowButton.disabled = true;

    } else if (!shippingDetails ||
               !shippingDetails.firstName ||
               !shippingDetails.address1 ||
               !shippingDetails.postcode ||
               !shippingDetails.deliveryMethod) {

        formMessage.textContent =
            "Shipping details are missing. Please complete the Shipping Details page first.";

        payNowButton.disabled = true;
    }

    // Simulated payment submission.
    paymentForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const selectedMethod = paymentForm.querySelector(
            'input[name="paymentMethod"]:checked'
        );

        if (!selectedMethod) {
            formMessage.textContent =
                "Please select a payment method.";
            return;
        }

        if (cart.length === 0 || !shippingDetails) {
            formMessage.textContent =
                "Your cart or shipping information is missing.";
            return;
        }

        // This is a demonstration only.
        // No payment information is collected or transmitted.
        paymentForm.hidden = true;
        successMessage.hidden = false;

        // Clear completed checkout data.
        try {
            localStorage.removeItem("aagCart");
            sessionStorage.removeItem("aagShippingDetails");

            // Update the header cart count.
            updateCartCount();

        } catch (error) {
            // Confirmation still displays if storage is unavailable.
        }

        successMessage.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });

    // Cancel returns to Shipping Details.
    cancelButton.addEventListener("click", function () {
        window.location.href = "shipping.html";
    });

});

/* =========================================
   FLOATING BACK TO TOP BUTTON
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const backToTop = document.getElementById("backToTop");

    if (!backToTop) {
        return;
    }

    function toggleBackToTop() {

        if (window.scrollY > 250) {
            backToTop.classList.add("show");
        } else {
            backToTop.classList.remove("show");
        }
    }

    window.addEventListener("scroll", toggleBackToTop);

    // Check the position when the page first loads.
    toggleBackToTop();

});
