import React, { useState } from 'react';
import { LifeBuoy, Lock, User as UserIcon, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { User, AppConfig } from '../types';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  appConfig: AppConfig;
}

export const Login: React.FC<LoginProps> = ({ users, onLogin, appConfig }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    
    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      
      const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      
      if (foundUser) {
        // Validate password (basic strict check, fall back to simple check if user has no password set for legacy reasons, though now all have it)
        if (foundUser.password === password) {
             onLogin(foundUser);
        } else {
             setError('Invalid password. Please try again.');
        }
      } else {
        setError('Invalid credentials. User not found.');
      }
    }, 800);
  };

  const fillCredentials = (user: User) => {
      setUsername(user.username);
      // Fill with the user's actual password if available for demo, or default
      setPassword(user.password || 'password123');
      setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 to-nova-teal flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col md:flex-row">
        
        {/* Left Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <div className="text-center md:text-left mb-8">
                <div className="inline-flex items-center justify-center h-16 mb-4">
                     {appConfig.logoUrl ? (
                         <img src={appConfig.logoUrl} alt="App Logo" className="h-14 w-auto object-contain" />
                     ) : (
                         <div className="w-12 h-12 bg-nova-teal/10 rounded-xl flex items-center justify-center text-nova-teal">
                            <LifeBuoy size={24} className="text-nova-accent" />
                         </div>
                     )}
                </div>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Welcome to {appConfig.appName}</h1>
                <p className="text-sm text-gray-500 mt-1">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2 animate-pulse">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {error}
                </div>
                )}

                <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Username</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-nova-teal transition-colors">
                    <UserIcon size={18} />
                    </div>
                    <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-nova-teal/20 focus:border-nova-teal transition-all"
                    placeholder="Username"
                    />
                </div>
                </div>

                <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Password</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-nova-teal transition-colors">
                    <Lock size={18} />
                    </div>
                    <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-nova-teal/20 focus:border-nova-teal transition-all"
                    placeholder="••••••••"
                    />
                </div>
                </div>

                <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-nova-teal text-white py-3 rounded-xl font-bold shadow-lg shadow-teal-700/20 hover:bg-teal-700 hover:shadow-teal-700/30 focus:ring-4 focus:ring-teal-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                {isLoading ? (
                    <>
                    <Loader2 size={20} className="animate-spin" />
                    Signing In...
                    </>
                ) : (
                    <>
                    Sign In
                    <ArrowRight size={20} />
                    </>
                )}
                </button>
            </form>
            
            <p className="text-center text-xs text-gray-400 mt-8">© 2024 Nova Maldives. Internal System.</p>
        </div>

        {/* Right Side: Demo Users & Branding */}
        <div className="w-full md:w-1/2 bg-gray-50 p-8 lg:p-12 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100">
            <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldCheck size={16} /> Demo Access Credentials
                </h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {users.map((user) => (
                        <button 
                            key={user.id}
                            onClick={() => fillCredentials(user)}
                            className="w-full flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-xl hover:border-nova-teal hover:shadow-md transition-all text-left group"
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${user.color} flex-shrink-0`}>
                                {user.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-800 group-hover:text-nova-teal transition-colors truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.role}</p>
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded hidden sm:block">
                                {user.username}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-700 leading-relaxed">
                <strong>Note:</strong> Click any user card above to auto-fill credentials. Default password is usually <code>password123</code>.
            </div>
        </div>

      </div>
    </div>
  );
};