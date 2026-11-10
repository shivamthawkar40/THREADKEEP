import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('SPY_2.O Engineering');
  const [role, setRole] = useState('lead_architect');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      addToast('Please complete all required fields.', 'error');
      return;
    }

    if (password.length < 6) {
      addToast('Password must be at least 6 characters long.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, organization, role });
      addToast('Account created successfully. Welcome to THREADKEEP!', 'success');
      navigate('/app/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-teal items-center justify-center text-ivory shadow-soft mb-2">
            <BookOpen className="w-6 h-6 text-aqua" />
          </div>
          <h1 className="text-2xl font-bold text-charcoal">Create THREADKEEP Account</h1>
          <p className="text-xs text-charcoal-light">
            Start protecting and reconnecting your software team's knowledge.
          </p>
        </div>

        <Card className="p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Vance"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-sage/40 bg-ivory text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-sage/40 bg-ivory text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-sage/40 bg-ivory text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Organization
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Team Name"
                  className="w-full px-3 py-2 rounded-lg border border-sage/40 bg-ivory text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Primary Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-sage/40 bg-ivory text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
                >
                  <option value="lead_architect">Lead Architect</option>
                  <option value="contributor">Contributor / Dev</option>
                  <option value="reviewer">Reviewer / Lead</option>
                  <option value="admin">Engineering Manager</option>
                </select>
              </div>
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
              Create Account & Launch
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-charcoal-light">
          Already have an account?{' '}
          <Link to="/login" className="text-teal font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
