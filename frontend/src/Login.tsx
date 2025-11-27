import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from './api';
import { WavyBackground } from "@/components/ui/shadcn-io/wavy-background";
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const WAVY_COLORS = ["#22d3ee", "#4ade80", "#2563eb"];

function Login() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await authAPI.signin(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WavyBackground 
      className="w-full h-full flex flex-col items-center justify-center py-12"
      containerClassName=""
      backgroundFill="black"
      colors={WAVY_COLORS}
      waveOpacity={0.5}
      blur={10}
    >
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-col items-center shadow-2xl">
            <Loader2 size={40} className="text-green-500 animate-spin mb-4" />
            <p className="text-white font-medium">Authenticating...</p>
          </div>
        </div>
      )}
      
      <div className="w-full max-w-md p-8 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl mx-4 relative overflow-hidden group">
        {/* Decorative gradient blobs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/20 rounded-full blur-3xl group-hover:bg-green-500/30 transition-all duration-700"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-700"></div>

        <div className="text-center mb-10 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-blue-600 mb-6 shadow-lg shadow-green-500/20 transform group-hover:scale-110 transition-transform duration-500">
            <span className="text-3xl font-bold text-white">$</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-slate-400">Sign in to continue to FinanceTracker</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
            <div className="relative group/input">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-green-400 transition-colors">
                <Mail size={20} />
              </div>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email" 
                className="w-full pl-10 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none text-white placeholder-slate-500 transition-all duration-300 hover:bg-slate-800/70"
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
            <div className="relative group/input">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-green-400 transition-colors">
                <Lock size={20} />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password" 
                className="w-full pl-10 pr-16 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none text-white placeholder-slate-500 transition-all duration-300 hover:bg-slate-800/70"
                required 
              />
              <span 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-medium cursor-pointer select-none transition-colors uppercase tracking-wider"
                onClick={() => setShowPassword(!showPassword)}
                onMouseDown={(e) => e.preventDefault()}
              >
                {showPassword ? 'hide' : 'show'}
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 group/btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 relative z-10">
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">Don't have an account?</span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          <button 
            onClick={() => navigate('/register')} 
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all duration-300 border border-slate-700 hover:border-slate-600 shadow-lg hover:shadow-slate-700/25 hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            Create Account
          </button>

          <button 
            onClick={() => navigate('/')} 
            className="w-full mt-4 py-4 bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white font-bold rounded-xl transition-all duration-300 border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-2"
          >
            ← Back to Home
          </button>
        </div>
      </div>
      </WavyBackground>
  );
}export default Login;