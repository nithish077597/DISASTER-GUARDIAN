import { useState } from 'react';
import { motion } from 'framer-motion';
import { EyeOff, AlertCircle } from 'lucide-react';

export default function AuthForm({ mode = 'login', onSubmit, error, loading }) {
  const isSignup = mode === 'signup' || mode === 'admin-login';
  const isAdmin = mode === 'admin-login';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password, name, phone });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {isSignup && !isAdmin && (
        <div className="space-y-3">
          <div>
            <label htmlFor="auth-name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              id="auth-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label htmlFor="auth-phone" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <input
              id="auth-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Email
        </label>
        <input
          id="auth-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="auth-password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Password
        </label>
        <input
          id="auth-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
          placeholder="Enter your password"
        />
        {!isAdmin && (
          <button type="button" className="mt-1.5 text-xs text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1">
            <EyeOff className="w-3 h-3" />
            Forgot password?
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            Processing…
          </span>
        ) : isAdmin ? (
          'Admin Login'
        ) : isSignup ? (
          'Create Account'
        ) : (
          'Sign In'
        )}
      </button>
    </motion.form>
  );
}
