import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useStore } from '../store';
import type { User } from '../types';
import { useApi } from '../hooks/useApi';

function Login() {
  const navigate = useNavigate();
  const isDarkMode = useStore((state: { isDarkMode: boolean }) => state.isDarkMode);
  const setCurrentUser = useStore((state: { setCurrentUser: (user: User) => void }) => state.setCurrentUser);
  const currentUser = useStore((state: { currentUser: User | null }) => state.currentUser);
  const { callApi, loading, error: apiError } = useApi();
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      navigate(`/${currentUser.role}/dashboard`);
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    const { data, error } = await callApi<{ _id: string; name: string; email: string; role: 'employer' | 'jobseeker'; company?: string; token: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: { email, password },
      }
    );
    if (error) {
      setError(error);
    } else if (data) {
      const user: User = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        company: data.company,
        token: data.token,
      };
      setCurrentUser(user);
      navigate(`/${data.role}/dashboard`);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8`}>
        <div className="flex items-center justify-center mb-8">
          <LogIn className="w-12 h-12 text-blue-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-8">Welcome Back</h1>
        
        {(error || apiError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className={`w-full p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border focus:ring-2 focus:ring-blue-500`}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className={`w-full p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border focus:ring-2 focus:ring-blue-500`}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className={`mt-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
