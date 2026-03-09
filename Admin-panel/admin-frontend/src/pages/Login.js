import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [adminSecretKey, setAdminSecretKey] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewResetLink, setPreviewResetLink] = useState('');

  const { login, loading } = useAuth();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryMode = params.get('mode');
    const queryToken = params.get('token');
    const resolvedMode = queryMode === 'forgot' || queryMode === 'reset' ? queryMode : 'login';

    if (queryToken) {
      setMode('reset');
      setResetToken(queryToken);
      return;
    }

    setMode(resolvedMode);
  }, [location.search]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPreviewResetLink('');

    try {
      await login(email, adminSecretKey);
      await showSuccessAlert('Success', 'Login successful');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPreviewResetLink('');

    try {
      const response = await authAPI.forgotPassword(email);
      setSuccess(response.data?.message || 'If an account exists for this email, a reset link has been sent.');
      setPreviewResetLink(response.data?.previewResetLink || '');
      await showSuccessAlert('Success', 'Password reset link sent successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process forgot password request');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPreviewResetLink('');

    try {
      const response = await authAPI.resetPassword(resetToken, newPassword, confirmPassword);
      setSuccess(response.data?.message || 'Password reset successful.');
      await showSuccessAlert('Success', 'Password reset successful');
      setMode('login');
      setAdminSecretKey('');
      setNewPassword('');
      setConfirmPassword('');
      setResetToken('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const title =
    mode === 'forgot'
      ? 'Forgot your password?'
      : mode === 'reset'
        ? 'Reset password'
        : 'Sign in to EasyPG Admin';

  const subtitle =
    mode === 'forgot'
      ? 'Enter your email to receive a reset link'
      : mode === 'reset'
        ? 'Set a new password for your admin account'
        : 'Enter your credentials to access the admin panel';

  const inputClassName =
    'mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400';
  const backgroundImageUrl =
    'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1920&q=80';
  const showSuccessAlert = async (title, text) => {
    if (typeof window !== 'undefined' && window.Swal) {
      await window.Swal.fire({
        icon: 'success',
        title,
        text,
        confirmButtonColor: '#f97316'
      });
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center md:justify-start overflow-hidden py-12 px-4 sm:px-6 lg:px-12"
      style={{
        backgroundImage: `linear-gradient(rgba(10, 20, 40, 0.45), rgba(10, 20, 40, 0.45)), url(${backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="relative max-w-xl w-full rounded-3xl border border-slate-200 bg-[rgba(255,255,255,0.97)] px-8 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.28)] sm:px-10 md:ml-10">
        <div>
          <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-orange-100">
            <img
              src="/logos/logo1.png"
              alt="EasyPG Logo"
              className="h-10 w-10 rounded object-cover"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            {title}
          </h2>
          <p className="mt-3 text-center text-base text-slate-600">
            {subtitle}
          </p>
        </div>

        <form
          className="mt-10 space-y-6"
          onSubmit={mode === 'forgot' ? handleForgotPassword : mode === 'reset' ? handleResetPassword : handleLogin}
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
          {previewResetLink && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-sm break-all">
              Preview reset link:{' '}
              <a href={previewResetLink} className="underline">
                {previewResetLink}
              </a>
            </div>
          )}

          <div className="space-y-4">
            {mode !== 'reset' && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClassName}
                  placeholder="Enter your email"
                />
              </div>
            )}

            {mode === 'login' && (
              <div>
                <label htmlFor="adminSecretKey" className="block text-sm font-medium text-gray-700">
                  Admin Secret Key
                </label>
                <div className="mt-1 relative">
                  <input
                    id="adminSecretKey"
                    name="adminSecretKey"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={adminSecretKey}
                    onChange={(e) => setAdminSecretKey(e.target.value)}
                    className={`${inputClassName} pr-10`}
                    placeholder="........"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {mode === 'reset' && (
              <>
                <div>
                  <label htmlFor="resetToken" className="block text-sm font-medium text-gray-700">
                    Reset Token
                  </label>
                  <input
                    id="resetToken"
                    name="resetToken"
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className={inputClassName}
                    placeholder="Paste reset token"
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showResetPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`${inputClassName} pr-10`}
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                    >
                      {showResetPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showResetConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${inputClassName} pr-10`}
                      placeholder="Re-enter password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                    >
                      {showResetConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-2xl font-semibold rounded-xl text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === 'forgot'
                ? 'Send reset link'
                : mode === 'reset'
                  ? 'Reset password'
                  : loading
                    ? 'Signing in...'
                    : 'Sign in'}
            </button>

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setError('');
                  setSuccess('');
                  setPreviewResetLink('');
                }}
                className="w-full text-lg text-orange-500 hover:text-orange-600"
              >
                Forgot password?
              </button>
            )}

            {(mode === 'forgot' || mode === 'reset') && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccess('');
                  setPreviewResetLink('');
                }}
                className="w-full text-lg text-orange-500 hover:text-orange-600"
              >
                Back to login
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
