import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { 
  Sparkles, LayoutDashboard, Store, Package, Star, Handshake, 
  Wand2, BarChart3, MessageSquare, Wallet, Settings, HelpCircle,
  ChevronLeft, ChevronRight, TrendingUp, Eye, ShoppingBag, Briefcase,
  Plus, PenTool, Mail, ArrowUpRight, ExternalLink, Copy, Share2,
  Youtube, Instagram, Twitter, LogOut, Bell, Search, DollarSign
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Seed database first
      await api.post('/seed').catch(() => {});
      
      const [analyticsRes, revenueRes, activityRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/revenue?period=30d'),
        api.get('/analytics/activity')
      ]);
      
      setAnalytics(analyticsRes.data);
      setRevenueData(revenueRes.data.data);
      setActivities(activityRes.data);
      
      // Get creator profile
      const creatorsRes = await api.get(`/creators/${user?.username}`).catch(() => null);
      if (creatorsRes?.data) {
        setCreatorProfile(creatorsRes.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const copyStoreLink = () => {
    const link = `${window.location.origin}/store/${user?.username || 'username'}`;
    navigator.clipboard.writeText(link);
    toast.success('Store link copied!');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: true },
    { icon: Store, label: 'My Store', path: '/store-builder' },
    { icon: Package, label: 'Products', path: '/dashboard' },
    { icon: Star, label: 'Memberships', path: '/dashboard' },
    { icon: Handshake, label: 'Brand Deals', path: '/dashboard' },
    { icon: Wand2, label: 'AI Tools', path: '/ai-tools' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard' },
    { icon: MessageSquare, label: 'Messages', path: '/dashboard' },
    { icon: Wallet, label: 'Payouts', path: '/dashboard' },
  ];

  const statsCards = [
    { 
      label: 'Total Earnings', 
      value: `$${analytics?.total_earnings?.toLocaleString() || '0'}`, 
      change: analytics?.earnings_change || 0,
      icon: DollarSign,
      color: 'text-success'
    },
    { 
      label: 'Store Visitors', 
      value: analytics?.store_visitors?.toLocaleString() || '0', 
      change: analytics?.visitors_change || 0,
      icon: Eye,
      color: 'text-secondary'
    },
    { 
      label: 'Products Sold', 
      value: analytics?.products_sold || '0', 
      change: analytics?.sales_change || 0,
      icon: ShoppingBag,
      color: 'text-primary'
    },
    { 
      label: 'Brand Offers', 
      value: analytics?.brand_offers || '0', 
      subtext: `${analytics?.new_offers || 0} new`,
      icon: Briefcase,
      color: 'text-accent'
    },
  ];

  const quickActions = [
    { icon: Plus, label: 'Add Product', description: 'Upload a new digital product', onClick: () => navigate('/store-builder') },
    { icon: PenTool, label: 'Create Post', description: 'Schedule content with AI', onClick: () => navigate('/ai-tools') },
    { icon: Mail, label: 'View Offers', description: `${analytics?.new_offers || 0} new brand offers`, badge: analytics?.new_offers },
    { icon: Wand2, label: 'AI Writer', description: 'Generate content instantly', onClick: () => navigate('/ai-tools') },
    { icon: BarChart3, label: 'Check Analytics', description: "See what's working" },
    { icon: Wallet, label: 'Withdraw Funds', description: `$${analytics?.total_earnings?.toLocaleString() || '0'} available` },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-lg p-3 text-sm">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-muted" style={{ color: entry.color }}>
              {entry.name}: ${entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
        {/* Logo */}
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
            data-testid="sidebar-toggle"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                item.active 
                  ? 'bg-primary/20 text-primary' 
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`}
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>
        
        {/* Bottom Section */}
        <div className="p-4 border-t border-white/5 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-all"
          >
            <Settings className="w-5 h-5" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Settings</span>}
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-all"
          >
            <HelpCircle className="w-5 h-5" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Help & Support</span>}
          </Link>
          
          {!sidebarCollapsed && (
            <button className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
              Upgrade to Pro
            </button>
          )}
          
          {/* Profile */}
          <div className="flex items-center gap-3 px-3 py-3 mt-4 bg-creatorflow-card/50 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted truncate">@{user?.username}</p>
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
              <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
              <p className="text-sm text-muted">Welcome back, {user?.name?.split(' ')[0] || 'Creator'}!</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input 
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-creatorflow-card/50 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary w-64"
                />
              </div>
              <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors" data-testid="notifications-btn">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats Row */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((stat, index) => (
              <div 
                key={index}
                className="glass rounded-xl p-5 card-hover"
                data-testid={`stat-card-${index}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted mb-1">{stat.label}</p>
                    <p className="text-3xl font-heading font-bold">{stat.value}</p>
                    {stat.change !== undefined && (
                      <p className={`text-sm mt-1 flex items-center gap-1 ${stat.change >= 0 ? 'text-success' : 'text-accent'}`}>
                        <TrendingUp className="w-4 h-4" />
                        {stat.change >= 0 ? '+' : ''}{stat.change}%
                      </p>
                    )}
                    {stat.subtext && (
                      <p className="text-sm text-muted mt-1">{stat.subtext}</p>
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Chart & Quick Actions */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 glass rounded-xl p-6" data-testid="revenue-chart">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-heading font-bold">Revenue Overview</h2>
                <div className="flex gap-2">
                  {['7D', '30D', '90D'].map((period) => (
                    <button 
                      key={period}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        period === '30D' ? 'bg-primary/20 text-primary' : 'text-muted hover:bg-white/10'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMemberships" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00D9FF" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBrandDeals" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#8A8AA3" tick={{ fill: '#8A8AA3', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis stroke="#8A8AA3" tick={{ fill: '#8A8AA3', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="products" name="Products" stroke="#6C5CE7" fillOpacity={1} fill="url(#colorProducts)" strokeWidth={2} />
                    <Area type="monotone" dataKey="memberships" name="Memberships" stroke="#00D9FF" fillOpacity={1} fill="url(#colorMemberships)" strokeWidth={2} />
                    <Area type="monotone" dataKey="brand_deals" name="Brand Deals" stroke="#FF6B6B" fillOpacity={1} fill="url(#colorBrandDeals)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-heading font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-creatorflow-card/50 hover:bg-creatorflow-card transition-colors text-left group"
                    data-testid={`quick-action-${index}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <action.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{action.label}</p>
                      <p className="text-xs text-muted truncate">{action.description}</p>
                    </div>
                    {action.badge && (
                      <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full">
                        {action.badge}
                      </span>
                    )}
                    <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-white transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Feed & Store Preview & Platforms */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="glass rounded-xl p-6" data-testid="activity-feed">
              <h2 className="text-lg font-heading font-bold mb-4">Recent Activity</h2>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b border-white/5 last:border-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      activity.type === 'sale' ? 'bg-success/20 text-success' :
                      activity.type === 'subscriber' ? 'bg-primary/20 text-primary' :
                      activity.type === 'offer' ? 'bg-secondary/20 text-secondary' :
                      activity.type === 'tip' ? 'bg-accent/20 text-accent' :
                      'bg-white/10 text-white'
                    }`}>
                      {activity.type === 'sale' ? '🛒' :
                       activity.type === 'subscriber' ? '⭐' :
                       activity.type === 'offer' ? '🤝' :
                       activity.type === 'tip' ? '💝' :
                       activity.type === 'milestone' ? '📊' : '💬'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.message}</p>
                      {activity.amount && (
                        <p className="text-sm font-medium text-success mt-0.5">+${activity.amount.toFixed(2)}</p>
                      )}
                      <p className="text-xs text-muted mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Store Preview */}
            <div className="glass rounded-xl p-6" data-testid="store-preview">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-bold">My Store</h2>
                <Link to={`/store/${user?.username}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                  Preview <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              
              <div className="bg-creatorflow-card rounded-xl p-4 mb-4">
                {/* Mini Store Preview */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-3 overflow-hidden">
                    {creatorProfile?.avatar ? (
                      <img src={creatorProfile.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                        {user?.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <p className="font-heading font-bold">@{user?.username}</p>
                  <p className="text-xs text-muted mt-1">creatorflow.link/{user?.username}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <div>
                  <p className="text-lg font-heading font-bold">{analytics?.store_visitors || 0}</p>
                  <p className="text-xs text-muted">Visits today</p>
                </div>
                <div>
                  <p className="text-lg font-heading font-bold">{analytics?.conversion_rate || 0}%</p>
                  <p className="text-xs text-muted">Conversion</p>
                </div>
                <div>
                  <p className="text-lg font-heading font-bold">8</p>
                  <p className="text-xs text-muted">Products</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 btn-gradient"
                  onClick={() => navigate('/store-builder')}
                  data-testid="edit-store-btn"
                >
                  Edit Store
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="px-3"
                  onClick={copyStoreLink}
                  data-testid="copy-link-btn"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="px-3">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Connected Platforms */}
            <div className="glass rounded-xl p-6" data-testid="connected-platforms">
              <h2 className="text-lg font-heading font-bold mb-4">Connected Accounts</h2>
              <div className="space-y-3">
                {[
                  { name: 'YouTube', icon: Youtube, color: 'text-red-500', followers: creatorProfile?.follower_stats?.youtube || 0, connected: true },
                  { name: 'Instagram', icon: Instagram, color: 'text-pink-500', followers: creatorProfile?.follower_stats?.instagram || 0, connected: true },
                  { name: 'TikTok', icon: () => <span className="text-lg">📱</span>, followers: creatorProfile?.follower_stats?.tiktok || 0, connected: true },
                  { name: 'X / Twitter', icon: Twitter, color: 'text-white', followers: creatorProfile?.follower_stats?.twitter || 0, connected: false },
                ].map((platform, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-creatorflow-card/50 rounded-lg">
                    <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${platform.color}`}>
                      {typeof platform.icon === 'function' ? <platform.icon /> : <platform.icon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{platform.name}</p>
                      {platform.connected ? (
                        <p className="text-xs text-muted">{platform.followers.toLocaleString()} followers</p>
                      ) : (
                        <p className="text-xs text-muted">Not connected</p>
                      )}
                    </div>
                    {platform.connected ? (
                      <span className="text-xs text-success">✓ Connected</span>
                    ) : (
                      <Button size="sm" variant="outline" className="text-xs">Connect</Button>
                    )}
                  </div>
                ))}
              </div>
              
              <Button variant="ghost" className="w-full mt-4 text-sm text-muted hover:text-white">
                Manage Connections
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatorDashboard;
