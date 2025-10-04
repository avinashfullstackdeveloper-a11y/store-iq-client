# Project README: Frontend Overview

## Project Overview & Process Flow

This project is an AI-powered content creation platform enabling users to generate, edit, and publish videos and images using advanced AI tools. The user journey flows from signup/login, through a feature-rich dashboard, to content creation, management, and publishing.

### User Flow

1. **Signup/Login:**  
   Users register or log in via `/signup` or `/login` using email/password or social providers (Google, Facebook, GitHub).
2. **Dashboard Access:**  
   Authenticated users are redirected to `/dashboard`, the central hub for all features.
3. **AI Tools & Content Creation:**  
   Users access AI-powered tools for script, video, and image generation and editing.
4. **Content Management:**  
   Created content is managed in `/dashboard/videos` and can be edited or exported.
5. **Publishing & Analytics:**  
   Content can be published to YouTube/Instagram via `/dashboard/publish`, with analytics available at `/dashboard/stats`.

---

## Route-to-Component Mapping

| Route                                 | Component/Page                                      | Description                                 |
|----------------------------------------|-----------------------------------------------------|---------------------------------------------|
| `/`                                   | [`Index`](client/src/pages/Index.tsx:8)             | Landing page                                |
| `/about`                              | [`About`](client/src/pages/About.tsx)               | About page                                  |
| `/tools`                              | [`Tools`](client/src/pages/Tools.tsx:5)             | Tools showcase                              |
| `/login`                              | [`Login`](client/src/pages/Login.tsx:26)            | User login                                  |
| `/signup`                             | [`Signup`](client/src/pages/Signup.tsx:8)           | User signup                                 |
| `/dashboard`                          | [`Dashboard`](client/src/pages/dashboard/Dashboard.tsx:14) | Main dashboard                      |
| `/dashboard/ai-tools`                 | [`AItools`](client/src/pages/dashboard/AItools.tsx:29) | AI tools hub                          |
| `/dashboard/ai-tools/mobimagetool`    | [`Mobimagetool`](client/src/pages/dashboard/ai-tools/Mobimagetool.tsx) | Mobile AI image tool   |
| `/dashboard/ai-tools/ttscharachter`   | [`Ttscharachter`](client/src/pages/dashboard/ai-tools/Ttscharachter.tsx) | AI TTS tool           |
| `/dashboard/aitextmounting`           | [`Aitextmounting`](client/src/pages/dashboard/Aitextmounting.tsx) | AI text mounting      |
| `/dashboard/create-video/prompt-generator` | [`PromptGenerator`](client/src/pages/dashboard/create-video/PromptGenerator.tsx) | Script generator |
| `/dashboard/create-video/video-generator`  | [`VideoGenerator`](client/src/pages/dashboard/create-video/VideoGenerator.tsx:24) | Video generator |
| `/dashboard/create-video/image-generator`  | [`ImageGenerator`](client/src/pages/dashboard/create-video/ImageGenerator.tsx) | Image generator |
| `/dashboard/create-video/image-editor`     | [`ImageEditor`](client/src/pages/dashboard/create-video/ImageEditor.tsx) | Image editor |
| `/dashboard/videos`                   | [`Videos`](client/src/pages/dashboard/Videos.tsx:53) | Video library                                |
| `/dashboard/video-editor/:id`         | [`VideoEditor`](client/src/pages/dashboard/VideoEditor.tsx:54) | Video editor                                |
| `/dashboard/scripts`                  | [`Scripts`](client/src/pages/dashboard/Scripts.tsx)  | Script management (planned)                  |
| `/dashboard/search-images`            | [`SearchImages`](client/src/pages/dashboard/SearchImages.tsx:35) | Image search           |
| `/dashboard/search-videos`            | [`SearchVideos`](client/src/pages/dashboard/SearchVideos.tsx:12) | Video search           |
| `/dashboard/publish`                  | [`Publish`](client/src/pages/dashboard/Publish.tsx:16) | Publish to platforms                        |
| `/dashboard/exports`                  | [`Exports`](client/src/pages/dashboard/Exports.tsx)  | Exported content                             |
| `/dashboard/stats`                    | [`Stats`](client/src/pages/dashboard/Stats.tsx:91)   | Analytics dashboard                          |
| `/dashboard/settings`                 | [`Settings`](client/src/pages/dashboard/Settings.tsx:325) | User settings                         |
| `*`                                   | [`NotFound`](client/src/pages/NotFound.tsx:4)        | 404 page                                     |

---

## Signup & Login Process

- **Signup (`/signup`):**  
  Users register with email/phone and password, or via social logins (Google, Facebook, GitHub).  
  Component: [`Signup`](client/src/pages/Signup.tsx:8)

- **Login (`/login`):**  
  Users authenticate with email/password or social providers.  
  Component: [`Login`](client/src/pages/Login.tsx:26)

- **Navigation:**  
  Links allow switching between login and signup. Successful authentication redirects to `/dashboard`.

- **API Endpoints:**  
  Authentication handled via API calls (see `authFetch.ts`), with social logins triggering OAuth flows.

---

## Main Features

### Authentication
- **Signup/Login:** Secure registration and authentication with social login support.
- **404 Handling:** User-friendly not found page.

### Dashboard & Navigation
- **Main Dashboard:** Central hub for all features and quick actions.
- **AI Tools Overview:** Entry point to all AI-powered tools.

### AI Tools
- **Script Generator:** Generate scripts for videos using AI.
- **Video Generator:** Create videos from prompts.
- **Image Generator:** Produce images from text prompts.
- **Image Editor:** Edit images with AI.
- **Text Mounting:** Overlay AI-generated text on media.
- **Mobile Image Tool:** Mobile-optimized AI image editing.
- **TTS Character:** Generate AI-powered voices.

### Content Management
- **Videos Library:** Manage and organize videos.
- **Video Editor:** Edit, crop, and export videos.
- **Scripts:** (Planned) Manage video scripts.

### Content Discovery
- **Search Images:** Find and preview images from Unsplash.
- **Search Videos:** Discover viral YouTube videos.

### Publishing & Export
- **Publish Content:** Publish to YouTube/Instagram.
- **Exports:** Manage exported content.

### Analytics
- **Stats Dashboard:** Visualize content and publishing metrics.

### User Settings
- **Account Settings:** Manage profile, password, timezone, and integrations.

### General Pages
- **Home/Landing:** Platform introduction.
- **About:** Platform information.
- **Tools Overview:** Showcase of available tools.

---

## Tech Stack & Architecture

- **Frameworks & Libraries:**  
  - React (TypeScript), Vite, shadcn-ui, Radix UI, Tailwind CSS, react-router-dom, @tanstack/react-query, zod, axios, react-hook-form, framer-motion, recharts

- **Project Structure:**  
  - `src/pages/`: Route-based pages  
  - `src/components/`: Reusable UI components  
  - `src/context/`: Context providers (auth, loader)  
  - `src/hooks/`: Custom hooks  
  - `src/lib/`: Utilities and API helpers  
  - `src/integrations/`: Third-party integrations

- **Architecture:**  
  - Context API for authentication and global state  
  - Protected routes  
  - Modular AI tools  
  - Separation of concerns for maintainability

- **Styling & UI:**  
  - Tailwind CSS, shadcn-ui, Radix UI

- **Build & Deployment:**  
  - Vite for builds, `vercel.json` for Vercel deployment

This structure enables rapid development, modularity, and maintainability, following modern React best practices.
