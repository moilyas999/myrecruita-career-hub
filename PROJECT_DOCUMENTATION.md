# MyRecruita - Comprehensive Project Documentation

> **Knowledge Base Reference Document**  
> **Last Updated**: January 2025  
> **Version**: 2.0  
> **Status**: Production

---

## Table of Contents

1. [Executive Summary & Project Vision](#1-executive-summary--project-vision)
2. [Application Identity & Branding](#2-application-identity--branding)
3. [Technology Stack](#3-technology-stack)
4. [Architecture Overview](#4-architecture-overview)
5. [Database Schema](#5-database-schema)
6. [Permission & Role System](#6-permission--role-system)
7. [Supabase Edge Functions](#7-supabase-edge-functions)
8. [AI Features & Capabilities](#8-ai-features--capabilities)
9. [Application Routes & Navigation](#9-application-routes--navigation)
10. [Admin Dashboard](#10-admin-dashboard)
11. [CV Management System](#11-cv-management-system)
12. [Candidate Pipeline](#12-candidate-pipeline)
13. [Job Management System](#13-job-management-system)
14. [Blog & Content Management](#14-blog--content-management)
15. [Notification System](#15-notification-system)
16. [PWA & Progressive Features](#16-pwa--progressive-features)
17. [SEO & Structured Data](#17-seo--structured-data)
18. [Public-Facing Features](#18-public-facing-features)
19. [Authentication & Security](#19-authentication--security)
20. [Key Hooks & Utilities](#20-key-hooks--utilities)
21. [Component Patterns & Best Practices](#21-component-patterns--best-practices)
22. [Development Guidelines](#22-development-guidelines)
23. [Feature Implementation Checklist](#23-feature-implementation-checklist)
24. [Future Roadmap](#24-future-roadmap)
25. [Changelog](#25-changelog)
26. [Knowledge Base Instructions](#26-knowledge-base-instructions)

---

## 1. Executive Summary & Project Vision

### What is MyRecruita?

MyRecruita is a **Recruitment Agency Content Management System (CMS)** designed to streamline recruitment agency operations through AI-powered automation and industry-standard features. It serves as a comprehensive platform for managing candidates, job postings, client relationships, and the entire recruitment lifecycle.

### Core Mission

- **Streamline CV Management**: AI-powered parsing and scoring eliminates manual data entry
- **Automate Candidate Matching**: Intelligent algorithms match candidates to jobs instantly
- **Visual Pipeline Tracking**: Kanban-style boards for tracking candidates through hiring stages
- **Reduce Manual Work**: Bulk import, email ingestion, and automation features
- **Real-Time Collaboration**: Multi-channel notifications keep teams synchronized

### Target Users

| User Role | Primary Functions |
|-----------|------------------|
| **Recruiters** | Daily CV review, job posting, candidate pipeline management, client communication |
| **Account Managers** | Client relationship management, job status tracking, placement tracking |
| **Marketing Team** | Blog management, talent showcase, employer branding content |
| **Administrators** | User management, permissions, system settings, full access |
| **CV Uploaders** | Limited data entry access for uploading and parsing CVs |
| **Viewers** | Read-only access for stakeholders and auditors |

### Competitive Advantages

- ✅ **APSCo-Accredited Platform** - Industry-recognized recruitment standards
- ✅ **AI-Powered CV Parsing** - 6-category scoring with detailed breakdowns
- ✅ **Real-Time Job Matching** - Instant candidate-to-job relevance scoring
- ✅ **Email Ingestion** - Automatic job status updates from client emails
- ✅ **Progressive Web App** - Installable app with offline support
- ✅ **Granular Permissions** - 28 permission types across 6 roles
- ✅ **Multi-Channel Notifications** - Push, email, and in-app alerts

### Specialist Sectors

MyRecruita specializes in recruitment for:
- 💼 **Finance & Accounting** - CFOs, Financial Controllers, Accountants
- 💻 **Information Technology** - Developers, DevOps, IT Managers
- ⚖️ **Legal** - Solicitors, Legal Counsel, Compliance Officers
- 👥 **Human Resources** - HR Directors, Talent Acquisition, L&D
- 🎯 **Executive Search** - C-Suite, Board Members, Senior Leadership

---

## 2. Application Identity & Branding

### Brand Information

| Property | Value |
|----------|-------|
| **Name** | MyRecruita |
| **Tagline** | "Your Career Partner" |
| **Accreditation** | APSCo Member |
| **Primary Domain** | myrecruita-career-hub.lovable.app |
| **Supabase Project ID** | yoegksjmdtubnkgdtttj |

### Visual Identity

```css
/* Primary Brand Colors (HSL) */
--primary: 217 91% 60%;           /* Blue - Trust, Professionalism */
--secondary: 210 40% 96%;         /* Light Blue - Clean, Modern */
--accent: 43 96% 56%;             /* Gold/Amber - Premium, Achievement */

/* Semantic Colors */
--destructive: 0 84% 60%;         /* Red - Errors, Rejections */
--success: 142 76% 36%;           /* Green - Success, Placed */
--warning: 38 92% 50%;            /* Orange - Warnings, Attention */
```

### Logo & Assets

- **Logo Location**: `public/lovable-uploads/`
- **APSCo Certificate**: `public/images/apsco-certificate.png`
- **APSCo Logo**: `public/images/apsco-logo.png`
- **Blog Images**: `public/images/` and `src/assets/`

---

## 3. Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | ^18.3.1 | UI framework with hooks |
| **TypeScript** | ^5.x | Static type safety |
| **Vite** | ^5.x | Build tool & dev server |
| **Tailwind CSS** | ^3.4 | Utility-first CSS framework |
| **shadcn/ui** | Latest | Pre-built accessible components |
| **React Router** | ^6.26.2 | Client-side routing with lazy loading |
| **TanStack React Query** | ^5.83.0 | Server state management & caching |
| **React Hook Form** | ^7.53.0 | Form state management |
| **Zod** | ^3.23.8 | Schema validation |
| **Recharts** | ^2.12.7 | Data visualization charts |
| **Lucide React** | ^0.462.0 | Icon library (500+ icons) |
| **date-fns** | ^4.1.0 | Date manipulation utilities |
| **sonner** | ^1.5.0 | Toast notification system |
| **cmdk** | ^1.0.0 | Command palette (⌘K) |
| **vaul** | ^0.9.3 | Drawer component |
| **embla-carousel-react** | ^8.3.0 | Carousel/slider component |

### Backend Technologies (Supabase)

| Service | Purpose |
|---------|---------|
| **PostgreSQL** | Relational database with Row Level Security |
| **Edge Functions** | Deno-based serverless functions (TypeScript) |
| **Auth** | Email/password authentication with OTP |
| **Storage** | Secure file storage for CVs and documents |
| **Realtime** | WebSocket subscriptions for live updates |

### External Integrations

| Service | Purpose | Secret Key |
|---------|---------|------------|
| **Lovable AI Gateway** | Gemini AI for CV parsing, matching | `LOVABLE_API_KEY` |
| **Progressier** | PWA, push notifications | `PROGRESSIER_APP_ID`, `PROGRESSIER_API_KEY` |
| **Resend** | Transactional email delivery | `RESEND_API_KEY` |
| **Postmark** | Email ingestion webhooks | (via webhook URL) |

### AI Gateway Configuration

```typescript
// AI Gateway Endpoint
const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Default Model
const AI_MODEL = "google/gemini-3-flash-preview";

// Features Available
- Function calling (structured output)
- JSON mode responses
- Multi-turn conversations
- Large context window
```

---

## 4. Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   React     │  │  React      │  │   TanStack Query        │  │
│  │   Router    │  │  Components │  │   (Server State)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE CLIENT                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Auth      │  │   Database  │  │   Storage               │  │
│  │   Client    │  │   Client    │  │   Client                │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE BACKEND                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Edge Functions (Deno)                     ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       ││
│  │  │ parse-cv │ │ match-cv │ │ process  │ │ send     │       ││
│  │  │          │ │ -to-job  │ │ -bulk    │ │ -notif   │       ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    PostgreSQL Database                       ││
│  │  26 Tables • Row Level Security • Triggers • Functions      ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Storage Buckets                           ││
│  │  cv-uploads (private)                                        ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Lovable    │  │ Progressier │  │   Resend / Postmark     │  │
│  │  AI Gateway │  │ (PWA/Push)  │  │   (Email)               │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Patterns

**CV Submission Flow**:
```
User Upload → Storage → Database → Edge Function → AI Parse → Update DB → Notify Admins
```

**Job Matching Flow**:
```
Select Job → Fetch Candidates → Filter → AI Match → Score & Rank → Display Results
```

**Pipeline Update Flow**:
```
Drag Card → Update Stage → Log Activity → Realtime Broadcast → Update UI
```

---

## 5. Database Schema

### Complete Table Reference (26 Tables)

#### Core Recruitment Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `cv_submissions` | Candidate CV data | name, email, phone, job_title, cv_file_url, cv_score, ai_profile |
| `jobs` | Job postings | reference_id, title, location, sector, status, requirements |
| `job_applications` | Applications to jobs | job_id, user_id, cv_file_url, message |
| `talent_profiles` | Featured talent | reference_id, role, sector, years_experience, is_visible |
| `talent_requests` | Employer talent inquiries | talent_id, company_name, contact_name, email |

#### Candidate Pipeline Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `candidate_pipeline` | Pipeline entries | cv_submission_id, job_id, stage, priority, notes, assigned_to |
| `pipeline_activity` | Activity audit log | pipeline_id, action, from_stage, to_stage, note, created_by |

#### Admin & Staff Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `admin_profiles` | Admin user profiles | user_id, email, role, display_name, avatar_url |
| `staff_permissions` | Granular permissions | user_id, permission, granted_by |
| `user_profiles` | Regular user profiles | user_id, email, full_name, cv_file_url, phone |

#### Notification Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `notifications` | In-app notifications | user_id, title, message, category, read, link |
| `notification_preferences` | User preferences | user_id, email_enabled, push_enabled, event_preferences |

#### Bulk Import Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `bulk_import_sessions` | Import session tracking | status, total_files, imported_count, failed_count, user_id |
| `bulk_import_files` | Individual file status | session_id, file_name, status, parsed_data, error_message |
| `cv_upload_activity_log` | Audit trail | user_id, action, details, user_email |

#### Email Processing Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `email_ingestion_log` | Incoming email log | message_id, from_email, subject, status, is_relevant, filter_reason |
| `job_status_updates` | AI-detected status changes | job_id, suggested_status, confidence_score, ai_reasoning, reviewed_by |

#### Blog Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `blog_posts` | Blog articles | title, slug, content, is_published, author_name, view_count |
| `blog_categories` | Post categories | name, slug, description |
| `blog_tags` | Post tags | name, slug |
| `blog_post_tags` | Post-tag junction | post_id, tag_id |

#### Submission Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `contact_submissions` | Contact form entries | name, email, inquiry_type, message, subject, company |
| `career_partner_requests` | Career partner inquiries | name, email, service_type, message, phone |
| `employer_job_submissions` | Employer job requests | company_name, job_title, job_description, contact_name |

#### Settings Table

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `app_settings` | Application configuration | key, value (JSON), description, updated_by |

### CV Submissions Schema (Detailed)

```sql
cv_submissions {
  id: uuid (PK)
  name: text NOT NULL
  email: text NOT NULL
  phone: text NOT NULL
  cv_file_url: text
  
  -- AI-Generated Fields
  ai_profile: jsonb {
    summary_for_matching: string
    key_achievements: string[]
    hard_skills: string[]
    soft_skills: string[]
    certifications: string[]
    industries: string[]
    experience_years: number
    seniority: string
    education: { level, field, institution }
    ideal_roles: string[]
    career_progression: string
  }
  cv_score: integer (0-100)
  cv_score_breakdown: jsonb {
    completeness: number (0-20)
    skills: number (0-20)
    experience: number (0-25)
    achievements: number (0-15)
    education: number (0-10)
    presentation: number (0-10)
  }
  
  -- Extracted Fields
  job_title: text
  location: text
  sector: text
  seniority_level: text
  education_level: text
  years_experience: integer
  skills: text
  experience_summary: text
  
  -- Metadata
  source: text ('website', 'bulk_import', 'manual', 'email')
  added_by: uuid (admin user_id)
  admin_notes: text
  user_id: uuid (if submitted by logged-in user)
  scored_at: timestamp
  created_at: timestamp
}
```

### Database Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `is_admin(user_id)` | Check if user is any admin | boolean |
| `is_full_admin(user_id)` | Check if user is full admin | boolean |
| `get_admin_role(user_id)` | Get user's admin role | text |
| `has_permission(user_id, permission)` | Check specific permission | boolean |
| `get_user_permissions(user_id)` | Get all user permissions | permission_type[] |
| `assign_role_permissions(user_id, role)` | Assign role-based permissions | void |
| `generate_job_reference()` | Generate MR-2025-XXX format | text |
| `generate_talent_reference()` | Generate TAL-MR-XXX format | text |
| `update_updated_at_column()` | Trigger for updated_at | trigger |
| `handle_new_user_signup()` | Create user profile on signup | trigger |
| `ensure_notification_preferences()` | Auto-create notification prefs | trigger |
| `sync_notification_event_types()` | Sync event types for all users | void |

---

## 6. Permission & Role System

### Permission Types (28 Total)

```typescript
type PermissionType =
  // CV Permissions (5)
  | "cv.view" | "cv.create" | "cv.update" | "cv.delete" | "cv.export"
  // Job Permissions (4)
  | "jobs.view" | "jobs.create" | "jobs.update" | "jobs.delete"
  // Application Permissions (2)
  | "applications.view" | "applications.manage"
  // Talent Permissions (4)
  | "talent.view" | "talent.create" | "talent.update" | "talent.delete"
  // Pipeline Permissions (4)
  | "pipeline.view" | "pipeline.create" | "pipeline.update" | "pipeline.delete"
  // Submission Permissions (2)
  | "submissions.view" | "submissions.delete"
  // Blog Permissions (4)
  | "blog.view" | "blog.create" | "blog.update" | "blog.delete"
  // Analytics Permissions (1)
  | "analytics.view"
  // Staff Permissions (4)
  | "staff.view" | "staff.create" | "staff.update" | "staff.delete"
  // Settings Permissions (2)
  | "settings.view" | "settings.update"
  // Notification Permissions (1)
  | "notifications.manage";
```

### Role Definitions (6 Roles)

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **admin** | Full system access | All 28 permissions |
| **recruiter** | Daily recruitment operations | CV, Jobs, Pipeline, Talent, Analytics |
| **account_manager** | Client relationship management | View-only for Jobs, Talent, Pipeline, Analytics |
| **marketing** | Content and branding | Blog (full), Jobs (view), Talent (view), Analytics |
| **cv_uploader** | Data entry personnel | cv.create only |
| **viewer** | Read-only stakeholders | View permissions for CV, Jobs, Talent, Pipeline |

### Role-Permission Matrix

| Permission | Admin | Recruiter | Account Mgr | Marketing | CV Uploader | Viewer |
|------------|:-----:|:---------:|:-----------:|:---------:|:-----------:|:------:|
| cv.view | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| cv.create | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| cv.update | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| cv.delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| cv.export | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| jobs.view | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| jobs.create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| jobs.update | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| jobs.delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| pipeline.view | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| pipeline.create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| pipeline.update | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| pipeline.delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| blog.view | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| blog.create | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| blog.update | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| blog.delete | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| staff.* | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| settings.* | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Permission Checking in Code

```typescript
// Hook usage
const { hasPermission, permissions, isFullAdmin } = usePermissions();

// Check single permission
if (hasPermission("cv.delete")) {
  // Show delete button
}

// Check multiple permissions
const canManageJobs = hasPermission("jobs.create") && hasPermission("jobs.update");

// Full admin bypass
if (isFullAdmin) {
  // Show all admin features
}
```

---

## 7. Supabase Edge Functions

### Function Overview (11 Functions)

| Function | Trigger | Purpose |
|----------|---------|---------|
| `parse-cv` | POST request | AI-powered CV parsing and scoring |
| `match-cv-to-job` | POST request | Match candidates to job postings |
| `process-bulk-import` | POST request | Background bulk CV processing |
| `rescore-cvs` | POST request | Re-score CVs against criteria |
| `create-admin-user` | POST request | Create new admin accounts |
| `bypass-otp-login` | POST request | Development OTP bypass |
| `send-admin-notification` | POST request | Push/email notifications |
| `send-daily-summary` | Scheduled | Daily activity digest email |
| `send-push-notification` | POST request | Progressier push delivery |
| `receive-email-webhook` | Webhook | Postmark email ingestion |
| `process-job-email` | POST request | AI email classification |

### Shared Utilities (`_shared/`)

| File | Purpose |
|------|---------|
| `ai-client.ts` | Lovable AI Gateway client wrapper |
| `cors.ts` | CORS headers configuration |
| `cv-parser.ts` | CV text extraction utilities |
| `file-handler.ts` | File download and processing |
| `prompts.ts` | AI system prompts |
| `types.ts` | Shared TypeScript types |

### Function Details

#### `parse-cv`

**Purpose**: Extract structured data from CV documents using AI

**Input**:
```typescript
{
  cvUrl: string;        // Supabase storage URL
  submissionId: string; // cv_submissions.id
}
```

**Process**:
1. Download file from Supabase Storage
2. Convert PDF/DOCX to text
3. Send to Gemini AI with extraction prompt
4. Parse structured response
5. Generate AI profile for matching
6. Calculate 6-category score (0-100)
7. Update database record

**Output**:
```typescript
{
  success: boolean;
  data: {
    name: string;
    email: string;
    phone: string;
    job_title: string;
    location: string;
    sector: string;
    seniority_level: string;
    years_experience: number;
    skills: string;
    education_level: string;
    experience_summary: string;
    cv_score: number;
    cv_score_breakdown: ScoreBreakdown;
    ai_profile: AIProfile;
  }
}
```

#### `match-cv-to-job`

**Purpose**: Find and rank candidates for a specific job

**Input**:
```typescript
{
  jobId: string;
  filters?: {
    location?: string;
    sector?: string;
    minExperience?: number;
    maxExperience?: number;
  };
  limit?: number; // Default 50
}
```

**Process**:
1. Fetch job details from database
2. Fetch candidates with AI profiles
3. Apply optional filters
4. Send to Gemini AI for matching
5. Score each candidate (0-100)
6. Return ranked results

#### `process-job-email`

**Purpose**: AI classification of emails for job status changes

**Status Types**:
- `expired` - "no longer looking", "position cancelled"
- `filled` - "hired", "placed", "position filled"
- `paused` - "on hold", "hiring freeze"
- `none` - No clear status change

---

## 8. AI Features & Capabilities

### AI Gateway Configuration

```typescript
// Endpoint
const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Default Model
const MODEL = "google/gemini-3-flash-preview";

// Request Format (OpenAI-compatible)
const request = {
  model: MODEL,
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ],
  temperature: 0.3,  // Low for consistency
  response_format: { type: "json_object" }
};
```

### 8.1 CV Parsing Engine

**Capabilities**:
- Extract personal information (name, email, phone, location)
- Identify job title and career sector
- Assess seniority level and experience years
- Extract and categorize skills (hard/soft)
- Parse education and certifications
- Generate professional summary

**Extracted Fields**:

| Category | Fields |
|----------|--------|
| **Personal** | name, email, phone, location |
| **Professional** | job_title, sector, seniority_level, years_experience |
| **Skills** | skills (comma-separated), hard_skills[], soft_skills[] |
| **Experience** | experience_summary, key_achievements[] |
| **Education** | education_level, certifications[], field, institution |

### 8.2 CV Scoring System

**Scoring Breakdown (0-100)**:

| Category | Max Points | Weight | Evaluation Criteria |
|----------|------------|--------|---------------------|
| **Completeness** | 20 | 20% | All sections present, contact info, no gaps |
| **Skills Relevance** | 20 | 20% | Specific technical skills, relevant keywords |
| **Experience Depth** | 25 | 25% | Achievement-focused, quantifiable results |
| **Achievements** | 15 | 15% | Measurable accomplishments, impact statements |
| **Education** | 10 | 10% | Clear credentials, relevant certifications |
| **Presentation** | 10 | 10% | Formatting, structure, readability |

**Score Interpretation**:

| Score Range | Label | Action |
|-------------|-------|--------|
| 80-100 | Excellent | Ready for immediate client presentation |
| 60-79 | Good | Minor improvements suggested |
| 40-59 | Average | Needs CV refinement |
| 0-39 | Poor | Significant gaps, requires review |

### 8.3 AI Profile Generation

**Purpose**: Create structured profiles optimized for job matching

```typescript
interface AIProfile {
  summary_for_matching: string;    // 3-4 sentence professional summary
  key_achievements: string[];      // Top 3-5 career achievements
  hard_skills: string[];           // Technical/domain skills
  soft_skills: string[];           // Interpersonal skills
  certifications: string[];        // Professional certifications
  industries: string[];            // Industry experience
  experience_years: number;        // Total years of experience
  seniority: string;              // Junior/Mid/Senior/Executive
  education: {
    level: string;                // Degree level
    field: string;                // Field of study
    institution: string;          // University/college
  };
  ideal_roles: string[];          // Suitable job titles
  career_progression: string;     // Career trajectory narrative
}
```

### 8.4 CV-to-Job Matching

**Algorithm**:
1. **Fetch Candidates**: Query cv_submissions with ai_profile
2. **Apply Filters**: Location, sector, experience range
3. **AI Evaluation**: Send candidate summaries + job description
4. **Score Generation**: 0-100 relevance score per candidate
5. **Explanation**: Human-readable match reasoning

**Scoring Weights**:

| Factor | Weight | Description |
|--------|--------|-------------|
| Skills Alignment | 40% | Required skills vs. candidate skills |
| Experience Relevance | 25% | Similar roles and industries |
| Seniority Fit | 20% | Experience level appropriateness |
| Location Compatibility | 15% | Work location feasibility |

**Match Result Structure**:

```typescript
interface MatchResult {
  cv_id: string;
  match_score: number;           // 0-100
  explanation: string;           // 1-2 sentence reasoning
  skills_matched: string[];      // Skills candidate possesses
  skills_missing: string[];      // Required skills candidate lacks
  candidate: {
    name: string;
    email: string;
    job_title: string;
    location: string;
    years_experience: number;
    cv_score: number;
  };
}
```

### 8.5 Email Classification

**Status Detection**:

| Status | Trigger Keywords |
|--------|-----------------|
| `expired` | "no longer looking", "position cancelled", "closed", "withdrawn" |
| `filled` | "hired", "placed", "found someone", "position filled", "successful" |
| `paused` | "on hold", "hiring freeze", "waiting for approval", "delayed" |
| `none` | No clear status change detected |

**Job Matching Logic** (Priority Order):
1. Reference ID match (MR-2025-XXX) - Highest confidence
2. Exact job title match
3. Partial title match
4. Word-based fuzzy matching

---

## 9. Application Routes & Navigation

### Public Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Home | Landing page with hero, services, stats |
| `/jobs` | Jobs | Job listing with search and filters |
| `/jobs/:id` | JobDetail | Individual job posting |
| `/submit-cv` | SubmitCV | Public CV submission form |
| `/career-partner` | CareerPartner | Career services landing page |
| `/featured-talent` | FeaturedTalent | Anonymous talent showcase |
| `/employers` | Employers | Employer services page |
| `/post-job` | PostJob | Employer job submission form |
| `/about` | About | Company information |
| `/contact` | Contact | Contact form |
| `/blog` | Blog | Blog listing |
| `/blog/:slug` | BlogPost | Individual blog post |
| `/thank-you` | ThankYou | Form submission confirmation |

### Authentication Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/auth` | Auth | Login/signup for candidates |
| `/admin-login` | AdminLogin | Admin authentication |
| `/complete-profile` | CompleteProfile | Post-signup profile completion |

### User Dashboard Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/dashboard` | Dashboard | User dashboard home |
| `/my-applications` | MyApplications | Track job applications |
| `/my-profile` | MyProfile | Edit user profile |

### Admin Dashboard Routes

| Route | Purpose |
|-------|---------|
| `/admin?tab=overview` | Dashboard stats and metrics |
| `/admin?tab=submissions` | CV Database management |
| `/admin?tab=jobs` | Job postings management |
| `/admin?tab=pipeline` | Candidate Pipeline (Kanban) |
| `/admin?tab=cvmatching` | AI CV Matching tool |
| `/admin?tab=cvbulkimport` | Bulk CV import |
| `/admin?tab=talent` | Featured Talent management |
| `/admin?tab=blog` | Blog CMS |
| `/admin?tab=analytics` | Analytics dashboard |
| `/admin?tab=jobstatus` | Job Status Tracker |
| `/admin?tab=admins` | Team management |
| `/admin?tab=notifications` | Notification settings |
| `/admin?tab=settings` | App settings |
| `/admin?tab=permissions` | Permissions management |

---

## 10. Admin Dashboard

### Tab Configuration

```typescript
const TAB_CONFIG = {
  overview: { component: DashboardOverview, title: "Dashboard" },
  submissions: { component: SubmissionsManagement, title: "CV Database" },
  jobs: { component: JobsManagement, title: "Jobs" },
  pipeline: { component: CandidatePipeline, title: "Pipeline" },
  cvmatching: { component: CVMatchingTool, title: "CV Matching" },
  cvbulkimport: { component: CVBulkImport, title: "Bulk Import" },
  talent: { component: TalentManagement, title: "Talent" },
  blog: { component: BlogManagement, title: "Blog" },
  analytics: { component: StatsDashboard, title: "Analytics", fullAdminOnly: true },
  jobstatus: { component: JobStatusTracker, title: "Job Status" },
  admins: { component: AdminManagement, title: "Team", fullAdminOnly: true },
  notifications: { component: NotificationSettings, title: "Notifications" },
  settings: { component: SettingsManagement, title: "Settings", fullAdminOnly: true },
  permissions: { component: PermissionsManagement, title: "Permissions", fullAdminOnly: true },
};
```

### Tab Access by Role

| Tab | Admin | Recruiter | Account Mgr | Marketing | CV Uploader | Viewer |
|-----|:-----:|:---------:|:-----------:|:---------:|:-----------:|:------:|
| overview | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| submissions | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| jobs | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| pipeline | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| cvmatching | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| cvbulkimport | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| talent | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| blog | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| analytics | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| admins | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Sidebar Navigation Groups

```
Dashboard
├── Overview

Talent Pool
├── CV Database
├── Candidate Pipeline
├── AI CV Matching
├── Bulk Import

Jobs & Recruitment
├── Job Postings
├── Job Status Tracker

Marketing
├── Featured Talent
├── Blog Management

Analytics
├── Statistics

Settings
├── Manage Admins
├── Notifications
├── Permissions
├── App Settings
```

---

## 11. CV Management System

### Submission Sources

| Source | Entry Point | Processing | Notifications |
|--------|-------------|------------|---------------|
| `website` | Public `/submit-cv` | Auto-parse → Score → Profile | Admin push + email |
| `bulk_import` | Admin bulk upload | Background queue processing | Session completion |
| `manual` | Admin manual entry | Optional AI parse | None |
| `email` | Postmark webhook | Future implementation | TBD |

### CV Submission Flow

```
┌──────────────────┐
│  User Submits CV │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Upload to Storage│ (cv-uploads bucket)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Create DB Record │ (cv_submissions)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Trigger parse-cv│ (Edge Function)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Download & Parse │ (PDF/DOCX → Text)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Send to Gemini  │ (AI Extraction)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Extract & Score  │ (0-100 scoring)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Generate Profile │ (ai_profile JSON)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Update Database  │ (all fields)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Notify Admins    │ (Push + Email)
└──────────────────┘
```

### Bulk Import System

**Features**:
- Upload up to 50 files per session
- Background processing with real-time progress
- Automatic retry on transient failures
- Detailed error reporting per file
- Activity logging for audit compliance

**Database Tables**:
- `bulk_import_sessions` - Session tracking
- `bulk_import_files` - Individual file status
- `cv_upload_activity_log` - Audit trail

**Processing Flow**:
1. Admin uploads multiple files
2. Files stored in `cv-uploads` bucket
3. Session record created (status: `pending`)
4. File records created (status: `pending`)
5. `process-bulk-import` Edge Function triggered
6. Files processed sequentially (rate limiting)
7. Real-time status updates via Supabase Realtime
8. Session marked complete on finish
9. Admin notified of results

**File Statuses**:
- `pending` - Awaiting processing
- `processing` - Currently being parsed
- `completed` - Successfully parsed and imported
- `failed` - Error during processing (with error message)

### CV Database Features

**Search & Filter**:
- Full-text search (name, email, skills)
- Sector filter dropdown
- Location filter
- Seniority level filter
- Score range filter
- Date range filter

**Bulk Operations**:
- Multi-select with checkboxes
- Bulk delete
- Bulk add to pipeline
- Bulk export

**Individual Actions**:
- View full CV details
- Open original CV file
- Edit candidate info
- Add to pipeline (specific job)
- Re-score with AI
- Delete candidate

---

## 12. Candidate Pipeline

### Pipeline Stages

| Stage | Key | Color | Icon | Description |
|-------|-----|-------|------|-------------|
| Sourced | `sourced` | Gray | Search | Initial candidate identification |
| Screening | `screening` | Blue | FileSearch | CV/profile review in progress |
| Shortlisted | `shortlisted` | Purple | UserCheck | Passed initial screening |
| Interviewing | `interviewing` | Yellow | MessageSquare | Active interview process |
| Offered | `offered` | Orange | Send | Offer extended to candidate |
| Placed | `placed` | Green | CheckCircle | Successfully placed |
| Rejected | `rejected` | Red | XCircle | Not proceeding |
| Withdrawn | `withdrawn` | Gray | UserMinus | Candidate withdrew |

### Pipeline Data Model

```typescript
// Database Table: candidate_pipeline
interface CandidatePipeline {
  id: string;
  cv_submission_id: string;     // FK to cv_submissions
  job_id: string;               // FK to jobs
  stage: PipelineStage;         // Current stage
  priority: number | null;      // 0-5 priority rating
  assigned_to: string | null;   // FK to admin user_id
  notes: string | null;         // Recruiter notes
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

// Database Table: pipeline_activity
interface PipelineActivity {
  id: string;
  pipeline_id: string;          // FK to candidate_pipeline
  action: string;               // 'stage_change', 'note_added', etc.
  from_stage: string | null;
  to_stage: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

// Frontend Type with Joined Data
interface PipelineEntry extends CandidatePipeline {
  cv_submission: {
    name: string;
    email: string;
    phone: string;
    job_title: string;
    location: string;
    cv_score: number;
    cv_file_url: string;
  };
  job: {
    title: string;
    reference_id: string;
  };
}
```

### Pipeline Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `CandidatePipeline.tsx` | `src/components/admin/` | Main Kanban board view |
| `PipelineColumn.tsx` | `src/components/admin/pipeline/` | Stage column with drag-drop zone |
| `PipelineCard.tsx` | `src/components/admin/pipeline/` | Candidate card with actions |
| `AddToPipelineDialog.tsx` | `src/components/admin/pipeline/` | Add candidate dialog |
| `PipelineDetailSheet.tsx` | `src/components/admin/pipeline/` | Candidate detail slide-out |

### Pipeline Permissions

| Permission | Capability |
|------------|------------|
| `pipeline.view` | View pipeline board, see all candidates |
| `pipeline.create` | Add candidates to pipeline |
| `pipeline.update` | Move stages, update notes, assign priority |
| `pipeline.delete` | Remove candidates from pipeline |

### Activity Tracking

All pipeline actions are automatically logged:
- Stage changes with from/to stages
- Notes added
- Priority changes
- Assignment changes
- Rejection with reason
- Removal from pipeline

---

## 13. Job Management System

### Job Data Model

```typescript
interface Job {
  id: string;
  reference_id: string;      // Auto: MR-2025-001
  title: string;
  location: string;
  sector: string;            // Finance, IT, Legal, HR, Executive
  description: string;       // Full job description (rich text)
  requirements: string;      // Requirements list
  benefits: string | null;   // Benefits and perks
  salary: string | null;     // Salary range text
  status: JobStatus;
  created_at: string;
  updated_at: string;
}

type JobStatus = "active" | "paused" | "filled" | "expired";
```

### Job Reference Generation

```sql
-- Automatic reference generation
-- Format: MR-2025-001, MR-2025-002, etc.

CREATE FUNCTION generate_job_reference()
RETURNS text AS $$
  SELECT 'MR-' || 
         to_char(now(), 'YYYY') || '-' ||
         lpad(
           (COALESCE(MAX(CAST(SUBSTRING(reference_id FROM 'MR-2025-(\d+)') AS INTEGER)), 0) + 1)::text,
           3, '0'
         )
  FROM jobs WHERE reference_id ~ '^MR-2025-\d+$';
$$ LANGUAGE sql;
```

### Job Status Tracker (Email Ingestion)

**Flow**:
1. Client email arrives at designated address
2. Postmark webhook triggers `receive-email-webhook`
3. Email logged to `email_ingestion_log`
4. Spam/irrelevant emails filtered
5. `process-job-email` analyzes with AI
6. Status suggestion created in `job_status_updates`
7. Admin reviews in Job Status Tracker tab
8. Approve/reject status change

**Review Queue Display**:
- Suggested status change
- Confidence score (visual indicator)
- AI reasoning explanation
- Original email subject/body
- Matched job (if found)
- Approve/Reject buttons

---

## 14. Blog & Content Management

### Blog Data Model

```typescript
interface BlogPost {
  id: string;
  title: string;
  slug: string;              // URL-friendly slug
  content: string;           // Rich text content
  excerpt: string | null;    // Short summary
  featured_image_url: string | null;
  author_name: string;
  category_id: string | null;
  is_published: boolean;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}
```

### Blog Features

**Post Management**:
- Create/edit posts with rich text editor
- Draft and publish workflow
- Category assignment
- Tag management
- Featured image upload
- SEO meta fields

**Content Organization**:
- Categories (hierarchical)
- Tags (flat taxonomy)
- Archive by date
- Search functionality

---

## 15. Notification System

### Notification Channels

| Channel | Provider | Use Case |
|---------|----------|----------|
| **Push** | Progressier | Real-time alerts for critical events |
| **Email** | Resend | Detailed notifications, summaries |
| **In-App** | Supabase Realtime | Live updates within dashboard |

### Notification Events

| Event | Description | Default Recipients |
|-------|-------------|-------------------|
| `cv_submission` | New CV submitted | Recruiters, Admins |
| `job_application` | Application received | Recruiters, Admins |
| `contact_submission` | Contact form entry | Account Managers, Admins |
| `career_partner_request` | Career services inquiry | Account Managers, Admins |
| `employer_job_submission` | Employer job request | Recruiters, Admins |
| `talent_request` | Talent profile inquiry | Account Managers, Admins |
| `staff_added` | New team member | Admins |
| `permission_changed` | Permission update | Affected user |
| `blog_published` | Blog post live | Marketing |
| `system_updates` | System announcements | All |
| `weekly_digest` | Weekly summary | Enabled users |
| `daily_summary` | Daily activity recap | Enabled users |

### Notification Preferences

```typescript
interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;      // Master email toggle
  push_enabled: boolean;       // Master push toggle
  in_app_enabled: boolean;     // Master in-app toggle
  event_preferences: {
    cv_submission: boolean;
    job_application: boolean;
    contact_submission: boolean;
    // ... all event types
  };
}
```

---

## 16. PWA & Progressive Features

### Progressier Integration

**Features**:
- Installable app (Add to Home Screen)
- Push notification subscriptions
- Offline page caching
- App update prompts

**Configuration**: `public/progressier.js`

### Push Notification Flow

```
User Enables → Progressier Registers → Store Subscription
         ↓
Event Occurs → Edge Function → Progressier API → Device
```

### Offline Support

**Components**:
- `OfflineIndicator.tsx` - Shows offline status banner
- Service worker caches critical assets
- Graceful degradation for API failures

### App Updates

**Hook**: `useProgressierUpdates.ts`

- Detects new version available
- Prompts user to refresh
- Handles cache invalidation

---

## 17. SEO & Structured Data

### SEO Components

| Component | Purpose |
|-----------|---------|
| `useSEO` hook | Set page title, description, meta tags |
| `StructuredData` | Inject JSON-LD schema |
| `Breadcrumb` | Breadcrumb navigation + schema |
| `FAQ` | FAQ schema markup |
| `InternalLinking` | Related content links |

### Structured Data Types

**Organization Schema**:
```json
{
  "@type": "Organization",
  "name": "MyRecruita",
  "url": "https://myrecruita.com",
  "sameAs": ["linkedin", "twitter"]
}
```

**JobPosting Schema**:
```json
{
  "@type": "JobPosting",
  "title": "Financial Controller",
  "employmentType": "FULL_TIME",
  "hiringOrganization": { "@type": "Organization" }
}
```

### Meta Tag Management

```typescript
useSEO({
  title: "Financial Controller Jobs | MyRecruita",
  description: "Find Financial Controller positions...",
  keywords: ["finance jobs", "controller", "CFO"],
  ogImage: "/images/og-finance-jobs.jpg",
  canonical: "/jobs/finance"
});
```

---

## 18. Public-Facing Features

### Home Page Sections

1. **Hero** - Main headline, CTA buttons
2. **Stats** - Key metrics display
3. **Services** - Sector specializations
4. **Featured Jobs** - Latest active positions
5. **Featured Talent** - Anonymous talent showcase
6. **Testimonials** - Client feedback
7. **APSCo Accreditation** - Trust badge

### CV Submission Form

**Fields**: Full name, Email, Phone, Job title preference, CV file upload (PDF/DOC/DOCX), Cover message, Privacy consent

### Featured Talent

**Display**: Anonymous profiles (TAL-MR-001), Role, Sector, Years of experience, Location preference, Key skills

---

## 19. Authentication & Security

### Authentication Flow

**Candidate/User Auth**: Email + password → OTP verification → Session stored

**Admin Auth**: Admin login → Check `admin_profiles` → Load permissions → Redirect to dashboard

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies for each operation.

### Security Best Practices

- ✅ RLS on all tables
- ✅ Server-side permission validation
- ✅ API keys in Supabase secrets
- ✅ CORS configured on Edge Functions
- ✅ Input validation with Zod

---

## 20. Key Hooks & Utilities

### Custom Hooks

| Hook | Location | Purpose |
|------|----------|---------|
| `useAuth` | `src/hooks/useAuth.tsx` | Authentication context, session management |
| `usePermissions` | `src/hooks/usePermissions.ts` | Permission checking, role access |
| `usePipeline` | `src/hooks/usePipeline.ts` | Pipeline data management |
| `useNotifications` | `src/hooks/useNotifications.ts` | Notification handling |
| `usePushNotifications` | `src/hooks/usePushNotifications.ts` | Push subscription management |
| `useRealtimeSubscription` | `src/hooks/useRealtimeSubscription.ts` | Supabase realtime |
| `useAutoSave` | `src/hooks/useAutoSave.ts` | Form auto-save |
| `useSEO` | `src/hooks/useSEO.tsx` | Page meta management |
| `useMobile` | `src/hooks/use-mobile.tsx` | Responsive breakpoint |
| `useToast` | `src/hooks/use-toast.ts` | Toast notifications |

### Utility Libraries

| File | Purpose |
|------|---------|
| `src/lib/utils.ts` | Common utilities (cn, formatters) |
| `src/lib/permissions.ts` | Permission type definitions |
| `src/lib/queryKeys.ts` | React Query key factory |
| `src/lib/version.ts` | App version management |
| `src/lib/progressier.ts` | Progressier helpers |

---

## 21. Component Patterns & Best Practices

### File Organization

```
src/
├── components/
│   ├── admin/              # Admin dashboard components
│   │   ├── pipeline/       # Pipeline sub-components
│   ├── layout/             # Navigation, Footer
│   ├── SEO/                # SEO components
│   └── ui/                 # shadcn/ui components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and configs
├── pages/                  # Route page components
├── services/               # API service functions
├── types/                  # TypeScript type definitions
└── integrations/           # Supabase client and types

supabase/
├── functions/              # Edge Functions
│   ├── _shared/           # Shared utilities
│   └── [function-name]/   # Individual functions
└── migrations/             # Database migrations
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CVMatchingTool.tsx` |
| Hooks | camelCase with use prefix | `usePipeline.ts` |
| Types | PascalCase | `PipelineEntry` |
| Database Tables | snake_case | `cv_submissions` |
| Edge Functions | kebab-case | `parse-cv` |

### Styling Guidelines

**Do**:
```tsx
// ✅ Use semantic tokens
<div className="bg-background text-foreground border-border">
<Button variant="destructive">Delete</Button>
```

**Don't**:
```tsx
// ❌ Avoid hardcoded colors
<div className="bg-white text-black border-gray-200">
```

---

## 22. Development Guidelines

### Core Philosophy

> **"Preserve meaning first, reveal structure second."**

### Adding New Features Checklist

- [ ] Review existing patterns
- [ ] Create database tables via migration
- [ ] Add permissions to enum
- [ ] Update `src/lib/permissions.ts`
- [ ] Create types in `src/types/`
- [ ] Create hook in `src/hooks/`
- [ ] Create components
- [ ] Add route in `src/App.tsx`
- [ ] Add to AdminDashboard tabs
- [ ] Add notification events
- [ ] Update query keys
- [ ] **UPDATE THIS DOCUMENTATION**

### Database Changes

1. Always use Supabase migration tool
2. Enable RLS on ALL new tables
3. Create appropriate RLS policies
4. Add indexes for frequently queried columns
5. Never modify reserved schemas (auth, storage, realtime)

### Security Checklist

- [ ] RLS enabled on table
- [ ] RLS policies cover all operations
- [ ] Permission checks in UI components
- [ ] Server-side validation in Edge Functions
- [ ] No sensitive data in client-side storage
- [ ] API keys in Supabase secrets

---

## 23. Feature Implementation Checklist

### ✅ Implemented Features

| Category | Feature | Status |
|----------|---------|:------:|
| **CV Management** | Single CV Upload | ✅ |
| | Bulk CV Import | ✅ |
| | AI CV Parsing | ✅ |
| | AI CV Scoring | ✅ |
| | AI Profile Generation | ✅ |
| **Job Management** | Job CRUD | ✅ |
| | Job Status Tracking | ✅ |
| | AI Email Classification | ✅ |
| **Matching** | CV-to-Job Matching | ✅ |
| **Pipeline** | Kanban Board | ✅ |
| | Drag-Drop | ✅ |
| | Activity Logging | ✅ |
| **Admin** | Role-Based Access | ✅ |
| | 28 Permission Types | ✅ |
| **Blog** | Full CMS | ✅ |
| **Notifications** | Push/Email/In-App | ✅ |
| **PWA** | Installable App | ✅ |
| **SEO** | Structured Data | ✅ |

---

## 24. Future Roadmap

### Phase 2: Client/Company CRM
- [ ] `companies` table
- [ ] Contact management
- [ ] Activity timeline
- [ ] Client portal

### Phase 3: AI Job Description Generator
- [ ] Template library
- [ ] AI-powered generation
- [ ] SEO optimization

### Phase 4: Interview Scheduling
- [ ] Calendar integration
- [ ] Automated scheduling
- [ ] Interview reminders

### Phase 5: Revenue Dashboard
- [ ] Placement fee tracking
- [ ] Commission calculation
- [ ] Forecasting

### Phase 6: Candidate Portal
- [ ] Self-service profiles
- [ ] Application tracking
- [ ] Job alerts

---

## 25. Changelog

### Version 2.0 (January 2025)

**Major Features**:
- ✅ Candidate Pipeline (Kanban board)
- ✅ AI CV Matching Tool
- ✅ Email Ingestion for Job Status
- ✅ Granular Permission System (28 types)
- ✅ Bulk CV Import with background processing

### Version 1.0 (Initial Release)

**Core Features**:
- ✅ CV submission and management
- ✅ Job posting and management
- ✅ Blog CMS
- ✅ Admin dashboard
- ✅ User authentication

---

## 26. Knowledge Base Instructions

### For AI Assistants & Developers

> **READ THIS SECTION BEFORE MAKING ANY CHANGES**

#### Core Operating Principles

1. **CONSULT THIS DOCUMENT** before any significant modifications
2. **UPDATE THIS DOCUMENT** after implementing new features
3. **PRESERVE EXISTING BEHAVIOR** - refactoring changes organization, not function
4. **FOLLOW ESTABLISHED PATTERNS** for permissions, components, database
5. **MAINTAIN TYPE SAFETY** - types in `src/integrations/supabase/types.ts`
6. **USE REACT QUERY** with keys from `src/lib/queryKeys.ts`
7. **CHECK PERMISSIONS** before rendering admin UI elements

#### Quick Reference

**Adding a New Admin Tab**:
1. Create component in `src/components/admin/`
2. Add to `TAB_CONFIG` in `src/pages/AdminDashboard.tsx`
3. Add navigation in `src/components/admin/AdminSidebar.tsx`

**Adding a New Permission**:
1. Add to `permission_type` enum via migration
2. Add to `PERMISSION_CONFIG` in `src/lib/permissions.ts`
3. Update `assign_role_permissions()` function

**Creating an Edge Function**:
1. Create folder `supabase/functions/[name]/`
2. Add `index.ts` with Deno server
3. Use `_shared/` utilities
4. Auto-deploys on save

#### Troubleshooting

**"Permission denied"**: Check RLS policies, verify user permissions
**"Types out of sync"**: Run migration, types auto-regenerate
**"Edge function fails"**: Check logs in Supabase dashboard

---

## Document Maintenance

Update this document:
- After any new feature implementation
- After database schema changes
- After permission system updates
- After adding new Edge Functions

**Last reviewed**: January 2025

---

*This documentation is the single source of truth for MyRecruita. Consult before changes, update after completion.*
