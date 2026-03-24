import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import {
  Sparkles, LayoutDashboard, Users, Megaphone, BarChart3, MessageSquare,
  Settings, HelpCircle, ChevronLeft, ChevronRight, Search, Bell, LogOut,
  Plus, Filter, Eye, TrendingUp, DollarSign, Target, Check, X,
  Youtube, Instagram, Twitter, ExternalLink, Send
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

const BrandDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [creators, setCreators] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    brief: '',
    budget: '',
    target_niche: '',
    target_followers_min: 1000,
    target_followers_max: 1000000
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Seed database first
      await api.post('/seed').catch(() => {});
      
      const [creatorsRes, campaignsRes, dealsRes] = await Promise.all([
        api.get('/creators'),
        api.get('/campaigns'),
        api.get('/deals')
      ]);
      
      setCreators(creatorsRes.data);
      setCampaigns(campaignsRes.data);
      setDeals(dealsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const createCampaign = async (e) => {
    e.preventDefault();
    try {
      await api.post('/campaigns', {
        ...newCampaign,
        budget: parseFloat(newCampaign.budget)
      });
      toast.success('Campaign created!');
      setShowCampaignDialog(false);
      setNewCampaign({ title: '', brief: '', budget: '', target_niche: '', target_followers_min: 1000, target_followers_max: 1000000 });
      fetchData();
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  const sendOffer = async (creator) => {
    if (campaigns.length === 0) {
      toast.error('Create a campaign first');
      return;
    }
    
    try {
      await api.post('/deals', {
        campaign_id: campaigns[0].id,
        creator_id: creator.user_id,
        payment_amount: 500,
        deliverables: ['1 Instagram post', '1 Story']
      });
      toast.success(`Offer sent to ${creator.display_name}!`);
      fetchData();
    } catch (error) {
      toast.error('Failed to send offer');
    }
  };

  const filteredCreators = creators.filter(creator => {
    const matchesSearch = creator.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          creator.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNiche = !selectedNiche || creator.niche?.toLowerCase() === selectedNiche.toLowerCase();
    return matchesSearch && matchesNiche;
  });

  const getTotalFollowers = (stats) => {
    return Object.values(stats || {}).reduce((a, b) => a + b, 0);
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Users, label: 'Find Creators' },
    { icon: Megaphone, label: 'Campaigns' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: MessageSquare, label: 'Messages' },
  ];

  const niches = ['Tech', 'Lifestyle', 'Fitness', 'Design', 'Gaming', 'Food', 'Travel'];

  if (loading) {
    return (
      <div className="min-h-screen bg-creatorflow-bg flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creatorflow-bg flex">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full ${sidebarCollapsed ? 'w-20' : 'w-64'} glass border-r border-white/5 flex flex-col transition-all duration-300 z-50`}>
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          {!sidebarCollapsed && (
            <Link to="/" className="flex items-center gap-2" data-testid="sidebar-logo">
              <Sparkles className="w-7 h-7 text-primary" />
              <span className="text-lg font-heading font-bold">CreatorFlow</span>
            </Link>
          )}
          {sidebarCollapsed && <Sparkles className="w-7 h-7 text-primary mx-auto" />}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                item.active 
                  ? 'bg-primary/20 text-primary' 
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/5 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-all">
            <Settings className="w-5 h-5" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Settings</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-all">
            <HelpCircle className="w-5 h-5" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Help</span>}
          </button>
          
          <div className="flex items-center gap-3 px-3 py-3 mt-4 bg-creatorflow-card/50 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0) || 'B'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted">Brand Account</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button 
                onClick={handleLogout}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4 text-muted" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 glass border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-heading font-bold">Brand Dashboard</h1>
              <p className="text-sm text-muted">Find and collaborate with creators</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Row */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Active Campaigns', value: campaigns.length, icon: Megaphone, color: 'text-primary' },
              { label: 'Creators Contacted', value: deals.length, icon: Users, color: 'text-secondary' },
              { label: 'Total Budget', value: `$${campaigns.reduce((a, c) => a + c.budget, 0).toLocaleString()}`, icon: DollarSign, color: 'text-success' },
              { label: 'Pending Deals', value: deals.filter(d => d.status === 'pending').length, icon: Target, color: 'text-accent' },
            ].map((stat, index) => (
              <div key={index} className="glass rounded-xl p-5 card-hover">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted mb-1">{stat.label}</p>
                    <p className="text-3xl font-heading font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Campaigns Section */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-heading font-bold">My Campaigns</h2>
              <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
                <DialogTrigger asChild>
                  <Button className="btn-gradient" data-testid="create-campaign-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    New Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass border-white/10">
                  <DialogHeader>
                    <DialogTitle>Create New Campaign</DialogTitle>
                    <DialogDescription>
                      Set up a new influencer marketing campaign
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={createCampaign} className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="campaign-title">Campaign Title</Label>
                      <Input
                        id="campaign-title"
                        value={newCampaign.title}
                        onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                        className="input-glass mt-1"
                        placeholder="Product Launch Campaign"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="campaign-brief">Brief</Label>
                      <Textarea
                        id="campaign-brief"
                        value={newCampaign.brief}
                        onChange={(e) => setNewCampaign({ ...newCampaign, brief: e.target.value })}
                        className="input-glass mt-1"
                        placeholder="Describe what you're looking for..."
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="campaign-budget">Budget ($)</Label>
                        <Input
                          id="campaign-budget"
                          type="number"
                          value={newCampaign.budget}
                          onChange={(e) => setNewCampaign({ ...newCampaign, budget: e.target.value })}
                          className="input-glass mt-1"
                          placeholder="1000"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="campaign-niche">Target Niche</Label>
                        <select
                          id="campaign-niche"
                          value={newCampaign.target_niche}
                          onChange={(e) => setNewCampaign({ ...newCampaign, target_niche: e.target.value })}
                          className="w-full input-glass mt-1"
                        >
                          <option value="">Any Niche</option>
                          {niches.map(niche => (
                            <option key={niche} value={niche}>{niche}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <Button type="submit" className="w-full btn-gradient">
                      Create Campaign
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {campaigns.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No campaigns yet. Create your first campaign to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center gap-4 p-4 bg-creatorflow-card/50 rounded-lg">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Megaphone className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{campaign.title}</h3>
                      <p className="text-sm text-muted line-clamp-1">{campaign.brief}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success">${campaign.budget}</p>
                      <p className="text-xs text-muted">{campaign.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Creator Discovery */}
          <div className="glass rounded-xl p-6" data-testid="creator-discovery">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-heading font-bold">Discover Creators</h2>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <Input
                    placeholder="Search creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-glass pl-10 w-full sm:w-64"
                    data-testid="search-creators"
                  />
                </div>
                <select
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="input-glass px-4 py-2"
                >
                  <option value="">All Niches</option>
                  {niches.map(niche => (
                    <option key={niche} value={niche}>{niche}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCreators.map((creator) => (
                <div 
                  key={creator.id}
                  className="bg-creatorflow-card/50 rounded-xl p-4 card-hover"
                  data-testid={`creator-card-${creator.username}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      {creator.avatar ? (
                        <img src={creator.avatar} alt={creator.display_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-white">{creator.display_name?.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{creator.display_name}</h3>
                        {creator.is_verified && (
                          <Check className="w-4 h-4 text-secondary" />
                        )}
                      </div>
                      <p className="text-sm text-muted">@{creator.username}</p>
                      {creator.niche && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                          {creator.niche}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                    {Object.entries(creator.follower_stats || {}).map(([platform, count]) => (
                      <div key={platform}>
                        <p className="text-sm font-bold">{(count / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-muted capitalize">{platform.slice(0, 2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <p className="text-sm text-muted flex-1">
                      {getTotalFollowers(creator.follower_stats).toLocaleString()} total followers
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link 
                      to={`/store/${creator.username}`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      className="flex-1 btn-gradient"
                      onClick={() => sendOffer(creator)}
                      data-testid={`send-offer-${creator.username}`}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Send Offer
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredCreators.length === 0 && (
              <div className="text-center py-12 text-muted">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No creators found matching your criteria</p>
              </div>
            )}
          </div>

          {/* Active Deals */}
          {deals.length > 0 && (
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-heading font-bold mb-4">Active Deals</h2>
              <div className="space-y-3">
                {deals.map((deal) => {
                  const creator = creators.find(c => c.user_id === deal.creator_id);
                  return (
                    <div key={deal.id} className="flex items-center gap-4 p-4 bg-creatorflow-card/50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                        {creator?.display_name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{creator?.display_name || 'Unknown Creator'}</p>
                        <p className="text-sm text-muted">{deal.deliverables?.join(', ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success">${deal.payment_amount}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          deal.status === 'pending' ? 'bg-warning/20 text-warning' :
                          deal.status === 'active' ? 'bg-success/20 text-success' :
                          'bg-muted/20 text-muted'
                        }`}>
                          {deal.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BrandDashboard;
