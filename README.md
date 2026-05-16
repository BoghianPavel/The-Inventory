# 📦 The Inventory - Logistica Inteligentă

**The Inventory** este o aplicație web modernă pentru managementul stocurilor și gestiunea depozitelor. Proiectul este construit pe o arhitectură decuplată, având un backend robust în Python (SQLAlchemy) și o interfață rapidă, fluidă și animată realizată în React (Vite) cu Tailwind CSS v4.

---

## 🚀 Caracteristici Principale

* **Dashboard Interactiv:** Interfață premium cu gradienți mesh delicați și animații native (`framer-motion`).
* **Arhitectură Vizuală (ERD):** O secțiune dedicată în pagina principală care randează dinamic schema relațională a bazei de date.
* **Management modular:** Secțiuni dedicate pentru gestionarea completă a **Depozitelor**, **Furnizorilor** și **Produselor**.
* **Navigare SPA Silențioasă:** Trecerea între module se face instantaneu, fără reîncărcarea paginii și fără popup-uri intruzive.
* **Randare de Siguranță:** Integrare inteligentă cu `lucide-react` care previne erorile de tip `undefined` la încărcarea iconițelor prin utilizarea unui fallback dinamic.

---

## 📊 Structura Bazei de Date (Schema Relațională)

Aplicația folosește o structură de date optimizată pentru integritate atomică, mapată direct din modelele ORM (SQLAlchemy):

### 🏢 1. Warehouses (Depozite)
* `id` (Integer, Primary Key) — Identificator unic crescător.
* `name` (String) — Numele depozitului.
* `location` (String) — Locația fizică a depozitului.

### 🚚 2. Suppliers (Furnizori)
* `id` (Integer, Primary Key) — Identificator unic.
* `name` (String) — Numele companiei/furnizorului.
* `contact_email` (String) — Adresa de email pentru comenzi și contact.

### 📦 3. Products (Produse)
* `id` (String, Primary Key) — Generat automat ca **UUIDv4** pentru securitatea și unicitatea referințelor.
* `warehouse_id` (Integer, Foreign Key) — Legătură directă către depozitul în care este stocat (`warehouses.id`).
* `name` (String) — Denumirea produsului.
* `sku` (String) — Codul unic de stoc (Stock Keeping Unit).
* `description` (String) — Detalii și descrierea produsului.
* `price` (Float) — Prețul unitar.
* `category` (String) — Categoria din care face parte.
* `stockQuantity` (Integer) — Cantitatea disponibilă în stoc.

---

## 🛠️ Tehnologii Utilizate

### Frontend
* **React 19** & **Vite** (pentru un build ultra-rapid)
* **Tailwind CSS v4** (folosind noua directivă `@import "tailwindcss"` și configurare nativă în CSS)
* **Framer Motion** (pentru animații fluide la nivelul cardurilor și tabelelor)
* **Lucide React** (pachet complet de iconițe vectoriale)

### Backend
* **Python 3**
* **SQLAlchemy** (Object Relational Mapper pentru interacțiunea cu baza de date)
* **UUID** (pentru identificatorii unici ai produselor)
