# Database Schema Documentation

This document explains all the main tables in the Uniti database and what information each field holds.

## Table of Contents

1. [Users](#users)
2. [Freelancers](#freelancers)
3. [Clients](#clients)
4. [Projects](#projects)
5. [Categories](#categories)
6. [Services](#services)
7. [Skills](#skills)
8. [Briefs](#briefs)
9. [Proposals](#proposals)
10. [Contracts](#contracts)
11. [Milestones](#milestones)
12. [Deliverables](#deliverables)
13. [Invoices](#invoices)
14. [Payments](#payments)
15. [Conversations](#conversations)
16. [Conversation Participants](#conversation-participants)
17. [Messages](#messages)
18. [Portfolios](#portfolios)
19. [Testimonials](#testimonials)

---

## Users

**Purpose**: Core user authentication and profile information for all platform users (admins, freelancers, clients, team members).

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT UNSIGNED | Primary key, auto-incrementing unique identifier |
| `email` | VARCHAR(255) | User's email address (unique, used for login) |
| `password_hash` | VARCHAR(255) | Hashed password for authentication |
| `role` | ENUM | User role: `'admin'`, `'freelancer'`, `'client'`, `'team_member'` |
| `display_name` | VARCHAR(150) | User's display name shown throughout the platform |
| `avatar_url` | VARCHAR(512) | URL to user's profile picture/avatar |
| `timezone` | VARCHAR(50) | User's timezone (default: 'UTC') |
| `auth_user_id` | INT UNSIGNED | Reference to external authentication system user ID |
| `is_active` | ENUM('TRUE','FALSE') | Whether the user account is active (default: 'TRUE') |
| `email_verified` | ENUM('TRUE','FALSE') | Whether email has been verified (default: 'FALSE') |
| `last_login` | DATETIME | Timestamp of last successful login |
| `created_at` | DATETIME | Account creation timestamp |
| `updated_at` | DATETIME | Last update timestamp (auto-updated) |

---

## Freelancers

**Purpose**: Extended profile information for freelancers who offer services on the platform.

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT UNSIGNED | Primary key, auto-incrementing unique identifier |
| `user_id` | INT UNSIGNED | Foreign key to `users.id` (one-to-one relationship) |
| `display_name` | VARCHAR(100) | Freelancer's public display name |
| `headline` | VARCHAR(150) | Short professional headline/tagline |
| `title` | VARCHAR(200) | Professional title (e.g., "Senior Web Developer") |
| `bio` | TEXT | Brief biography about the freelancer |
| `description` | TEXT | Detailed description of services and expertise |
| `country` | VARCHAR(100) | Country where freelancer is located |
| `skills` | JSON | Array of skills in JSON format (e.g., ["JavaScript", "React", "Node.js"]) |
| `avatar_url` | VARCHAR(500) | URL to freelancer's profile picture |
| `hourly_rate_cents` | INT UNSIGNED | Hourly rate in cents (e.g., 5000 = $50.00) |
| `rating` | DECIMAL(3,2) | Average rating from reviews (0.00 to 5.00) |
| `total_reviews` | INT UNSIGNED | Total number of reviews received |
| `completed_projects` | INT UNSIGNED | Count of successfully completed projects |
| `response_time` | VARCHAR(50) | Average response time (e.g., "Within 2 hours") |
| `availability` | VARCHAR(50) | Current availability status (default: 'available') |
| `verification_state` | ENUM | Verification status: `'unverified'`, `'pending'`, `'verified'`, `'rejected'` |
| `status` | ENUM | Account status: `'pending'`, `'approved'`, `'suspended'`, `'rejected'` |
| `created_at` | DATETIME | Profile creation timestamp |
| `updated_at` | DATETIME | Last update timestamp (auto-updated) |

---

## Clients

**Purpose**: Organization and individual client information for businesses and individuals hiring freelancers.

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT UNSIGNED | Primary key, auto-incrementing unique identifier |
| `owner_id` | INT UNSIGNED | Foreign key to `users.id` - the account owner (required) |
| `user_id` | INT UNSIGNED | Foreign key to `users.id` - optional legacy primary contact |
| `client_type` | ENUM | Type: `'individual'` or `'organization'` (default: 'organization') |
| `company_name` | VARCHAR(200) | Legal or brand name of the company/organization |
| `display_name` | VARCHAR(200) | Optional shorter label for display |
| `contact_name` | VARCHAR(120) | Primary contact person's name |
| `contact_email` | VARCHAR(255) | Primary contact email address |
| `phone` | VARCHAR(32) | Contact phone number |
| `address_line1` | VARCHAR(200) | Primary street address |
| `address_line2` | VARCHAR(200) | Secondary address line (suite, unit, etc.) |
| `city` | VARCHAR(120) | City name |
| `region` | VARCHAR(120) | State/province/region |
| `postal_code` | VARCHAR(32) | Postal/ZIP code |
| `country_code` | CHAR(2) | ISO-3166-1 alpha-2 country code (e.g., 'AU', 'US') |
| `website` | VARCHAR(255) | Company website URL |
| `company_number` | VARCHAR(64) | Business registration number (ABN/ACN/EIN/etc.) |
| `tax_id` | VARCHAR(64) | Tax identification number |
| `status` | ENUM | Account status: `'active'` or `'inactive'` (default: 'active') |
| `created_at` | DATETIME | Account creation timestamp |
| `updated_at` | DATETIME | Last update timestamp (auto-updated) |

---

## Projects

**Purpose**: Work projects posted by clients and assigned to freelancers.

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT UNSIGNED | Primary key, auto-incrementing unique identifier |
| `client_id` | INT UNSIGNED | Foreign key to `clients.id` - who owns the project |
| `freelancer_id` | INT UNSIGNED | Foreign key to `freelancers.id` - assigned freelancer (nullable) |
| `created_by` | INT UNSIGNED | Foreign key to `users.id` - who created the project |
| `service_id` | INT | Foreign key to `services.id` - type of service (nullable) |
| `title` | VARCHAR(200) | Project title/name |
| `description` | TEXT | Detailed project description and requirements |
| `budget_cents` | INT UNSIGNED | Project budget in cents (e.g., 500000 = $5,000.00) |
| `budget` | INT UNSIGNED | Legacy budget field (use `budget_cents` instead) |
| `currency` | CHAR(3) | ISO 4217 currency code (default: 'AUD') |
| `status` | ENUM | Project status: `'draft'`, `'open'`, `'in_review'`, `'contracted'`, `'in_progress'`, `'delivered'`, `'completed'`, `'cancelled'`, `'disputed'` (default: 'open') |
| `deadline` | DATE | Project deadline/target completion date (nullable) |
| `started_at` | DATETIME | When project work actually started (nullable) |
| `completed_at` | DATETIME | When project was marked as completed (nullable) |
| `created_at` | DATETIME | Project creation timestamp |
| `updated_at` | DATETIME | Last update timestamp (auto-updated) |

---

## Categories

**Purpose**: Service categories for organizing and browsing services on the platform.

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT UNSIGNED | Primary key, auto-incrementing unique identifier |
| `name` | VARCHAR(100) | Category name (unique, e.g., "Web Development") |
| `slug` | VARCHAR(100) | URL-friendly identifier (unique, e.g., "web-development") |
| `description` | TEXT | Category description and explanation |
| `icon_url` | VARCHAR(512) | URL to category icon image |
| `image_url` | VARCHAR(512) | URL to category banner/image |
| `display_order` | INT UNSIGNED | Order for display/sorting (lower numbers appear first) |
| `is_active` | ENUM('TRUE','FALSE') | Whether category is active and visible (default: 'TRUE') |
| `created_at` | DATETIME | Category creation timestamp |
| `updated_at` | DATETIME | Last update timestamp (auto-updated) |

---

## Services

**Purpose**: Individual services offered within categories (e.g., "WordPress Development" under "Web Development").

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT UNSIGNED | Primary key, auto-incrementing unique identifier |
| `category_id` | INT UNSIGNED | Foreign key to `categories.id` - parent category |
| `name` | VARCHAR(200) | Service name (e.g., "WordPress Development") |
| `slug` | VARCHAR(200) | URL-friendly identifier (unique, e.g., "wordpress-development") |
| `description` | TEXT | Detailed service description |
| `short_description` | VARCHAR(500) | Brief summary for listings and previews |
| `icon_url` | VARCHAR(512) | URL to service icon image |
| `image_url` | VARCHAR(512) | URL to service banner/image |
| `base_price_cents` | INT UNSIGNED | Starting/base price in cents (e.g., 100000 = $1,000.00) |
| `currency` | CHAR(3) | ISO 4217 currency code (default: 'AUD') |
| `display_order` | INT UNSIGNED | Order for display/sorting within category |
| `is_active` | ENUM('TRUE','FALSE') | Whether service is active and available (default: 'TRUE') |
| `created_at` | DATETIME | Service creation timestamp |
| `updated_at` | DATETIME | Last update timestamp (auto-updated) |

---

## Skills

**Purpose**: Skills that freelancers can have and clients can search for.

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT UNSIGNED | Primary key, auto-incrementing unique identifier |
| `name` | VARCHAR(100) | Skill name (unique, e.g., "JavaScript", "React") |
| `slug` | VARCHAR(100) | URL-friendly identifier (unique, e.g., "javascript") |
| `category` | VARCHAR(100) | Skill category grouping (e.g., "Programming", "Design") |
| `description` | TEXT | Description of what the skill entails |
| `icon_url` | VARCHAR(512) | URL to skill icon image |
| `display_order` | INT UNSIGNED | Order for display/sorting |
| `is_active` | ENUM('TRUE','FALSE') | Whether skill is active and visible (default: 'TRUE') |
| `created_at` | DATETIME | Skill creation timestamp |
| `updated_at` | DATETIME | Last update timestamp (auto-updated) |

---

## Briefs

**Purpose**: Project briefs/requirements posted by clients before creating a project.

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT UNSIGNED | Primary key, auto-incrementing unique identifier |
| `client_id` | INT UNSIGNED | Foreign key to `clients.id` - who posted the brief |
| `title` | VARCHAR(200) | Brief title/name |
| `description` | TEXT | Detailed project requirements and specifications |
| `service_id` | INT UNSIGNED | Foreign key to `services.id` - type of service needed (nullable) |
| `budget_cents` | INT UNSIGNED | Budget in cents for the project (nullable) |
| `currency` | CHAR(3) | ISO 4217 currency code (default: 'AUD') |
| `deadline` | DATE | Project deadline/target completion date (nullable) |
| `status` | ENUM | Brief status: `'draft'`, `'open'`, `'closed'`, `'archived'` (default: 'open') |
| `created_by` | INT UNSIGNED | Foreign key to `users.id` - who created the brief |
| `created_at` | DATETIME | Brief creation timestamp |
| `updated_at` | DATETIME | Last update timestamp (auto-updated) |

---

## Proposals

**Purpose**: Proposals submitted by freelancers for projects or briefs.

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT UNSIGNED | Primary key, auto-incrementing unique identifier |
| `project_id` | INT UNSIGNED | Foreign key to `projects.id` - project being proposed for (nullable) |
| `brief_id` | INT UNSIGNED | Foreign key to `briefs.id` - brief being proposed for (nullable) |
| `freelancer_id` | INT UNSIGNED | Foreign key to `freelancers.id` - who submitted the proposal |
| `status` | ENUM | Proposal status: `'sent'`, `'shortlisted'`, `'accepted'`, `'declined'`, `'withdrawn'`, `'expired'` (default: 'sent') |
| `total_cents` | INT UNSIGNED | Total proposal amount in cents |
| `currency` | CHAR(3) | ISO 4217 currency code (default: 'AUD') |
| `message` | TEXT | Proposal message/cover letter from freelancer (nullable) |
| `valid_until` | DATE | Proposal expiration date (nullable) |
| `submitted_at` | DATETIME | When proposal was submitted (nullable) |
| `created_at` | DATETIME | Proposal creation timestamp |
| `updated_at` | DATETIME | Last update timestamp (auto-updated) |

---

## Contracts

**Purpose**: Contracts created when a proposal is accepted (snapshot of accepted proposal terms).

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT UNSIGNED | Primary key, auto-incrementing unique identifier |
| `project_id` | INT UNSIGNED | Foreign key to `projects.id` - associated project (unique, one contract per project) |
| `proposal_id` | INT UNSIGNED | Foreign key to `proposals.id` - the accepted proposal |
| `start_at` | DATETIME | Contract start date/time (default: current timestamp) |
| `terms` | TEXT | Contract terms and conditions (nullable) |
| `created_at` | DATETIME | Contract creation timestamp |
| `updated_at` | DATETIME | Last update timestamp (auto-updated) |

---

## Milestones

**Purpose**: Breakdown of project work into milestones for payment and tracking.

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT UNSIGNED | Primary key, auto-incrementing unique identifier |
| `contract_id` | INT UNSIGNED | Foreign key to `contracts.id` - parent contract |
| `title` | VARCHAR(200) | Milestone title/name |
| `description` | TEXT | Detailed milestone description and requirements (nullable) |
| `amount_cents` | INT UNSIGNED | Payment amount for this milestone in cents |
| `due_date` | DATE | Milestone deadline/target completion date (nullable) |
| `status` | ENUM | Status: `'pending'`, `'funded'`, `'in_progress'`, `'submitted'`, `'approved'`, `'released'`, `'rejected'` (default: 'pending') |
| `sort_order` | INT UNSIGNED | Order within contract (default: 1) |
| `created_at` | DATETIME | Milestone creation timestamp |
| `updated_at` | DATETIME | Last update timestamp (auto-updated) |

---

## Deliverables

**Purpose**: Files and deliverables submitted for milestones, with approval tracking.

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT UNSIGNED | Primary key, auto-incrementing unique identifier |
| `project_id` | INT UNSIGNED | Foreign key to `projects.id` - associated project (nullable) |
| `milestone_id` | INT UNSIGNED | Foreign key to `milestones.id` - associated milestone (nullable) |
| `title` | VARCHAR(200) | Deliverable title/name |
| `description` | TEXT | Deliverable description (nullable) |
| `file_path` | VARCHAR(512) | File storage path/URL (nullable) |
| `submitted_at` | DATETIME | When deliverable was submitted (nullable) |
| `approved_at` | DATETIME | When deliverable was approved by client (nullable) |
| `created_at` | DATETIME | Deliverable creation timestamp |
| `updated_at` | DATETIME | Last update timestamp (auto-updated) |

---

## Invoices

**Purpose**: Invoices issued to clients for milestone payments.

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT UNSIGNED | Primary key, auto-incrementing unique identifier |
| `milestone_id` | INT UNSIGNED | Foreign key to `milestones.id` - milestone being invoiced |
| `client_id` | INT UNSIGNED | Foreign key to `clients.id` - client being invoiced |
| `amount_cents` | INT UNSIGNED | Invoice amount in cents |
| `currency` | CHAR(3) | ISO 4217 currency code (default: 'AUD') |
| `status` | ENUM | Invoice status: `'issued'`, `'paid'`, `'overdue'`, `'cancelled'` (default: 'issued') |
| `invoice_number` | VARCHAR(50) | Human-readable invoice number (unique, nullable, e.g., "INV-2024-000001") |
| `issued_at` | DATETIME | When invoice was issued (default: current timestamp) |
| `paid_at` | DATETIME | When invoice was paid (nullable) |
| `due_date` | DATE | Invoice due date (nullable) |
| `created_at` | DATETIME | Invoice creation timestamp |
| `updated_at` | DATETIME | Last update timestamp (auto-updated) |

---

## Payments

**Purpose**: Payment transactions processed through payment providers (Stripe, PayPal, etc.).

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT UNSIGNED | Primary key, auto-incrementing unique identifier |
| `invoice_id` | INT UNSIGNED | Foreign key to `invoices.id` - invoice being paid (nullable) |
| `provider` | VARCHAR(50) | Payment provider (e.g., 'stripe', 'paypal', 'bank_transfer') |
| `provider_payment_id` | VARCHAR(255) | External payment ID from provider (e.g., Stripe payment intent ID) |
| `amount_cents` | INT UNSIGNED | Payment amount in cents |
| `currency` | CHAR(3) | ISO 4217 currency code (default: 'AUD') |
| `status` | ENUM | Payment status: `'pending'`, `'authorized'`, `'captured'`, `'failed'`, `'refunded'`, `'disputed'` (default: 'pending') |
| `payment_method` | VARCHAR(50) | Payment method (e.g., 'credit_card', 'bank_transfer') (nullable) |
| `metadata` | JSON | Additional payment details in JSON format (nullable) |
| `created_at` | DATETIME | Payment creation timestamp |
| `updated_at` | DATETIME | Last update timestamp (auto-updated) |

---

## Conversations

**Purpose**: Message conversations between users (typically linked to projects).

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT UNSIGNED | Primary key, auto-incrementing unique identifier |
| `project_id` | INT UNSIGNED | Foreign key to `projects.id` - associated project (nullable) |
| `title` | VARCHAR(200) | Conversation title/subject (nullable) |
| `created_at` | DATETIME | Conversation creation timestamp |
| `updated_at` | DATETIME | Last update timestamp (auto-updated when new messages arrive) |

---

## Conversation Participants

**Purpose**: Many-to-many relationship tracking which users are in which conversations.

| Field | Type | Description |
|-------|------|-------------|
| `conversation_id` | INT UNSIGNED | Foreign key to `conversations.id` (part of composite primary key) |
| `user_id` | INT UNSIGNED | Foreign key to `users.id` (part of composite primary key) |
| `joined_at` | DATETIME | When user joined the conversation (default: current timestamp) |
| `last_read_at` | DATETIME | When user last read messages in the conversation (nullable) |

**Primary Key**: (`conversation_id`, `user_id`)

---

## Messages

**Purpose**: Individual messages within conversations.

| Field | Type | Description |
|-------|------|-------------|
| `id` | BIGINT UNSIGNED | Primary key, auto-incrementing unique identifier (BIGINT for high volume) |
| `conversation_id` | INT UNSIGNED | Foreign key to `conversations.id` - parent conversation |
| `sender_id` | INT UNSIGNED | Foreign key to `users.id` - who sent the message |
| `body` | TEXT | Message content/text (nullable) |
| `file_path` | VARCHAR(512) | Optional attachment file path/URL (nullable) |
| `is_read` | ENUM('TRUE','FALSE') | Whether message has been read (default: 'FALSE') |
| `created_at` | DATETIME | Message creation timestamp |
| `updated_at` | DATETIME | Last update timestamp (auto-updated) |

---

## Portfolios

**Purpose**: Portfolio entries that freelancers showcase on their public profile.

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT UNSIGNED | Primary key, auto-incrementing |
| `freelancer_id` | INT UNSIGNED | Foreign key to `freelancers.id` (cascade delete) |
| `title` | VARCHAR(200) | Project/engagement title |
| `summary` | TEXT | Short teaser/overview (optional) |
| `description` | TEXT | Detailed write-up of the work (optional) |
| `thumbnail_url` | VARCHAR(512) | Featured image |
| `gallery_urls` | JSON | Array of supporting screenshots/images |
| `project_url` | VARCHAR(512) | External link to the live project/case study (optional) |
| `tags` | JSON | Skill/tech stack tags (optional) |
| `is_public` | ENUM('TRUE','FALSE') | Visibility flag for the item (default: 'TRUE') |
| `created_at` | DATETIME | Creation timestamp |
| `updated_at` | DATETIME | Auto-managed update timestamp |

Indexes cover `freelancer_id`, `is_public`, and `created_at` to efficiently fetch public work for a given freelancer.

---

## Testimonials

**Purpose**: Client testimonials/reviews displayed on the platform.

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT UNSIGNED | Primary key, auto-incrementing unique identifier |
| `client_name` | VARCHAR(100) | Client's name for the testimonial |
| `client_title` | VARCHAR(200) | Client's job title/position (nullable) |
| `client_company` | VARCHAR(200) | Client's company name (nullable) |
| `content` | TEXT | Testimonial text/content |
| `rating` | INT UNSIGNED | Rating from 1 to 5 stars (nullable) |
| `is_featured` | ENUM('TRUE','FALSE') | Whether testimonial is featured/prominent (default: 'FALSE') |
| `is_active` | ENUM('TRUE','FALSE') | Whether testimonial is active and visible (default: 'TRUE') |
| `client_image_url` | VARCHAR(512) | URL to client's photo/avatar (nullable) |
| `created_at` | DATETIME | Testimonial creation timestamp |
| `updated_at` | DATETIME | Last update timestamp (auto-updated) |

---

## Notes

- **Recovery Tables**: Each main table has a corresponding `_recovery` table for backup/restore purposes. These are automatically synced via triggers and are not documented here as they mirror the main table structure.

- **Currency Fields**: All monetary amounts are stored in cents (e.g., 500000 = $5,000.00) for precision. Currency codes follow ISO 4217 standard (e.g., 'AUD', 'USD', 'EUR').

- **Timestamps**: All tables include `created_at` and `updated_at` timestamps. `updated_at` is automatically updated when a row is modified.

- **Foreign Keys**: Foreign key relationships are enforced with appropriate `ON DELETE` actions:
  - `CASCADE`: Deleting parent deletes children
  - `SET NULL`: Deleting parent sets foreign key to NULL
  - `RESTRICT`: Prevents deletion if children exist

- **Indexes**: All tables have indexes on frequently queried fields (foreign keys, status fields, searchable fields) for optimal performance.

