# ProMatchAI Architecture Map

## Overview

ProMatchAI is a mobile-first React application for connecting refugees and job seekers with jobs, apprenticeships, learning content, and employer/admin workflows.

The system is built around:

- A Vite + React frontend
- A Supabase Edge Function backend
- A simple key-value persistence layer in Supabase
- Heavy use of `localStorage` for offline-first and demo-friendly behavior
- Rule-based recommendation and scoring utilities that power the "AI" experience

At a high level, the architecture looks like this:

```text
User
  ->
React App (Vite)
  ->
UI Components + Local State + localStorage
  ->
Supabase Edge Function API
  ->
Supabase KV Store Table
```

## Top-Level Structure

### Frontend application

Main frontend files:

- `src/main.tsx`
- `src/App.tsx`
- `src/components/*`
- `src/utils/*`
- `src/types/*`

The frontend is responsible for:

- Screen switching and navigation
- User profile state
- Authentication-like flows for refugees and admins
- Job browsing and applications
- Learning/course progress
- Profile editing and CV generation
- Notifications
- AI-style recommendations and explanations

### Backend application

Primary backend files:

- `src/supabase/functions/server/index.tsx`
- `src/supabase/functions/server/kv_store.tsx`

There is also another copy of the deployed function code under:

- `supabase/functions/make-server-215f50be/*`

The backend is responsible for:

- CRUD endpoints for users, jobs, courses, and applications
- Analytics aggregation
- Recommendation endpoints
- Shortlist persistence

## Frontend Architecture

### App shell

The main application shell lives in `src/App.tsx`.

It acts as:

- The top-level state container
- A manual router using React state
- The owner of the current `userProfile`
- The orchestrator for refugee, employer, and admin flows

Instead of route-based navigation, the app uses a `currentScreen` state:

- `onboarding`
- `refugee-login`
- `refugee-signup`
- `profiling`
- `main`
- `admin-login`
- `admin-signup`
- `admin`

Once the user reaches the main refugee experience, the app switches between four tabs:

- `home`
- `jobs`
- `learn`
- `profile`

### Main user-facing modules

#### 1. Onboarding

File:

- `src/components/Onboarding.tsx`

Responsibilities:

- Language selection
- Entry point into refugee vs employer flow
- Partner organization display
- First impression / platform explanation

#### 2. Refugee auth and setup

Files:

- `src/components/RefugeeLogin.tsx`
- `src/components/RefugeeSignup.tsx`
- `src/components/SkillProfiling.tsx`

Responsibilities:

- Demo-style signup/login
- Initial profile creation
- Skill selection
- Moving users into the main app

Important note:

- The refugee auth flow behaves more like local profile selection than secure authentication.

#### 3. Dashboard

File:

- `src/components/Dashboard.tsx`

Responsibilities:

- Welcome and summary view
- AI-recommended opportunities
- Application overview
- Course continuation
- Profile-aware home screen

#### 4. Jobs

File:

- `src/components/JobsTab.tsx`

Responsibilities:

- Load jobs from local cache and backend
- Compute match percentages
- Search and filter jobs
- Apply to jobs
- Explain matching strengths and gaps

#### 5. Learning

File:

- `src/components/LearnTab.tsx`

Responsibilities:

- Load courses
- Track progress
- Mark downloads / offline availability
- Generate course completion state
- Trigger certificates and notifications

#### 6. Profile

File:

- `src/components/ProfileTab.tsx`

Responsibilities:

- Edit contact details
- Edit skills, education, experience
- Upload profile picture
- Generate downloadable CV PDF
- Show achievements and earned certificates

### Admin architecture

Primary file:

- `src/components/AdminPanel.tsx`

Related admin modules include:

- `AdminApplicantManagement.tsx`
- `ApplicationManagementPanel.tsx`
- `JobManagementPanel.tsx`
- `CourseManagementPanel.tsx`
- `RecommendedCandidatesPanel.tsx`
- `ShortlistManagement.tsx`
- `InterviewInvitationDialog.tsx`
- `EmailAutomationSettings.tsx`

Admin responsibilities:

- Read users, jobs, courses, and applications
- View analytics
- Create and manage jobs and courses
- Review applicant profiles
- Shortlist candidates
- Send interview-related actions
- Use recommendation logic for candidate ranking

## Shared Utility Architecture

### Recommendation engine

File:

- `src/utils/recommendations.ts`

Purpose:

- Normalizes candidate and opportunity profiles
- Applies hard filters
- Scores matches using weighted features
- Adds basic text similarity
- Produces reciprocal recommendation scores

Scoring dimensions include:

- Skills
- Language
- Experience and training
- Location
- Interest/category alignment
- Badges/certificates
- Text similarity

This is one of the most structured parts of the project and is shared across frontend and backend logic.

### AI-style matching explanations

File:

- `src/utils/aiMatching.ts`

Purpose:

- Computes skill overlap percentages
- Assigns confidence labels
- Generates lightweight explanations for UI display

### Notifications

Files:

- `src/utils/notifications.ts`
- `src/components/NotificationBell.tsx`
- `src/components/NotificationsView.tsx`

Purpose:

- Store notifications in user-specific `localStorage` keys
- Track unread counts
- Display activity like applications, shortlists, interviews, and course completions

### Translations

File:

- `src/utils/translations.ts`

Purpose:

- Supplies UI strings for multiple languages
- Supports multilingual navigation and screen content

### Achievement computation

File:

- `src/utils/profileAchievements.ts`

Purpose:

- Computes progress-style achievements from profile data
- Rewards activity in learning, skill-building, experience, and communication completeness

### Local visibility rules

File:

- `src/utils/jobVisibility.ts`

Purpose:

- Tracks locally deleted/hidden jobs
- Filters job lists before display
- Merges local and backend job collections

## Backend Architecture

### Edge function server

File:

- `src/supabase/functions/server/index.tsx`

Frameworks and runtime:

- Deno
- Hono
- Supabase Edge Functions

Primary route groups:

- `/users`
- `/jobs`
- `/courses`
- `/applications`
- `/recommendations/opportunities/:candidateId`
- `/recommendations/candidates/:opportunityId`
- `/shortlists/*`
- `/analytics`
- `/health`

### Storage model

File:

- `src/supabase/functions/server/kv_store.tsx`

The backend uses a simple table:

- `kv_store_215f50be`

Each entity is stored as a JSON value under a string key:

- `user:{id}`
- `job:{id}`
- `course:{id}`
- `application:{id}`
- `shortlist:{id}`

This makes the backend flexible and fast to prototype with, but less structured than a relational schema.

## Persistence Model

The project uses a hybrid persistence strategy.

### Browser-side storage

Common keys include:

- `promatchai_users`
- `promatchai_jobs`
- `promatchai_courses`
- `promatchai_applications`
- `promatchai_shortlists`
- `promatchai_notifications_{userId}`

Browser storage is heavily used for:

- Offline-first behavior
- Demo resilience
- Fast UI updates
- Cache fallback when backend calls fail

### Server-side storage

The Supabase Edge Function persists the same kinds of objects in the KV table.

Typical pattern:

1. Read cached local data first
2. Render quickly
3. Try backend request in the background
4. Merge or replace data if backend succeeds

This is convenient for prototyping, but introduces dual-source-of-truth complexity.

## Main Data Flows

### Refugee onboarding flow

1. User lands on onboarding
2. Selects language and refugee path
3. Signs up or logs in
4. Skill profiling collects initial skills
5. Profile enters main app

Key files:

- `src/components/Onboarding.tsx`
- `src/components/RefugeeLogin.tsx`
- `src/components/RefugeeSignup.tsx`
- `src/components/SkillProfiling.tsx`
- `src/App.tsx`

### Job discovery and application flow

1. Jobs tab loads local jobs
2. Backend jobs are fetched if available
3. Jobs are scored against the user profile
4. User opens a job and submits an introduction
5. Application is stored locally
6. Application is posted to backend in the background
7. Notification is added

Key files:

- `src/components/JobsTab.tsx`
- `src/utils/aiMatching.ts`
- `src/utils/notifications.ts`
- `src/supabase/functions/server/index.tsx`

### Learning and certificate flow

1. Learn tab loads courses
2. User starts or continues a course
3. Progress is written back into the user profile
4. Completing a course generates a certificate
5. Course completion updates badges and notifications

Key files:

- `src/components/LearnTab.tsx`
- `src/App.tsx`
- `src/utils/notifications.ts`
- `src/utils/profileAchievements.ts`

### Admin management flow

1. Admin enters the admin portal
2. Panel loads local users/jobs/courses/applications
3. Background backend refresh happens if available
4. Admin manages jobs, courses, applications, and shortlists
5. Candidate recommendations are generated for jobs

Key files:

- `src/components/AdminLogin.tsx`
- `src/components/AdminPanel.tsx`
- `src/utils/recommendations.ts`
- `src/supabase/functions/server/index.tsx`

## Design Characteristics

This project currently has the shape of an advanced prototype or capstone application.

Strengths:

- Clear product vision
- Strong mobile-first focus
- Rich feature coverage
- Shared recommendation engine across frontend and backend
- Meaningful user/admin workflows

Architectural constraints:

- Manual routing rather than route-based navigation
- Mixed localStorage + backend persistence
- Demo-style authentication
- Large, multi-responsibility UI components
- Duplicate backend code locations in the repo

## Suggested Mental Model

The easiest way to understand the codebase is to think of it as four layers:

### Layer 1: Experience layer

- Screens and UI components
- Tabs, dialogs, forms, cards, and visual workflows

### Layer 2: App state layer

- `App.tsx`
- component-local state
- `userProfile`
- active screen and active tab state

### Layer 3: Domain logic layer

- recommendations
- matching
- notifications
- profile achievements
- job visibility rules

### Layer 4: Persistence layer

- `localStorage`
- Supabase Edge Function API
- Supabase KV table

## Key Files To Read First

If someone new joins the project, these are the best starting points:

1. `src/App.tsx`
2. `src/components/Dashboard.tsx`
3. `src/components/JobsTab.tsx`
4. `src/components/LearnTab.tsx`
5. `src/components/ProfileTab.tsx`
6. `src/components/AdminPanel.tsx`
7. `src/utils/recommendations.ts`
8. `src/supabase/functions/server/index.tsx`
9. `src/supabase/functions/server/kv_store.tsx`

## Short Summary

ProMatchAI is a React + Supabase platform prototype for refugee opportunity matching. The frontend manages most user experience and much of the state locally, while the backend provides CRUD, analytics, shortlist handling, and recommendation endpoints backed by a simple KV store. The project’s defining architectural trait is its hybrid offline-first model: local browser storage drives fast and resilient UX, while Supabase acts as a sync-capable server-side layer.
