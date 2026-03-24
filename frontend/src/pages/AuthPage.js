import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, Sparkles, User, Building2 } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState('creator');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(loginEmail, loginPassword);
      toast.success('Welcome back!');
      navigate(user.role === 'brand' ? '/brand/dashboard' : '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await register(registerEmail, registerPassword, registerName, activeRole);
      toast.success('Account created successfully!');
      navigate(user.role === 'brand' ? '/brand/dashboard' : '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-creatorflow-bg flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted hover:text-white transition-colors mb-8"
          data-testid="back-to-home"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-2xl font-heading font-bold text-white">CreatorFlow</span>
          </Link>
          <p className="text-muted mt-2">One Link. Infinite Income.</p>
        </div>
        
        {/* Auth Card */}
        <div className="glass rounded-2xl p-8">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-creatorflow-card">
              <TabsTrigger value="login" data-testid="login-tab">Sign In</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">Sign Up</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="input-glass"
                    required
                    data-testid="login-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="input-glass"
                    required
                    data-testid="login-password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full btn-gradient"
                  disabled={isLoading}
                  data-testid="login-submit"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              
              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-creatorflow-card/50 rounded-lg border border-white/5">
                <p className="text-xs text-muted mb-2">Demo Credentials:</p>
                <p className="text-xs text-white/70">Creator: demo@creator.com / demo123</p>
                <p className="text-xs text-white/70">Brand: demo@brand.com / demo123</p>
              </div>
            </TabsContent>
            
            {/* Register Tab */}
            <TabsContent value="register">
              {/* Role Selector */}
              <div className="flex gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveRole('creator')}
                  className={`flex-1 p-4 rounded-xl border transition-all ${
                    activeRole === 'creator' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  data-testid="role-creator"
                >
                  <User className={`w-6 h-6 mx-auto mb-2 ${activeRole === 'creator' ? 'text-primary' : 'text-muted'}`} />
                  <p className={`text-sm font-medium ${activeRole === 'creator' ? 'text-white' : 'text-muted'}`}>Creator</p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRole('brand')}
                  className={`flex-1 p-4 rounded-xl border transition-all ${
                    activeRole === 'brand' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  data-testid="role-brand"
                >
                  <Building2 className={`w-6 h-6 mx-auto mb-2 ${activeRole === 'brand' ? 'text-primary' : 'text-muted'}`} />
                  <p className={`text-sm font-medium ${activeRole === 'brand' ? 'text-white' : 'text-muted'}`}>Brand</p>
                </button>
              </div>
              
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">{activeRole === 'brand' ? 'Company Name' : 'Full Name'}</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder={activeRole === 'brand' ? 'Your Company' : 'Your Name'}
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="input-glass"
                    required
                    data-testid="register-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="input-glass"
                    required
                    data-testid="register-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="input-glass"
                    required
                    minLength={6}
                    data-testid="register-password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full btn-gradient"
                  disabled={isLoading}
                  data-testid="register-submit"
                >
                  {isLoading ? 'Creating account...' : `Create ${activeRole === 'brand' ? 'Brand' : 'Creator'} Account`}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Terms */}
        <p className="text-center text-xs text-muted mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
