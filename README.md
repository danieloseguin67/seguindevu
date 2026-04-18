# SeguinDev University — Learning Portal

An Angular 21 single-page application providing a bilingual (English / French) learning portal with role-based access control, topic management, and document viewing.

---

## Features

- **Secure login** — bcrypt password hashing, session storage, route guards
- **Role-based access** — admin-only "Manage Topics" panel
- **Bilingual UI** — English/French toggle powered by `@ngx-translate`
- **Category accordion** — topics grouped by category (expandable sections)
- **Topic management** — admin can add, edit, delete topics and reset to defaults
- **Document viewer** — opens PDF or Markdown files in a new tab
- **Related articles** — expandable list of external links per topic
- **Responsive layout** — Angular Material grid, works on desktop and mobile

---

## Tech Stack

| Technology | Version |
|---|---|
| Angular | 21.2.x |
| Angular Material | 21.2.x |
| @ngx-translate | 17.x |
| bcryptjs | 3.x |
| RxJS | 7.8.x |
| Node.js | 22.x |
| npm | 10.x |

---

## Project Structure

```
seguindevu/
├── public/
│   ├── topics.json          # Topic definitions (served at /topics.json)
│   ├── users.json           # User accounts with bcrypt password hashes
│   ├── topics/              # Topic documents (PDFs, Markdown files)
│   └── i18n/
│       ├── en.json          # English translations
│       └── fr.json          # French translations
└── src/
    └── app/
        ├── auth/            # AuthService, AuthGuard, AdminGuard
        ├── login/           # Login component
        ├── dashboard/       # Main dashboard with category accordion + admin panel
        ├── topics/          # TopicsService, Topic model
        └── admin-topics/    # Standalone admin topics page
```

---

## Getting Started

### Prerequisites

- Node.js 22.x
- npm 10.x

### Install & Run

```bash
cd seguindevu
npm install
npm start
```

App is available at **http://localhost:4200**

### Build for Production

```bash
npm run build
```

Output is in `dist/seguindevu/`.

---

## User Accounts

Passwords are stored as **bcrypt hashes** (cost factor 10). Never store plain-text passwords in `users.json`.

| Username | Full Name | Role |
|---|---|---|
| `admin` | Administrator User | Admin |
| `daniel` | Daniel Seguin | User |
| `jessica` | Jessica Larmour | User |

> To add or manage users, use `manage_users_gui.py` (requires Python) or edit `public/users.json` directly with bcrypt-hashed passwords.

---

## Topics

Topics are defined in `public/topics.json`. Each topic supports:

| Field | Type | Description |
|---|---|---|
| `id` | number | Unique identifier |
| `category` | string | Groups topics in the accordion (e.g. "Software", "Programming") |
| `title` | string | Display title |
| `description` | string | English description |
| `descriptionFr` | string *(optional)* | French description |
| `document` | string | Path relative to the web root (e.g. `topics/MyFile.pdf`) |
| `documentType` | `"pdf"` \| `"markdown"` | Controls the icon and viewer |
| `articles` | array | Related external links `{ title, url }` |

### Adding Topic Files

Place PDF and Markdown files in:

```
public/topics/
```

They are served at `http://localhost:4200/topics/<filename>`.

### Refreshing Topics in the Browser

The app caches topics in **localStorage** (`seguindevu_topics`). After editing `topics.json`, open the **Manage Topics** panel (admin only) and click **Reset to Defaults** to reload from the file.

---

## Internationalisation (i18n)

UI labels live in `public/i18n/en.json` and `public/i18n/fr.json`.  
Topic descriptions switch automatically based on the active language using the `descriptionFr` field in `topics.json`.

Toggle the language with the **Français / English** button in the toolbar.

---

## Admin Panel

Log in as `admin` to see the **Manage Topics** button in the toolbar.  
The right-side drawer allows:

- **Add Topic** — create a topic with category, title, description, document URL, type, and related articles
- **Edit** ✏️ — modify any existing topic
- **Delete** 🗑️ — remove a topic
- **Reset to Defaults** — clears localStorage and reloads `topics.json`

---

## Security Notes

- Passwords are stored as **bcrypt hashes** — never plain text
- Authentication state is in **sessionStorage** (cleared when the browser tab closes)
- Route guards (`authGuard`, `adminGuard`) protect the dashboard and admin routes
- External links use `target="_blank" rel="noopener noreferrer"`
