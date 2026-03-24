import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { 
  Sparkles, Store, Handshake, DollarSign, Star, Package, Coffee,
  Lightbulb, PenTool, Image, BarChart3, Hash, MessageSquare,
  Link2, Palette, TrendingUp, ArrowRight, Check, ChevronDown,
  Play, Youtube, Instagram, Twitter, Menu, X
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { Slider } from "../components/ui/slider";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Earnings calculator state
  const [followers, setFollowers] = useState([50000]);
  const [products, setProducts] = useState([3]);
  const [membershipPrice, setMembershipPrice] = useState([10]);

  const calculateEarnings = () => {
    const followersCount = followers[0];
    const productsCount = products[0];
    const memberPrice = membershipPrice[0];
    
    const productRevenue = productsCount * 500; // avg $500/product/month
    const membershipRevenue = (followersCount * 0.005) * memberPrice; // 0.5% conversion
    const brandDeals = followersCount > 100000 ? 2000 : followersCount > 50000 ? 1000 : 500;
    const tips = followersCount * 0.0001 * 50; // 0.01% tip at $50 avg
    
    return Math.round(productRevenue + membershipRevenue + brandDeals + tips);
  };

  const features = [
    { icon: Store, title: "Creator Store", description: "Your link-in-bio storefront. Sell anything, anywhere." },
    { icon: Handshake, title: "Brand Deals", description: "Get discovered by brands looking for creators like you." },
    { icon: DollarSign, title: "Affiliate Sales", description: "Earn commissions on products you recommend." },
    { icon: Star, title: "Memberships", description: "Recurring revenue from your biggest fans." },
    { icon: Package, title: "Digital Products", description: "Sell ebooks, presets, courses, and more." },
    { icon: Coffee, title: "Tips", description: "Let fans support you with one-time tips." },
  ];

  const aiTools = [
    { icon: Lightbulb, title: "Content Idea Generator", description: "AI analyzes trends and suggests viral content ideas with virality scores." },
    { icon: PenTool, title: "Script & Caption Writer", description: "Generate scroll-stopping scripts and captions in your unique voice." },
    { icon: Image, title: "Thumbnail Generator", description: "AI-designed thumbnails that get clicks. A/B test variations." },
    { icon: BarChart3, title: "Analytics Interpreter", description: "Plain English insights from your complex analytics data." },
    { icon: Hash, title: "Hashtag Optimizer", description: "Perfect hashtag mix for maximum reach on each platform." },
    { icon: MessageSquare, title: "Comment Responder", description: "AI drafts replies in your voice to engage your community." },
  ];

  const testimonials = [
    {
      name: "Sarah Creates",
      handle: "@sarahcreates",
      platform: "Instagram",
      followers: "250K",
      quote: "I made $4,200 last month just from my CreatorFlow store. The AI tools helped me double my content output.",
      avatar: "https://images.pexels.com/photos/7676395/pexels-photo-7676395.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=100&w=100"
    },
    {
      name: "Tech With Mike",
      handle: "@techwithmike",
      platform: "YouTube",
      followers: "500K",
      quote: "Brands find ME now instead of me pitching them. I've landed 3 major sponsorships through the platform.",
      avatar: "https://images.pexels.com/photos/7676403/pexels-photo-7676403.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=100&w=100"
    },
    {
      name: "Fitness Jay",
      handle: "@fitnessjay",
      platform: "TikTok",
      followers: "180K",
      quote: "The analytics AI told me my videos were too long. I shortened them and engagement jumped 40%.",
      avatar: null
    },
    {
      name: "Design By Luna",
      handle: "@designbyluna",
      platform: "Instagram",
      followers: "90K",
      quote: "Sold my first preset pack and made $2,000 in a week. The store setup took 10 minutes.",
      avatar: null
    },
  ];

  const faqs = [
    {
      question: "Is CreatorFlow really free?",
      answer: "Yes! Our free plan includes your store, basic analytics, and brand deal access. Upgrade only when you need advanced features like unlimited AI generations or custom domains."
    },
    {
      question: "How do I get paid?",
      answer: "We use Stripe for secure, instant payouts. Withdraw to your bank account anytime once you hit the $50 minimum threshold."
    },
    {
      question: "What social platforms do you support?",
      answer: "We support YouTube, Instagram, TikTok, and X (Twitter). Connect all your accounts to show brands your full reach."
    },
    {
      question: "How do brand deals work?",
      answer: "Brands browse creators on our marketplace. When they like your profile, you'll get an offer notification. Accept, create content, get paid. We handle contracts and payment escrow."
    },
    {
      question: "Can I use my own domain?",
      answer: "Yes! Pro and Business plans let you connect a custom domain like yourname.com instead of creatorflow.link/yourname."
    },
    {
      question: "What AI tools are included?",
      answer: "Free users get 5 AI generations monthly. Pro and above get unlimited access to all tools: content ideas, scripts, captions, thumbnails, analytics insights, and more."
    },
    {
      question: "How do you compare to Linktree?",
      answer: "Linktree is just links. CreatorFlow is links + store + brand deals + AI tools + analytics. It's like comparing a bicycle to a Tesla."
    },
    {
      question: "Is my data safe?",
      answer: "100%. We use bank-level encryption and never sell your data. Your content and earnings information is always secure."
    },
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Creator store page",
        "3 digital products",
        "Basic analytics",
        "5 AI generations/month",
        "Brand deal applications",
        "creatorflow.link/username"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$15",
      period: "/month",
      description: "For growing creators",
      features: [
        "Everything in Free",
        "Unlimited products",
        "Custom domain",
        "Advanced analytics",
        "Unlimited AI tools",
        "Membership features",
        "Priority brand matching",
        "Remove branding"
      ],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Business",
      price: "$39",
      period: "/month",
      description: "For professional creators",
      features: [
        "Everything in Pro",
        "Voice cloning AI",
        "Video AI tools",
        "Priority support",
        "API access",
        "Team collaboration",
        "White-label options"
      ],
      cta: "Start Business Trial",
      popular: false
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For brands & agencies",
      features: [
        "Full brand dashboard",
        "Unlimited creator discovery",
        "Campaign management",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-creatorflow-bg text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
              <Sparkles className="w-7 h-7 text-primary" />
              <span className="text-xl font-heading font-bold">CreatorFlow</span>
            </Link>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted hover:text-white transition-colors">Features</a>
              <a href="#ai-tools" className="text-muted hover:text-white transition-colors">AI Tools</a>
              <a href="#pricing" className="text-muted hover:text-white transition-colors">Pricing</a>
              <a href="#faq" className="text-muted hover:text-white transition-colors">FAQ</a>
            </div>
            
            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Button 
                  onClick={() => navigate(user?.role === 'brand' ? '/brand/dashboard' : '/dashboard')}
                  className="btn-gradient"
                  data-testid="nav-dashboard"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/auth')}
                    className="text-white hover:bg-white/10"
                    data-testid="nav-signin"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="btn-gradient"
                    data-testid="nav-start-free"
                  >
                    Start Free
                  </Button>
                </>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-white/5 p-4">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-muted hover:text-white transition-colors">Features</a>
              <a href="#ai-tools" className="text-muted hover:text-white transition-colors">AI Tools</a>
              <a href="#pricing" className="text-muted hover:text-white transition-colors">Pricing</a>
              <a href="#faq" className="text-muted hover:text-white transition-colors">FAQ</a>
              <hr className="border-white/10" />
              {isAuthenticated ? (
                <Button onClick={() => navigate('/dashboard')} className="btn-gradient">
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/auth')} className="justify-start">
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/auth')} className="btn-gradient">
                    Start Free
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-[100px] animate-pulse-glow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse-glow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px]" />
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-slide-up">
              <span className="text-lg">🚀</span>
              <span className="text-sm text-muted">Trusted by 50,000+ creators</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              One Link.{' '}
              <span className="gradient-text">Infinite Income.</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Stop juggling 10 different tools. CreatorFlow gives you a storefront, brand deals, AI tools, and analytics — all in one powerful link.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Button 
                size="lg" 
                className="btn-gradient text-lg px-8 py-6 animate-glow"
                onClick={() => navigate('/auth')}
                data-testid="hero-start-free"
              >
                Start Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="btn-secondary text-lg px-8 py-6"
                data-testid="hero-watch-demo"
              >
                <Play className="mr-2 w-5 h-5" /> Watch Demo
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <p className="text-sm text-muted animate-slide-up" style={{ animationDelay: '0.4s' }}>
              No credit card required • Free forever plan • Setup in 2 minutes
            </p>
          </div>
          
          {/* Hero Visual - Phone Mockup with Floating Cards */}
          <div className="mt-16 relative max-w-4xl mx-auto">
            <div className="relative">
              {/* Phone Mockup */}
              <div className="mx-auto w-64 sm:w-80 glass rounded-[2.5rem] p-3 shadow-2xl border border-white/10">
                <div className="bg-creatorflow-card rounded-[2rem] overflow-hidden aspect-[9/16]">
                  {/* Mock Store Content */}
                  <div className="p-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4" />
                    <h3 className="font-heading font-bold text-lg">@sarahcreates</h3>
                    <p className="text-sm text-muted mb-6">Lifestyle creator & coach</p>
                    
                    <div className="space-y-3">
                      <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer">
                        <Youtube className="w-4 h-4 inline mr-2 text-red-500" />
                        <span className="text-sm">YouTube</span>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer">
                        <Instagram className="w-4 h-4 inline mr-2 text-pink-500" />
                        <span className="text-sm">Instagram</span>
                      </div>
                      <div className="bg-primary/20 border border-primary/50 rounded-lg p-3">
                        <Package className="w-4 h-4 inline mr-2 text-primary" />
                        <span className="text-sm font-medium">Shop My Products</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Earning Cards */}
              <div className="absolute -left-4 sm:left-10 top-20 glass rounded-xl p-4 animate-float shadow-neon-purple hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Monthly Earnings</p>
                    <p className="text-xl font-heading font-bold text-success">$2,500</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-4 sm:right-10 top-40 glass rounded-xl p-4 animate-float-delayed shadow-neon-cyan hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Handshake className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Brand Deal</p>
                    <p className="text-xl font-heading font-bold text-secondary">$8,000</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute left-10 sm:left-20 bottom-10 glass rounded-xl p-3 animate-float-slow hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">New Subscriber</p>
                    <p className="text-sm font-medium">+$9.99/mo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-12 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
            <div className="text-center">
              <p className="text-3xl font-heading font-bold gradient-text">50,000+</p>
              <p className="text-sm text-muted">Creators</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-heading font-bold gradient-text">$10M+</p>
              <p className="text-sm text-muted">Earned</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-heading font-bold gradient-text">500K+</p>
              <p className="text-sm text-muted">Products Sold</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-heading font-bold gradient-text">10,000+</p>
              <p className="text-sm text-muted">Brand Deals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-4">MONETIZATION</p>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
              6 Ways to Earn. <span className="gradient-text">One Platform.</span>
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              We built every monetization tool creators need
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="glass rounded-xl p-6 card-hover group"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-2">{feature.title}</h3>
                <p className="text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tools Section */}
      <section id="ai-tools" className="py-24 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-secondary text-sm font-bold uppercase tracking-[0.2em] mb-4">AI-POWERED</p>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
              Your <span className="text-glow-cyan">AI Creative Team</span>
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Write faster. Design smarter. Grow bigger.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiTools.map((tool, index) => (
              <div 
                key={index}
                className="glass rounded-xl p-6 card-hover group border border-secondary/10 hover:border-secondary/30"
                data-testid={`ai-tool-card-${index}`}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <tool.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-2">{tool.title}</h3>
                <p className="text-muted text-sm">{tool.description}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="btn-gradient"
              onClick={() => navigate('/auth')}
              data-testid="ai-tools-cta"
            >
              Try AI Tools Free <Sparkles className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-accent text-sm font-bold uppercase tracking-[0.2em] mb-4">GET STARTED</p>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
              Live in <span className="text-accent">3 Minutes</span>
            </h2>
            <p className="text-lg text-muted">Seriously. Set your timer.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, icon: Link2, title: "Connect", description: "Link your YouTube, Instagram, TikTok, and X. We pull your stats automatically." },
              { step: 2, icon: Palette, title: "Customize", description: "Drag and drop to add products, links, memberships. Make it yours." },
              { step: 3, icon: TrendingUp, title: "Earn", description: "Share your link. Get brand offers. Watch the earnings roll in." },
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-secondary/50" />
                )}
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6 relative z-10">
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-creatorflow-bg border-2 border-primary flex items-center justify-center font-heading font-bold text-sm">
                  {item.step}
                </div>
                <h3 className="text-2xl font-heading font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Brands Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-secondary/5 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-secondary text-sm font-bold uppercase tracking-[0.2em] mb-4">FOR BRANDS</p>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
              Find Your <span className="text-glow-cyan">Perfect Creators</span>
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              AI-powered influencer marketing that actually works
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { title: "Smart Matching", description: "AI finds creators whose audience matches your target customer" },
              { title: "Verified Analytics", description: "No fake followers. We verify every creator's real engagement." },
              { title: "Secure Payments", description: "Escrow protection. Pay only when content delivers." },
              { title: "Performance Tracking", description: "Real-time campaign analytics. Know your ROI instantly." },
            ].map((item, index) => (
              <div key={index} className="glass rounded-xl p-6 card-hover">
                <h3 className="text-lg font-heading font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted">{item.description}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              size="lg" 
              className="btn-gradient"
              onClick={() => navigate('/auth')}
              data-testid="brands-cta"
            >
              Find Creators for Your Brand <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-4">PRICING</p>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
              Start Free. <span className="gradient-text">Scale When Ready.</span>
            </h2>
            <p className="text-lg text-muted">No hidden fees. No contracts. Cancel anytime.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`glass rounded-xl p-6 relative ${plan.popular ? 'border-2 border-primary shadow-neon-purple' : 'border border-white/5'}`}
                data-testid={`pricing-plan-${plan.name.toLowerCase()}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full text-xs font-bold">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-heading font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-heading font-bold">{plan.price}</span>
                    <span className="text-muted">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted mt-2">{plan.description}</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${plan.popular ? 'btn-gradient' : 'btn-secondary'}`}
                  onClick={() => navigate('/auth')}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-4">TESTIMONIALS</p>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold">
              Creators <span className="gradient-text">Love CreatorFlow</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="glass rounded-xl p-6 card-hover" data-testid={`testimonial-${index}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary overflow-hidden">
                    {testimonial.avatar ? (
                      <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-heading font-bold">{testimonial.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <span>{testimonial.handle}</span>
                      <span>•</span>
                      <span>{testimonial.followers} followers</span>
                    </div>
                  </div>
                </div>
                <p className="text-muted italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-secondary text-sm font-bold uppercase tracking-[0.2em] mb-4">CALCULATOR</p>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
              See Your <span className="text-glow-cyan">Earning Potential</span>
            </h2>
            <p className="text-lg text-muted">Slide to calculate how much you could make</p>
          </div>
          
          <div className="glass rounded-2xl p-8" data-testid="earnings-calculator">
            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-muted">Follower Count</span>
                  <span className="font-heading font-bold">{followers[0].toLocaleString()}</span>
                </div>
                <Slider
                  value={followers}
                  onValueChange={setFollowers}
                  max={1000000}
                  min={1000}
                  step={1000}
                  className="[&_[role=slider]]:bg-primary"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-muted">Products to Sell</span>
                  <span className="font-heading font-bold">{products[0]}</span>
                </div>
                <Slider
                  value={products}
                  onValueChange={setProducts}
                  max={20}
                  min={1}
                  step={1}
                  className="[&_[role=slider]]:bg-secondary"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-muted">Membership Price</span>
                  <span className="font-heading font-bold">${membershipPrice[0]}/mo</span>
                </div>
                <Slider
                  value={membershipPrice}
                  onValueChange={setMembershipPrice}
                  max={100}
                  min={5}
                  step={5}
                  className="[&_[role=slider]]:bg-accent"
                />
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <p className="text-muted mb-2">Estimated Monthly Earnings</p>
              <p className="text-5xl font-heading font-bold gradient-text">
                ${calculateEarnings().toLocaleString()}
              </p>
              <p className="text-muted mt-2">= ${(calculateEarnings() * 12).toLocaleString()}/year</p>
              
              <Button 
                size="lg" 
                className="btn-gradient mt-6"
                onClick={() => navigate('/auth')}
                data-testid="calculator-cta"
              >
                Start Earning This <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-4">FAQ</p>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold">
              Questions? <span className="gradient-text">Answers.</span>
            </h2>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`faq-${index}`}
                className="glass rounded-xl border-none px-6"
                data-testid={`faq-item-${index}`}
              >
                <AccordionTrigger className="text-left font-heading font-medium hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-6">
            Ready to Turn Your Audience Into <span className="gradient-text">Income?</span>
          </h2>
          <p className="text-lg text-muted mb-8">
            Join 50,000+ creators already earning on CreatorFlow
          </p>
          <Button 
            size="lg" 
            className="bg-white text-creatorflow-bg hover:bg-white/90 text-lg px-10 py-7 rounded-full font-bold animate-glow"
            onClick={() => navigate('/auth')}
            data-testid="final-cta"
          >
            Create Your Free Store <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-sm text-muted mt-4">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="text-lg font-heading font-bold">CreatorFlow</span>
              </Link>
              <p className="text-sm text-muted mb-4">One Link. Infinite Income.</p>
              <div className="flex gap-4">
                <a href="#" className="text-muted hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted hover:text-white transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            {/* Product */}
            <div>
              <h4 className="font-heading font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Creator Store</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Brand Marketplace</a></li>
                <li><a href="#ai-tools" className="hover:text-white transition-colors">AI Tools</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h4 className="font-heading font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Creator Academy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h4 className="font-heading font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h4 className="font-heading font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted">© 2026 CreatorFlow. All rights reserved.</p>
            <p className="text-sm text-muted">Made with 💜 for creators</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
