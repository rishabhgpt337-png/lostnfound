# 🔍 Campus Lost & Found Web Portal

An interactive, responsive, and real-time cloud-synchronized web application built for college campuses. It allows students and staff across multiple devices (smartphones, tablets, and laptops) to report lost personal belongings, post found items, search the live items directory with instant filters, view detailed item profiles, and mark recovered items as resolved.

> **Course:** FYBSc IT (First Year Bachelor of Science in Information Technology)  
> **Subject:** Introduction to Programming  
> **Frontend:** Pure HTML5, CSS3, Vanilla JavaScript (ES6+ `async`/`await`, DOM Manipulation)  
> **Database & Cloud Storage:** [Supabase](https://supabase.com) (PostgreSQL Database & Storage Bucket)  
> **Multi-Device Support:** Real-time cross-device data synchronization

---

## 🌟 Key Features

1. **📱 Real Multi-Device Cloud Synchronization**
   - Powered by **Supabase PostgreSQL** cloud database.
   - When a student posts an item on **Phone 1**, it is immediately visible to another student or faculty member on **Phone 2** or a laptop upon loading/refreshing the gallery.
   - Status updates (e.g., "Mark as Resolved") update instantly in the cloud.

2. **🏠 Interactive Home Dashboard**
   - Welcoming hero banner with direct quick-action buttons.
   - Live activity summary counters (**Active Lost**, **Active Found**, and **Resolved** items) computed directly from the cloud database.
   - "How It Works" 3-step guide for campus students.
   - Recent items activity preview grid.

3. **📢 Report Lost Item**
   - Detailed submission form with client-side validation.
   - Fields: Item Name, Category, Date Lost, Last Seen Location, Detailed Description, Contact Person Name, and 10-Digit Mobile Number.
   - Optional photo attachment with automatic upload to Supabase Cloud Storage.

4. **🎁 Report Found Item**
   - Dedicated form for students or campus security who find items across college classrooms, library, canteen, or campus grounds.
   - Captures item condition, where it was found, custody details, and finder contact information.

5. **🔎 Lost & Found Gallery with Real-Time Search & Filtering**
   - Dynamic card grid showing item photos/category icons, status badges, titles, descriptions, locations, and dates.
   - Instant search by item title, location, category, or description keywords.
   - Status filter tabs: **All Items**, **Lost Items**, **Found Items**, and **Resolved**.
   - Category filter dropdown (Electronics, ID Cards, Wallets, Books, Personal, Clothing, etc.).

6. **📋 Item Details Modal Dialog**
   - Pop-up modal presenting complete item details, category badges, and notes.
   - Direct `tel:` mobile call link for one-tap calling between students.
   - Keyboard accessible (`Escape` key closes the dialog).

7. **✅ Mark as Resolved / Handed Over**
   - Allows finders or owners to mark recovered items as **Resolved**.
   - Updates the database record in Supabase and instantly refreshes UI badges and statistics.

---

## 📁 Project File Structure

```text
lostnfound/
│
├── index.html      # Single Page Application structure with semantic HTML5 sections & modal
├── style.css       # Clean college-themed CSS styling (Navy/Blue palette, cards, responsive layout)
├── script.js       # Core JavaScript logic (Supabase CRUD, DOM manipulation, filters, validation)
├── config.js       # Supabase Project URL and Public Anon Key configuration
├── supabase.sql    # Database schema (table creation, RLS security policies, and sample data)
└── README.md       # Project documentation, setup guide, and viva exam preparation guide
```

---

## ⚙️ How to Set Up & Configure Supabase

Follow these simple steps to connect the app to your free Supabase cloud database:

### Step 1: Create a Free Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **"New Project"**.
3. Choose an organization, enter a project name (e.g., `campus-lostnfound`), set a database password, and choose your preferred region.
4. Click **"Create new project"** (takes ~1-2 minutes to provision).

### Step 2: Run the SQL Schema in Supabase
1. In your Supabase project dashboard, open the **SQL Editor** tab from the left sidebar (icon `>_`).
2. Click **"New query"**.
3. Copy the entire contents of the `supabase.sql` file in this repository.
4. Paste it into the SQL Editor and click **"Run"** (or press `Ctrl+Enter`).
5. This automatically creates:
   - The `items` table with constraints and default values.
   - Public **Row Level Security (RLS)** policies for reading, reporting, and resolving items.
   - The `item-images` public storage bucket for photos.
   - Initial sample college items for demonstration.

### Step 3: Add Your Supabase Keys to `config.js`
1. In your Supabase dashboard, go to **Project Settings** (gear icon) → **API**.
2. Find:
   - **Project URL** (e.g., `https://abcdefghijklm.supabase.co`)
   - **Project API Keys** → `anon` / `public` key (starts with `eyJhbGci...`)
3. Open `config.js` in your code editor and paste your credentials:
   ```javascript
   const SUPABASE_CONFIG = {
       SUPABASE_URL: "https://your-project-ref.supabase.co",
       SUPABASE_ANON_KEY: "eyJhbGciOi..."
   };
   ```
4. Save `config.js`.

> ⚠️ **Security Notice:** Never paste your `service_role` secret key or database password on the frontend! Only use the public `anon` key.

---

## 🚀 How to Run and Test Across Multiple Devices

### Option A: Local Testing (Single Computer)
1. Open the folder in **VS Code**.
2. Right-click `index.html` and select **"Open with Live Server"** (or run `python -m http.server 8000`).
3. Open `http://localhost:8000` or `http://127.0.0.1:5500` in your browser.

### Option B: Multi-Device Demonstration (Phone 1 & Phone 2)
To test cross-device synchronization between two different mobile phones:

1. **Via GitHub Pages or Free Static Hosting:**
   - Push the repository to GitHub.
   - Go to **Repository Settings** → **Pages** → select `main` branch → Save.
   - Open the resulting GitHub Pages link on **Phone 1** and **Phone 2**.
2. **Test the Multi-Device Flow:**
   - **On Phone 1:** Open the portal, click **"Report Found Item"**, fill in details (e.g., "Casio Calculator in Lab 204"), and submit.
   - **On Phone 2:** Open the portal and visit **"View All Items"**. The item submitted on Phone 1 is immediately present!
   - **On Phone 2:** Click **"Resolve"** on the item. The item status updates to **Resolved** in the Supabase cloud and reflects on both phones.

---

## 🎓 Programming Concepts Used (Viva Preparation Guide)

For the **FYBSc IT "Introduction to Programming"** practical and viva examination:

| Concept | Explanation | Where it is used in the project |
| :--- | :--- | :--- |
| **Variables (`const`, `let`)** | Store references to DOM nodes, filter state, and database client instances. | `dbClient`, `currentFilterType`, `SUPABASE_CONFIG` in `config.js` and `script.js`. |
| **Arrays & Objects** | Model structured data records and collections of database rows. | `items` array of item objects containing `id`, `name`, `type`, `location`, `status`, etc. |
| **Functions & Parameters** | Encapsulate modular, reusable operations with input arguments. | `showSection(sectionId)`, `openModal(itemId)`, `addItem(newItem)`, `markAsResolved(itemId)`. |
| **Conditional Statements (`if / else`)** | Control program execution flow based on logical conditions. | Form validation, connection checks (`isConnected()`), status badge styling. |
| **Loops & Iteration** | Iterate through item lists for counting, rendering, and filtering. | `for` loop in `updateStats()`, `.forEach()` for building card elements, `.filter()` for search results. |
| **DOM Manipulation** | Dynamically create, select, and update HTML elements in real time. | `document.getElementById()`, `document.createElement()`, `element.innerHTML`, `classList.add()`. |
| **Event Listeners** | Capture and handle user interactions asynchronously. | `form.addEventListener('submit', ...)`, `input` event on search bar, `click` on modals, `keydown` for Escape key. |
| **Asynchronous JS (`async` / `await`)** | Handle non-blocking asynchronous cloud database queries and file uploads. | `async function loadItems()`, `await dbClient.from('items').select('*')`. |
| **Cloud Database (PostgreSQL / Supabase)** | Provides persistent, relational cloud data storage accessible from any device. | Supabase JavaScript client loaded via CDN (`@supabase/supabase-js@2`). |
| **Row Level Security (RLS)** | Database-level security policies governing who can read, insert, or update rows. | SQL policies in `supabase.sql` allowing public access for student reporting. |
| **Cloud Storage (Buckets)** | Stores uploaded item photographs and generates public URLs for rendering. | `dbClient.storage.from('item-images').upload()` and `.getPublicUrl()`. |
| **XSS Prevention (Sanitization)** | Protects the application against Cross-Site Scripting attacks. | `escapeHtml(str)` utility function escaping user-provided text before injecting into `innerHTML`. |

---

## ❓ Frequently Asked Viva Questions & Answers

**Q1: Why did you transition from `localStorage` to Supabase?**  
> *Answer:* `localStorage` is restricted to a single browser on a single device. A real-world Lost & Found portal requires multi-device access—if Student A loses a wallet and Student B finds it, they use different phones. Supabase provides a cloud-hosted PostgreSQL database with a JavaScript client library, allowing instant cross-device read/write synchronization without building a custom backend server.

**Q2: How does the client interact with Supabase without a Node.js / Express backend?**  
> *Answer:* We load the official Supabase JavaScript SDK via CDN (`@supabase/supabase-js@2`). Supabase provides an auto-generated REST API over PostgreSQL. The client uses `dbClient.from('items').select('*')`, `.insert([...])`, and `.update(...)` to execute SQL queries securely over HTTPS.

**Q3: What is Row Level Security (RLS) and why is it needed?**  
> *Answer:* Row Level Security is a PostgreSQL feature that controls whether rows can be read, inserted, or updated based on security policies. We enabled RLS on the `items` table in `supabase.sql` and created permissive public policies so any student using the public `anon` API key can report and view items.

**Q4: Is it safe to expose the Supabase `anon` key in `config.js`?**  
> *Answer:* Yes. The `anon` (anonymous) key is designed to be public on the client side. Access permissions are strictly governed by PostgreSQL Row Level Security (RLS) policies. We never expose the secret `service_role` key or database password.

**Q5: How does the search and filter mechanism work?**  
> *Answer:* In `script.js`, `renderItems()` queries Supabase for the latest items and then applies the JavaScript `.filter()` method in memory. It matches user search queries against item names, locations, categories, and descriptions, combined with active status tabs (`Lost`, `Found`, `Resolved`) and category dropdown selections.

**Q6: How are photo uploads handled in Supabase?**  
> *Answer:* When a student selects an image file, the file is uploaded to the Supabase `item-images` storage bucket using `dbClient.storage.from('item-images').upload()`. We then retrieve the public HTTPS URL using `.getPublicUrl()` and save that URL string in the `image_url` column of the `items` table.

---

## 👥 Authors
- **FYBSc IT Student Team**
- Department of Information Technology
