// Freelancer Showcase Types
export interface Freelancer {
    id: string;
    display_name: string;
    bio: string;
    country: string;
    skills: string[];
    base_fee?: number; // Private field, only available to admins
    contact_email?: string; // Private field, only available to admins
    contact_phone?: string; // Private field, only available to admins
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at?: string;
}

export interface FreelancerPublic {
    id: string;
    display_name: string;
    bio: string;
    country: string;
    skills: string[];
    status: 'approved';
    created_at: string;
}

export interface PortfolioItem {
    id: string;
    freelancer_id: string;
    title: string;
    summary: string;
    thumbnail_url?: string;
    gallery_urls: string[];
    tags: string[];
    is_public: boolean;
    created_at: string;
    updated_at?: string;
}

export interface PortfolioItemPublic {
    id: string;
    freelancer_id: string;
    title: string;
    summary: string;
    thumbnail_url?: string;
    gallery_urls: string[];
    tags: string[];
    created_at: string;
    is_public: true;
}

export interface FreelancerOnboardingData {
    display_name: string;
    bio: string;
    country: string;
    skills: string[];
    base_fee: number;
    contact_email: string;
    contact_phone?: string;
}

export interface Admin {
    user_id: string;
    role: string;
    created_at: string;
}

export interface QuoteRequest {
    name: string;
    email: string;
    company?: string;
    project_type: string;
    budget_range: string;
    timeline: string;
    description: string;
    preferred_skills?: string[];
}
