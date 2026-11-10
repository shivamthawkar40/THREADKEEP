import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, ShieldCheck, Sparkles, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      addToast('Signed in successfully. Welcome back to THREADKEEP.', 'success');
      navigate('/app/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('architect@spy2o.io');
    setPassword('threadkeep2026');
    addToast('Demo credentials populated. Click Sign In to proceed.', 'info');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-teal items-center justify-center text-ivory shadow-soft mb-2">
            <BookOpen className="w-6 h-6 text-aqua" />
          </div>
          <h1 className="text-2xl font-bold text-charcoal">Sign In to THREADKEEP</h1>
          <p className="text-xs text-charcoal-light">
            Reconnect and access your team's project memory repository.
          </p>
        </div>

        <Card className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-sage/40 bg-ivory text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                  Password
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-sage/40 bg-ivory text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2"
              icon={ArrowRight}
              iconPosition="right"
            >
              Sign In to Workspace
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-sage/20">
            <button
              type="button"
              onClick={handleDemoFill}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-mint-dark/50 bg-mint text-teal text-xs font-bold hover:bg-mint-dark/70 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Fill Demo Credentials (1-Click)</span>
            </button>
            <div className="text-[11px] text-charcoal-light text-center mt-2 font-mono">
              Demo: architect@spy2o.io / threadkeep2026
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-charcoal-light">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-teal font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
