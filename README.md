# 🔍 Campus Lost & Found Web Portal

An interactive, responsive, and client-side web application built for college campuses. It allows students and staff to report lost personal belongings, post found items, search the items directory with real-time filters, view item details, and mark recovered items as resolved.

> **Course:** FYBSc IT (First Year Bachelor of Science in Information Technology)  
> **Subject:** Introduction to Programming  
> **Tech Stack:** Pure HTML5, CSS3, Vanilla JavaScript (DOM Manipulation & `localStorage`)

---

## 🌟 Key Features

1. **🏠 Interactive Home Dashboard**
   - Welcoming hero banner with direct quick-action buttons.
   - Live activity summary counters (**Active Lost**, **Active Found**, and **Resolved** items).
   - "How It Works" 3-step college guide for students.
   - Recent items activity preview grid.

2. **📢 Report Lost Item**
   - Detailed submission form with validation.
   - Fields: Item Name, Category, Date Lost, Last Seen Location, Detailed Description, Contact Person Name, and 10-Digit Mobile Number.
   - Optional photo upload with instant preview using JavaScript `FileReader`.

3. **🎁 Report Found Item**
   - Form designed for good samaritans who find items on campus grounds.
   - Fields: Item Name, Category, Date Found, Where Found, Description/Current custody, Finder's Name, and Contact Number.
   - Photo attachment support.

4. **🔎 Lost & Found Gallery with Real-Time Search & Filtering**
   - Dynamic card grid showing item photo/category icon, badges, title, description, location, and date.
   - Instant search by item title, location, category, or description keywords.
   - Status tabs: **All Items**, **Lost Items**, **Found Items**, and **Resolved**.
   - Category filter dropdown (Electronics, ID Cards, Wallets, Books, etc.).

5. **📋 Item Details Modal Dialog**
   - Click "View Details" to open a clean pop-up with full description, category icon, and metadata table.
   - Includes a direct `tel:` call button for mobile devices.
   - Keyboard accessible (`Escape` key closes modal).

6. **✅ Mark as Resolved**
   - Users/finders can update an item's status to **Resolved / Returned** with confirmation.
   - Status badge updates across the app and stats counters refresh instantly.

7. **💾 Client-Side Storage (`localStorage`)**
   - All reports are stored in the browser's `localStorage` as an array of JavaScript objects.
   - Pre-loaded with realistic demonstration sample items on the first visit.
   - Includes a **"Reset Sample Demo Data"** button in the footer for viva testing.

---

## 📁 Project File Structure

```text
lostnfound/
│
├── index.html      # Single Page Application structure with semantic HTML5 sections & modal
├── style.css       # Clean college-themed CSS styling (Navy/Blue palette, cards, responsive layout)
├── script.js       # Core JavaScript logic (data handling, localStorage, DOM manipulation, filters)
└── README.md       # Project documentation and viva exam preparation guide
```

---

## 🚀 How to Run Locally

Since this is a lightweight, pure HTML/CSS/JavaScript project, it requires **no build tools, no Node.js server, and no database setup**.

### Method 1: VS Code Live Server (Recommended)
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension by Ritwick Dey (if not installed).
3. Right-click `index.html` and select **"Open with Live Server"**.
4. The website will open in your default browser at `http://127.0.0.1:5500`.

### Method 2: Python Built-in HTTP Server
Run the following command in PowerShell / Terminal:
```powershell
cd "C:\Users\Risha\OneDrive\Documents\CLAUDE\lostnfound"
python -m http.server 8000
```
Then open your browser and navigate to: **`http://localhost:8000`**

### Method 3: Direct File Opening
You can simply double-click `index.html` to open it directly in Google Chrome, Microsoft Edge, or Mozilla Firefox (`file:///.../index.html`).

---

## 🎓 Programming Concepts Used (Viva Preparation Guide)

For the **Introduction to Programming** practical / viva examination:

| Concept | Explanation | Where it is used in the project |
| :--- | :--- | :--- |
| **Variables (`const`, `let`)** | Store references to DOM nodes, filter states, and data collections. | `STORAGE_KEY`, `currentFilterType` in `script.js`. |
| **Arrays of Objects** | Used as the primary in-memory database data model. | `SAMPLE_ITEMS`, `items` array storing items with fields like `id`, `name`, `type`, `status`. |
| **Functions & Parameters** | Encapsulate reusable blocks of logic and accept parameters. | `showSection(sectionId)`, `openModal(itemId)`, `validateFormData(data)`. |
| **Conditional Statements** | Guide program flow using `if`, `else if`, and `switch`. | Form field validations, status checks (`item.status === 'Resolved'`), category icon mappings. |
| **Loops & Iteration** | Iterate through item arrays for counting, filtering, and rendering. | `for` loops for finding max ID, `.filter()` for search results, `.forEach()` for card generation. |
| **DOM Manipulation** | Select, create, and modify HTML elements dynamically. | `document.getElementById()`, `document.createElement()`, `element.innerHTML`, `classList.add()`. |
| **Event Listeners** | Listen and respond to user actions asynchronously. | `form.addEventListener('submit', ...)`, `input` event for search, `click` for modal navigation, `keydown` for Escape key. |
| **Browser `localStorage`** | Persistent key-value browser storage across page reloads. | `localStorage.getItem()`, `localStorage.setItem()`, `JSON.stringify()`, `JSON.parse()`. |
| **FileReader Web API** | Asynchronously reads the contents of files stored on the user's computer. | Converts uploaded image files into Base64 Data URL strings stored inside localStorage. |

---

## ❓ Frequently Asked Viva Questions & Answers

**Q1: Why did you use `localStorage` instead of a backend database like MySQL or MongoDB?**  
> *Answer:* For an Introduction to Programming client-side project, `localStorage` provides persistent, zero-configuration data storage right inside the browser. It allows storing structured JavaScript objects using `JSON.stringify()` without requiring a backend server.

**Q2: How does the search and filter mechanism work?**  
> *Answer:* In `script.js`, the `renderItems()` function reads the items array from `localStorage` and applies the JavaScript `.filter()` array method. It checks if the item's name, location, or description includes the search query string, and matches the selected status tab and category dropdown.

**Q3: How are images handled without a cloud storage service?**  
> *Answer:* When a student selects a photo, the JavaScript `FileReader` API reads the file as a Base64 Data URL string (`reader.readAsDataURL(file)`). This Base64 text is saved as a property of the item object in `localStorage` and rendered via `<img src="...">`. To prevent storage limits, image sizes are capped at 1MB.

**Q4: How does Single Page Application (SPA) navigation work without page reloads?**  
> *Answer:* All main views (`#home`, `#report-lost`, `#report-found`, `#items`) are structured as `<section>` elements in `index.html`. In `style.css`, sections have `display: none` by default, and `display: block` when given the `.active` class. The `showSection(sectionId)` JavaScript function removes `.active` from other sections and adds it to the requested one.

---

## 👥 Authors
- **FYBSc IT Student Team**
- Department of Information Technology
