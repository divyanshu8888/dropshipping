export const brand = {
  name: 'Unitiv'
};

export const loginCopy = {
  seo: {
    title: `Login - ${brand.name}`,
    // Why: 150-160 char description for healthier SERP snippets
    description: `Sign in to your ${brand.name} account to manage projects, collaborate with vetted freelancers and clients, track milestones, and keep payments moving securely.`
  },

  hero: {
    badge: 'Secure • Accountable • Focused',
    titleLead: 'Stay connected with',
    titleStrong: `${brand.name}`,
    subcopy:
      'Keep your briefs, conversations, and deliverables in one place. Sign in to review updates, track project health, and manage payments with clarity.'
  },

  highlights: [
    {
      icon: '🧠',
      title: 'Projects in One Place',
      description:
        'Access the latest briefs, approvals, and invoices without digging through email threads.'
    },
    {
      icon: '🛡️',
      title: 'Protected Accounts',
      description:
        'Session limits, audit trails, and encryption keep access scoped to the right people.'
    },
    {
      icon: '📊',
      title: 'Progress at a Glance',
      description:
        'See milestones, payment status, and next actions immediately after you sign in.'
    },
    {
      icon: '📁',
      title: 'Audit-Ready Trail',
      description:
        'Every deliverable, approval, and payout carries a timestamped record for easy reviews.'
    }
  ],

  trust: {
    uptimePill: '99.9% uptime',
    enterprisePill: 'Enterprise-ready',
    caption: 'Trusted by operators who rely on accountable workflows and transparent reporting.'
  },

  form: {
    heading: 'Welcome back',
    noAccount: 'New to Unitiv?',
    createCta: 'Create your profile',
    fields: {
      emailLabel: 'Email address',
      emailPlaceholder: 'name@company.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password'
    },
    submit: 'Sign in',
    submitting: 'Signing in…',
    forgot: 'Forgot your password?'
  },

  alerts: {
    invalid: 'Invalid email or password',
    generic: 'Login failed. Please try again.',
    protectedNote: `Protected and encrypted by ${brand.name}. Need help?`,
    contactTeam: 'Contact our support team.'
  }
};

export const signupCopy = {
  seo: {
    title: `Create an account - ${brand.name}`,
    // Why: 150-160 char description for healthier SERP snippets
    description: `Create your free ${brand.name} account as a client or freelancer to post briefs, build your profile, collaborate on projects, and get paid securely in one place.`
  },

  hero: {
    badge: 'Fast • Secure • Guided',
    titleLead: 'Create your account',
    titleStrong: `and launch your profile on ${brand.name}`,
    subcopy:
      'Securely set your credentials, define your role, and unlock access to curated briefs, vetted talent, and payments made for digital commerce teams.'
  },

  form: {
    heading: 'Get started',
    haveAccount: 'Already have an account?',
    loginCta: 'Sign in',
    fields: {
      nameLabel: 'Full name',
      namePlaceholder: 'Alex Morgan',
      emailLabel: 'Work email',
      emailPlaceholder: 'you@company.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'At least 6 characters',
      roleLabel: 'I am a',
      roleOptions: {
        freelancer: 'Freelancer',
        client: 'Client'
      }
    },
    submit: 'Create account',
    submitting: 'Creating account…'
  },

  alerts: {
    success: 'Account created successfully! Redirecting…',
    emailTaken: 'This email is already connected to a Unitiv profile. Try signing in.',
    invalidEmail: 'Please use a valid email.',
    shortPassword: 'Password must be at least 6 characters.',
    generic: 'We couldn’t create your account. Please review the details and try again.'
  }
};


