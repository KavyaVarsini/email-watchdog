import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Commit token to context
      login(token);
      
      // Allow a brief moment for context user fetch before navigating
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      console.error('[AuthCallback] No token returned in URL params');
      navigate('/login?error=callback_failed', { replace: true });
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#060817] text-white">
      <div className="text-center space-y-6 animate-pulse">
        <div className="relative inline-block">
          <div className="absolute inset-0 rounded-2xl bg-brand-500/30 blur-lg animate-ping"></div>
          <div className="relative p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Shield className="w-12 h-12" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-wide">Establishing Bridge</h2>
          <p className="text-sm text-gray-500 mt-1.5">Completing Google OAuth handshakes...</p>
        </div>
        <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden mx-auto border border-white/5">
          <div className="h-full bg-brand-500 rounded-full animate-[shimmer_1.5s_infinite] w-2/3"></div>
        </div>
      </div>
    </div>
  );
}
