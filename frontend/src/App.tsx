import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Globe,
  Image as ImageIcon,
  Menu,
  Megaphone,
  Sparkles,
  TrendingUp,
  UserRound,
} from 'lucide-react';

type UserSummary = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string | null;
};

type ServiceItem = {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  featured: boolean;
};

type InfluencerItem = {
  id: number;
  name: string;
  city: string;
  followers: number;
  engagement_rate: number;
  status: string;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    message?: string;
    code?: string;
  };
};

type BusinessProfile = {
  id: number;
  user_id: number;
  business_name: string;
  city: string;
  district: string;
  state: string;
  website: string | null;
  description: string;
  created_at: string;
  updated_at: string;
};

type InfluencerProfile = {
  id: number;
  user_id: number;
  display_name: string;
  city: string;
  district: string;
  bio: string;
  followers: number;
  engagement_rate: number;
  average_views: number;
  status: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

type AdminSummary = {
  metrics: {
    businesses: number;
    influencers: number;
    campaigns: number;
    leads: number;
    payments: number;
    users: number;
  };
  generated_at: string;
};

type AdminSettingItem = {
  key: string;
  value: string;
  description: string;
  updated_at?: string;
};

type PackageItem = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  active: boolean;
};

type CampaignItem = {
  id: number;
  business_id: number;
  name: string;
  objective: string;
  target_location: string;
  target_audience: string;
  budget: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

type CampaignInvitationItem = {
  id: number;
  campaign_id: number;
  influencer_id: number;
  status: string;
  campaign_name: string;
  influencer_name: string;
  created_at: string;
};

type CampaignDeliveryItem = {
  id: number;
  campaign_id: number;
  influencer_id: number;
  campaign_name: string;
  influencer_name: string;
  content_url: string;
  notes: string;
  status: string;
  payment_record_id: number | null;
  created_at: string;
  updated_at: string;
};

type LeadItem = {
  id: number;
  name: string;
  email: string;
  phone: string;
  business_name: string;
  status: string;
  assigned_to: number | null;
  created_at: string;
};

type ConversationItem = {
  id: number;
  type: string;
  title: string;
  created_at: string;
};

type MessageItem = {
  id: number;
  conversation_id: number;
  sender_id: number;
  text: string;
  created_at: string;
};

type NotificationItem = {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type PaymentItem = {
  id: number;
  user_id: number;
  amount: number;
  currency: string;
  status: string;
  provider_reference: string;
  created_at: string;
};

type ReviewItem = {
  id: number;
  reviewer_id: number;
  target_user_id: number;
  overall_rating: number;
  comment: string;
  created_at: string;
};

const API_BASE = 'http://localhost:8000';

const fallbackServices: ServiceItem[] = [
  { id: 1, name: 'Website Development', slug: 'website-development', description: 'Professional business websites built for trust and conversion.', category: 'Web', price: 9999, featured: true },
  { id: 2, name: 'Social Media', slug: 'social-media', description: 'Consistent content systems for growth across Instagram, Facebook and YouTube.', category: 'Content', price: 14999, featured: true },
  { id: 3, name: 'Influencer Marketing', slug: 'influencer-marketing', description: 'Creator matchmaking designed around relevance and budget fit.', category: 'Marketing', price: 19999, featured: true },
];

const fallbackInfluencers: InfluencerItem[] = [
  { id: 1, name: 'Ravi K.', city: 'Narasaraopet', followers: 38000, engagement_rate: 7.2, status: 'VERIFIED' },
  { id: 2, name: 'Anusha P.', city: 'Palnadu', followers: 52000, engagement_rate: 8.4, status: 'VERIFIED' },
  { id: 3, name: 'Venkatesh R.', city: 'Guntur', followers: 25000, engagement_rate: 5.5, status: 'PENDING_REVIEW' },
];

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const body = (await response.json().catch(() => ({}))) as ApiEnvelope<T> & Record<string, unknown>;

  if (response.status === 401 && path === '/api/auth/me/') {
    return null as T;
  }

  if (!response.ok || body.success === false) {
    const message = body?.error?.message || body?.message || 'Request failed.';
    throw new Error(message);
  }

  return body.data as T;
}

function App() {
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [services, setServices] = useState<ServiceItem[]>(fallbackServices);
  const [influencers, setInfluencers] = useState<InfluencerItem[]>(fallbackInfluencers);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const publicServices = await apiRequest<ServiceItem[]>(`/api/public/services/`);
        const publicInfluencers = await apiRequest<InfluencerItem[]>(`/api/public/influencers/`);
        setServices(publicServices.length ? publicServices : fallbackServices);
        setInfluencers(publicInfluencers.length ? publicInfluencers : fallbackInfluencers);
      } catch {
        setServices(fallbackServices);
        setInfluencers(fallbackInfluencers);
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const me = await apiRequest<{ user: UserSummary } | null>(`/api/auth/me/`);
        setCurrentUser(me?.user ?? null);
      } catch {
        setCurrentUser(null);
      }
    })();
  }, []);

  const handleLogin = async (payload: { email: string; password: string }) => {
    try {
      const response = await apiRequest<{ user: UserSummary }>(`/api/auth/login/`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setCurrentUser(response.user);
      setStatusMessage('Login successful.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Login failed.');
    }
  };

  const handleRegister = async (payload: Record<string, string>) => {
    try {
      const response = await apiRequest<{ user: UserSummary }>(`/api/auth/register/`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setCurrentUser(response.user);
      setStatusMessage('Account created successfully.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Registration failed.');
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest<{ message?: string }>(`/api/auth/logout/`, { method: 'POST' });
      setCurrentUser(null);
      setStatusMessage('Logged out successfully.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Logout failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-sm font-semibold text-white">DG</div>
            <div>
              <div className="text-lg font-semibold">Digital Growth</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Narasaraopet</div>
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <Link to="/">Home</Link>
            <Link to="/services">Services</Link>
            <Link to="/influencers">Influencers</Link>
            <Link to="/pricing">Pricing</Link>
            {currentUser ? <Link to="/dashboard">Dashboard</Link> : null}
            <Link to="/auth">{currentUser ? 'Profile' : 'Login'}</Link>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {!currentUser ? (
              <>
                <Link to="/auth" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Find an Influencer</Link>
                <Link to="/auth" className="rounded-full bg-blue-700 px-4 py-2 text-sm font-medium text-white">Grow My Business</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">{currentUser.email}</Link>
                <button onClick={handleLogout} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Logout</button>
              </>
            )}
          </div>

          <button className="rounded-full border border-slate-300 p-2 md:hidden" aria-label="Menu">
            <Menu size={18} />
          </button>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage services={services} influencers={influencers} />} />
          <Route path="/services" element={<MarketplacePage title="Services" items={services} />} />
          <Route path="/influencers" element={<MarketplacePage title="Influencer Marketplace" items={influencers.map((item) => ({ ...item, name: item.name, description: `${item.city} · ${item.followers.toLocaleString()} followers` }))} />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/dashboard" element={<DashboardPage currentUser={currentUser} />} />
          <Route path="/auth" element={<AuthPage onLogin={handleLogin} onRegister={handleRegister} statusMessage={statusMessage} currentUser={currentUser} />} />
        </Routes>
      </main>
    </div>
  );
}

function HomePage({ services, influencers }: { services: ServiceItem[]; influencers: InfluencerItem[] }) {
  const steps = [
    'Tell us what you need',
    'Choose the right service or influencer',
    'Launch your project or campaign',
    'Track the result',
  ];

  const packages = [
    { name: 'Starter Digital Presence', price: '₹9,999', description: 'For local businesses beginning their digital presence.' },
    { name: 'Business Growth', price: '₹24,999', description: 'For active businesses looking to improve visibility and leads.' },
    { name: 'Complete Digital Growth', price: '₹49,999', description: 'Full-funnel content, campaigns and conversion support.' },
  ];

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-blue-700">
              <Sparkles size={14} /> Local digital growth
            </div>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Build Your Digital Presence. Reach More Customers.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              Help local businesses create online visibility, strengthen their content, and connect with the right influencers for growth.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/auth" className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-700 px-6 py-3 font-medium text-white shadow-md">
                Grow My Business <ArrowRight size={18} />
              </Link>
              <Link to="/influencers" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700">
                Find an Influencer
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Growth Snapshot</p>
                  <h3 className="mt-1 text-2xl font-semibold">Digital growth pipeline</h3>
                </div>
                <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                  <TrendingUp size={18} />
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Website visibility', value: 'High intent', status: 'Strong' },
                  { label: 'Local reach', value: 'Regional', status: 'Growing' },
                  { label: 'Influencer fit', value: 'Relevant creators', status: 'Matched' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="font-medium text-slate-900">{item.status}</span>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full w-3/4 rounded-full bg-blue-600" />
                    </div>
                    <div className="mt-2 text-xs text-slate-500">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-700">Services</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">Growth services built for local businesses</h2>
            </div>
            <Link to="/services" className="hidden text-sm font-medium text-blue-700 md:inline-flex">Explore services</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <div key={service.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Compass size={20} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{service.name}</h3>
                <p className="mt-2 text-sm text-slate-500">{service.category}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{service.description}</p>
                <div className="mt-4 text-lg font-semibold text-slate-900">₹{service.price.toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-700">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">Simple, practical process</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-sm font-medium text-white">{index + 1}</div>
              <p className="text-lg font-medium text-slate-900">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-200">Marketplace preview</p>
              <h2 className="mt-3 text-3xl font-semibold">Creators ready for local campaigns</h2>
            </div>
            <Link to="/influencers" className="text-sm font-medium text-blue-200">View marketplace</Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {influencers.map((influencer) => (
              <div key={influencer.id} className="rounded-2xl border border-slate-700 bg-slate-800 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 font-semibold text-white">
                  {influencer.name.split(' ')[0][0]}
                </div>
                <h3 className="text-lg font-semibold">{influencer.name}</h3>
                <p className="mt-1 text-sm text-slate-300">{influencer.city}</p>
                <div className="mt-5 flex items-center justify-between text-sm text-slate-300">
                  <span>Followers</span>
                  <span className="font-medium text-white">{influencer.followers.toLocaleString()}</span>
                </div>
                <button className="mt-5 w-full rounded-full border border-slate-600 px-4 py-2 text-sm font-medium text-white">
                  View profile
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-700">Packages</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">Simple growth packages</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">{pkg.name}</h3>
              <div className="mt-4 text-3xl font-semibold text-blue-700">{pkg.price}</div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{pkg.description}</p>
              <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-700 px-4 py-2 text-sm font-medium text-white">
                Get started <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Megaphone size={20} /></div>
            <h3 className="text-xl font-semibold text-slate-900">Why businesses choose us</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Clear strategy, consistent execution, and actionable reporting for local growth decisions.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><CheckCircle2 size={20} /></div>
            <h3 className="text-xl font-semibold text-slate-900">Practical execution</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">We focus on deliverables that improve reach, trust, and conversion instead of vanity metrics.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Globe size={20} /></div>
            <h3 className="text-xl font-semibold text-slate-900">Local-first growth</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">We help businesses grow in Narasaraopet and across wider Andhra Pradesh with the right digital mix.</p>
          </div>
        </div>
      </section>
    </>
  );
}

function MarketplacePage({ title, items }: { title: string; items: Array<Record<string, unknown>> }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-700">Digital growth platform</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">{title}</h1>
        </div>
        <Link to="/auth" className="rounded-full bg-blue-700 px-4 py-2 text-sm font-medium text-white">Create listing</Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <div key={String((item as { id?: number; slug?: string; name?: string }).id ?? index)} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <ImageIcon size={20} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">{String((item as { name?: string }).name ?? 'Item')}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{String((item as { description?: string }).description ?? 'Digital growth opportunity for local businesses.')}</p>
            <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
              <span>{String((item as { category?: string }).category ?? 'Digital Growth')}</span>
              <span className="font-semibold text-slate-900">{(item as { price?: number }).price ? `₹${(item as { price?: number }).price?.toLocaleString('en-IN')}` : 'Premium'}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PricingPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-700">Pricing</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">Simple pricing for growth</h1>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {[
          ['Starter', '₹9,999', 'For emerging local brands'],
          ['Growth', '₹24,999', 'For active campaigns and stronger visibility'],
          ['Scale', '₹49,999', 'For full-funnel support and creator programs'],
        ].map(([name, price, text]) => (
          <div key={name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">{name}</h3>
            <div className="mt-4 text-3xl font-semibold text-blue-700">{price}</div>
            <p className="mt-3 text-sm text-slate-600">{text}</p>
            <button className="mt-6 w-full rounded-full bg-blue-700 px-4 py-2 text-sm font-medium text-white">Choose plan</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function DashboardPage({ currentUser }: { currentUser: UserSummary | null }) {
  const [data, setData] = useState<BusinessProfile | InfluencerProfile | AdminSummary | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [invitations, setInvitations] = useState<CampaignInvitationItem[]>([]);
  const [deliveries, setDeliveries] = useState<CampaignDeliveryItem[]>([]);
  const [leadForm, setLeadForm] = useState({
    name: 'Priya',
    email: 'priya@demo.com',
    phone: '9876543210',
    business_name: 'Demo Brand',
    status: 'NEW',
  });
  const [invitationForm, setInvitationForm] = useState({
    campaign_id: '',
    influencer_id: '',
    status: 'PENDING',
  });
  const [deliveryForm, setDeliveryForm] = useState({
    campaign_id: '',
    influencer_id: '',
    content_url: 'https://cdn.example.com/content/reel.mp4',
    notes: 'Submitted final reel and story package.',
    status: 'SUBMITTED',
  });
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminSettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [campaignForm, setCampaignForm] = useState({
    name: 'Spring Brand Launch',
    objective: 'Increase local awareness and drive store visits.',
    target_location: 'Narasaraopet',
    target_audience: 'Local families and young professionals',
    budget: '25000',
    status: 'DRAFT',
    start_date: '2026-10-15',
    end_date: '2026-10-30',
  });
  const [influencerForm, setInfluencerForm] = useState({
    display_name: 'Aarav Creator',
    city: 'Narasaraopet',
    district: 'Palnadu',
    bio: 'Local creator focused on lifestyle, food, and product storytelling.',
    followers: '35000',
    engagement_rate: '7.5',
    average_views: '120000',
    status: 'ACTIVE',
    is_verified: true,
  });
  const [adminSettingForm, setAdminSettingForm] = useState({
    key: 'welcome_message',
    value: 'Launch Week is active',
    description: 'Main announcement shown across the platform.',
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: '25000',
    currency: 'INR',
    status: 'PENDING',
    provider_reference: 'RG-2026-1001',
  });
  const [notificationForm, setNotificationForm] = useState({
    title: 'Campaign due',
    message: 'Content review is due today for the spring launch campaign.',
    type: 'CAMPAIGN',
  });
  const [messageForm, setMessageForm] = useState({
    title: 'Campaign discussion',
    type: 'SUPPORT',
    text: 'Hi, can we review the next posting timeline?',
  });
  const [replyForm, setReplyForm] = useState({
    conversationId: '',
    text: '',
  });

  useEffect(() => {
    if (!currentUser) {
      setData(null);
      setCampaigns([]);
      setLeads([]);
      setConversations([]);
      setMessages([]);
      setNotifications([]);
      setPayments([]);
      setReviews([]);
      setLoading(false);
      return;
    }

    let isActive = true;

    const loadDashboard = async () => {
      try {
        const role = currentUser.role?.toUpperCase() ?? 'BUSINESS';

        if (role === 'BUSINESS') {
          const [business, businessCampaigns, businessLeads, businessInvitations, businessDeliveries, businessConversations, businessMessages, businessNotifications, businessPayments, businessReviews] = await Promise.all([
            apiRequest<BusinessProfile>(`/api/business/onboarding/`),
            apiRequest<CampaignItem[]>(`/api/campaigns/`),
            apiRequest<LeadItem[]>(`/api/leads/`),
            apiRequest<CampaignInvitationItem[]>(`/api/campaigns/invitations/`),
            apiRequest<CampaignDeliveryItem[]>(`/api/campaigns/deliveries/`),
            apiRequest<ConversationItem[]>(`/api/messages/conversations/`),
            apiRequest<MessageItem[]>(`/api/messages/`),
            apiRequest<NotificationItem[]>(`/api/notifications/`),
            apiRequest<PaymentItem[]>(`/api/payments/`),
            apiRequest<ReviewItem[]>(`/api/reviews/`),
          ]);

          if (isActive) {
            setData(business);
            setCampaigns(businessCampaigns);
            setLeads(businessLeads);
            setInvitations(businessInvitations);
            setDeliveries(businessDeliveries);
            setConversations(businessConversations);
            setMessages(businessMessages);
            setNotifications(businessNotifications);
            setPayments(businessPayments);
            setReviews(businessReviews);
          }
          return;
        }

        if (role === 'INFLUENCER') {
          const [influencer, influencerInvitations, influencerDeliveries, influencerPayments, influencerNotifications] = await Promise.all([
            apiRequest<InfluencerProfile>(`/api/influencer/onboarding/`),
            apiRequest<CampaignInvitationItem[]>(`/api/campaigns/invitations/`),
            apiRequest<CampaignDeliveryItem[]>(`/api/campaigns/deliveries/`),
            apiRequest<PaymentItem[]>(`/api/payments/`),
            apiRequest<NotificationItem[]>(`/api/notifications/`),
          ]);
          if (isActive) {
            setData(influencer);
            setInvitations(influencerInvitations);
            setDeliveries(influencerDeliveries);
            setPayments(influencerPayments);
            setNotifications(influencerNotifications);
            setInfluencerForm({
              display_name: influencer.display_name || 'Aarav Creator',
              city: influencer.city || 'Narasaraopet',
              district: influencer.district || 'Palnadu',
              bio: influencer.bio || 'Local creator focused on lifestyle, food, and product storytelling.',
              followers: String(influencer.followers || 0),
              engagement_rate: String(influencer.engagement_rate || 0),
              average_views: String(influencer.average_views || 0),
              status: influencer.status || 'ACTIVE',
              is_verified: influencer.is_verified,
            });
          }
          return;
        }

        if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
          const [summary, settings, adminNotifications] = await Promise.all([
            apiRequest<AdminSummary>(`/api/analytics/summary/`),
            apiRequest<{ settings: AdminSettingItem[] }>(`/api/admin/settings/`),
            apiRequest<NotificationItem[]>(`/api/notifications/`),
          ]);
          if (isActive) {
            setData(summary);
            setAdminSettings(settings.settings || []);
            setNotifications(adminNotifications);
          }
          return;
        }

        if (isActive) setData(null);
      } catch (caughtError) {
        if (isActive) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load dashboard data.');
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    void loadDashboard();
    return () => {
      isActive = false;
    };
  }, [currentUser]);

  const createCampaign = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const created = await apiRequest<CampaignItem>(`/api/campaigns/`, {
        method: 'POST',
        body: JSON.stringify({
          ...campaignForm,
          budget: Number(campaignForm.budget) || 0,
        }),
      });
      setCampaigns((previous) => [created, ...previous]);
      setCampaignForm({
        name: '',
        objective: '',
        target_location: 'Narasaraopet',
        target_audience: '',
        budget: '0',
        status: 'DRAFT',
        start_date: '',
        end_date: '',
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to create campaign.');
    }
  };

  const createLead = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const created = await apiRequest<LeadItem>(`/api/leads/`, {
        method: 'POST',
        body: JSON.stringify(leadForm),
      });
      setLeads((previous) => [created, ...previous]);
      setLeadForm({
        name: '',
        email: '',
        phone: '',
        business_name: '',
        status: 'NEW',
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to create lead.');
    }
  };

  const createConversation = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const created = await apiRequest<ConversationItem>(`/api/messages/conversations/`, {
        method: 'POST',
        body: JSON.stringify({
          title: messageForm.title,
          type: messageForm.type,
          message: messageForm.text,
        }),
      });
      setConversations((previous) => [created, ...previous]);
      setMessages((previous) => [
        {
          id: Date.now(),
          conversation_id: created.id,
          sender_id: currentUser?.id ?? 0,
          text: messageForm.text,
          created_at: new Date().toISOString(),
        },
        ...previous,
      ]);
      setMessageForm({
        title: '',
        type: 'SUPPORT',
        text: '',
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to create conversation.');
    }
  };

  const sendReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!replyForm.conversationId || !replyForm.text) {
      return;
    }

    try {
      const created = await apiRequest<MessageItem>(`/api/messages/`, {
        method: 'POST',
        body: JSON.stringify({
          conversation_id: Number(replyForm.conversationId),
          text: replyForm.text,
        }),
      });
      setMessages((previous) => [created, ...previous]);
      setReplyForm((prev) => ({ ...prev, text: '' }));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to send message.');
    }
  };

  const updateInfluencerProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const updated = await apiRequest<InfluencerProfile>(`/api/influencer/onboarding/`, {
        method: 'POST',
        body: JSON.stringify({
          ...influencerForm,
          followers: Number(influencerForm.followers) || 0,
          engagement_rate: Number(influencerForm.engagement_rate) || 0,
          average_views: Number(influencerForm.average_views) || 0,
          is_verified: Boolean(influencerForm.is_verified),
        }),
      });
      setData(updated);
      setInfluencerForm({
        display_name: updated.display_name || 'Aarav Creator',
        city: updated.city || 'Narasaraopet',
        district: updated.district || 'Palnadu',
        bio: updated.bio || 'Local creator focused on lifestyle, food, and product storytelling.',
        followers: String(updated.followers || 0),
        engagement_rate: String(updated.engagement_rate || 0),
        average_views: String(updated.average_views || 0),
        status: updated.status || 'ACTIVE',
        is_verified: updated.is_verified,
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to update influencer profile.');
    }
  };

  const saveAdminSetting = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const created = await apiRequest<{ key: string; value: string; description: string }>(`/api/admin/settings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminSettingForm),
      });
      setAdminSettings((previous) => {
        const next = previous.filter((item) => item.key !== created.key);
        return [{ key: created.key, value: created.value, description: created.description }, ...next];
      });
      setAdminSettingForm({
        key: created.key,
        value: created.value,
        description: created.description,
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to save admin setting.');
    }
  };

  const createInvitation = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const created = await apiRequest<CampaignInvitationItem>(`/api/campaigns/invitations/`, {
        method: 'POST',
        body: JSON.stringify({
          campaign_id: Number(invitationForm.campaign_id),
          influencer_id: Number(invitationForm.influencer_id),
          status: invitationForm.status,
        }),
      });
      setInvitations((previous) => [created, ...previous]);
      setInvitationForm({
        campaign_id: '',
        influencer_id: '',
        status: 'PENDING',
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to send campaign invitation.');
    }
  };

  const updateInvitationStatus = async (invitationId: number, status: string) => {
    try {
      const updated = await apiRequest<CampaignInvitationItem>(`/api/campaigns/invitations/`, {
        method: 'POST',
        body: JSON.stringify({
          campaign_id: invitations.find((item) => item.id === invitationId)?.campaign_id,
          influencer_id: invitations.find((item) => item.id === invitationId)?.influencer_id,
          status,
        }),
      });
      setInvitations((previous) => previous.map((item) => item.id === invitationId ? updated : item));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to update invitation status.');
    }
  };

  const submitCampaignDelivery = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const created = await apiRequest<CampaignDeliveryItem>(`/api/campaigns/deliveries/`, {
        method: 'POST',
        body: JSON.stringify({
          campaign_id: Number(deliveryForm.campaign_id),
          influencer_id: currentUser?.id ? Number(deliveryForm.influencer_id || currentUser.id) : Number(deliveryForm.influencer_id),
          content_url: deliveryForm.content_url,
          notes: deliveryForm.notes,
          status: deliveryForm.status,
        }),
      });
      setDeliveries((previous) => [created, ...previous]);
      setDeliveryForm({
        campaign_id: '',
        influencer_id: '',
        content_url: 'https://cdn.example.com/content/reel.mp4',
        notes: 'Submitted final reel and story package.',
        status: 'SUBMITTED',
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to submit campaign delivery.');
    }
  };

  const approveCampaignDelivery = async (deliveryId: number) => {
    try {
      const updated = await apiRequest<CampaignDeliveryItem>(`/api/campaigns/deliveries/`, {
        method: 'POST',
        body: JSON.stringify({
          delivery_id: deliveryId,
          status: 'APPROVED',
          notes: 'Approved for payout.',
        }),
      });
      setDeliveries((previous) => previous.map((item) => item.id === deliveryId ? updated : item));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to approve delivery.');
    }
  };

  const createPaymentRecord = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const created = await apiRequest<PaymentItem>(`/api/payments/`, {
        method: 'POST',
        body: JSON.stringify({
          ...paymentForm,
          amount: Number(paymentForm.amount) || 0,
        }),
      });
      setPayments((previous) => [created, ...previous]);
      setPaymentForm({
        amount: '0',
        currency: 'INR',
        status: 'PENDING',
        provider_reference: '',
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to record payment.');
    }
  };

  const createSystemNotification = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const created = await apiRequest<NotificationItem>(`/api/notifications/`, {
        method: 'POST',
        body: JSON.stringify(notificationForm),
      });
      setNotifications((previous) => [created, ...previous]);
      setNotificationForm({
        title: '',
        message: '',
        type: 'CAMPAIGN',
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to create notification.');
    }
  };

  if (!currentUser) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-700">Dashboard</p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900">Sign in to view your workspace</h1>
          <p className="mt-4 text-slate-600">Your business, influencer profile, and analytics appear here once you are authenticated.</p>
          <Link to="/auth" className="mt-6 inline-flex rounded-full bg-blue-700 px-5 py-3 text-sm font-medium text-white">Go to login</Link>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Loading dashboard…</h1>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center shadow-sm">
          <h1 className="text-3xl font-semibold text-red-700">Unable to load dashboard</h1>
          <p className="mt-3 text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  const role = currentUser.role?.toUpperCase() ?? 'BUSINESS';

  if (role === 'BUSINESS' && data && 'business_name' in data) {
    const profile = data as BusinessProfile;

    return (
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-700">Business dashboard</p>
            <h1 className="mt-2 text-4xl font-semibold text-slate-900">{profile.business_name || 'Your brand'}</h1>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">Active account</span>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Location</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">{profile.city}, {profile.state}</h3>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Website</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">{profile.website || 'Not added yet'}</h3>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Status</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">Onboarding complete</h3>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Business profile</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">{profile.description || 'Add a business description to tell creators and partners what you do.'}</p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Campaigns</h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-blue-700">{campaigns.length}</span>
            </div>

            <form onSubmit={createCampaign} className="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Campaign name</label>
                <input value={campaignForm.name} onChange={(event) => setCampaignForm({ ...campaignForm, name: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Objective</label>
                <textarea value={campaignForm.objective} onChange={(event) => setCampaignForm({ ...campaignForm, objective: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" rows={3} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Budget</label>
                  <input type="number" value={campaignForm.budget} onChange={(event) => setCampaignForm({ ...campaignForm, budget: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                  <select value={campaignForm.status} onChange={(event) => setCampaignForm({ ...campaignForm, status: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="NEGOTIATING">Negotiating</option>
                    <option value="FUNDED">Funded</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full rounded-xl bg-blue-700 px-4 py-2.5 font-medium text-white">Create campaign</button>
            </form>

            <div className="space-y-3">
              {campaigns.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No campaigns yet.</div>
              ) : (
                campaigns.map((campaign) => (
                  <div key={campaign.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{campaign.name}</h3>
                      <span className="rounded-full bg-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700">{campaign.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{campaign.objective || 'No objective provided yet.'}</p>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                      <span>{campaign.target_location}</span>
                      <span>₹{Number(campaign.budget).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Leads</h2>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-emerald-700">{leads.length}</span>
            </div>

            <form onSubmit={createLead} className="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                  <input value={leadForm.name} onChange={(event) => setLeadForm({ ...leadForm, name: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                  <input value={leadForm.email} onChange={(event) => setLeadForm({ ...leadForm, email: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                  <input value={leadForm.phone} onChange={(event) => setLeadForm({ ...leadForm, phone: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Business</label>
                  <input value={leadForm.business_name} onChange={(event) => setLeadForm({ ...leadForm, business_name: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                <select value={leadForm.status} onChange={(event) => setLeadForm({ ...leadForm, status: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                </select>
              </div>
              <button type="submit" className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white">Create lead</button>
            </form>

            <div className="space-y-3">
              {leads.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No leads yet.</div>
              ) : (
                leads.map((lead) => (
                  <div key={lead.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{lead.name}</h3>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">{lead.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{lead.email}</p>
                    <p className="text-sm text-slate-600">{lead.phone || 'No phone supplied'}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-900">Campaign execution</h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-blue-700">{campaigns.length}</span>
              </div>

              <div className="space-y-3">
                {campaigns.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No campaigns in motion.</div>
                ) : (
                  campaigns.slice(0, 4).map((campaign) => (
                    <div key={campaign.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">{campaign.name}</h3>
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">{campaign.status}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{campaign.objective}</p>
                      <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                        <span>{campaign.target_location}</span>
                        <span>₹{Number(campaign.budget).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={createPaymentRecord} className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-lg font-semibold text-slate-900">Payout / payment record</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Amount</label>
                    <input type="number" value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                    <select value={paymentForm.status} onChange={(event) => setPaymentForm({ ...paymentForm, status: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Reference</label>
                  <input value={paymentForm.provider_reference} onChange={(event) => setPaymentForm({ ...paymentForm, provider_reference: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
                </div>
                <button type="submit" className="w-full rounded-xl bg-blue-700 px-4 py-2.5 font-medium text-white">Record payment</button>
              </form>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-900">Inbox</h2>
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-violet-700">{conversations.length}</span>
              </div>

              <form onSubmit={createConversation} className="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Conversation title</label>
                  <input value={messageForm.title} onChange={(event) => setMessageForm({ ...messageForm, title: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
                  <select value={messageForm.type} onChange={(event) => setMessageForm({ ...messageForm, type: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                    <option value="SUPPORT">Support</option>
                    <option value="CAMPAIGN">Campaign</option>
                    <option value="PARTNERSHIP">Partnership</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Message</label>
                  <textarea value={messageForm.text} onChange={(event) => setMessageForm({ ...messageForm, text: event.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
                </div>
                <button type="submit" className="w-full rounded-xl bg-violet-600 px-4 py-2.5 font-medium text-white">Start conversation</button>
              </form>

              <div className="space-y-3">
                {conversations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No conversations yet.</div>
                ) : (
                  conversations.slice(0, 4).map((conversation) => (
                    <div key={conversation.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">{conversation.title}</h3>
                        <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-700">{conversation.type}</span>
                      </div>
                      <div className="mt-3 text-sm text-slate-600">
                        {messages.filter((message) => message.conversation_id === conversation.id).slice(0, 2).map((message) => (
                          <div key={message.id} className="mb-2 last:mb-0">{message.text}</div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={sendReply} className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Reply to</label>
                  <select value={replyForm.conversationId} onChange={(event) => setReplyForm({ ...replyForm, conversationId: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                    <option value="">Select conversation</option>
                    {conversations.map((conversation) => (
                      <option key={conversation.id} value={String(conversation.id)}>{conversation.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Reply text</label>
                  <textarea value={replyForm.text} onChange={(event) => setReplyForm({ ...replyForm, text: event.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
                </div>
                <button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-2.5 font-medium text-white">Send reply</button>
              </form>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Notifications</h2>
              <div className="mt-5 space-y-3">
                {notifications.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No notifications.</div>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">{notification.type}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{notification.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Campaign invitations</h2>
              <div className="mt-5 space-y-3">
                {invitations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No campaign invitations.</div>
                ) : (
                  invitations.slice(0, 5).map((invitation) => (
                    <div key={invitation.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-slate-900">{invitation.campaign_name}</h3>
                        <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-700">{invitation.status}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{invitation.influencer_name}</p>
                      {currentUser?.role?.toUpperCase() === 'INFLUENCER' ? (
                        <div className="mt-3 flex gap-2">
                          <button type="button" onClick={() => updateInvitationStatus(invitation.id, 'ACCEPTED')} className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-medium text-white">Accept</button>
                          <button type="button" onClick={() => updateInvitationStatus(invitation.id, 'DECLINED')} className="rounded-full border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700">Decline</button>
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Content approvals</h2>
              <div className="mt-5 space-y-3">
                {deliveries.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No content submissions yet.</div>
                ) : (
                  deliveries.slice(0, 5).map((delivery) => (
                    <div key={delivery.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-slate-900">{delivery.campaign_name}</h3>
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">{delivery.status}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{delivery.influencer_name}</p>
                      <a href={delivery.content_url} className="mt-2 block text-sm font-medium text-blue-700 underline" target="_blank" rel="noreferrer">Open content</a>
                      {currentUser?.role?.toUpperCase() === 'BUSINESS' ? (
                        <button type="button" onClick={() => approveCampaignDelivery(delivery.id)} className="mt-3 rounded-full bg-emerald-600 px-3 py-2 text-xs font-medium text-white">Approve & pay</button>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Payments</h2>
              <div className="mt-5 space-y-3">
                {payments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No payment records.</div>
                ) : (
                  payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div>
                        <div className="font-semibold text-slate-900">₹{Number(payment.amount).toLocaleString('en-IN')}</div>
                        <div className="text-sm text-slate-500">{payment.provider_reference || payment.currency}</div>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">{payment.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Reviews</h2>
              <div className="mt-5 space-y-3">
                {reviews.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No reviews yet.</div>
                ) : (
                  reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-slate-900">Rating: {review.overall_rating}/5</span>
                        <span className="text-sm text-slate-500">#{review.target_user_id}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{review.comment || 'No comment provided.'}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (role === 'INFLUENCER' && data && 'display_name' in data) {
    const profile = data as InfluencerProfile;

    return (
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-700">Influencer dashboard</p>
            <h1 className="mt-2 text-4xl font-semibold text-slate-900">{profile.display_name}</h1>
          </div>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">{profile.status}</span>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Followers</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">{profile.followers.toLocaleString()}</h3>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Engagement</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">{profile.engagement_rate}%</h3>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Avg views</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">{profile.average_views.toLocaleString()}</h3>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Verification</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">{profile.is_verified ? 'Verified' : 'Pending'}</h3>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Creator profile</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">{profile.bio || 'Add a short bio to present your niche, content style, and audience.'}</p>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Profile settings</h2>
          <form onSubmit={updateInfluencerProfile} className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Display name</label>
              <input value={influencerForm.display_name} onChange={(event) => setInfluencerForm({ ...influencerForm, display_name: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">City</label>
              <input value={influencerForm.city} onChange={(event) => setInfluencerForm({ ...influencerForm, city: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">District</label>
              <input value={influencerForm.district} onChange={(event) => setInfluencerForm({ ...influencerForm, district: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
              <select value={influencerForm.status} onChange={(event) => setInfluencerForm({ ...influencerForm, status: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <option value="ACTIVE">Active</option>
                <option value="PENDING_REVIEW">Pending review</option>
                <option value="RESTRICTED">Restricted</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Followers</label>
              <input type="number" value={influencerForm.followers} onChange={(event) => setInfluencerForm({ ...influencerForm, followers: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Engagement %</label>
              <input type="number" step="0.1" value={influencerForm.engagement_rate} onChange={(event) => setInfluencerForm({ ...influencerForm, engagement_rate: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Avg views</label>
              <input type="number" value={influencerForm.average_views} onChange={(event) => setInfluencerForm({ ...influencerForm, average_views: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
            </div>
            <div className="flex items-center justify-start pt-8">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={influencerForm.is_verified} onChange={(event) => setInfluencerForm({ ...influencerForm, is_verified: event.target.checked })} />
                Verified creator
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Bio</label>
              <textarea value={influencerForm.bio} onChange={(event) => setInfluencerForm({ ...influencerForm, bio: event.target.value })} rows={4} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full rounded-xl bg-blue-700 px-4 py-2.5 font-medium text-white">Save creator profile</button>
            </div>
          </form>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Payout wallet</h2>
          <div className="mt-5 space-y-3">
            {payments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No payout history yet.</div>
            ) : (
              payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <div className="font-semibold text-slate-900">₹{Number(payment.amount).toLocaleString('en-IN')}</div>
                    <div className="text-sm text-slate-500">{payment.provider_reference || payment.currency}</div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">{payment.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Campaign opportunities</h2>
          <div className="mt-5 space-y-3">
            {invitations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No campaign opportunities right now.</div>
            ) : (
              invitations.slice(0, 5).map((invitation) => (
                <div key={invitation.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-slate-900">{invitation.campaign_name}</h3>
                    <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-700">{invitation.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Invitation from {invitation.influencer_name}</p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => updateInvitationStatus(invitation.id, 'ACCEPTED')} className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-medium text-white">Accept</button>
                    <button type="button" onClick={() => updateInvitationStatus(invitation.id, 'DECLINED')} className="rounded-full border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700">Decline</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Submit campaign content</h2>
          <form onSubmit={submitCampaignDelivery} className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Campaign ID</label>
                <input type="number" value={deliveryForm.campaign_id} onChange={(event) => setDeliveryForm({ ...deliveryForm, campaign_id: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                <select value={deliveryForm.status} onChange={(event) => setDeliveryForm({ ...deliveryForm, status: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  <option value="SUBMITTED">Submitted</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Content URL</label>
              <input value={deliveryForm.content_url} onChange={(event) => setDeliveryForm({ ...deliveryForm, content_url: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
              <textarea value={deliveryForm.notes} onChange={(event) => setDeliveryForm({ ...deliveryForm, notes: event.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
            </div>
            <button type="submit" className="w-full rounded-xl bg-violet-600 px-4 py-2.5 font-medium text-white">Submit delivery</button>
          </form>
        </div>
      </section>
    );
  }

  if ((role === 'ADMIN' || role === 'SUPER_ADMIN') && data && 'metrics' in data) {
    const summary = data as AdminSummary;

    return (
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-700">Admin overview</p>
            <h1 className="mt-2 text-4xl font-semibold text-slate-900">Platform metrics</h1>
          </div>
          <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">Admin access</span>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            ['Businesses', summary.metrics.businesses],
            ['Influencers', summary.metrics.influencers],
            ['Campaigns', summary.metrics.campaigns],
            ['Leads', summary.metrics.leads],
            ['Payments', summary.metrics.payments],
            ['Users', summary.metrics.users],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{label}</p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-900">{value}</h3>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Platform settings</h2>
            <form onSubmit={saveAdminSetting} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Setting key</label>
                <input value={adminSettingForm.key} onChange={(event) => setAdminSettingForm({ ...adminSettingForm, key: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Value</label>
                <input value={adminSettingForm.value} onChange={(event) => setAdminSettingForm({ ...adminSettingForm, value: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                <textarea value={adminSettingForm.description} onChange={(event) => setAdminSettingForm({ ...adminSettingForm, description: event.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
              </div>
              <button type="submit" className="w-full rounded-xl bg-violet-600 px-4 py-2.5 font-medium text-white">Save platform setting</button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Live settings</h2>
            <div className="mt-5 space-y-3">
              {adminSettings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No platform settings yet.</div>
              ) : (
                adminSettings.slice(0, 6).map((setting) => (
                  <div key={setting.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-slate-900">{setting.key}</h3>
                      <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-700">LIVE</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{setting.value}</p>
                    {setting.description ? <p className="mt-1 text-xs text-slate-500">{setting.description}</p> : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard is ready</h1>
        <p className="mt-4 text-slate-600">Your role is not yet mapped to a dashboard view. Connect to the backend to continue onboarding.</p>
      </div>
    </section>
  );
}

function AuthPage({
  onLogin,
  onRegister,
  statusMessage,
  currentUser,
}: {
  onLogin: (payload: { email: string; password: string }) => Promise<void>;
  onRegister: (payload: Record<string, string>) => Promise<void>;
  statusMessage: string;
  currentUser: UserSummary | null;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [login, setLogin] = useState({ email: 'admin@example.com', password: 'StrongPass123!' });
  const [register, setRegister] = useState({
    email: 'newbusiness@example.com',
    password: 'StrongPass123!',
    first_name: 'Test',
    last_name: 'Founder',
    company_name: 'Demo Brand',
    role: 'BUSINESS',
  });

  const submitLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    await onLogin({ email: login.email, password: login.password });
  };

  const submitRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    await onRegister(register);
  };

  if (currentUser) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <UserRound size={20} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-blue-700">Member</p>
              <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-sm uppercase tracking-[0.18em] text-slate-500">Account</h3>
              <div className="mt-3 font-semibold text-slate-900">{currentUser.email}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-sm uppercase tracking-[0.18em] text-slate-500">Role</h3>
              <div className="mt-3 font-semibold text-slate-900">{currentUser.role || 'Business'}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-sm uppercase tracking-[0.18em] text-slate-500">Status</h3>
              <div className="mt-3 font-semibold text-emerald-600">Active</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex gap-3 rounded-full bg-slate-100 p-1">
            <button onClick={() => setMode('login')} className={`flex-1 rounded-full px-4 py-2 text-sm font-medium ${mode === 'login' ? 'bg-blue-700 text-white' : 'text-slate-700'}`}>
              Login
            </button>
            <button onClick={() => setMode('register')} className={`flex-1 rounded-full px-4 py-2 text-sm font-medium ${mode === 'register' ? 'bg-blue-700 text-white' : 'text-slate-700'}`}>
              Register
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={submitLogin} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input value={login.email} onChange={(event) => setLogin({ ...login, email: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <input type="password" value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500" />
              </div>
              <button type="submit" className="w-full rounded-xl bg-blue-700 px-4 py-3 font-medium text-white">Login</button>
            </form>
          ) : (
            <form onSubmit={submitRegister} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">First Name</label>
                  <input value={register.first_name} onChange={(event) => setRegister({ ...register, first_name: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Last Name</label>
                  <input value={register.last_name} onChange={(event) => setRegister({ ...register, last_name: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input value={register.email} onChange={(event) => setRegister({ ...register, email: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Company</label>
                <input value={register.company_name} onChange={(event) => setRegister({ ...register, company_name: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <input type="password" value={register.password} onChange={(event) => setRegister({ ...register, password: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
                <select value={register.role} onChange={(event) => setRegister({ ...register, role: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500">
                  <option value="BUSINESS">Business</option>
                  <option value="INFLUENCER">Influencer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <button type="submit" className="w-full rounded-xl bg-blue-700 px-4 py-3 font-medium text-white">Create account</button>
            </form>
          )}

          {statusMessage && <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">{statusMessage}</div>}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white shadow-sm">
          <p className="text-sm uppercase tracking-[0.18em] text-blue-200">Why join</p>
          <h2 className="mt-3 text-3xl font-semibold">Built for local growth teams and creators.</h2>
          <ul className="mt-6 space-y-4 text-slate-200">
            {[
              'Launch campaigns without chasing disconnected tools.',
              'Manage creator discovery, communications, and delivery in one place.',
              'Track performance with a cleaner operational workflow.',
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-700 text-xs">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default App;
