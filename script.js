// ============================================================
//  Campus Lost & Found Portal — script.js
//  Course: FYBSc IT - Introduction to Programming
//
//  Now powered by Supabase for real multi-device synchronization.
//  Any item submitted on one phone is instantly visible on all devices.
//
//  Key Concepts Used for Viva:
//  1. Variables (let, const)
//  2. Arrays and Objects (items array, item object)
//  3. Functions with Parameters (addItem, loadItems, markAsResolved)
//  4. Conditional Statements (if/else)
//  5. Loops (forEach, for)
//  6. DOM Manipulation (getElementById, innerHTML, classList)
//  7. Event Listeners (addEventListener, submit, click, keydown)
//  8. Async/Await & Promises (for database calls)
//  9. Supabase Database (select, insert, update)
//  10. Supabase Storage (image upload & public URL)
// ============================================================



// =====================================================
//  SECTION 1: DATABASE CONNECTION & STATUS
// =====================================================

/**
 * Show a banner at the top of the page for database or connection issues.
 * type: 'error' shows red | 'warning' shows yellow
 */
function showDbBanner(message, type) {
    const banner = document.getElementById("db-connection-banner");
    if (!banner) return;
    banner.className = "db-banner " + (type === "error" ? "error" : "");
    banner.innerHTML = (type === "error" ? "⚠️ " : "ℹ️ ") + message;
    banner.style.display = "flex";
}

function hideDbBanner() {
    const banner = document.getElementById("db-connection-banner");
    if (banner) banner.style.display = "none";
}

/**
 * Check if the Supabase client is available.
 * Returns true if connected, false if not.
 */
function isConnected() {
    if (!dbClient) {
        showDbBanner(
            "Database not connected. Please add your Supabase credentials to config.js.",
            "error"
        );
        return false;
    }
    return true;
}



// =====================================================
//  SECTION 2: DATABASE OPERATIONS
// =====================================================

/**
 * Load all items from Supabase database (newest first).
 * Returns an array of item objects, or an empty array if error.
 */
async function loadItems() {
    if (!isConnected()) return [];

    const { data, error } = await dbClient
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error loading items from Supabase:", error.message);
        showDbBanner("Unable to load items from the database. Please try again.", "error");
        return [];
    }

    hideDbBanner();
    return data;
}

/**
 * Insert a new item report into the Supabase database.
 * Returns true on success, false on failure.
 */
async function addItem(newItem) {
    if (!isConnected()) return false;

    const { error } = await dbClient
        .from("items")
        .insert([newItem]);

    if (error) {
        console.error("Error adding item to Supabase:", error.message);
        return false;
    }

    return true;
}

/**
 * Update an item's status to "Resolved" in the Supabase database.
 * Returns true on success, false on failure.
 */
async function markAsResolved(itemId) {
    if (!isConnected()) return false;

    const { error } = await dbClient
        .from("items")
        .update({ status: "Resolved" })
        .eq("id", itemId);

    if (error) {
        console.error("Error updating item status:", error.message);
        return false;
    }

    return true;
}

/**
 * Upload an image to Supabase Storage.
 * Returns the public URL string, or empty string if failed or no file.
 */
async function uploadItemImage(fileInput) {
    if (!isConnected()) return "";

    const file = fileInput && fileInput.files && fileInput.files[0];
    if (!file) return "";

    // Generate a unique file path using timestamp
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await dbClient.storage
        .from("item-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
        console.error("Image upload failed:", uploadError.message);
        return ""; // Don't block item submission on image failure
    }

    const { data } = dbClient.storage
        .from("item-images")
        .getPublicUrl(fileName);

    return data.publicUrl || "";
}



// =====================================================
//  SECTION 3: STATISTICS
// =====================================================

/**
 * Load items and update the stats counters on home page and items page.
 */
async function updateStats() {
    const items = await loadItems();

    let lostCount = 0;
    let foundCount = 0;
    let resolvedCount = 0;

    // Count each item by type and status
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

    // Update home page stats (total-lost, total-found, total-resolved)
    const totalLostEl = document.getElementById("total-lost");
    const totalFoundEl = document.getElementById("total-found");
    const totalResolvedEl = document.getElementById("total-resolved");
    if (totalLostEl) totalLostEl.textContent = lostCount;
    if (totalFoundEl) totalFoundEl.textContent = foundCount;
    if (totalResolvedEl) totalResolvedEl.textContent = resolvedCount;

    // Update filter tab counters on items page
    const countAllEl = document.getElementById("count-all");
    const countLostEl = document.getElementById("count-lost");
    const countFoundEl = document.getElementById("count-found");
    const countResolvedEl = document.getElementById("count-resolved");
    if (countAllEl) countAllEl.textContent = items.length;
    if (countLostEl) countLostEl.textContent = lostCount;
    if (countFoundEl) countFoundEl.textContent = foundCount;
    if (countResolvedEl) countResolvedEl.textContent = resolvedCount;
}



// =====================================================
//  SECTION 4: NAVIGATION (SPA SECTION SWITCHING)
// =====================================================

/**
 * Show a specific section and hide all others.
 * sectionId: 'home', 'report-lost', 'report-found', or 'items'
 */
async function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll(".main-content .section");
    sections.forEach(function(sec) {
        sec.classList.remove("active");
    });

    // Show the chosen section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add("active");
    }

    // Highlight correct nav link
    const navLinks = document.querySelectorAll(".nav-menu li a");
    navLinks.forEach(function(link) {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + sectionId) {
            link.classList.add("active");
        }
    });

    // Close mobile menu
    const navMenu = document.getElementById("nav-menu");
    if (navMenu) navMenu.classList.remove("show");

    // Reload data when entering items or home section
    if (sectionId === "items") {
        await renderItems();
    } else if (sectionId === "home") {
        await updateStats();
        await renderRecentItems();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Jump to items page with a specific filter applied.
 */
async function filterAndShow(filterType) {
    setFilterType(filterType);
    await showSection("items");
}

/**
 * Open/close mobile hamburger menu.
 */
function toggleMobileNav() {
    const navMenu = document.getElementById("nav-menu");
    if (navMenu) navMenu.classList.toggle("show");
}



// =====================================================
//  SECTION 5: IMAGE PREVIEW (CLIENT-SIDE)
// =====================================================

/**
 * Immediately preview the chosen photo in the form.
 * This is shown in the browser before the image is uploaded to Supabase.
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

    // Limit to 5MB (Supabase Storage can handle it; Base64 in DB was limited to 1MB)
    if (file.size > 5242880) {
        alert("Image size exceeds 5MB. Please select a smaller photo.");
        input.value = "";
        container.innerHTML = "";
        container.style.display = "none";
        return;
    }

    // Show local preview using FileReader (this is just for UI — actual upload happens on submit)
    const reader = new FileReader();
    reader.onload = function(e) {
        container.innerHTML = `
            <img src="${e.target.result}" alt="Photo Preview">
            <p style="font-size:0.75rem; color:#64748b; margin-top:4px;">Photo selected (${Math.round(file.size / 1024)} KB) — will upload on submit</p>
        `;
        container.style.display = "block";
    };
    reader.readAsDataURL(file);
}



// =====================================================
//  SECTION 6: FORM ALERTS & VALIDATION
// =====================================================

/**
 * Show a success or error alert inside a form.
 */
function showFormAlert(formAlertId, message, type) {
    const alertBox = document.getElementById(formAlertId);
    if (!alertBox) return;

    alertBox.innerHTML = `
        <div class="form-alert ${type === "success" ? "form-alert-success" : "form-alert-error"}">
            ${type === "success" ? "✓ " : "⚠️ "}${escapeHtml(message)}
        </div>
    `;

    setTimeout(function() {
        if (alertBox) alertBox.innerHTML = "";
    }, 5000);
}

/**
 * Validate all required form fields.
 * Returns an error message string if invalid, null if all valid.
 */
function validateFormData(data) {
    if (!data.name || data.name.trim() === "") {
        return "Please enter the item name.";
    }
    if (!data.category || data.category === "") {
        return "Please select a category.";
    }
    if (!data.date || data.date === "") {
        return "Please select a date.";
    }
    if (!data.location || data.location.trim() === "") {
        return "Please specify the location.";
    }
    if (!data.description || data.description.trim() === "") {
        return "Please provide a description.";
    }
    if (!data.contact_name || data.contact_name.trim() === "") {
        return "Please enter your name.";
    }

    // Validate 10-digit phone number
    const phoneDigits = data.contact_number.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
        return "Please enter a valid 10-digit mobile number (e.g. 9876543210).";
    }

    return null; // All valid
}



// =====================================================
//  SECTION 7: FORM SUBMISSION
// =====================================================

/**
 * Handle form submission for Lost or Found item reports.
 * Validates the form, optionally uploads an image, and inserts into Supabase.
 */
async function handleFormSubmit(event, formId) {
    event.preventDefault();

    const form = document.getElementById(formId);
    if (!form) return;

    const alertId = formId === "lost-form" ? "lost-form-alert" : "found-form-alert";
    const previewContainerId = formId === "lost-form" ? "lost-preview-container" : "found-preview-container";

    // Get form field values
    const type = form.elements["type"].value;          // "Lost" or "Found"
    const name = form.elements["name"].value.trim();
    const category = form.elements["category"].value;
    const date = form.elements["date"].value;
    const location = form.elements["location"].value.trim();
    const description = form.elements["description"].value.trim();
    const contact_name = form.elements["contactName"].value.trim();
    const contact_number = form.elements["contactNumber"].value.trim();
    const imageInput = form.elements["image"];

    // Run validation
    const validationError = validateFormData({
        name, category, date, location, description, contact_name, contact_number
    });
    if (validationError) {
        showFormAlert(alertId, validationError, "error");
        return;
    }

    // Disable submit button and show loading state
    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
    }

    // Upload image to Supabase Storage if the user attached one
    let image_url = "";
    if (imageInput && imageInput.files && imageInput.files[0]) {
        showFormAlert(alertId, "Uploading photo...", "success");
        image_url = await uploadItemImage(imageInput);
        if (!image_url) {
            console.warn("Image upload failed. Continuing without image.");
        }
    }

    // Build the item object matching the Supabase column names
    const newItem = {
        type: type,
        name: name,
        category: category,
        description: description,
        date: date,
        location: location,
        contact_name: contact_name,
        contact_number: contact_number,
        image_url: image_url,
        status: "Active"
    };

    // Insert item into Supabase
    const success = await addItem(newItem);

    // Re-enable submit button
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = formId === "lost-form" ? "Submit Lost Report" : "Submit Found Report";
    }

    if (!success) {
        showFormAlert(alertId, "Could not submit the item. Please check your connection and try again.", "error");
        return;
    }

    // Show success message
    showFormAlert(alertId, `${type} item report submitted successfully! It is now visible to all devices.`, "success");
    showToast(`Your ${type.toLowerCase()} item has been posted and is now live!`, "success");

    // Reset form and preview
    form.reset();
    const previewBox = document.getElementById(previewContainerId);
    if (previewBox) {
        previewBox.innerHTML = "";
        previewBox.style.display = "none";
    }

    // Refresh stats and then head to gallery after short delay
    await updateStats();
    setTimeout(async function() {
        await showSection("items");
    }, 1300);
}



// =====================================================
//  SECTION 8: RENDERING ITEMS (GALLERY & HOME PREVIEW)
// =====================================================

// Current active filter (Lost, Found, Resolved, All)
let currentFilterType = "All";

/**
 * Return the emoji for a given category.
 */
function getCategoryIcon(category) {
    switch (category) {
        case "Electronics":       return "💻";
        case "ID/Documents":      return "🪪";
        case "Wallets/Bags":      return "👛";
        case "Stationery/Books":  return "📚";
        case "Personal":          return "🔑";
        case "Clothing":          return "👕";
        default:                  return "📦";
    }
}

/**
 * Build an item card HTML element.
 */
function createItemCardElement(item) {
    const card = document.createElement("div");
    card.className = "item-card " + (item.status === "Resolved" ? "is-resolved" : "");

    // Set badge based on type and status
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

    // Media: show image if available, else category icon
    let mediaHtml = "";
    if (item.image_url && item.image_url.trim() !== "") {
        mediaHtml = `<img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.name)}">`;
    } else {
        mediaHtml = `<span class="card-placeholder-icon">${getCategoryIcon(item.category)}</span>`;
    }

    // Resolve button (only for active items)
    let resolveBtnHtml = "";
    if (item.status !== "Resolved") {
        resolveBtnHtml = `
            <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); handleMarkAsResolved(${item.id})">
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
                <li><span>👤</span> <strong>Contact:</strong> ${escapeHtml(item.contact_name)}</li>
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
 * Render the entire items gallery with filtering and search applied.
 * Fetches real data from Supabase every time.
 */
async function renderItems() {
    const grid = document.getElementById("items-grid");
    if (!grid) return;

    // Show loading indicator
    grid.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⏳</div><p>Loading items from database...</p></div>`;

    const items = await loadItems();

    const searchInput = document.getElementById("search");
    const categorySelect = document.getElementById("filter-category");
    const resultsSummary = document.getElementById("results-count-text");
    const clearSearchBtn = document.getElementById("clear-search");
    const resetFiltersBtn = document.getElementById("reset-all-filters");

    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const selectedCategory = categorySelect ? categorySelect.value : "All";

    if (clearSearchBtn) {
        clearSearchBtn.style.display = query.length > 0 ? "block" : "none";
    }

    // Filter items based on search query, status tab, and category dropdown
    const filteredItems = items.filter(function(item) {
        // 1. Search query check
        const matchesSearch = query === "" ||
            item.name.toLowerCase().includes(query) ||
            item.location.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query);

        // 2. Status / Type tab check
        let matchesType = false;
        if (currentFilterType === "All") {
            matchesType = true;
        } else if (currentFilterType === "Resolved") {
            matchesType = (item.status === "Resolved");
        } else {
            matchesType = (item.type === currentFilterType && item.status !== "Resolved");
        }

        // 3. Category dropdown check
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;

        return matchesSearch && matchesType && matchesCategory;
    });

    // Update summary text
    if (resultsSummary) {
        const filterName = currentFilterType === "All" ? "Total" : currentFilterType;
        resultsSummary.textContent = `Showing ${filteredItems.length} of ${items.length} items (${filterName})`;
    }

    // Show/hide reset button
    if (resetFiltersBtn) {
        const isFiltered = query !== "" || currentFilterType !== "All" || selectedCategory !== "All";
        resetFiltersBtn.style.display = isFiltered ? "inline-block" : "none";
    }

    // Update tab counts
    updateTabCounts(items);

    // Clear and render the grid
    grid.innerHTML = "";

    if (filteredItems.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔎</div>
                <h3>No items found</h3>
                <p>No lost or found items reported yet, or try adjusting your search filters.</p>
                <button class="btn btn-secondary btn-sm" onclick="resetFilters()">Clear Filters</button>
            </div>
        `;
        return;
    }

    // Render each item card
    filteredItems.forEach(function(item) {
        grid.appendChild(createItemCardElement(item));
    });
}

/**
 * Update filter tab counts based on full items list.
 */
function updateTabCounts(items) {
    let lostCount = 0, foundCount = 0, resolvedCount = 0;
    items.forEach(function(item) {
        if (item.status === "Resolved") resolvedCount++;
        else if (item.type === "Lost") lostCount++;
        else if (item.type === "Found") foundCount++;
    });

    const countAllEl = document.getElementById("count-all");
    const countLostEl = document.getElementById("count-lost");
    const countFoundEl = document.getElementById("count-found");
    const countResolvedEl = document.getElementById("count-resolved");

    if (countAllEl) countAllEl.textContent = items.length;
    if (countLostEl) countLostEl.textContent = lostCount;
    if (countFoundEl) countFoundEl.textContent = foundCount;
    if (countResolvedEl) countResolvedEl.textContent = resolvedCount;
}

/**
 * Render the 3 most recent items on the Home Page preview section.
 */
async function renderRecentItems() {
    const recentGrid = document.getElementById("recent-items-grid");
    if (!recentGrid) return;

    recentGrid.innerHTML = `<div class="empty-state"><p>Loading recent reports...</p></div>`;

    const items = await loadItems();
    recentGrid.innerHTML = "";

    if (items.length === 0) {
        recentGrid.innerHTML = `
            <div class="empty-state">
                <p>No items reported yet. Be the first to report a lost or found item!</p>
            </div>
        `;
        return;
    }

    // Show the 3 most recent items
    items.slice(0, 3).forEach(function(item) {
        recentGrid.appendChild(createItemCardElement(item));
    });
}



// =====================================================
//  SECTION 9: FILTER & SEARCH HELPERS
// =====================================================

/**
 * Set the status tab filter and re-render the gallery.
 */
function setFilterType(filterType) {
    currentFilterType = filterType;

    const tabs = ["All", "Lost", "Found", "Resolved"];
    tabs.forEach(function(tab) {
        const btn = document.getElementById("tab-" + tab);
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
 * Clear the search box and re-render.
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
 * Reset all filters and search to their defaults.
 */
function resetFilters() {
    const searchInput = document.getElementById("search");
    const categorySelect = document.getElementById("filter-category");
    if (searchInput) searchInput.value = "";
    if (categorySelect) categorySelect.value = "All";
    setFilterType("All");
}



// =====================================================
//  SECTION 10: ITEM DETAILS MODAL
// =====================================================

// Store all currently loaded items so modal can find by ID
let _cachedItems = [];

/**
 * Open the item details modal popup for a given item ID.
 */
async function openModal(itemId) {
    // Load or re-use the last fetched items
    if (_cachedItems.length === 0) {
        _cachedItems = await loadItems();
    }

    const item = _cachedItems.find(function(i) { return i.id === itemId; });
    if (!item) return;

    const modalBody = document.getElementById("modal-body");
    const modal = document.getElementById("item-modal");
    if (!modalBody || !modal) return;

    let typeBadgeClass = item.type === "Lost" ? "badge-lost" : "badge-found";
    let statusBadgeClass = item.status === "Resolved" ? "badge-resolved" : "badge-found";

    let mediaHtml = "";
    if (item.image_url && item.image_url.trim() !== "") {
        mediaHtml = `
            <div class="modal-media">
                <img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.name)}">
            </div>
        `;
    }

    let resolveButtonHtml = "";
    if (item.status !== "Resolved") {
        resolveButtonHtml = `
            <button class="btn btn-success" onclick="handleMarkAsResolved(${item.id})">
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
                    <td>👤 ${escapeHtml(item.contact_name)}</td>
                </tr>
                <tr>
                    <th>Contact Number</th>
                    <td>📞 <a href="tel:${escapeHtml(item.contact_number)}" style="color:var(--primary-light);font-weight:700;">${escapeHtml(item.contact_number)}</a></td>
                </tr>
                <tr>
                    <th>Current Status</th>
                    <td><strong>${escapeHtml(item.status)}</strong></td>
                </tr>
            </tbody>
        </table>

        <div class="modal-actions">
            ${resolveButtonHtml}
            <a href="tel:${escapeHtml(item.contact_number)}" class="btn btn-primary">
                📞 Call Contact
            </a>
            <button class="btn btn-secondary" onclick="closeModal()">
                Close
            </button>
        </div>
    `;

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

/**
 * Close the modal popup.
 */
function closeModal() {
    const modal = document.getElementById("item-modal");
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

/**
 * Handle the "Mark as Resolved" button click.
 * Updates Supabase and refreshes the page.
 */
async function handleMarkAsResolved(itemId) {
    if (!confirm("Are you sure you want to mark this item as Resolved / Handed Over?")) {
        return;
    }

    const success = await markAsResolved(itemId);

    if (!success) {
        showToast("Could not update item status. Please try again.", "error");
        return;
    }

    // Clear cached items to force a fresh fetch
    _cachedItems = [];

    showToast("Item marked as Resolved! ✓", "success");
    closeModal();

    await updateStats();
    await renderItems();
    await renderRecentItems();
}



// =====================================================
//  SECTION 11: TOAST NOTIFICATIONS
// =====================================================

/**
 * Show a floating notification at the bottom of the page.
 */
function showToast(message, type) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.innerHTML = (type === "success" ? "✓ " : "ℹ ") + escapeHtml(message);
    toast.classList.add("show");

    setTimeout(function() {
        toast.classList.remove("show");
    }, 3500);
}



// =====================================================
//  SECTION 12: UTILITY FUNCTIONS
// =====================================================

/**
 * Prevent XSS: convert unsafe characters in strings before inserting into HTML.
 */
function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

/**
 * Format a database date string (YYYY-MM-DD) into a readable format (e.g. 26 Sep 2026).
 */
function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    const parts = String(dateStr).substring(0, 10).split("-");
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



// =====================================================
//  SECTION 13: APP INITIALIZATION
// =====================================================

document.addEventListener("DOMContentLoaded", async function() {

    // Set max date on date fields to today
    const todayStr = new Date().toISOString().split("T")[0];
    const lostDateInput = document.getElementById("lost-date");
    const foundDateInput = document.getElementById("found-date");
    if (lostDateInput) lostDateInput.setAttribute("max", todayStr);
    if (foundDateInput) foundDateInput.setAttribute("max", todayStr);

    // Attach form submission handlers
    const lostForm = document.getElementById("lost-form");
    if (lostForm) {
        lostForm.addEventListener("submit", function(e) {
            handleFormSubmit(e, "lost-form");
        });
    }

    const foundForm = document.getElementById("found-form");
    if (foundForm) {
        foundForm.addEventListener("submit", function(e) {
            handleFormSubmit(e, "found-form");
        });
    }

    // Close modal on Escape key
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") closeModal();
    });

    // Read URL hash and navigate to correct section on load
    const hash = window.location.hash.replace("#", "");
    if (["home", "report-lost", "report-found", "items"].includes(hash)) {
        await showSection(hash);
    } else {
        await showSection("home");
    }

    // Initial statistics load
    await updateStats();
    await renderRecentItems();
});
