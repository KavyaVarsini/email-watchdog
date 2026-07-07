import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shield, Bell, CheckCircle, Smartphone, AlertTriangle } from 'lucide-react';

export default function Login() {
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'missing_code':
          setErrorMessage('Google did not return an authorization code. Please try again.');
          break;
        case 'no_access_token':
          setErrorMessage('Failed to fetch access token from Google.');
          break;
        case 'no_email':
          setErrorMessage('Could not retrieve your email address from Google profile.');
          break;
        case 'missing_refresh_token':
          setErrorMessage('Gmail connection requires offline authorization. Please check Google permissions and re-consent.');
          break;
        case 'callback_failed':
          setErrorMessage('OAuth callback handling failed on the server.');
          break;
        default:
          setErrorMessage('An unexpected authentication error occurred.');
      }
    }
  }, [searchParams]);

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden bg-gradient-to-br from-[#060817] via-[#090e29] to-[#040612]">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-xl z-10 space-y-8">
        
        {/* App Title & Tagline */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-brand-500/25 bg-brand-500/5 text-brand-400 text-sm font-semibold tracking-wide shadow-[0_0_20px_rgba(99,117,255,0.15)] animate-bounce">
            <Bell className="w-4 h-4" />
            <span>Real-Time Notification Bridge</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
            Email <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-purple-400 bg-clip-text text-transparent">WatchDog</span>
          </h1>
          <p className="text-base text-gray-400 max-w-md mx-auto">
            Never miss an important email again. Connect your Gmail and receive instant notifications directly on Telegram.
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-4 rounded-2xl border border-red-500/25 bg-red-500/5 text-red-400 flex items-start gap-3 shadow-[0_0_15px_rgba(239,68,68,0.08)] animate-pulse">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Authentication Failed</p>
              <p className="text-xs opacity-90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/5 glow-indigo space-y-8">
          
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3">Why Email WatchDog?</h2>
            
            <div className="grid gap-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Continuous Background Polling</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Continuous inbox checks run on our servers every minute, ensuring alerts show up even when your browser tab is closed.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Instant Telegram Notifications</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Receive formatting rich-alerts with sender info, email title, and message snippet on your phone or desktop instantly.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Duplicate Detection Guard</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Built-in message hashing ensures that you receive precisely one notification per unique incoming email.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white text-gray-900 hover:bg-gray-100 font-semibold text-sm transition-all duration-300 transform active:scale-95 shadow-[0_4px_20px_rgba(255,255,255,0.15)] group relative overflow-hidden"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Get Started with Google OAuth</span>
              
              {/* Subtle shining border animation */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-brand-500/50 rounded-2xl transition-all duration-300 pointer-events-none"></div>
            </button>
            <p className="text-[10px] text-center text-gray-500">
              By signing in, you grant read-only access to your Gmail. Credentials are encrypted securely.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
