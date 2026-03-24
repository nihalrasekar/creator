import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import {
  Sparkles, ArrowLeft, Lightbulb, PenTool, Image, BarChart3,
  Hash, MessageSquare, FileText, Wand2, Copy, RefreshCw,
  TrendingUp, Zap, Clock, CheckCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const AIToolsHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ideas');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Form states
  const [niche, setNiche] = useState('');
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [tone, setTone] = useState('casual');
  const [content, setContent] = useState('');
  const [comment, setComment] = useState('');
  const [productName, setProductName] = useState('');
  const [productDetails, setProductDetails] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/ai/history?limit=10');
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const generateContent = async (toolType, inputData) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await api.post('/ai/generate', {
        tool_type: toolType,
        input_data: inputData
      });
      setResult(response.data);
      fetchHistory();
      toast.success('Content generated!');
    } catch (error) {
      toast.error('Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const tools = [
    { id: 'ideas', icon: Lightbulb, label: 'Content Ideas', description: 'Get viral content ideas for your niche' },
    { id: 'script', icon: PenTool, label: 'Script Writer', description: 'Generate scripts with hooks and CTAs' },
    { id: 'captions', icon: FileText, label: 'Caption Writer', description: 'Platform-optimized captions' },
    { id: 'hashtags', icon: Hash, label: 'Hashtag Optimizer', description: 'Perfect hashtag mix for reach' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics Insights', description: 'Plain English performance analysis' },
    { id: 'comments', icon: MessageSquare, label: 'Comment Responder', description: 'AI-drafted replies in your voice' },
    { id: 'thumbnails', icon: Image, label: 'Thumbnail Ideas', description: 'Click-worthy thumbnail concepts' },
    { id: 'product', icon: Wand2, label: 'Product Description', description: 'Converting product copy' },
  ];

  return (
    <div className="min-h-screen bg-creatorflow-bg">
      {/* Header */}
      <header className="glass border-b border-white/5 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              data-testid="back-to-dashboard"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-lg font-heading font-bold">AI Tools Hub</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted">
            <Zap className="w-4 h-4 text-warning" />
            <span>Unlimited generations (Pro)</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Tool Selector Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-xl p-4 sticky top-24">
              <h2 className="font-heading font-bold mb-4">AI Tools</h2>
              <nav className="space-y-1">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => { setActiveTab(tool.id); setResult(null); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                      activeTab === tool.id
                        ? 'bg-primary/20 text-primary'
                        : 'text-muted hover:text-white hover:bg-white/5'
                    }`}
                    data-testid={`tool-${tool.id}`}
                  >
                    <tool.icon className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{tool.label}</p>
                      <p className="text-xs opacity-70">{tool.description}</p>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tool Interface */}
            <div className="glass rounded-xl p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                {/* Content Ideas */}
                <TabsContent value="ideas" className="mt-0">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-heading font-bold">Content Idea Generator</h2>
                      <p className="text-sm text-muted">Get trending content ideas with virality scores</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="niche">Your Niche</Label>
                      <Input
                        id="niche"
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        placeholder="e.g., Tech, Fitness, Cooking, Gaming"
                        className="input-glass mt-1"
                      />
                    </div>
                    <Button 
                      onClick={() => generateContent('idea_generator', { niche })}
                      className="btn-gradient"
                      disabled={loading || !niche}
                      data-testid="generate-ideas"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Generate Ideas
                    </Button>
                  </div>
                  
                  {result?.output?.ideas && (
                    <div className="mt-6 space-y-3">
                      <h3 className="font-medium">Generated Ideas:</h3>
                      {result.output.ideas.map((idea, index) => (
                        <div key={index} className="p-4 bg-creatorflow-card/50 rounded-lg flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium">{idea.title}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-success" />
                                Virality: {idea.virality_score}/100
                              </span>
                              <span>Platform: {idea.platform}</span>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(idea.title)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Script Writer */}
                <TabsContent value="script" className="mt-0">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                      <PenTool className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-heading font-bold">Script & Caption Writer</h2>
                      <p className="text-sm text-muted">Generate scroll-stopping scripts with hooks</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="script-topic">Topic</Label>
                      <Input
                        id="script-topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., Morning routine tips, Product review"
                        className="input-glass mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="script-platform">Platform</Label>
                        <select
                          id="script-platform"
                          value={platform}
                          onChange={(e) => setPlatform(e.target.value)}
                          className="w-full input-glass mt-1"
                        >
                          <option value="youtube">YouTube</option>
                          <option value="tiktok">TikTok</option>
                          <option value="instagram">Instagram Reels</option>
                          <option value="twitter">Twitter/X</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="script-tone">Tone</Label>
                        <select
                          id="script-tone"
                          value={tone}
                          onChange={(e) => setTone(e.target.value)}
                          className="w-full input-glass mt-1"
                        >
                          <option value="casual">Casual</option>
                          <option value="professional">Professional</option>
                          <option value="funny">Funny</option>
                          <option value="educational">Educational</option>
                          <option value="dramatic">Dramatic</option>
                        </select>
                      </div>
                    </div>
                    <Button 
                      onClick={() => generateContent('script_writer', { topic, platform, tone })}
                      className="btn-gradient"
                      disabled={loading || !topic}
                      data-testid="generate-script"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Generate Script
                    </Button>
                  </div>
                  
                  {result?.output?.script && (
                    <div className="mt-6 space-y-4">
                      <div className="p-4 bg-creatorflow-card/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-secondary">Hook (First 3 seconds)</h3>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(result.output.hook)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-lg font-medium">{result.output.hook}</p>
                      </div>
                      <div className="p-4 bg-creatorflow-card/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">Full Script</h3>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(result.output.script)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-muted">{result.output.script}</p>
                      </div>
                      <div className="p-4 bg-creatorflow-card/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-accent">Call to Action</h3>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(result.output.cta)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p>{result.output.cta}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Caption Writer */}
                <TabsContent value="captions" className="mt-0">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-xl font-heading font-bold">Caption Writer</h2>
                      <p className="text-sm text-muted">Platform-optimized captions that convert</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="caption-content">Describe your content</Label>
                      <Textarea
                        id="caption-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="e.g., A video showing my morning routine and productivity tips"
                        className="input-glass mt-1"
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={() => generateContent('caption_writer', { content })}
                      className="btn-gradient"
                      disabled={loading || !content}
                      data-testid="generate-captions"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Generate Captions
                    </Button>
                  </div>
                  
                  {result?.output?.captions && (
                    <div className="mt-6 space-y-4">
                      {result.output.captions.map((item, index) => (
                        <div key={index} className="p-4 bg-creatorflow-card/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{item.platform}</h3>
                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(item.caption)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted">{item.caption}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Hashtag Optimizer */}
                <TabsContent value="hashtags" className="mt-0">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
                      <Hash className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <h2 className="text-xl font-heading font-bold">Hashtag Optimizer</h2>
                      <p className="text-sm text-muted">Get the perfect hashtag mix for maximum reach</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="hashtag-content">Content description</Label>
                      <Input
                        id="hashtag-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="e.g., Fitness workout video, home exercises"
                        className="input-glass mt-1"
                      />
                    </div>
                    <Button 
                      onClick={() => generateContent('hashtag_optimizer', { content })}
                      className="btn-gradient"
                      disabled={loading || !content}
                      data-testid="generate-hashtags"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Optimize Hashtags
                    </Button>
                  </div>
                  
                  {result?.output?.hashtags && (
                    <div className="mt-6 space-y-4">
                      {Object.entries(result.output.hashtags).map(([category, tags]) => (
                        <div key={category} className="p-4 bg-creatorflow-card/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium capitalize">{category.replace('_', ' ')}</h3>
                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(Array.isArray(tags) ? tags.join(' ') : tags)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-success">
                            {Array.isArray(tags) ? tags.join(' ') : tags}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Analytics Insights */}
                <TabsContent value="analytics" className="mt-0">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-heading font-bold">Analytics Interpreter</h2>
                      <p className="text-sm text-muted">Get plain English insights from your performance data</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => generateContent('analytics_interpreter', {})}
                    className="btn-gradient"
                    disabled={loading}
                    data-testid="generate-analytics"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Analyze My Performance
                  </Button>
                  
                  {result?.output && (
                    <div className="mt-6 space-y-4">
                      <div className="p-4 bg-creatorflow-card/50 rounded-lg">
                        <h3 className="font-medium mb-3">Key Insights</h3>
                        <ul className="space-y-2">
                          {result.output.insights?.map((insight, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                              <span className="text-muted">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 bg-creatorflow-card/50 rounded-lg">
                        <h3 className="font-medium mb-3">Recommendations</h3>
                        <ul className="space-y-2">
                          {result.output.recommendations?.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Zap className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                              <span className="text-muted">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Comment Responder */}
                <TabsContent value="comments" className="mt-0">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-heading font-bold">Comment Responder</h2>
                      <p className="text-sm text-muted">AI-drafted replies in your authentic voice</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => generateContent('comment_responder', {})}
                    className="btn-gradient"
                    disabled={loading}
                    data-testid="generate-comments"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Generate Sample Responses
                  </Button>
                  
                  {result?.output?.responses && (
                    <div className="mt-6 space-y-4">
                      {result.output.responses.map((item, index) => (
                        <div key={index} className="p-4 bg-creatorflow-card/50 rounded-lg">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">
                              👤
                            </div>
                            <div>
                              <p className="text-sm font-medium">Fan Comment:</p>
                              <p className="text-sm text-muted">"{item.comment}"</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 pl-11">
                            <div className="flex-1 p-3 bg-primary/10 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-primary">Suggested Reply:</p>
                                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(item.response)}>
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                              <p className="text-sm">{item.response}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Thumbnail Ideas */}
                <TabsContent value="thumbnails" className="mt-0">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Image className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-xl font-heading font-bold">Thumbnail Generator</h2>
                      <p className="text-sm text-muted">Get click-worthy thumbnail concepts</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="thumb-topic">Video topic</Label>
                      <Input
                        id="thumb-topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., iPhone 16 review, 30-day fitness transformation"
                        className="input-glass mt-1"
                      />
                    </div>
                    <Button 
                      onClick={() => generateContent('thumbnail_generator', { topic })}
                      className="btn-gradient"
                      disabled={loading || !topic}
                      data-testid="generate-thumbnails"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Generate Thumbnail Ideas
                    </Button>
                  </div>
                  
                  {result?.output?.suggestions && (
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      {result.output.suggestions.map((thumb, index) => (
                        <div key={index} className="p-4 bg-creatorflow-card/50 rounded-lg">
                          <div className="aspect-video bg-creatorflow-card rounded-lg mb-3 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${thumb.colors[0]}, ${thumb.colors[1]})` }}>
                            <span className="text-white font-bold text-center px-4">{thumb.text_overlay}</span>
                          </div>
                          <p className="text-sm font-medium">{thumb.style}</p>
                          <div className="flex gap-2 mt-2">
                            {thumb.colors.map((color, i) => (
                              <div key={i} className="w-6 h-6 rounded" style={{ backgroundColor: color }} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Product Description */}
                <TabsContent value="product" className="mt-0">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center">
                      <Wand2 className="w-6 h-6 text-warning" />
                    </div>
                    <div>
                      <h2 className="text-xl font-heading font-bold">Product Description Writer</h2>
                      <p className="text-sm text-muted">Generate converting product copy</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="prod-name">Product Name</Label>
                      <Input
                        id="prod-name"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g., Premium Lightroom Preset Pack"
                        className="input-glass mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="prod-details">Product Details</Label>
                      <Textarea
                        id="prod-details"
                        value={productDetails}
                        onChange={(e) => setProductDetails(e.target.value)}
                        placeholder="What's included, who it's for, key benefits..."
                        className="input-glass mt-1"
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={() => generateContent('product_description', { name: productName, details: productDetails })}
                      className="btn-gradient"
                      disabled={loading || !productName}
                      data-testid="generate-product-desc"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Generate Description
                    </Button>
                  </div>
                  
                  {result?.output?.description && (
                    <div className="mt-6">
                      <div className="p-4 bg-creatorflow-card/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">Generated Description</h3>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(result.output.description)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-muted">{result.output.description}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Generation History */}
            {history.length > 0 && (
              <div className="glass rounded-xl p-6">
                <h2 className="font-heading font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted" />
                  Recent Generations
                </h2>
                <div className="space-y-3">
                  {history.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-creatorflow-card/50 rounded-lg">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        {tools.find(t => t.id === item.tool_type?.replace('_generator', '').replace('_writer', '').replace('_optimizer', '').replace('_interpreter', '').replace('_responder', ''))?.icon ? (
                          React.createElement(tools.find(t => item.tool_type?.includes(t.id))?.icon || Sparkles, { className: "w-4 h-4 text-primary" })
                        ) : (
                          <Sparkles className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium capitalize">{item.tool_type?.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted">{new Date(item.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIToolsHub;
