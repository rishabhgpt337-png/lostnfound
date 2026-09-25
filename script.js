// ============================================================
//  Campus Lost & Found Portal — script.js
//  Course: FYBSc IT - Introduction to Programming
//
//  This script manages the complete client-side functionality:
//  - LocalStorage Data Persistence
//  - Single Page Application (SPA) Section Navigation
//  - Form Validation & Image Processing (FileReader)
//  - Dynamic DOM Rendering for Item Cards & Statistics
//  - Real-time Keyword Search & Category/Status Filtering
//  - Item Details Modal & Status Update ("Mark as Resolved")
//
//  Key Concepts Used for Viva:
//  1. Variables (let, const, var)
//  2. Data Structures (Arrays and Objects)
//  3. Functions and Parameter Passing
//  4. Conditional Logic (if / else if / else)
//  5. Iteration (for loops, forEach, filter, find)
//  6. DOM Selection & Manipulation (getElementById, querySelector, innerHTML)
//  7. Event Handling (addEventListener, submit, click, input, keydown)
//  8. Web APIs (localStorage, JSON.parse/stringify, FileReader)
// ============================================================


// ---------- 1. CONSTANTS & INITIAL SAMPLE DATA ----------

// LocalStorage key name used to store items in the user's browser
const STORAGE_KEY = "college_lost_found_items";

// Sample demonstration dataset pre-loaded when the app is first opened
const SAMPLE_ITEMS = [
    {
        id: 1,
        type: "Lost",
        name: "Black Leather Wallet",
        category: "Wallets/Bags",
        description: "[Demo Sample] Black WildHorn leather wallet containing college ID card and metro smart card.",
        date: "2026-09-23",
        location: "College Canteen Table 4",
        contactName: "Rahul Sharma (FYBSc IT)",
        contactNumber: "9876543210",
        image: "",
        status: "Active"
    },
    {
        id: 2,
        type: "Found",
        name: "Blue Milton Water Bottle",
        category: "Personal",
        description: "[Demo Sample] Stainless steel blue Milton 1-litre water bottle left on the study table.",
        date: "2026-09-24",
        location: "Library Reading Room (2nd Floor)",
        contactName: "Priya Mehta (SYBSc IT)",
        contactNumber: "9123456789",
        image: "",
        status: "Active"
    },
    {
        id: 3,
        type: "Lost",
        name: "Casio Scientific Calculator",
        category: "Electronics",
        description: "[Demo Sample] Casio fx-991EX calculator with an IT department sticker on the back cover.",
        date: "2026-09-22",
        location: "Computer Lab 3 (Ground Floor)",
        contactName: "Aman Verma (FYBSc IT)",
        contactNumber: "9000012345",
        image: "",
        status: "Active"
    },
    {
        id: 4,
        type: "Found",
        name: "Student ID Card & Lanyard",
        category: "ID/Documents",
        description: "[Demo Sample] First-year college identity card found near the auditorium entrance corridor.",
        date: "2026-09-21",
        location: "Main Auditorium Corridor",
        contactName: "Sunita Rao (Security Office)",
        contactNumber: "9765432108",
        image: "",
        status: "Resolved"
    }
];

// Current active filter state
let currentFilterType = "All";


// ---------- 2. LOCALSTORAGE HELPER FUNCTIONS ----------

/**
 * Retrieve all items from browser localStorage.
 * If no data exists yet, initialize with the sample dataset.
 * @returns {Array} Array of item objects
 */
function getItemsFromStorage() {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData === null) {
        // First visit: save and return default sample data
        saveItemsToStorage(SAMPLE_ITEMS);
        return [...SAMPLE_ITEMS];
    }
    try {
        return JSON.parse(rawData);
    } catch (e) {
        console.error("Error parsing localStorage data", e);
        return [];
    }
}

/**
 * Save the array of items to browser localStorage as a JSON string.
 * @param {Array} items - Array of item objects
 */
function saveItemsToStorage(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * Generate a new unique integer ID for an item.
 * @param {Array} items - Existing items array
 * @returns {number} Unique numeric ID
 */
function generateUniqueId(items) {
    if (!items || items.length === 0) return 1;
    let maxId = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].id > maxId) {
            maxId = items[i].id;
        }
    }
    return maxId + 1;
}

/**
 * Reset localStorage to sample demo items (useful for demonstrations).
 */
function resetToSampleData() {
    if (confirm("Reset all items back to the initial sample demonstration data?")) {
        saveItemsToStorage(SAMPLE_ITEMS);
        updateStats();
        renderItems();
        renderRecentItems();
        showToast("Demo data restored successfully!", "success");
    }
}


// ---------- 3. NAVIGATION & VIEW SWITCHING ----------

/**
 * Switch the visible section (Single Page App behavior).
 * @param {string} sectionId - 'home', 'report-lost', 'report-found', or 'items'
 */
function showSection(sectionId) {
    // 1. Hide all sections
    const sections = document.querySelectorAll(".main-content .section");
    sections.forEach(sec => sec.classList.remove("active"));

    // 2. Show the target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add("active");
    }

    // 3. Update active nav link
    const navLinks = document.querySelectorAll(".nav-menu li a");
    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + sectionId) {
            link.classList.add("active");
        }
    });

    // 4. Close mobile menu if open
    const navMenu = document.getElementById("nav-menu");
    if (navMenu) {
        navMenu.classList.remove("show");
    }

    // 5. Trigger section-specific updates
    if (sectionId === "items") {
        renderItems();
    } else if (sectionId === "home") {
        updateStats();
        renderRecentItems();
    }

    // 6. Scroll window to top
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Helper to jump directly from stats cards to the items page with a filter applied.
 * @param {string} filterType - 'Lost', 'Found', or 'Resolved'
 */
function filterAndShow(filterType) {
    setFilterType(filterType);
    showSection("items");
}

/**
 * Toggle mobile navigation hamburger menu.
 */
function toggleMobileNav() {
    const navMenu = document.getElementById("nav-menu");
    if (navMenu) {
        navMenu.classList.toggle("show");
    }
}


// ---------- 4. STATISTICS CALCULATION ----------

/**
 * Compute counts for Lost, Found, and Resolved items and update the UI.
 */
function updateStats() {
    const items = getItemsFromStorage();

    let lostCount = 0;
    let foundCount = 0;
    let resolvedCount = 0;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.status === "Resolved") {
            resolvedCount++;
        } else if (item.type === "Lost") {
            lostCount++;
        } else if (item.type === "Found") {
            foundCount++;
        }
    }

    // Update Home page statistics
    const totalLostEl = document.getElementById("total-lost");
    const totalFoundEl = document.getElementById("total-found");
    const totalResolvedEl = document.getElementById("total-resolved");

    if (totalLostEl) totalLostEl.textContent = lostCount;
    if (totalFoundEl) totalFoundEl.textContent = foundCount;
    if (totalResolvedEl) totalResolvedEl.textContent = resolvedCount;

    // Update Filter Tab badge counters on Items page
    const countAllEl = document.getElementById("count-all");
    const countLostEl = document.getElementById("count-lost");
    const countFoundEl = document.getElementById("count-found");
    const countResolvedEl = document.getElementById("count-resolved");

    if (countAllEl) countAllEl.textContent = items.length;
    if (countLostEl) countLostEl.textContent = lostCount;
    if (countFoundEl) countFoundEl.textContent = foundCount;
    if (countResolvedEl) countResolvedEl.textContent = resolvedCount;
}


// ---------- 5. IMAGE UPLOAD & PREVIEW (FileReader API) ----------

/**
 * Read and preview the selected image file before submission.
 * @param {HTMLInputElement} input - File input element
 * @param {string} previewContainerId - ID of preview container div
 */
function previewImage(input, previewContainerId) {
    const container = document.getElementById(previewContainerId);
    if (!container) return;

    const file = input.files && input.files[0];
    if (!file) {
        container.innerHTML = "";
        container.style.display = "none";
        return;
    }

    // Validate image file size (limit to ~1MB to keep localStorage lightweight)
    if (file.size > 1048576) {
        alert("Image size exceeds 1MB. Please select a smaller photo.");
        input.value = ""; // Clear file selection
        container.innerHTML = "";
        container.style.display = "none";
        return;
    }

    // Use FileReader to convert file into base64 Data URL
    const reader = new FileReader();
    reader.onload = function(e) {
        container.innerHTML = `
            <img src="${e.target.result}" alt="Photo Preview">
            <p style="font-size:0.75rem; color:#64748b; margin-top:4px;">Photo selected (${Math.round(file.size / 1024)} KB)</p>
        `;
        container.style.display = "block";
    };
    reader.readAsDataURL(file);
}

/**
 * Helper to read a file input as Base64 string asynchronously.
 * @param {HTMLInputElement} fileInput - Form file input element
 * @returns {Promise<string>} Base64 string or empty string
 */
function readFileAsBase64(fileInput) {
    return new Promise((resolve) => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) {
            resolve("");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        reader.onerror = function() {
            resolve("");
        };
        reader.readAsDataURL(file);
    });
}


// ---------- 6. FORM SUBMISSION & VALIDATION ----------

/**
 * Display a temporary alert message inside a form container.
 * @param {string} formAlertId - Container element ID
 * @param {string} message - Message text
 * @param {string} type - 'error' or 'success'
 */
function showFormAlert(formAlertId, message, type) {
    const alertBox = document.getElementById(formAlertId);
    if (!alertBox) return;

    alertBox.innerHTML = `
        <div class="form-alert ${type === 'success' ? 'form-alert-success' : 'form-alert-error'}">
            ${type === 'success' ? '✓ ' : '⚠️ '}${escapeHtml(message)}
        </div>
    `;

    setTimeout(() => {
        if (alertBox) alertBox.innerHTML = "";
    }, 4000);
}

/**
 * Validate form inputs.
 * @param {Object} data - Form data object
 * @returns {string|null} Error message or null if valid
 */
function validateFormData(data) {
    if (!data.name || data.name.trim() === "") {
        return "Please enter the item name.";
    }
    if (!data.category || data.category === "") {
        return "Please select a category.";
    }
    if (!data.date || data.date === "") {
        return "Please select a valid date.";
    }
    if (!data.location || data.location.trim() === "") {
        return "Please specify the location.";
    }
    if (!data.description || data.description.trim() === "") {
        return "Please provide a short description.";
    }
    if (!data.contactName || data.contactName.trim() === "") {
        return "Please enter your name.";
    }

    // Contact number validation: must be 10 digits
    const phoneClean = data.contactNumber.replace(/\D/g, "");
    if (phoneClean.length !== 10) {
        return "Please enter a valid 10-digit mobile number (e.g. 9876543210).";
    }

    return null; // Valid
}

/**
 * Handle form submission for Lost or Found reports.
 * @param {Event} event - Submit event
 * @param {string} formId - 'lost-form' or 'found-form'
 */
async function handleFormSubmit(event, formId) {
    event.preventDefault();

    const form = document.getElementById(formId);
    if (!form) return;

    const alertId = formId === "lost-form" ? "lost-form-alert" : "found-form-alert";
    const previewContainerId = formId === "lost-form" ? "lost-preview-container" : "found-preview-container";

    // Extract form values
    const type = form.elements["type"].value;
    const name = form.elements["name"].value.trim();
    const category = form.elements["category"].value;
    const date = form.elements["date"].value;
    const location = form.elements["location"].value.trim();
    const description = form.elements["description"].value.trim();
    const contactName = form.elements["contactName"].value.trim();
    const contactNumber = form.elements["contactNumber"].value.trim();
    const imageInput = form.elements["image"];

    // Validation
    const validationError = validateFormData({
        name, category, date, location, description, contactName, contactNumber
    });

    if (validationError) {
        showFormAlert(alertId, validationError, "error");
        return;
    }

    // Read image if selected
    const imageBase64 = await readFileAsBase64(imageInput);

    // Fetch existing items and create new record
    const items = getItemsFromStorage();
    const newItem = {
        id: generateUniqueId(items),
        type: type, // "Lost" or "Found"
        name: name,
        category: category,
        description: description,
        date: date,
        location: location,
        contactName: contactName,
        contactNumber: contactNumber,
        image: imageBase64,
        status: "Active"
    };

    // Prepend new item to the beginning of the list
    items.unshift(newItem);

    // Save to localStorage
    saveItemsToStorage(items);

    // Show success feedback
    showFormAlert(alertId, `${type} item report submitted successfully!`, "success");
    showToast(`Your ${type.toLowerCase()} item report has been published.`, "success");

    // Reset the form and preview box
    form.reset();
    const previewBox = document.getElementById(previewContainerId);
    if (previewBox) {
        previewBox.innerHTML = "";
        previewBox.style.display = "none";
    }

    // Refresh stats
    updateStats();

    // After 1.2 seconds, smoothly navigate to the items gallery to see the new post
    setTimeout(() => {
        showSection("items");
    }, 1200);
}


// ---------- 7. RENDERING ITEMS (GALLERY & HOME PREVIEW) ----------

/**
 * Get category icon/emoji helper.
 * @param {string} category
 * @returns {string} Emoji icon
 */
function getCategoryIcon(category) {
    switch (category) {
        case "Electronics": return "💻";
        case "ID/Documents": return "🪪";
        case "Wallets/Bags": return "👛";
        case "Stationery/Books": return "📚";
        case "Personal": return "🔑";
        case "Clothing": return "👕";
        default: return "📦";
    }
}

/**
 * Build an individual item card DOM element.
 * @param {Object} item - Item object
 * @returns {HTMLElement} Card element
 */
function createItemCardElement(item) {
    const card = document.createElement("div");
    card.className = `item-card ${item.status === "Resolved" ? "is-resolved" : ""}`;

    // Status / Type badge setup
    let badgeClass = "badge-lost";
    let badgeLabel = "Lost Item";
    let badgeIcon = "🔴";

    if (item.status === "Resolved") {
        badgeClass = "badge-resolved";
        badgeLabel = "Resolved";
        badgeIcon = "✅";
    } else if (item.type === "Found") {
        badgeClass = "badge-found";
        badgeLabel = "Found Item";
        badgeIcon = "🟢";
    }

    // Media: image or clean placeholder
    let mediaHtml = "";
    if (item.image && item.image.trim() !== "") {
        mediaHtml = `<img src="${item.image}" alt="${escapeHtml(item.name)}">`;
    } else {
        mediaHtml = `<span class="card-placeholder-icon">${getCategoryIcon(item.category)}</span>`;
    }

    // Resolve button HTML (only if not already resolved)
    let resolveBtnHtml = "";
    if (item.status !== "Resolved") {
        resolveBtnHtml = `
            <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); markItemAsResolved(${item.id})">
                ✓ Resolve
            </button>
        `;
    }

    card.innerHTML = `
        <div class="card-media">
            ${mediaHtml}
            <div class="card-badge-container">
                <span class="badge ${badgeClass}">
                    <span>${badgeIcon}</span> ${badgeLabel}
                </span>
            </div>
        </div>
        <div class="card-body">
            <span class="card-category">${getCategoryIcon(item.category)} ${escapeHtml(item.category)}</span>
            <h3 class="card-title">${escapeHtml(item.name)}</h3>
            <p class="card-desc">${escapeHtml(item.description)}</p>
            <ul class="card-meta-list">
                <li><span>📍</span> <strong>Location:</strong> ${escapeHtml(item.location)}</li>
                <li><span>📅</span> <strong>Date:</strong> ${formatDate(item.date)}</li>
                <li><span>👤</span> <strong>Contact:</strong> ${escapeHtml(item.contactName)}</li>
            </ul>
            <div class="card-actions">
                <button class="btn btn-outline btn-sm" onclick="openModal(${item.id})">
                    View Details
                </button>
                ${resolveBtnHtml}
            </div>
        </div>
    `;

    return card;
}

/**
 * Render items in the main gallery based on search, status tab, and category filter.
 */
function renderItems() {
    const items = getItemsFromStorage();
    const searchInput = document.getElementById("search");
    const categorySelect = document.getElementById("filter-category");
    const grid = document.getElementById("items-grid");
    const resultsSummary = document.getElementById("results-count-text");
    const clearSearchBtn = document.getElementById("clear-search");
    const resetFiltersBtn = document.getElementById("reset-all-filters");

    if (!grid) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const selectedCategory = categorySelect ? categorySelect.value : "All";

    // Show or hide clear button inside search box
    if (clearSearchBtn) {
        clearSearchBtn.style.display = query.length > 0 ? "block" : "none";
    }

    // Filter items
    const filteredItems = items.filter(item => {
        // 1. Search Query match (searches name, location, and description)
        const matchesSearch = query === "" ||
            item.name.toLowerCase().includes(query) ||
            item.location.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query);

        // 2. Status / Type Filter tab match
        let matchesType = false;
        if (currentFilterType === "All") {
            matchesType = true;
        } else if (currentFilterType === "Resolved") {
            matchesType = (item.status === "Resolved");
        } else {
            // Lost or Found active items
            matchesType = (item.type === currentFilterType && item.status !== "Resolved");
        }

        // 3. Category Dropdown match
        let matchesCategory = false;
        if (selectedCategory === "All" || item.category === selectedCategory) {
            matchesCategory = true;
        }

        return matchesSearch && matchesType && matchesCategory;
    });

    // Clear grid
    grid.innerHTML = "";

    // Show summary text
    if (resultsSummary) {
        const filterName = currentFilterType === "All" ? "Total" : currentFilterType;
        resultsSummary.textContent = `Showing ${filteredItems.length} of ${items.length} items (${filterName})`;
    }

    // Show reset button if any filter is active
    if (resetFiltersBtn) {
        const isFiltered = query !== "" || currentFilterType !== "All" || selectedCategory !== "All";
        resetFiltersBtn.style.display = isFiltered ? "inline-block" : "none";
    }

    // If empty
    if (filteredItems.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔎</div>
                <h3>No Matching Items Found</h3>
                <p>We couldn't find any lost or found items matching your current search and filter criteria.</p>
                <button class="btn btn-secondary btn-sm" onclick="resetFilters()">Clear Filters</button>
            </div>
        `;
        return;
    }

    // Append cards
    filteredItems.forEach(item => {
        grid.appendChild(createItemCardElement(item));
    });

    // Keep statistics numbers in sync
    updateStats();
}

/**
 * Render the 3 most recent items on the Home Page preview section.
 */
function renderRecentItems() {
    const recentGrid = document.getElementById("recent-items-grid");
    if (!recentGrid) return;

    const items = getItemsFromStorage();
    recentGrid.innerHTML = "";

    if (items.length === 0) {
        recentGrid.innerHTML = `
            <div class="empty-state">
                <p>No items reported yet. Be the first to report a lost or found item!</p>
            </div>
        `;
        return;
    }

    // Take the first 3 items
    const recentList = items.slice(0, 3);
    recentList.forEach(item => {
        recentGrid.appendChild(createItemCardElement(item));
    });
}


// ---------- 8. FILTER & SEARCH CONTROL HELPERS ----------

/**
 * Set the current status tab filter ('All', 'Lost', 'Found', 'Resolved').
 * @param {string} filterType
 */
function setFilterType(filterType) {
    currentFilterType = filterType;

    // Update tab button classes
    const tabs = ["All", "Lost", "Found", "Resolved"];
    tabs.forEach(tab => {
        const btn = document.getElementById(`tab-${tab}`);
        if (btn) {
            if (tab === filterType) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        }
    });

    renderItems();
}

/**
 * Clear the search box input and refresh results.
 */
function clearSearch() {
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.value = "";
        renderItems();
        searchInput.focus();
    }
}

/**
 * Reset all filters (search, tab, category dropdown) back to default.
 */
function resetFilters() {
    const searchInput = document.getElementById("search");
    const categorySelect = document.getElementById("filter-category");

    if (searchInput) searchInput.value = "";
    if (categorySelect) categorySelect.value = "All";

    setFilterType("All");
}


// ---------- 9. ITEM DETAILS MODAL & RESOLVE ACTION ----------

/**
 * Open the detailed view modal for a given item ID.
 * @param {number} itemId - ID of the item
 */
function openModal(itemId) {
    const items = getItemsFromStorage();
    const item = items.find(i => i.id === itemId);

    if (!item) return;

    const modalBody = document.getElementById("modal-body");
    const modal = document.getElementById("item-modal");

    if (!modalBody || !modal) return;

    // Badges setup
    let typeBadgeClass = item.type === "Lost" ? "badge-lost" : "badge-found";
    let statusBadgeClass = item.status === "Resolved" ? "badge-resolved" : "badge-found";

    // Media HTML
    let mediaHtml = "";
    if (item.image && item.image.trim() !== "") {
        mediaHtml = `
            <div class="modal-media">
                <img src="${item.image}" alt="${escapeHtml(item.name)}">
            </div>
        `;
    }

    // Resolve Button
    let resolveButtonHtml = "";
    if (item.status !== "Resolved") {
        resolveButtonHtml = `
            <button class="btn btn-success" onclick="markItemAsResolved(${item.id})">
                ✓ Mark as Resolved / Returned
            </button>
        `;
    } else {
        resolveButtonHtml = `
            <button class="btn btn-secondary" disabled style="cursor:default;">
                ✓ This item is marked as Resolved
            </button>
        `;
    }

    modalBody.innerHTML = `
        <div class="modal-header-badges">
            <span class="badge ${typeBadgeClass}">
                ${item.type === "Lost" ? "🔴 Lost Item" : "🟢 Found Item"}
            </span>
            <span class="badge ${statusBadgeClass}">
                Status: ${item.status}
            </span>
        </div>

        ${mediaHtml}

        <h2 id="modal-title" class="modal-title">${escapeHtml(item.name)}</h2>

        <div class="modal-desc-box">
            <strong>Description:</strong><br>
            ${escapeHtml(item.description)}
        </div>

        <table class="modal-details-table">
            <tbody>
                <tr>
                    <th>Category</th>
                    <td>${getCategoryIcon(item.category)} ${escapeHtml(item.category)}</td>
                </tr>
                <tr>
                    <th>Location</th>
                    <td>📍 ${escapeHtml(item.location)}</td>
                </tr>
                <tr>
                    <th>Date Reported</th>
                    <td>📅 ${formatDate(item.date)}</td>
                </tr>
                <tr>
                    <th>Contact Person</th>
                    <td>👤 ${escapeHtml(item.contactName)}</td>
                </tr>
                <tr>
                    <th>Contact Number</th>
                    <td>📞 <a href="tel:${escapeHtml(item.contactNumber)}" style="color:var(--primary-light);font-weight:700;">${escapeHtml(item.contactNumber)}</a></td>
                </tr>
                <tr>
                    <th>Current Status</th>
                    <td><strong>${escapeHtml(item.status)}</strong></td>
                </tr>
            </tbody>
        </table>

        <div class="modal-actions">
            ${resolveButtonHtml}
            <a href="tel:${escapeHtml(item.contactNumber)}" class="btn btn-primary">
                📞 Call Contact
            </a>
            <button class="btn btn-secondary" onclick="closeModal()">
                Close
            </button>
        </div>
    `;

    modal.style.display = "flex";
    document.body.style.overflow = "hidden"; // Prevent background scrolling
}

/**
 * Close the item details modal.
 */
function closeModal() {
    const modal = document.getElementById("item-modal");
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

/**
 * Change the status of an item to 'Resolved'.
 * @param {number} itemId - ID of item to resolve
 */
function markItemAsResolved(itemId) {
    if (!confirm("Are you sure you want to mark this item as Resolved / Handed Over?")) {
        return;
    }

    const items = getItemsFromStorage();
    let found = false;

    for (let i = 0; i < items.length; i++) {
        if (items[i].id === itemId) {
            items[i].status = "Resolved";
            found = true;
            break;
        }
    }

    if (found) {
        saveItemsToStorage(items);
        updateStats();
        renderItems();
        renderRecentItems();
        closeModal();
        showToast("Item status updated to Resolved! ✓", "success");
    }
}


// ---------- 10. TOAST NOTIFICATIONS ----------

/**
 * Display a floating toast notification.
 * @param {string} message - Message text
 * @param {string} type - 'success' or 'info'
 */
function showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.innerHTML = `${type === "success" ? "✓" : "ℹ"} ${escapeHtml(message)}`;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}


// ---------- 11. STRING & DATE UTILITY FUNCTIONS ----------

/**
 * Escape HTML special characters to prevent XSS injection.
 * @param {string} str - Raw text string
 * @returns {string} Sanitized string
 */
function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

/**
 * Format ISO date (YYYY-MM-DD) into readable format (e.g., 23 Sep 2026).
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {string} Formatted date
 */
function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    if (monthIndex >= 0 && monthIndex < 12) {
        return `${day} ${months[monthIndex]} ${year}`;
    }
    return dateStr;
}


// ---------- 12. INITIALIZATION & EVENT LISTENERS ----------

document.addEventListener("DOMContentLoaded", function() {

    // 1. Set max date on date inputs to today's date so users can't pick future dates
    const todayStr = new Date().toISOString().split("T")[0];
    const lostDateInput = document.getElementById("lost-date");
    const foundDateInput = document.getElementById("found-date");
    if (lostDateInput) lostDateInput.setAttribute("max", todayStr);
    if (foundDateInput) foundDateInput.setAttribute("max", todayStr);

    // 2. Attach Form Submission Event Listeners
    const lostForm = document.getElementById("lost-form");
    if (lostForm) {
        lostForm.addEventListener("submit", (e) => handleFormSubmit(e, "lost-form"));
    }

    const foundForm = document.getElementById("found-form");
    if (foundForm) {
        foundForm.addEventListener("submit", (e) => handleFormSubmit(e, "found-form"));
    }

    // 3. Close modal when pressing the Escape key
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            closeModal();
        }
    });

    // 4. Handle initial URL Hash Navigation (e.g. #items, #report-lost)
    const hash = window.location.hash.replace("#", "");
    if (["home", "report-lost", "report-found", "items"].includes(hash)) {
        showSection(hash);
    } else {
        showSection("home");
    }

    // 5. Initial Data Loading & UI Render
    updateStats();
    renderRecentItems();
});
