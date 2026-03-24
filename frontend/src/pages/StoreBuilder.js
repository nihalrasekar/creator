import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import {
  Sparkles, ArrowLeft, Save, Eye, Smartphone, Tablet, Monitor,
  Link2, Package, Star, Coffee, Image, Type, Mail, GripVertical,
  Plus, Trash2, ChevronUp, ChevronDown, ExternalLink, Settings
} from 'lucide-react';

const StoreBuilder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [devicePreview, setDevicePreview] = useState('mobile');
  const [theme, setTheme] = useState({ background: '#0D0D1A', accent: '#6C5CE7' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      const response = await api.get('/store');
      if (response.data) {
        setStore(response.data);
        setSections(response.data.sections || []);
        setTheme(response.data.theme || { background: '#0D0D1A', accent: '#6C5CE7' });
      }
    } catch (error) {
      console.error('Error fetching store:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveStore = async () => {
    setSaving(true);
    try {
      await api.put('/store', { sections, theme });
      toast.success('Store saved successfully!');
    } catch (error) {
      toast.error('Failed to save store');
    } finally {
      setSaving(false);
    }
  };

  const publishStore = async () => {
    setSaving(true);
    try {
      await api.post('/store/publish');
      await saveStore();
      toast.success('Store published!');
    } catch (error) {
      toast.error('Failed to publish store');
    } finally {
      setSaving(false);
    }
  };

  const addSection = (type) => {
    const newSection = {
      id: Date.now().toString(),
      type,
      title: getSectionTitle(type),
      content: {},
      order: sections.length
    };
    setSections([...sections, newSection]);
    setSelectedSection(newSection);
  };

  const getSectionTitle = (type) => {
    const titles = {
      bio: 'About Me',
      social_links: 'Follow Me',
      links: 'My Links',
      products: 'My Products',
      membership: 'Membership',
      tip_jar: 'Support Me',
      image: 'Image',
      text: 'Text Block',
      email_signup: 'Newsletter'
    };
    return titles[type] || 'New Section';
  };

  const updateSection = (id, updates) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
    if (selectedSection?.id === id) {
      setSelectedSection({ ...selectedSection, ...updates });
    }
  };

  const deleteSection = (id) => {
    setSections(sections.filter(s => s.id !== id));
    if (selectedSection?.id === id) {
      setSelectedSection(null);
    }
  };

  const moveSection = (id, direction) => {
    const index = sections.findIndex(s => s.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) return;

    const newSections = [...sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    setSections(newSections);
  };

  const componentLibrary = [
    { type: 'bio', icon: Type, label: 'Bio', category: 'Content' },
    { type: 'social_links', icon: Link2, label: 'Social Links', category: 'Links' },
    { type: 'links', icon: Link2, label: 'Custom Links', category: 'Links' },
    { type: 'products', icon: Package, label: 'Products', category: 'Monetization' },
    { type: 'membership', icon: Star, label: 'Membership', category: 'Monetization' },
    { type: 'tip_jar', icon: Coffee, label: 'Tip Jar', category: 'Monetization' },
    { type: 'image', icon: Image, label: 'Image', category: 'Content' },
    { type: 'email_signup', icon: Mail, label: 'Email Signup', category: 'Engagement' },
  ];

  const previewWidth = devicePreview === 'mobile' ? 'w-[375px]' : devicePreview === 'tablet' ? 'w-[768px]' : 'w-full max-w-4xl';

  if (loading) {
    return (
      <div className="min-h-screen bg-creatorflow-bg flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted">Loading store builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creatorflow-bg flex flex-col">
      {/* Top Bar */}
      <header className="glass border-b border-white/5 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            data-testid="back-to-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-px bg-white/10" />
          <h1 className="text-lg font-heading font-bold">Store Editor</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 p-1 bg-creatorflow-card rounded-lg">
            <button
              onClick={() => setDevicePreview('mobile')}
              className={`p-2 rounded ${devicePreview === 'mobile' ? 'bg-primary/20 text-primary' : 'text-muted hover:text-white'}`}
              data-testid="preview-mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevicePreview('tablet')}
              className={`p-2 rounded ${devicePreview === 'tablet' ? 'bg-primary/20 text-primary' : 'text-muted hover:text-white'}`}
              data-testid="preview-tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevicePreview('desktop')}
              className={`p-2 rounded ${devicePreview === 'desktop' ? 'bg-primary/20 text-primary' : 'text-muted hover:text-white'}`}
              data-testid="preview-desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>

          <Link 
            to={`/store/${user?.username}`}
            target="_blank"
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-white transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
            <ExternalLink className="w-3 h-3" />
          </Link>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={saveStore}
            disabled={saving}
            data-testid="save-store"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button 
            size="sm" 
            className="btn-gradient"
            onClick={publishStore}
            disabled={saving}
            data-testid="publish-store"
          >
            Publish
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Components */}
        <aside className="w-64 border-r border-white/5 p-4 overflow-y-auto hidden lg:block">
          <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">Add Sections</h2>
          
          {['Links', 'Monetization', 'Content', 'Engagement'].map(category => (
            <div key={category} className="mb-6">
              <h3 className="text-xs font-medium text-muted mb-2">{category}</h3>
              <div className="space-y-2">
                {componentLibrary
                  .filter(c => c.category === category)
                  .map(component => (
                    <button
                      key={component.type}
                      onClick={() => addSection(component.type)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-creatorflow-card/50 hover:bg-creatorflow-card transition-colors text-left group"
                      data-testid={`add-${component.type}`}
                    >
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <component.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm">{component.label}</span>
                      <Plus className="w-4 h-4 text-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Center - Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a12] flex justify-center">
          <div className={`${previewWidth} transition-all duration-300`}>
            {/* Phone Frame */}
            <div className={`${devicePreview === 'mobile' ? 'bg-creatorflow-card rounded-[2.5rem] p-3 shadow-2xl border border-white/10' : ''}`}>
              <div className={`bg-creatorflow-bg ${devicePreview === 'mobile' ? 'rounded-[2rem]' : 'rounded-xl'} overflow-hidden min-h-[600px]`} style={{ backgroundColor: theme.background }}>
                {/* Profile Header */}
                <div className="p-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <h2 className="text-xl font-heading font-bold">@{user?.username}</h2>
                  <p className="text-sm text-muted mt-1">Creator & Digital Product Expert</p>
                </div>

                {/* Sections */}
                <div className="px-4 pb-6 space-y-4">
                  {sections.map((section, index) => (
                    <div
                      key={section.id}
                      onClick={() => setSelectedSection(section)}
                      className={`relative group cursor-pointer rounded-xl transition-all ${
                        selectedSection?.id === section.id 
                          ? 'ring-2 ring-primary' 
                          : 'hover:ring-2 hover:ring-white/20'
                      }`}
                    >
                      {/* Section Controls */}
                      <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up'); }}
                          className="p-1 bg-creatorflow-card rounded hover:bg-white/10"
                          disabled={index === 0}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down'); }}
                          className="p-1 bg-creatorflow-card rounded hover:bg-white/10"
                          disabled={index === sections.length - 1}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Section Content Preview */}
                      {section.type === 'bio' && (
                        <div className="p-4 bg-creatorflow-card/50 rounded-xl">
                          <h3 className="font-medium mb-2">{section.title}</h3>
                          <p className="text-sm text-muted">{section.content?.text || 'Add your bio here...'}</p>
                        </div>
                      )}

                      {section.type === 'social_links' && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium mb-2">{section.title}</p>
                          <div className="flex justify-center gap-3">
                            {['youtube', 'instagram', 'tiktok', 'twitter'].map(platform => (
                              <div key={platform} className="w-10 h-10 rounded-full bg-creatorflow-card flex items-center justify-center text-muted">
                                {platform.charAt(0).toUpperCase()}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {section.type === 'links' && (
                        <div className="space-y-2">
                          <div className="p-3 bg-creatorflow-card/50 rounded-lg text-center text-sm">
                            {section.content?.url ? section.content.label || 'Custom Link' : 'Add custom link...'}
                          </div>
                        </div>
                      )}

                      {section.type === 'products' && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium mb-2">{section.title}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {[1, 2].map(i => (
                              <div key={i} className="p-3 bg-creatorflow-card/50 rounded-lg">
                                <div className="w-full aspect-square bg-creatorflow-card rounded mb-2" />
                                <p className="text-xs truncate">Product {i}</p>
                                <p className="text-xs text-primary">$29</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {section.type === 'membership' && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium mb-2">{section.title}</p>
                          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                            <p className="font-medium">Pro Membership</p>
                            <p className="text-2xl font-bold text-primary mt-1">$9.99<span className="text-sm text-muted">/mo</span></p>
                            <p className="text-xs text-muted mt-2">Exclusive content & perks</p>
                          </div>
                        </div>
                      )}

                      {section.type === 'tip_jar' && (
                        <div className="p-4 bg-creatorflow-card/50 rounded-xl text-center">
                          <Coffee className="w-8 h-8 mx-auto mb-2 text-accent" />
                          <p className="font-medium">{section.title}</p>
                          <div className="flex justify-center gap-2 mt-3">
                            {['$5', '$10', '$25'].map(amount => (
                              <button key={amount} className="px-4 py-2 bg-accent/20 text-accent rounded-full text-sm hover:bg-accent/30 transition-colors">
                                {amount}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {section.type === 'email_signup' && (
                        <div className="p-4 bg-creatorflow-card/50 rounded-xl">
                          <p className="font-medium mb-2">{section.title}</p>
                          <div className="flex gap-2">
                            <input 
                              type="email" 
                              placeholder="Enter your email" 
                              className="flex-1 px-3 py-2 bg-creatorflow-card rounded text-sm"
                              disabled
                            />
                            <button className="px-4 py-2 bg-primary rounded text-sm">Subscribe</button>
                          </div>
                        </div>
                      )}

                      {section.type === 'image' && (
                        <div className="aspect-video bg-creatorflow-card/50 rounded-xl flex items-center justify-center">
                          <Image className="w-8 h-8 text-muted" />
                        </div>
                      )}
                    </div>
                  ))}

                  {sections.length === 0 && (
                    <div className="text-center py-12 text-muted">
                      <p>Add sections from the left panel</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Settings */}
        <aside className="w-80 border-l border-white/5 p-4 overflow-y-auto hidden lg:block">
          {selectedSection ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold">Edit Section</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-accent hover:text-accent/80"
                  onClick={() => deleteSection(selectedSection.id)}
                  data-testid="delete-section"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="section-title">Section Title</Label>
                  <Input
                    id="section-title"
                    value={selectedSection.title}
                    onChange={(e) => updateSection(selectedSection.id, { title: e.target.value })}
                    className="input-glass mt-1"
                  />
                </div>

                {selectedSection.type === 'bio' && (
                  <div>
                    <Label htmlFor="bio-text">Bio Text</Label>
                    <Textarea
                      id="bio-text"
                      value={selectedSection.content?.text || ''}
                      onChange={(e) => updateSection(selectedSection.id, { 
                        content: { ...selectedSection.content, text: e.target.value } 
                      })}
                      className="input-glass mt-1"
                      rows={4}
                      placeholder="Write something about yourself..."
                    />
                  </div>
                )}

                {selectedSection.type === 'links' && (
                  <>
                    <div>
                      <Label htmlFor="link-label">Link Label</Label>
                      <Input
                        id="link-label"
                        value={selectedSection.content?.label || ''}
                        onChange={(e) => updateSection(selectedSection.id, { 
                          content: { ...selectedSection.content, label: e.target.value } 
                        })}
                        className="input-glass mt-1"
                        placeholder="My Website"
                      />
                    </div>
                    <div>
                      <Label htmlFor="link-url">URL</Label>
                      <Input
                        id="link-url"
                        value={selectedSection.content?.url || ''}
                        onChange={(e) => updateSection(selectedSection.id, { 
                          content: { ...selectedSection.content, url: e.target.value } 
                        })}
                        className="input-glass mt-1"
                        placeholder="https://"
                      />
                    </div>
                  </>
                )}

                {selectedSection.type === 'membership' && (
                  <>
                    <div>
                      <Label htmlFor="membership-name">Membership Name</Label>
                      <Input
                        id="membership-name"
                        value={selectedSection.content?.name || ''}
                        onChange={(e) => updateSection(selectedSection.id, { 
                          content: { ...selectedSection.content, name: e.target.value } 
                        })}
                        className="input-glass mt-1"
                        placeholder="Pro Membership"
                      />
                    </div>
                    <div>
                      <Label htmlFor="membership-price">Price ($/month)</Label>
                      <Input
                        id="membership-price"
                        type="number"
                        value={selectedSection.content?.price || ''}
                        onChange={(e) => updateSection(selectedSection.id, { 
                          content: { ...selectedSection.content, price: e.target.value } 
                        })}
                        className="input-glass mt-1"
                        placeholder="9.99"
                      />
                    </div>
                    <div>
                      <Label htmlFor="membership-benefits">Benefits</Label>
                      <Textarea
                        id="membership-benefits"
                        value={selectedSection.content?.benefits || ''}
                        onChange={(e) => updateSection(selectedSection.id, { 
                          content: { ...selectedSection.content, benefits: e.target.value } 
                        })}
                        className="input-glass mt-1"
                        rows={3}
                        placeholder="One benefit per line"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5" />
                <h2 className="font-heading font-bold">Theme Settings</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="bg-color">Background Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      id="bg-color"
                      type="color"
                      value={theme.background}
                      onChange={(e) => setTheme({ ...theme, background: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={theme.background}
                      onChange={(e) => setTheme({ ...theme, background: e.target.value })}
                      className="input-glass flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      id="accent-color"
                      type="color"
                      value={theme.accent}
                      onChange={(e) => setTheme({ ...theme, accent: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={theme.accent}
                      onChange={(e) => setTheme({ ...theme, accent: e.target.value })}
                      className="input-glass flex-1"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-muted mb-2">Store URL</p>
                  <div className="flex items-center gap-2 p-3 bg-creatorflow-card rounded-lg">
                    <span className="text-sm text-muted">creatorflow.link/</span>
                    <span className="text-sm font-medium">{user?.username}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default StoreBuilder;
