import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Send, Shield, HelpCircle, Save, CheckCircle2, AlertCircle, 
  Smartphone, MessageSquare, Info, RefreshCw
} from 'lucide-react';

export default function Settings() {
  const { api, user } = useAuth();
  
  const [telegramChatId, setTelegramChatId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  
  const [saveStatus, setSaveStatus] = useState({ success: false, message: '' });
  const [testStatus, setTestStatus] = useState({ success: false, message: '', error: false });

  // Fetch initial chat ID from user profile
  useEffect(() => {
    const fetchChatId = async () => {
      try {
        const res = await api.get('/auth/profile');
        if (res.data.success && res.data.user) {
          setTelegramChatId(res.data.user.telegramChatId || '');
        }
      } catch (err) {
        console.error('[Settings] Error fetching profile chat ID:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchChatId();
  }, [api]);

  // Save Chat ID to Database
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus({ success: false, message: '' });
    
    try {
      const res = await api.post('/notifications/telegram-id', { telegramChatId });
      if (res.data.success) {
        setSaveStatus({ success: true, message: 'Telegram Chat ID saved successfully!' });
        // Automatically hide alert after 4 seconds
        setTimeout(() => setSaveStatus({ success: false, message: '' }), 4000);
      }
    } catch (err) {
      console.error('[Settings] Error updating chat ID:', err.message);
      setSaveStatus({ 
        success: false, 
        message: err.response?.data?.message || 'Server error updating chat ID.' 
      });
    } finally {
      setSaving(false);
    }
  };

  // Dispatch a test alert
  const handleTestNotification = async () => {
    setTesting(true);
    setTestStatus({ success: false, message: '', error: false });

    try {
      // Test using the current input value (even if unsaved) to let users test instantly
      const res = await api.post('/notifications/test', { telegramChatId });
      if (res.data.success) {
        setTestStatus({ success: true, message: 'Test message dispatched! Check Telegram.', error: false });
        setTimeout(() => setTestStatus({ success: false, message: '', error: false }), 6000);
      }
    } catch (err) {
      console.error('[Settings] Test notification failed:', err.message);
      setTestStatus({ 
        success: false, 
        message: err.response?.data?.message || 'Telegram Bot API rejected request. Check bot token and chat ID setup.', 
        error: true 
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      
      {/* Upper Bar */}
      <div className="border-b border-white/5 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-white">Integration Settings</h2>
        <p className="text-sm text-gray-400 mt-1">Link external communication channels and verify alerts flow.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Settings Configuration Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card Form */}
          <div className="glass-panel rounded-2xl border border-white/5 p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Telegram Push Notifications</h3>
                <p className="text-xs text-gray-500 mt-0.5">Route real-time Gmail messages directly to your private chat.</p>
              </div>
            </div>

            {/* Save success/error notifications */}
            {saveStatus.message && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
                saveStatus.success 
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/25 text-red-400'
              }`}>
                {saveStatus.success ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                <span>{saveStatus.message}</span>
              </div>
            )}

            {/* Test success/error notifications */}
            {testStatus.message && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
                testStatus.error 
                  ? 'bg-red-500/10 border-red-500/25 text-red-400' 
                  : 'bg-brand-500/10 border-brand-500/25 text-brand-400'
              }`}>
                {testStatus.error ? <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                <span>{testStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Telegram Chat ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 987654321"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/5 bg-[#0a0d24] text-white focus:outline-none focus:border-brand-500/50 text-sm font-semibold tracking-wide transition-colors"
                />
                <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  Your chat ID is a unique numeric ID. Follow the sidebar instructions to fetch it.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 border border-transparent font-semibold text-sm text-white transition-all duration-300 shadow-[0_4px_15px_rgba(99,117,255,0.25)] hover:shadow-[0_4px_25px_rgba(99,117,255,0.4)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestNotification}
                  disabled={testing || !telegramChatId}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white font-semibold text-sm transition-all duration-300 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send className={`w-4 h-4 ${testing ? 'animate-bounce' : ''}`} />
                  <span>{testing ? 'Sending Alert...' : 'Send Test Notification'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Setup Guides Column */}
        <div className="space-y-6">
          
          {/* Telegram Bot Setup Instructions Card */}
          <div className="glass-panel rounded-2xl border border-white/5 p-6 space-y-4">
            <div className="flex items-center gap-2 text-brand-400 font-bold text-sm">
              <MessageSquare className="w-4 h-4" />
              <span>Telegram Connection Guide</span>
            </div>
            
            <ol className="text-xs text-gray-400 space-y-3.5 list-decimal list-inside pl-1">
              <li>
                Open Telegram and search for <strong className="text-white">@BotFather</strong>.
              </li>
              <li>
                Send <code className="px-1.5 py-0.5 rounded bg-white/5 text-brand-400">/newbot</code> and follow instructions to create your bot and copy the **Bot Token** into the backend server environment.
              </li>
              <li>
                Click the bot chat link provided by @BotFather and press <strong className="text-white">Start</strong> to activate a chat.
              </li>
              <li>
                Search for <strong className="text-white">@userinfobot</strong> on Telegram, and send `/start`.
              </li>
              <li>
                Copy the numeric <strong className="text-white">Id</strong> returned, enter it in the Chat ID input field on the left, and click <strong className="text-white">Save Settings</strong>.
              </li>
            </ol>
          </div>

          {/* Secure details info */}
          <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.005] flex gap-3 text-xs text-gray-500">
            <Shield className="w-5 h-5 text-brand-500/70 flex-shrink-0 mt-0.5" />
            <p>
              Your Telegram connection communicates directly with Telegram servers. No credentials, tokens, or email details are forwarded to any third-party APIs.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
