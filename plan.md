# tomasquinones.com - New Personal Website Plan

## Overview
Rebuild your personal portfolio as a modern Next.js 14 site with TypeScript and Tailwind CSS. Features a dark mode developer aesthetic, self-hosted photo gallery, integrated interactive projects, and deploys statically to your existing cPanel hosting.

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS (dark theme)
- **Deployment**: Static export (`output: 'export'`) to cPanel
- **Image Processing**: Sharp (build-time thumbnails), exifr (EXIF extraction)
- **Lightbox**: yet-another-react-lightbox
- **Icons**: lucide-react

## Site Structure

```
/                   - Home (hero, intro, quick links)
/about              - Bio, career timeline, skills
/projects           - Project showcase listing
/projects/[slug]    - Individual project pages
/projects/pomodoro  - Interactive: Pomodoro timer
/projects/pong      - Interactive: Pong game
/projects/memory    - Interactive: Memory game
/projects/chess     - Interactive: Chess tools
/projects/dvd       - Interactive: DVD screensaver
/projects/countdown - Interactive: Countdown timer
/projects/bingo     - Interactive: 2025 Bingo card
/projects/charts    - Interactive: Chart demos
/gallery            - Photo gallery (album overview)
/gallery/[album]    - Album view with lightbox
/blog               - Blog listing (simple to start)
/blog/[slug]        - Blog post
/contact            - Social links, contact info
```

---

## Phase 1: Foundation

### Tasks

- [ ] **1.1** Initialize Next.js 14 project with TypeScript
  - Run `npx create-next-app@14` with TypeScript option
  - Verify project structure created correctly

- [ ] **1.2** Configure static export
  - Update `next.config.js` with `output: 'export'`
  - Set `images: { unoptimized: true }`
  - Set `trailingSlash: true`

- [ ] **1.3** Set up Tailwind CSS with dark theme
  - Configure `tailwind.config.ts` with custom colors
  - Define dark theme tokens in `globals.css`
  - Add Inter and JetBrains Mono fonts

- [ ] **1.4** Create shared UI components
  - Create `src/components/ui/Button.tsx`
  - Create `src/components/ui/Card.tsx`
  - Create `src/components/ui/Container.tsx`
  - Create `src/lib/utils.ts` with `cn()` helper

- [ ] **1.5** Build root layout with navigation
  - Create `src/components/layout/Navbar.tsx` (responsive, mobile menu)
  - Create `src/components/layout/Footer.tsx`
  - Wire up in `src/app/layout.tsx`

- [ ] **1.6** Build Home page
  - Create hero section with name and tagline
  - Add profile photo
  - Add intro paragraph
  - Add quick links to main sections

- [ ] **1.7** Build About page
  - Migrate bio content from current index.html
  - Add career timeline component
  - Add skills/technologies section

- [ ] **1.8** Build Contact page
  - Add social media links (GitHub, LinkedIn, etc.)
  - Add email contact info
  - Style with SocialLink components

- [ ] **1.9** Update deployment configuration
  - Update `.cpanel.yml` to deploy `out/` directory
  - Test local build with `npm run build`
  - Verify static files generated in `/out`

- [ ] **1.10** Verify deployment
  - Push to repository
  - Confirm cPanel auto-deploy succeeds
  - Test live site loads correctly

---

## Phase 2: Interactive Projects

### Tasks

- [ ] **2.1** Create projects listing page
  - Build `src/app/projects/page.tsx`
  - Create `ProjectCard` component
  - Add project metadata/descriptions

- [ ] **2.2** Convert Bingo Card
  - Create `src/components/projects/BingoCard.tsx`
  - Implement state for tracking completed items
  - Add localStorage persistence
  - Create route at `/projects/bingo`

- [ ] **2.3** Convert Countdown Timer
  - Create `src/components/projects/CountdownTimer.tsx`
  - Implement data-driven date calculations
  - Create route at `/projects/countdown`

- [ ] **2.4** Convert Pomodoro Timer
  - Create `src/hooks/usePomodoro.ts` custom hook
  - Create `src/components/projects/PomodoroTimer.tsx`
  - Add audio notifications
  - Add work/break session management
  - Create route at `/projects/pomodoro`

- [ ] **2.5** Convert Memory Game
  - Create `src/components/projects/MemoryGame.tsx`
  - Implement useReducer for game state
  - Add card shuffle logic
  - Add win detection and scoring
  - Create route at `/projects/memory`

- [ ] **2.6** Convert DVD Screensaver
  - Create `src/hooks/useCanvas.ts` helper hook
  - Create `src/components/projects/DVDScreensaver.tsx`
  - Implement `requestAnimationFrame` loop
  - Add collision detection and color change
  - Create route at `/projects/dvd`

- [ ] **2.7** Convert Pong Game
  - Create `src/components/projects/PongGame.tsx`
  - Implement canvas game loop
  - Add AI paddle logic
  - Add score tracking
  - Add keyboard/touch controls
  - Create route at `/projects/pong`

- [ ] **2.8** Convert Chess Tools
  - Create `src/components/projects/ChessTools.tsx`
  - Implement SVG board rendering
  - Add Lichess API integration
  - Create route at `/projects/chess`

- [ ] **2.9** Convert Charts Demo
  - Install recharts package
  - Create `src/components/projects/ChartsDemo.tsx`
  - Convert existing chart examples
  - Create route at `/projects/charts`

- [ ] **2.10** Test all interactive projects
  - Verify each project works in dev mode
  - Verify each project works in static build
  - Test localStorage persistence where applicable

---

## Phase 3: Photo Gallery

### Tasks

- [ ] **3.1** Set up gallery directory structure
  - Create `public/images/gallery/` directory
  - Create sample album folder with `originals/` subdirectory
  - Add test photos

- [ ] **3.2** Create thumbnail generation script
  - Install Sharp package
  - Create `scripts/process-images.ts`
  - Generate medium (1200px) and thumbnail (400px) versions
  - Add to build pipeline

- [ ] **3.3** Create EXIF extraction script
  - Install exifr package
  - Extract camera, lens, settings, date, GPS data
  - Output `metadata.json` per album

- [ ] **3.4** Create gallery types
  - Define `Photo` interface in `src/types/index.ts`
  - Define `Album` interface
  - Create gallery utility functions in `src/lib/gallery.ts`

- [ ] **3.5** Build PhotoGrid component
  - Create `src/components/gallery/PhotoGrid.tsx`
  - Implement CSS columns masonry layout
  - Add lazy loading for images
  - Add click handler for lightbox

- [ ] **3.6** Build Lightbox component
  - Install yet-another-react-lightbox
  - Create `src/components/gallery/Lightbox.tsx`
  - Add EXIF data sidebar
  - Add keyboard navigation

- [ ] **3.7** Build AlbumCard component
  - Create `src/components/gallery/AlbumCard.tsx`
  - Display cover image, title, photo count

- [ ] **3.8** Build gallery overview page
  - Create `src/app/gallery/page.tsx`
  - List all albums with AlbumCard components

- [ ] **3.9** Build album detail page
  - Create `src/app/gallery/[album]/page.tsx`
  - Load album metadata and photos
  - Render PhotoGrid with Lightbox

- [ ] **3.10** Add initial photo albums
  - Organize photos into album folders
  - Run image processing script
  - Verify gallery displays correctly

---

## Phase 4: Blog

### Tasks

- [ ] **4.1** Create blog types and utilities
  - Define `Post` interface in `src/types/index.ts`
  - Create `src/lib/blog.ts` for post loading

- [ ] **4.2** Build PostCard component
  - Create `src/components/blog/PostCard.tsx`
  - Display title, date, excerpt, tags

- [ ] **4.3** Build blog listing page
  - Create `src/app/blog/page.tsx`
  - List posts with PostCard components
  - Add pagination if needed

- [ ] **4.4** Build blog post page
  - Create `src/app/blog/[slug]/page.tsx`
  - Render post content
  - Add navigation to prev/next posts

- [ ] **4.5** Add initial blog posts
  - Create sample posts as static pages
  - Verify listing and detail pages work

- [ ] **4.6** (Optional) Set up MDX support
  - Install @next/mdx and related packages
  - Configure next.config.js for MDX
  - Create MDX component mappings

---

## Phase 5: RWGPS Tools (Optional)

### Tasks

- [ ] **5.1** Research RWGPS API requirements
  - Document authentication flow
  - Identify needed endpoints

- [ ] **5.2** Create auth components
  - Build client-side OAuth flow
  - Store tokens in localStorage
  - Handle token refresh

- [ ] **5.3** Build RWGPS dashboard
  - Create `src/app/projects/rwgps/page.tsx`
  - Wrap in `'use client'` directive
  - Display user routes/activities

- [ ] **5.4** Add route visualization
  - Integrate map library (Leaflet or similar)
  - Display GPX route data

---

## Phase 6: Polish

### Tasks

- [ ] **6.1** Add SEO meta tags
  - Create metadata for each page
  - Add dynamic titles and descriptions
  - Configure robots.txt and sitemap

- [ ] **6.2** Create Open Graph images
  - Design OG image template
  - Generate images for key pages
  - Add og:image meta tags

- [ ] **6.3** Optimize performance
  - Run Lighthouse audit
  - Optimize images and fonts
  - Minimize CSS/JS bundles
  - Target 90+ scores

- [ ] **6.4** Accessibility audit
  - Add ARIA labels where needed
  - Test keyboard navigation
  - Verify color contrast ratios
  - Test with screen reader

- [ ] **6.5** Cross-browser testing
  - Test Chrome, Firefox, Safari
  - Test mobile browsers
  - Fix any compatibility issues

- [ ] **6.6** Final review and launch
  - Review all pages and features
  - Fix any remaining bugs
  - Update DNS/redirects if needed
  - Announce launch

---

## Key Files Reference

```
src/
├── app/
│   ├── layout.tsx          # Root layout, nav, footer
│   ├── page.tsx            # Home
│   ├── globals.css         # Tailwind + dark theme
│   └── [pages as above]
├── components/
│   ├── layout/             # Navbar, Footer, Container
│   ├── ui/                 # Button, Card, SocialLink
│   ├── projects/           # PomodoroTimer, PongGame, etc.
│   ├── gallery/            # PhotoGrid, Lightbox, AlbumCard
│   └── blog/               # PostCard
├── hooks/
│   ├── usePomodoro.ts
│   ├── useCanvas.ts
│   └── useLightbox.ts
├── lib/
│   ├── gallery.ts          # Album/photo loading
│   └── utils.ts            # cn(), formatDate()
├── types/
│   └── index.ts            # Photo, Album, Project interfaces
└── data/
    └── albums/             # Album metadata JSON files
```

## Config Files

**next.config.js:**
```js
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
}
```

**Updated .cpanel.yml:**
```yaml
deployment:
  tasks:
    - export DEPLOYPATH=/home/chinus/public_html
    - rm -rf $DEPLOYPATH/*
    - cp -r out/* $DEPLOYPATH/
```

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `#0a0a0a` | Page background |
| `--bg-secondary` | `#171717` | Section backgrounds |
| `--bg-card` | `#262626` | Card backgrounds |
| `--text-primary` | `#fafafa` | Headings, body text |
| `--text-muted` | `#a1a1aa` | Secondary text |
| `--accent` | `#3b82f6` | Links, buttons, highlights |

## Notes
- All existing projects will be preserved and rebuilt as React components
- Photo gallery uses build-time processing since Next.js Image optimization doesn't work with static export
- RWGPS tools require client-side auth since there's no server
