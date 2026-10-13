# GitNote — Learn. Share. Discover.

> A modern academic resource-sharing platform for college students. Centralizing Previous Year Question Papers (PYQs), lecture notes, assignments, and lab manuals in one clean, searchable hub.

---

## 🚀 Phase 1 MVP Scope

Phase 1 delivers the responsive **Frontend UI & Interactive Client Prototypes** built with modular React components and realistic mock data. Backend, database, and storage hooks are decoupled for seamless Phase 2 integration (Supabase Auth, PostgreSQL, Supabase Storage).

### ✨ Implemented Features & Pages

1. **Home / Explore Page (`/`)**
   - Brand header with GitNote logo & tagline: *"Learn. Share. Discover."*
   - Interactive search bar with instant keyword matching & trending chips (DSA, OS, DBMS, etc.)
   - Multi-criteria filter controls:
     - **Resource Type**: PYQ, Notes, Assignment, Lab Manual, Study Material
     - **Semester**: Semester 1 through 8
     - **Subject**: DSA, Operating Systems, DBMS, Computer Networks, Machine Learning, etc.
     - **Academic Year**: 2024-25, 2023-24, 2022-23, etc.
     - **Sort by**: Most Recent, Most Downloaded, Highest Rated, A-Z
   - Category desktop sidebar & responsive mobile navigation drawer
   - High-yield exam favorite cards showcase
   - Rich resource cards with type badges, semester badges, rating, download count, uploader avatar, and interactive bookmark toggle
   - Empty state when search or filter returns zero matches with 1-click reset

2. **Resource Details Page (`/resources/[id]`)**
   - Breadcrumb navigation (`Explore / Subject / Title`)
   - Resource title, academic metadata tags, and syllabus verification badges
   - **Interactive Document Preview**: Simulated PDF viewer with multi-page navigation (Page X of Y), zoom controls (70% - 150%), synopsis summary, exam key topics, and code/transcription sample
   - Download action with mock file generation
   - Bookmark toggle with animated toast notifications
   - Share button with clipboard copy confirmation
   - Contributor card with college affiliation and semester details
   - Related academic materials recommendations
   - **Report Resource Dialog**: Modal with academic integrity reasons (outdated syllabus, poor scan quality, wrong tags, copyright) and mock submission feedback

3. **Resource Upload Page (`/upload`)**
   - Drag-and-drop file upload zone with visual file picker (.pdf, .docx, .zip)
   - Academic contributor checklist & integrity guidance notice
   - Metadata inputs: Title (with char counter), Subject, Semester, Resource Type, Academic Year, Description, and Tags
   - Frontend form validation with error indicators
   - Multi-stage mock upload progress bar
   - Success confirmation screen with direct link to view the newly published resource

4. **User Profile Page (`/profile`)**
   - Verified student header with avatar, name, department, semester, and institution
   - Academic statistics: Total Uploads, Total Downloads Received, Saved Bookmarks, and Reputation Karma
   - Tabbed views:
     - **Contributed Resources**: Grid of resources uploaded by the student
     - **My Bookmarks**: Saved study materials for quick exam revision (accessible via `/profile?tab=bookmarks`)
     - **Badges & Karma**: Achievement accolades (Top Contributor, Semester Savior, Verified Student, Master Note-Taker)
   - Edit Profile modal with bio and institution update

5. **Authentication Pages (`/login` & `/signup`)**
   - Clean, academic SaaS authentication UI
   - Form validation for required fields, college email format, and password length
   - Password reveal toggles
   - 1-Click "Demo Student Login" button for instant preview

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context (`ResourceProvider`) with local state persistence and Toast notifications

---

## 💻 Running Locally

### Development Server
```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
pnpm build
pnpm start
```
