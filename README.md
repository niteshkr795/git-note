# GitNote — Learn. Share. Discover.

A modern academic resource-sharing platform for college students. Centralize Previous Year Question Papers (PYQs), lecture notes, assignments, and lab manuals in one clean, searchable hub.

🔗 **Live Website**: [https://gitnote8.vercel.app](https://gitnote8.vercel.app)

---

## ✨ Features

- **Explore & Filter**: Instant search by keyword, subject (B.Tech & GATE), semester (Semesters 1–8), academic year, and resource type (PYQ, Notes, Assignment, Lab Manual).
- **In-Browser Document Viewer**: Integrated PDF.js viewer with page navigation, zoom, rotation, and direct file download.
- **Resource Uploads**: Drag-and-drop file upload with validation, metadata tagging, and Supabase Storage integration.
- **Student Profiles & Cartoon Avatars**: Student profile management with bio, institution details, bookmarked resources, and a library of cartoon avatars for Men, Boys, and Girls (including an interactive cartoon avatar generator).
- **Authentication**: Supabase Auth with secure session handling and role-aware resource access.
- **Progressive Web App (PWA)**: Installable on mobile and desktop with offline support and service worker caching.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend & Database**: [Supabase](https://supabase.com) (PostgreSQL, Auth, Storage)
- **PDF Engine**: PDF.js
- **Icons**: Lucide React

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/niteshkr795/git-note.git
cd git-note
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local` and add your Supabase credentials:
```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-publishable-key
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production
```bash
npm run build
npm run start
```
