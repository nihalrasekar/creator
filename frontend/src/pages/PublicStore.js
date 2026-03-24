import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import {
  Youtube, Instagram, Twitter, ExternalLink, Coffee, Star,
  Package, Link2, Mail, Share2, Copy, ShoppingCart, Check
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PublicStore = () => {
  const { username } = useParams();
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    fetchStore();
  }, [username]);

  const fetchStore = async () => {
    try {
      // Seed database first
      await axios.post(`${API}/seed`).catch(() => {});
      
      const response = await axios.get(`${API}/store/${username}`);
      setStoreData(response.data);
    } catch (err) {
      setError('Store not found');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (product) => {
    setPurchasing(product.id);
    try {
      const response = await axios.post(`${API}/payments/checkout`, {
        product_id: product.id,
        origin_url: window.location.origin,
        metadata: { creator_username: username }
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      toast.error('Failed to initiate checkout');
    } finally {
      setPurchasing(null);
    }
  };

  const copyStoreLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  const shareStore = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${storeData?.creator?.display_name}'s Store`,
          url: window.location.href
        });
      } catch (err) {
        copyStoreLink();
      }
    } else {
      copyStoreLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-creatorflow-bg flex items-center justify-center">
        <div className="animate-pulse text-white">Loading store...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-creatorflow-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold mb-2">Store Not Found</h1>
          <p className="text-muted mb-4">This creator doesn't have a store yet.</p>
          <Link to="/">
            <Button className="btn-gradient">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { store, creator, products } = storeData;
  const theme = store?.theme || { background: '#0D0D1A', accent: '#6C5CE7' };

  const socialLinks = creator?.social_links || {};
  const followerStats = creator?.follower_stats || {};

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{ backgroundColor: theme.background }}
      data-testid="public-store"
    >
      <div className="max-w-md mx-auto">
        {/* Share Button */}
        <div className="flex justify-end gap-2 mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={copyStoreLink}
            className="text-muted hover:text-white"
            data-testid="copy-store-link"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={shareStore}
            className="text-muted hover:text-white"
            data-testid="share-store"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="w-28 h-28 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white/10" style={{ borderColor: `${theme.accent}40` }}>
            {creator?.avatar ? (
              <img src={creator.avatar} alt={creator.display_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl font-bold text-white">
                {creator?.display_name?.charAt(0) || 'C'}
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-heading font-bold flex items-center justify-center gap-2">
            {creator?.display_name}
            {creator?.is_verified && (
              <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                <Check className="w-3 h-3 text-black" />
              </span>
            )}
          </h1>
          
          <p className="text-muted mt-1">@{username}</p>
          
          {creator?.bio && (
            <p className="text-sm text-white/80 mt-3 max-w-xs mx-auto">
              {creator.bio}
            </p>
          )}
          
          {/* Follower Stats */}
          <div className="flex justify-center gap-4 mt-4 text-sm">
            {Object.entries(followerStats).map(([platform, count]) => (
              count > 0 && (
                <div key={platform} className="text-center">
                  <p className="font-bold">{(count / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted capitalize">{platform}</p>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Social Links */}
        {Object.keys(socialLinks).length > 0 && (
          <div className="flex justify-center gap-3 mb-8">
            {socialLinks.youtube && (
              <a 
                href={socialLinks.youtube} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                data-testid="social-youtube"
              >
                <Youtube className="w-5 h-5 text-red-500" />
              </a>
            )}
            {socialLinks.instagram && (
              <a 
                href={socialLinks.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                data-testid="social-instagram"
              >
                <Instagram className="w-5 h-5 text-pink-500" />
              </a>
            )}
            {socialLinks.tiktok && (
              <a 
                href={socialLinks.tiktok} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <span className="text-xl">📱</span>
              </a>
            )}
            {socialLinks.twitter && (
              <a 
                href={socialLinks.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                data-testid="social-twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
          </div>
        )}

        {/* Products Section */}
        {products && products.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" style={{ color: theme.accent }} />
              Products
            </h2>
            <div className="space-y-3">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="glass rounded-xl overflow-hidden card-hover"
                  data-testid={`product-${product.id}`}
                >
                  <div className="flex items-center gap-4 p-4">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-creatorflow-card flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{product.title}</h3>
                      <p className="text-sm text-muted line-clamp-2">{product.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-bold" style={{ color: theme.accent }}>
                          ${product.price.toFixed(2)}
                        </span>
                        {product.sales_count > 0 && (
                          <span className="text-xs text-muted">
                            {product.sales_count} sold
                          </span>
                        )}
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      className="shrink-0"
                      style={{ backgroundColor: theme.accent }}
                      onClick={() => handlePurchase(product)}
                      disabled={purchasing === product.id}
                      data-testid={`buy-${product.id}`}
                    >
                      {purchasing === product.id ? (
                        'Loading...'
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Buy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tip Jar */}
        <div className="glass rounded-xl p-6 mb-8 text-center">
          <Coffee className="w-10 h-10 mx-auto mb-3" style={{ color: theme.accent }} />
          <h2 className="text-lg font-heading font-bold mb-2">Support My Work</h2>
          <p className="text-sm text-muted mb-4">If you enjoy my content, consider buying me a coffee!</p>
          <div className="flex justify-center gap-3">
            {['5', '10', '25'].map((amount) => (
              <Button 
                key={amount}
                variant="outline"
                className="rounded-full"
                style={{ borderColor: `${theme.accent}50`, color: theme.accent }}
                onClick={async () => {
                  try {
                    const response = await axios.post(`${API}/payments/checkout`, {
                      amount: parseFloat(amount),
                      origin_url: window.location.origin,
                      metadata: { type: 'tip', creator_username: username }
                    });
                    if (response.data.url) {
                      window.location.href = response.data.url;
                    }
                  } catch (error) {
                    toast.error('Failed to process tip');
                  }
                }}
                data-testid={`tip-${amount}`}
              >
                ${amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Store Sections */}
        {store?.sections?.map((section) => (
          <div key={section.id} className="mb-6">
            {section.type === 'bio' && section.content?.text && (
              <div className="glass rounded-xl p-6">
                <h3 className="font-medium mb-2">{section.title}</h3>
                <p className="text-sm text-muted">{section.content.text}</p>
              </div>
            )}
            
            {section.type === 'links' && section.content?.url && (
              <a 
                href={section.content.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block glass rounded-xl p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <span className="flex-1 font-medium">{section.content.label || section.title}</span>
                  <ExternalLink className="w-4 h-4 text-muted" />
                </div>
              </a>
            )}

            {section.type === 'membership' && (
              <div className="glass rounded-xl p-6 border-2" style={{ borderColor: `${theme.accent}30` }}>
                <Star className="w-8 h-8 mb-3" style={{ color: theme.accent }} />
                <h3 className="text-lg font-heading font-bold">
                  {section.content?.name || 'Membership'}
                </h3>
                <p className="text-3xl font-bold mt-2" style={{ color: theme.accent }}>
                  ${section.content?.price || '9.99'}
                  <span className="text-sm text-muted">/month</span>
                </p>
                {section.content?.benefits && (
                  <ul className="mt-4 space-y-2 text-sm text-muted">
                    {section.content.benefits.split('\n').map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4" style={{ color: theme.accent }} />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                )}
                <Button 
                  className="w-full mt-4"
                  style={{ backgroundColor: theme.accent }}
                >
                  Join Now
                </Button>
              </div>
            )}

            {section.type === 'email_signup' && (
              <div className="glass rounded-xl p-6">
                <Mail className="w-8 h-8 mb-3" style={{ color: theme.accent }} />
                <h3 className="font-medium mb-2">{section.title}</h3>
                <div className="flex gap-2">
                  <input 
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary"
                  />
                  <Button style={{ backgroundColor: theme.accent }}>
                    Subscribe
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Footer */}
        <div className="text-center pt-8 pb-4">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors"
          >
            Powered by <span className="font-heading font-bold text-primary">CreatorFlow</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicStore;
