# MyRecruita - Project Documentation

> **Knowledge Base Reference Document**  
> Last Updated: January 2026  
> Version: 2.0.0

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Database Schema](#3-database-schema)
4. [Permission System](#4-permission-system)
5. [Edge Functions](#5-edge-functions)
6. [Application Routes](#6-application-routes)
7. [Admin Dashboard](#7-admin-dashboard)
8. [CV Submission System](#8-cv-submission-system)
9. [Candidate Pipeline](#9-candidate-pipeline)
10. [AI Features](#10-ai-features)
11. [Notification System](#11-notification-system)
12. [Key Hooks & Utilities](#12-key-hooks--utilities)
13. [Component Patterns](#13-component-patterns)
14. [Development Guidelines](#14-development-guidelines)
15. [Future Roadmap](#15-future-roadmap)
16. [Changelog](#16-changelog)

---

## 1. Project Overview

### Application Identity
- **Name**: MyRecruita
- **Domain**: APSCo-accredited specialist recruitment platform
- **Sectors**: Finance, IT, Legal, HR, Executive
- **Published URL**: https://myrecruita-career-hub.lovable.app

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| State Management | TanStack React Query v5 |
| Routing | React Router v6 |
| Backend | Supabase Edge Functions (Deno) |
| Database | PostgreSQL (Supabase) |
| Authentication | Supabase Auth |
| PWA | Progressier |
| AI | Google Gemini (via Supabase AI) |

### Key Features
- ✅ CV submission with AI parsing and scoring
- ✅ Bulk CV import with background processing
- ✅ Job posting and management
- ✅ Candidate pipeline (Kanban board)
- ✅ AI-powered CV-to-job matching
- ✅ Role-based access control (RBAC)
- ✅ Push notifications (Progressier)
- ✅ Email ingestion and AI classification
- ✅ Blog management with SEO
- ✅ Featured talent profiles

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React SPA)                      │
├─────────────────────────────────────────────────────────────────┤
│  Pages          │  Components       │  Hooks                    │
│  ────────────   │  ───────────────  │  ─────────────────────    │
│  Home           │  Navigation       │  useAuth                  │
│  Jobs           │  Footer           │  usePermissions           │
│  AdminDashboard │  Admin/*          │  usePipeline              │
│  SubmitCV       │  UI (shadcn)      │  useNotifications         │
│  Blog           │  SEO/*            │  useRealtimeSubscription  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                              │
├─────────────────────────────────────────────────────────────────┤
│  Auth           │  Database         │  Edge Functions           │
│  ────────────   │  ───────────────  │  ─────────────────────    │
│  Email/Password │  26 Tables        │  parse-cv                 │
│  Session Mgmt   │  RLS Policies     │  match-cv-to-job          │
│  Admin Profiles │  Functions        │  process-bulk-import      │
│                 │  Triggers         │  send-admin-notification  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│  Progressier (PWA)  │  Postmark (Email)  │  Gemini AI           │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Patterns

```
User Action → React Component → React Query Hook → Supabase Client → Database
                                      ↓
                              Edge Function (if AI/complex logic)
                                      ↓
                              External API (Gemini, Postmark)
```

---

## 3. Database Schema

### 3.1 Core Tables (26 Total)

#### Recruitment Core
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `cv_submissions` | Candidate CVs and profiles | name, email, phone, cv_file_url, ai_profile, cv_score |
| `jobs` | Job postings | title, description, location, sector, status, reference_id |
| `job_applications` | Applications to jobs | job_id, user_id, cv_file_url |
| `talent_profiles` | Featured talent | role, sector, years_experience, is_visible |
| `talent_requests` | Employer talent inquiries | company_name, talent_id |

#### Candidate Pipeline
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `candidate_pipeline` | Pipeline entries | cv_submission_id, job_id, stage, priority, assigned_to |
| `pipeline_activity` | Activity log | pipeline_id, action, from_stage, to_stage, note |

#### Admin & Staff
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `admin_profiles` | Admin user data | user_id, email, role, display_name |
| `staff_permissions` | Granular permissions | user_id, permission |
| `notification_preferences` | Notification settings | user_id, push_enabled, email_enabled |
| `notifications` | In-app notifications | user_id, title, message, read, category |

#### Bulk Import
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `bulk_import_sessions` | Import job tracking | user_id, status, total_files, imported_count |
| `bulk_import_files` | Individual files | session_id, file_name, status, parsed_data |
| `cv_upload_activity_log` | Audit trail | user_id, action, details |

#### Email Processing
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `email_ingestion_log` | Incoming emails | message_id, from_email, subject, status |
| `job_status_updates` | AI-parsed job updates | job_id, suggested_status, confidence_score |

#### Blog & Content
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `blog_posts` | Blog articles | title, slug, content, is_published |
| `blog_categories` | Post categories | name, slug |
| `blog_tags` | Post tags | name, slug |
| `blog_post_tags` | Post-tag relations | post_id, tag_id |

#### Submissions & Contacts
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `contact_submissions` | Contact form entries | name, email, inquiry_type, message |
| `career_partner_requests` | Career partner inquiries | name, email, service_type |
| `employer_job_submissions` | Employer job requests | company_name, job_title, job_description |

#### User Data
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `user_profiles` | Public user profiles | user_id, full_name, cv_file_url |
| `app_settings` | Application config | key, value, description |

### 3.2 CV Submissions Schema (Detail)

```sql
cv_submissions {
  id: uuid (PK)
  name: text
  email: text
  phone: text
  cv_file_url: text
  
  -- AI-Generated Fields
  ai_profile: jsonb {
    summary: string
    skills: string[]
    industries: string[]
    certifications: string[]
    languages: string[]
    key_achievements: string[]
    career_highlights: string[]
  }
  cv_score: integer (0-100)
  cv_score_breakdown: jsonb {
    completeness: number
    skills: number
    experience: number
    achievements: number
    education: number
    presentation: number
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

### 3.3 Database Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `has_permission(_permission, _user_id)` | Check if user has permission | boolean |
| `get_user_permissions(_user_id)` | Get all user permissions | permission_type[] |
| `is_admin(user_id)` | Check if user is any admin | boolean |
| `is_full_admin(user_id)` | Check if user is full admin | boolean |
| `get_admin_role(user_id)` | Get admin role | string |
| `assign_role_permissions(_role, _user_id)` | Assign role's default permissions | void |
| `generate_job_reference()` | Generate job reference ID | string |
| `generate_talent_reference()` | Generate talent reference ID | string |

---

## 4. Permission System

### 4.1 Permission Types (28 Permissions)

```typescript
type PermissionType =
  // CV Management
  | 'cv.view' | 'cv.create' | 'cv.update' | 'cv.delete' | 'cv.export'
  
  // Jobs Management
  | 'jobs.view' | 'jobs.create' | 'jobs.update' | 'jobs.delete'
  
  // Applications
  | 'applications.view' | 'applications.manage'
  
  // Talent Profiles
  | 'talent.view' | 'talent.create' | 'talent.update' | 'talent.delete'
  
  // Pipeline
  | 'pipeline.view' | 'pipeline.create' | 'pipeline.update' | 'pipeline.delete'
  
  // Submissions
  | 'submissions.view' | 'submissions.delete'
  
  // Blog
  | 'blog.view' | 'blog.create' | 'blog.update' | 'blog.delete'
  
  // System
  | 'analytics.view'
  | 'staff.view' | 'staff.create' | 'staff.update' | 'staff.delete'
  | 'settings.view' | 'settings.update'
  | 'notifications.manage';
```

### 4.2 Staff Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| `admin` | Full system access | All permissions |
| `recruiter` | Recruitment operations | CV, Jobs, Applications, Pipeline, Talent |
| `account_manager` | Client relationship management | Jobs, Applications, Pipeline, Submissions |
| `marketing` | Content and blog management | Blog, Talent (view), Analytics |
| `cv_uploader` | CV data entry only | CV (create, view) |
| `viewer` | Read-only access | View permissions only |

### 4.3 Permission Checking Pattern

```typescript
// In components
const { hasPermission } = usePermissions();

{hasPermission('cv.create') && (
  <Button onClick={handleCreate}>Add CV</Button>
)}

// In hooks/services
const canEdit = await hasPermission('cv.update');
```

---

## 5. Edge Functions

### 5.1 Function Inventory

| Function | Trigger | Purpose |
|----------|---------|---------|
| `parse-cv` | HTTP POST | Parse CV file → extract data + AI profile + score |
| `match-cv-to-job` | HTTP POST | Match CV to job → relevance score |
| `process-bulk-import` | HTTP POST | Process bulk import session files |
| `rescore-cvs` | HTTP POST | Re-score CVs against specific job |
| `create-admin-user` | HTTP POST | Create new admin user with role |
| `bypass-otp-login` | HTTP POST | Development OTP bypass |
| `send-admin-notification` | HTTP POST | Send push/email notifications |
| `send-daily-summary` | Scheduled | Daily activity digest email |
| `send-push-notification` | HTTP POST | Send push notification via Progressier |
| `receive-email-webhook` | HTTP POST | Postmark inbound email webhook |
| `process-job-email` | HTTP POST | AI classify email for job status |

### 5.2 Shared Modules

```
supabase/functions/_shared/
├── ai-client.ts      # Gemini AI client wrapper
├── cors.ts           # CORS headers
├── cv-parser.ts      # CV parsing logic
├── file-handler.ts   # File processing utilities
├── prompts.ts        # AI prompt templates
└── types.ts          # Shared TypeScript types
```

### 5.3 CV Parsing Flow

```
1. File Upload → Supabase Storage
2. parse-cv Edge Function called
3. File downloaded and converted to text
4. AI extracts structured data:
   - Personal info (name, email, phone)
   - Professional info (title, location, sector)
   - Skills and experience
5. AI generates profile summary
6. AI scores CV (0-100) with breakdown
7. Data saved to cv_submissions table
8. Notification sent to admins
```

---

## 6. Application Routes

### 6.1 Public Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with hero, services, stats |
| `/jobs` | Jobs | Job listings with filters |
| `/jobs/:id` | JobDetail | Individual job with apply form |
| `/submit-cv` | SubmitCV | CV submission form |
| `/career-partner` | CareerPartner | Career services page |
| `/featured-talent` | FeaturedTalent | Talent showcase |
| `/blog` | Blog | Blog listing |
| `/blog/:slug` | BlogPost | Individual blog post |
| `/about` | About | Company information |
| `/contact` | Contact | Contact form |
| `/employers` | Employers | Employer services |
| `/post-job` | PostJob | Employer job submission |
| `/thank-you` | ThankYou | Form submission confirmation |

### 6.2 Auth Routes

| Route | Page | Description |
|-------|------|-------------|
| `/auth` | Auth | Login/Register |
| `/complete-profile` | CompleteProfile | Profile completion after signup |

### 6.3 User Dashboard Routes

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard | User dashboard home |
| `/my-applications` | MyApplications | User's job applications |
| `/my-profile` | MyProfile | User profile management |

### 6.4 Admin Routes

| Route | Page | Description |
|-------|------|-------------|
| `/admin/login` | AdminLogin | Admin authentication |
| `/admin` | AdminDashboard | Admin panel with tabs |

---

## 7. Admin Dashboard

### 7.1 Tab Configuration

| Tab Key | Component | Permission | Description |
|---------|-----------|------------|-------------|
| `overview` | DashboardOverview | - | Stats and metrics |
| `submissions` | SubmissionsManagement | cv.view | CV Database |
| `jobs` | JobsManagement | jobs.view | Job postings |
| `pipeline` | CandidatePipeline | pipeline.view | Kanban board |
| `cvmatching` | CVMatchingTool | cv.view | AI matching |
| `cvbulkimport` | CVBulkImport | cv.create | Bulk import |
| `talent` | TalentManagement | talent.view | Featured talent |
| `blog` | BlogManagement | blog.view | Blog posts |
| `analytics` | StatsDashboard | analytics.view | Analytics |
| `jobstatus` | JobStatusTracker | jobs.view | Email-based status |
| `admins` | AdminManagement | staff.view | Staff management |
| `notifications` | NotificationSettings | notifications.manage | Notification config |
| `settings` | SettingsManagement | settings.view | App settings |
| `permissions` | PermissionsManagement | staff.view | Permission matrix |

### 7.2 Sidebar Navigation Groups

```
Dashboard
├── Overview

Talent Pool
├── CV Database
├── Candidate Pipeline ← NEW
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

## 8. CV Submission System

### 8.1 Submission Sources

| Source | Description | Entry Point |
|--------|-------------|-------------|
| `website` | Public form submission | `/submit-cv` page |
| `bulk_import` | Bulk file upload | Admin bulk import tab |
| `manual` | Admin manual entry | Admin CV database |
| `email` | Email ingestion | Postmark webhook |

### 8.2 Public Submission Flow

```
1. User fills form on /submit-cv
2. CV file uploaded to Supabase Storage
3. Record created in cv_submissions (source: 'website')
4. parse-cv Edge Function triggered
5. AI extracts data and scores CV
6. cv_submissions record updated with AI data
7. Admin notification sent
```

### 8.3 Bulk Import Flow

```
1. Admin uploads multiple CV files
2. bulk_import_sessions record created
3. Files uploaded to Storage
4. bulk_import_files records created (status: 'pending')
5. process-bulk-import Edge Function triggered
6. For each file:
   a. Parse CV with AI
   b. Create cv_submissions record
   c. Update bulk_import_files status
7. Session marked complete
8. Admin notified
```

### 8.4 Manual Entry Flow

```
1. Admin clicks "Add CV" in CV Database
2. Fills manual entry form
3. Optional CV file upload
4. Record created (source: 'manual', added_by: admin_id)
5. If file provided, parse-cv triggered
```

### 8.5 CV Scoring Breakdown

| Category | Weight | Description |
|----------|--------|-------------|
| Completeness | 20% | All required fields present |
| Skills | 25% | Relevant skills listed |
| Experience | 25% | Work history quality |
| Achievements | 15% | Quantified accomplishments |
| Education | 10% | Educational background |
| Presentation | 5% | CV formatting/structure |

---

## 9. Candidate Pipeline

### 9.1 Pipeline Stages

| Stage | Color | Description |
|-------|-------|-------------|
| `sourced` | Gray | Initial candidate identification |
| `screening` | Blue | CV/profile review |
| `shortlisted` | Purple | Passed initial screening |
| `interviewing` | Yellow | Interview process |
| `offered` | Orange | Offer extended |
| `placed` | Green | Successfully placed |
| `rejected` | Red | Not proceeding |
| `withdrawn` | Gray | Candidate withdrew |

### 9.2 Pipeline Components

```
src/components/admin/
├── CandidatePipeline.tsx      # Main Kanban view
└── pipeline/
    ├── AddToPipelineDialog.tsx  # Add candidate modal
    ├── PipelineCard.tsx         # Candidate card
    ├── PipelineColumn.tsx       # Stage column
    └── PipelineDetailSheet.tsx  # Candidate detail sheet
```

### 9.3 Pipeline Hook

```typescript
// src/hooks/usePipeline.ts
const {
  candidates,        // Pipeline entries with CV/job data
  isLoading,
  addToPipeline,     // Add candidate to pipeline
  updateStage,       // Move candidate between stages
  updateCandidate,   // Update notes, priority, assignment
  removeFromPipeline // Remove from pipeline
} = usePipeline(jobId);
```

### 9.4 Pipeline Data Model

```typescript
interface PipelineCandidate {
  id: string;
  cv_submission_id: string;
  job_id: string;
  stage: PipelineStage;
  priority: number | null;
  assigned_to: string | null;
  notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  cv_submission: {
    id: string;
    name: string;
    email: string;
    phone: string;
    job_title: string | null;
    cv_score: number | null;
    cv_file_url: string | null;
  };
  job: {
    id: string;
    title: string;
    reference_id: string;
  };
}
```

---

## 10. AI Features

### 10.1 CV Parsing

**Input**: PDF/DOC/DOCX file  
**Output**: Structured candidate data

```typescript
interface ParsedCV {
  name: string;
  email: string;
  phone: string;
  job_title: string;
  location: string;
  sector: string;
  seniority_level: string;
  education_level: string;
  years_experience: number;
  skills: string;
  experience_summary: string;
}
```

### 10.2 AI Profile Generation

**Input**: Parsed CV text  
**Output**: Rich candidate profile

```typescript
interface AIProfile {
  summary: string;           // 2-3 sentence overview
  skills: string[];          // Technical and soft skills
  industries: string[];      // Industry experience
  certifications: string[];  // Professional certifications
  languages: string[];       // Languages spoken
  key_achievements: string[];// Notable accomplishments
  career_highlights: string[];// Career progression highlights
}
```

### 10.3 CV Scoring

**Input**: Parsed CV data  
**Output**: Score with breakdown

```typescript
interface CVScore {
  overall: number;  // 0-100
  breakdown: {
    completeness: number;   // 0-20
    skills: number;         // 0-25
    experience: number;     // 0-25
    achievements: number;   // 0-15
    education: number;      // 0-10
    presentation: number;   // 0-5
  };
}
```

### 10.4 Job Matching

**Input**: CV data + Job description  
**Output**: Match score with reasoning

```typescript
interface MatchResult {
  score: number;           // 0-100
  reasoning: string;       // AI explanation
  matching_skills: string[];
  missing_skills: string[];
  recommendation: 'strong' | 'moderate' | 'weak';
}
```

### 10.5 Email Classification

**Input**: Email subject + body  
**Output**: Job status suggestion

```typescript
interface EmailClassification {
  is_relevant: boolean;
  email_type: 'job_update' | 'inquiry' | 'spam' | 'other';
  suggested_status: 'filled' | 'on_hold' | 'closed' | null;
  confidence_score: number;  // 0-1
  job_reference: string | null;
  reasoning: string;
}
```

---

## 11. Notification System

### 11.1 Channels

| Channel | Provider | Description |
|---------|----------|-------------|
| Push | Progressier | Browser push notifications |
| Email | Postmark | Transactional emails |
| In-App | Supabase | Database-stored notifications |

### 11.2 Event Types

| Event | Description | Default Roles |
|-------|-------------|---------------|
| `cv_submission` | New CV submitted | admin, recruiter, cv_uploader |
| `job_application` | Job application received | admin, recruiter |
| `contact_submission` | Contact form entry | admin, account_manager |
| `career_partner_request` | Career partner inquiry | admin, recruiter |
| `employer_job_submission` | Employer job request | admin, account_manager |
| `talent_request` | Talent profile inquiry | admin, recruiter |
| `staff_added` | New staff member | admin |
| `permission_changed` | Permission update | admin |
| `blog_published` | Blog post published | admin, marketing |
| `system_updates` | System notifications | All |
| `weekly_digest` | Weekly summary | admin, recruiter |
| `daily_summary` | Daily activity | admin |
| `job_status_update` | Job status change | admin, recruiter |

### 11.3 Notification Preferences

```typescript
interface NotificationPreferences {
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  in_app_enabled: boolean;
  event_preferences: Record<NotificationEventType, boolean>;
}
```

---

## 12. Key Hooks & Utilities

### 12.1 Authentication

```typescript
// src/hooks/useAuth.tsx
const {
  user,           // Current Supabase user
  session,        // Auth session
  isLoading,      // Auth loading state
  isAdmin,        // Is admin user
  adminProfile,   // Admin profile data
  signIn,         // Email/password sign in
  signUp,         // Create account
  signOut,        // Log out
} = useAuth();
```

### 12.2 Permissions

```typescript
// src/hooks/usePermissions.ts
const {
  permissions,        // User's permission array
  hasPermission,      // Check single permission
  hasAnyPermission,   // Check any of permissions
  hasAllPermissions,  // Check all permissions
  isLoading,
} = usePermissions();
```

### 12.3 Notifications

```typescript
// src/hooks/useNotifications.ts
const {
  notifications,      // User's notifications
  unreadCount,        // Unread notification count
  markAsRead,         // Mark notification read
  markAllAsRead,      // Mark all read
  deleteNotification, // Delete notification
} = useNotifications();
```

### 12.4 Realtime Subscriptions

```typescript
// src/hooks/useRealtimeSubscription.ts
useRealtimeSubscription({
  table: 'cv_submissions',
  event: 'INSERT',
  callback: (payload) => {
    // Handle new CV
  }
});
```

### 12.5 Query Keys

```typescript
// src/lib/queryKeys.ts
export const queryKeys = {
  cvSubmissions: ['cv-submissions'],
  jobs: ['jobs'],
  pipeline: (jobId?: string) => ['pipeline', jobId],
  notifications: ['notifications'],
  adminProfile: ['admin-profile'],
  // ... etc
};
```

---

## 13. Component Patterns

### 13.1 Permission-Based Rendering

```tsx
// Always check permissions before rendering actions
const { hasPermission } = usePermissions();

return (
  <Card>
    <CardContent>
      {/* View content - requires view permission */}
      {hasPermission('cv.view') && <CVDetails cv={cv} />}
      
      {/* Actions - require specific permissions */}
      <div className="flex gap-2">
        {hasPermission('cv.update') && (
          <Button onClick={handleEdit}>Edit</Button>
        )}
        {hasPermission('cv.delete') && (
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);
```

### 13.2 Data Fetching Pattern

```tsx
// Use React Query with queryKeys
const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.cvSubmissions,
  queryFn: async () => {
    const { data, error } = await supabase
      .from('cv_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
});
```

### 13.3 Mutation Pattern

```tsx
// Use mutation with cache invalidation
const mutation = useMutation({
  mutationFn: async (newCV) => {
    const { data, error } = await supabase
      .from('cv_submissions')
      .insert(newCV)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.cvSubmissions });
    toast.success('CV added successfully');
  },
});
```

### 13.4 Dialog/Sheet Pattern

```tsx
// State management for dialogs
const [dialogOpen, setDialogOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState<Item | null>(null);

const handleOpen = (item: Item) => {
  setSelectedItem(item);
  setDialogOpen(true);
};

return (
  <>
    <Button onClick={() => handleOpen(item)}>Open</Button>
    
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        {selectedItem && <ItemForm item={selectedItem} />}
      </DialogContent>
    </Dialog>
  </>
);
```

---

## 14. Development Guidelines

### 14.1 Core Philosophy

> **Preserve meaning first, reveal structure second.**

When modifying code:
1. Understand the existing behavior completely
2. Make changes that preserve functionality
3. Refactor for clarity only after behavior is correct
4. Test edge cases before committing

### 14.2 File Organization

```
src/
├── components/
│   ├── admin/           # Admin dashboard components
│   │   ├── pipeline/    # Pipeline sub-components
│   │   └── ...
│   ├── layout/          # Navigation, Footer
│   ├── SEO/             # SEO components
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and configs
├── pages/               # Route pages
├── services/            # API service functions
├── types/               # TypeScript types
└── integrations/        # Supabase client and types
```

### 14.3 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CandidatePipeline.tsx` |
| Hooks | camelCase with 'use' prefix | `usePipeline.ts` |
| Types | PascalCase | `PipelineCandidate` |
| Utils | camelCase | `formatDate.ts` |
| Constants | SCREAMING_SNAKE_CASE | `PIPELINE_STAGES` |

### 14.4 Styling Rules

1. **Use Tailwind semantic tokens** - Never hardcode colors
2. **Use shadcn/ui components** - Don't reinvent the wheel
3. **HSL color format** - All colors must be HSL
4. **Responsive design** - Mobile-first approach

```tsx
// ✅ Correct
<div className="bg-background text-foreground border-border">

// ❌ Wrong
<div className="bg-white text-gray-900 border-gray-200">
```

### 14.5 Database Changes

1. Always use migrations via Supabase migration tool
2. Enable RLS on all new tables
3. Create appropriate policies
4. Add indexes for frequently queried columns
5. Update TypeScript types after migration

### 14.6 Adding New Features

1. Create database tables/columns if needed
2. Add permissions to enum if new access control needed
3. Create types in `src/types/`
4. Create hooks in `src/hooks/`
5. Create components in appropriate directory
6. Add routes if needed
7. Update this documentation

---

## 15. Future Roadmap

### Phase 2: Client/Company CRM
- [ ] Companies table with contact history
- [ ] Client relationship management
- [ ] Activity timeline per company
- [ ] Contract and billing tracking

### Phase 3: AI Job Description Generator
- [ ] AI-powered job description creation
- [ ] Template library
- [ ] Industry-specific suggestions
- [ ] SEO optimization for job posts

### Phase 4: Advanced Analytics
- [ ] Conversion funnel analysis
- [ ] Time-to-hire metrics
- [ ] Source effectiveness tracking
- [ ] Recruiter performance dashboards

### Phase 5: Candidate Portal
- [ ] Self-service candidate profiles
- [ ] Application status tracking
- [ ] Interview scheduling
- [ ] Document management

---

## 16. Changelog

### Version 2.0.0 (January 2026)
- ✅ Added Candidate Pipeline (Kanban board)
- ✅ Pipeline stages and activity tracking
- ✅ "Add to Pipeline" from CV Database
- ✅ Pipeline permissions (view, create, update, delete)

### Version 1.x.x (Previous)
- Initial release with CV submissions
- Bulk CV import
- AI CV parsing and scoring
- Job management
- Blog system
- RBAC permission system
- Push notifications
- Email ingestion

---

## 📌 Knowledge Base Instructions

When making changes to this project:

1. **CONSULT THIS DOCUMENT** before any significant modifications
2. **UPDATE THIS DOCUMENT** after implementing new features or changes
3. **PRESERVE EXISTING BEHAVIOR** - refactoring changes organization, not function
4. **FOLLOW ESTABLISHED PATTERNS** for permissions, components, and database design
5. **MAINTAIN TYPE SAFETY** - all types are defined in `src/integrations/supabase/types.ts`
6. **USE REACT QUERY** for all data fetching with keys from `src/lib/queryKeys.ts`
7. **CHECK PERMISSIONS** before rendering admin UI elements

### When Adding New Features:
- Add new permissions to `permission_type` enum via migration
- Update `src/lib/permissions.ts` with new permission types
- Add database tables via migrations
- Create types in `src/types/` directory
- Add hooks in `src/hooks/` for data management
- Create focused components (avoid large monolithic files)
- **UPDATE THIS DOCUMENTATION**

### Security Checklist:
- [ ] RLS enabled on all tables
- [ ] Appropriate RLS policies created
- [ ] Permission checks in UI components
- [ ] Server-side validation in Edge Functions
- [ ] No sensitive data in client-side storage

---

*This document serves as the single source of truth for the MyRecruita project. Reference and update with every significant change.*
