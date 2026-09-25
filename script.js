// ============================================================
//  Campus Lost & Found Portal — script.js
//  This file handles all the JavaScript logic for the app.
//
//  Topics used (for viva explanation):
//  - Variables (var, let, const)
//  - Arrays and Objects
//  - Functions
//  - if/else conditions
//  - for loops
//  - Event listeners
//  - DOM manipulation (getElementById, innerHTML, classList)
//  - localStorage (save and load data in the browser)
//  - FileReader API (read image file as a data URL string)
// ============================================================


// ---------- 1. SAMPLE DATA ----------
// This array is used to pre-fill the app when no data exists.
// It helps demonstrate the features in a fresh browser.
var sampleItems = [
    {
        id: 1,
        type: "Lost",
        name: "Black Wallet",
        category: "Wallets/Bags",
        description: "[Sample Entry] Black leather wallet with college ID card and some cash inside.",
        date: "2026-09-20",
        location: "College Canteen",
        contactName: "Rahul Sharma",
        contactNumber: "9876543210",
        image: "",
        status: "Active"
    },
    {
        id: 2,
        type: "Found",
        name: "Water Bottle (Blue)",
        category: "Personal",
        description: "[Sample Entry] Blue Milton steel bottle found near the library entrance.",
        date: "2026-09-21",
        location: "Library",
        contactName: "Priya Mehta",
        contactNumber: "9123456789",
        image: "",
        status: "Active"
    },
    {
        id: 3,
        type: "Lost",
        name: "Calculator (Casio)",
        category: "Electronics",
        description: "[Sample Entry] Casio scientific calculator with a small scratch on the corner.",
        date: "2026-09-18",
        location: "Computer Lab 3",
        contactName: "Aman Verma",
        contactNumber: "9000012345",
        image: "",
        status: "Active"
    },
    {
        id: 4,
        type: "Found",
        name: "College ID Card",
        category: "ID/Documents",
        description: "[Sample Entry] Found a college ID card on the ground floor corridor near Room 101.",
        date: "2026-09-22",
        location: "Main Corridor",
        contactName: "Sunita Rao",
        contactNumber: "9765432108",
        image: "",
        status: "Resolved"
    }
];


// ---------- 2. LOAD/SAVE to localStorage ----------

// Load items array from localStorage.
// If nothing is there yet, use the sample data.
function loadItems() {
    var stored = localStorage.getItem("campusLostFoundItems");

    if (stored === null) {
        // First time — no data in localStorage yet.
        // Save sample data so there is something to display.
        saveItems(sampleItems);
        return sampleItems;
    }

    // JSON.parse converts the stored text back into a JavaScript array
    return JSON.parse(stored);
}

// Save the items array into localStorage.
// JSON.stringify converts the array to a text string for storage.
function saveItems(items) {
    localStorage.setItem("campusLostFoundItems", JSON.stringify(items));
}

// Get a new unique ID by finding the highest existing ID and adding 1.
function getNewId(items) {
    if (items.length === 0) {
        return 1;
    }
    var maxId = 0;
    for (var i = 0; i < items.length; i++) {
        if (items[i].id > maxId) {
            maxId = items[i].id;
        }
    }
    return maxId + 1;
}


// ---------- 3. STATISTICS ----------

// Count and display how many items are Lost, Found, and Resolved.
function updateStats() {
    var items = loadItems();
    var lostCount = 0;
    var foundCount = 0;
    var resolvedCount = 0;

    // Loop through all items and count each type
    for (var i = 0; i < items.length; i++) {
        if (items[i].status === "Resolved") {
            resolvedCount++;
        } else if (items[i].type === "Lost") {
            lostCount++;
        } else if (items[i].type === "Found") {
            foundCount++;
        }
    }

    // Update the numbers on the home page
    document.getElementById("total-lost").textContent = lostCount;
    document.getElementById("total-found").textContent = foundCount;
    document.getElementById("total-resolved").textContent = resolvedCount;
}


// ---------- 4. NAVIGATION ----------

// Show the selected section and hide others.
// Also highlight the active nav link.
function showSection(sectionId) {
    // Get all <section> elements on the page
    var sections = document.querySelectorAll("main section");

    // Hide every section
    for (var i = 0; i < sections.length; i++) {
        sections[i].classList.remove("active");
    }

    // Show only the section that was clicked
    var target = document.getElementById(sectionId);
    if (target) {
        target.classList.add("active");
    }

    // If user goes to the items page, render the items list
    if (sectionId === "items") {
        renderItems();
    }

    // Update stats every time user goes home
    if (sectionId === "home") {
        updateStats();
    }

    // Highlight the correct nav link
    var navLinks = document.querySelectorAll("nav ul li a");
    for (var j = 0; j < navLinks.length; j++) {
        navLinks[j].classList.remove("active");
        if (navLinks[j].getAttribute("href") === "#" + sectionId) {
            navLinks[j].classList.add("active");
        }
    }

    // Smooth scroll to top
    window.scrollTo(0, 0);
}


// ---------- 5. FORM HANDLING ----------

// Read image file as a base64 data URL using FileReader.
// This lets us store and display images without a server.
function readImageFile(fileInput, callback) {
    var file = fileInput.files[0];
    if (!file) {
        // No file selected
        callback("");
        return;
    }

    // Check file size — localStorage has a limit (~5MB total)
    // We restrict images to around 1MB to be safe
    if (file.size > 1048576) {
        showMessage("Image is too large. Please use an image smaller than 1MB.", "error", fileInput.closest("form"));
        callback("");
        return;
    }

    var reader = new FileReader();
    reader.onload = function(event) {
        // event.target.result is the image as a data URL string
        callback(event.target.result);
    };
    reader.readAsDataURL(file);
}

// Show a success or error message above the form
function showMessage(text, type, formElement) {
    // Remove any existing message first
    var oldMsg = formElement.querySelector(".msg-success, .msg-error");
    if (oldMsg) {
        oldMsg.remove();
    }

    var msg = document.createElement("div");
    msg.textContent = text;
    msg.className = (type === "success") ? "msg-success" : "msg-error";

    // Insert message at the top of the form
    formElement.insertBefore(msg, formElement.firstChild);

    // Auto-remove after 4 seconds
    setTimeout(function() {
        if (msg.parentNode) {
            msg.remove();
        }
    }, 4000);
}

// Validate and submit the Lost item form
function handleLostForm(event) {
    event.preventDefault(); // Stop the default form submit behavior

    var form = document.getElementById("lost-form");
    var contactNumber = form.elements["contactNumber"].value.trim();

    // Simple validation: contact number must be exactly 10 digits
    if (contactNumber.length !== 10 || isNaN(contactNumber)) {
        showMessage("Please enter a valid 10-digit contact number.", "error", form);
        return;
    }

    // Read image file, then save the item
    readImageFile(form.elements["image"], function(imageData) {
        submitItem(form, imageData);
    });
}

// Validate and submit the Found item form
function handleFoundForm(event) {
    event.preventDefault();

    var form = document.getElementById("found-form");
    var contactNumber = form.elements["contactNumber"].value.trim();

    if (contactNumber.length !== 10 || isNaN(contactNumber)) {
        showMessage("Please enter a valid 10-digit contact number.", "error", form);
        return;
    }

    readImageFile(form.elements["image"], function(imageData) {
        submitItem(form, imageData);
    });
}

// Build the item object and save it to localStorage
function submitItem(form, imageData) {
    var items = loadItems();

    // Create a new item object from the form values
    var newItem = {
        id: getNewId(items),
        type: form.elements["type"].value,       // "Lost" or "Found"
        name: form.elements["name"].value.trim(),
        category: form.elements["category"].value,
        description: form.elements["description"].value.trim(),
        date: form.elements["date"].value,
        location: form.elements["location"].value.trim(),
        contactName: form.elements["contactName"].value.trim(),
        contactNumber: form.elements["contactNumber"].value.trim(),
        image: imageData,  // base64 string or empty string
        status: "Active"
    };

    // Add the new item to the array
    items.push(newItem);

    // Save the updated array back to localStorage
    saveItems(items);

    // Show success message and reset the form
    showMessage("Item reported successfully!", "success", form);
    form.reset();

    // Update stats on the home page in the background
    updateStats();
}


// ---------- 6. DISPLAY ITEMS ----------

// Get the filtered search text and type filter value,
// then build and show item cards.
function renderItems() {
    var items = loadItems();
    var searchText = document.getElementById("search").value.toLowerCase().trim();
    var filterType = document.getElementById("filter-type").value;
    var grid = document.getElementById("items-grid");

    // Filter items based on search and selected type
    var filtered = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];

        // Check if item matches the search text
        var matchesSearch = (
            item.name.toLowerCase().includes(searchText) ||
            item.location.toLowerCase().includes(searchText)
        );

        // Check if item matches the type filter
        var matchesFilter = false;
        if (filterType === "All") {
            matchesFilter = true;
        } else if (filterType === "Resolved") {
            matchesFilter = (item.status === "Resolved");
        } else {
            matchesFilter = (item.type === filterType && item.status !== "Resolved");
        }

        if (matchesSearch && matchesFilter) {
            filtered.push(item);
        }
    }

    // Clear the current grid
    grid.innerHTML = "";

    if (filtered.length === 0) {
        grid.innerHTML = '<p class="no-items">No items found.</p>';
        return;
    }

    // Create a card for each filtered item
    for (var j = 0; j < filtered.length; j++) {
        grid.appendChild(createItemCard(filtered[j]));
    }
}

// Build one item card as a DOM element
function createItemCard(item) {
    var card = document.createElement("div");
    card.className = "item-card";

    // Set badge class based on type/status
    var badgeClass = "badge-lost";
    var badgeText = "Lost";
    if (item.status === "Resolved") {
        badgeClass = "badge-resolved";
        badgeText = "Resolved";
    } else if (item.type === "Found") {
        badgeClass = "badge-found";
        badgeText = "Found";
    }

    // If an image is stored, show it on the card
    var imgHtml = "";
    if (item.image) {
        imgHtml = '<img src="' + item.image + '" alt="Item image">';
    }

    // Build the card HTML
    card.innerHTML =
        imgHtml +
        '<span class="badge ' + badgeClass + '">' + badgeText + '</span>' +
        '<h3>' + escapeHtml(item.name) + '</h3>' +
        '<p class="card-category">' + escapeHtml(item.category) + '</p>' +
        '<p class="card-desc">' + escapeHtml(item.description) + '</p>' +
        '<p class="card-meta">' + escapeHtml(item.location) + ' &bull; ' + item.date + '</p>';

    // When the card is clicked, open the item detail modal
    card.addEventListener("click", function() {
        openModal(item.id);
    });

    return card;
}

// Simple helper to prevent XSS — replace special characters
function escapeHtml(text) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}


// ---------- 7. MODAL (ITEM DETAILS) ----------

// Find the item with the given id and display its full details in the modal
function openModal(itemId) {
    var items = loadItems();
    var item = null;

    // Find the item with matching id
    for (var i = 0; i < items.length; i++) {
        if (items[i].id === itemId) {
            item = items[i];
            break;
        }
    }

    if (!item) return;

    var modalBody = document.getElementById("modal-body");

    // Decide the badge text and button for resolve
    var badgeClass = (item.type === "Lost") ? "badge-lost" : "badge-found";
    if (item.status === "Resolved") {
        badgeClass = "badge-resolved";
    }

    var resolveButtonHTML = "";
    if (item.status !== "Resolved") {
        resolveButtonHTML =
            '<button class="resolve-btn" onclick="markResolved(' + item.id + ')">Mark as Resolved</button>';
    } else {
        resolveButtonHTML =
            '<button class="resolve-btn resolved" disabled>✓ Resolved</button>';
    }

    var imgHtml = "";
    if (item.image) {
        imgHtml = '<img src="' + item.image + '" alt="' + escapeHtml(item.name) + '">';
    }

    var badgeLabel = (item.status === "Resolved") ? "Resolved" : item.type;

    modalBody.innerHTML =
        imgHtml +
        '<span class="badge ' + badgeClass + '" style="margin-bottom:12px;display:inline-block;">' + badgeLabel + '</span>' +
        '<h2 style="text-align:left;margin-bottom:16px;">' + escapeHtml(item.name) + '</h2>' +
        '<div class="detail-row"><strong>Category:</strong> ' + escapeHtml(item.category) + '</div>' +
        '<div class="detail-row"><strong>Description:</strong> ' + escapeHtml(item.description) + '</div>' +
        '<div class="detail-row"><strong>Date:</strong> ' + item.date + '</div>' +
        '<div class="detail-row"><strong>Location:</strong> ' + escapeHtml(item.location) + '</div>' +
        '<div class="detail-row"><strong>Contact Name:</strong> ' + escapeHtml(item.contactName) + '</div>' +
        '<div class="detail-row"><strong>Contact Number:</strong> ' + escapeHtml(item.contactNumber) + '</div>' +
        '<div class="detail-row"><strong>Status:</strong> ' + item.status + '</div>' +
        resolveButtonHTML;

    // Show the modal
    document.getElementById("item-modal").style.display = "flex";
}

// Close the modal when user clicks X or clicks outside
function closeModal() {
    document.getElementById("item-modal").style.display = "none";
}


// ---------- 8. MARK AS RESOLVED ----------

// Change the status of an item to "Resolved" and save
function markResolved(itemId) {
    var items = loadItems();

    // Find the item and update its status
    for (var i = 0; i < items.length; i++) {
        if (items[i].id === itemId) {
            items[i].status = "Resolved";
            break;
        }
    }

    saveItems(items);    // Save updated list
    closeModal();        // Close modal
    renderItems();       // Refresh the items grid
    updateStats();       // Refresh statistics

    alert("Item has been marked as Resolved!");
}


// ---------- 9. EVENT LISTENERS & PAGE INIT ----------

// Wait for the entire HTML page to load before running our code
document.addEventListener("DOMContentLoaded", function() {

    // Attach Lost form submit handler
    document.getElementById("lost-form").addEventListener("submit", handleLostForm);

    // Attach Found form submit handler
    document.getElementById("found-form").addEventListener("submit", handleFoundForm);

    // Search box: filter items as the user types
    document.getElementById("search").addEventListener("input", renderItems);

    // Close modal if user clicks on the dark background (outside the box)
    document.getElementById("item-modal").addEventListener("click", function(event) {
        if (event.target === this) {
            closeModal();
        }
    });

    // Load statistics on first render
    updateStats();
});
