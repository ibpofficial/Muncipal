import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  UserCheck,
  Wrench,
  Building2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Briefcase,
  MapPin,
  BadgeCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { mapFirebaseAuthError } from '../firebase';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, signup, loginWithGoogleProvider, isAuthenticated, currentUser, isEmailVerified } = useAuth();

  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  const redirectUrl = searchParams.get('redirect') || '';

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('USER');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Extra role fields
  const [phone, setPhone] = useState('');
  const [preferredWard, setPreferredWard] = useState('WARD-12');
  const [businessName, setBusinessName] = useState('');
  const [profession, setProfession] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [department, setDepartment] = useState('Road Operations');
  const [designation, setDesignation] = useState('Municipal Engineer');
  const [employeeId, setEmployeeId] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [specialization, setSpecialization] = useState('Asphalt & surface repair');
  const [employeeRef, setEmployeeRef] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (!isEmailVerified && currentUser.authProvider === 'password') {
        navigate('/verify-email');
        return;
      }

      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        switch (currentUser.role) {
          case 'AUTHORITY':
            navigate('/authority');
            break;
          case 'WORKER':
            navigate('/worker');
            break;
          case 'PROFESSIONAL':
            navigate('/professional');
            break;
          case 'USER':
          default:
            navigate('/user');
            break;
        }
      }
    }
  }, [isAuthenticated, currentUser, isEmailVerified, navigate, redirectUrl]);

  // Live Password Requirement Checklist
  const hasMinLen = signupPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(signupPassword);
  const hasLower = /[a-z]/.test(signupPassword);
  const hasNumber = /[0-9]/.test(signupPassword);
  const passwordsMatch = signupPassword.length > 0 && signupPassword === confirmPassword;
  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasNumber;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!loginEmail.trim() || !loginPassword) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      setLoadingText('Signing in...');
      await login(loginEmail, loginPassword);
    } catch (err: any) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!signupEmail.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isPasswordValid) {
      setError('Please fulfill all password requirements.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    if (!termsAccepted) {
      setError('You must acknowledge the terms and civic code of conduct.');
      return;
    }

    try {
      setLoading(true);
      setLoadingText('Creating account...');
      await signup({
        name: fullName,
        email: signupEmail,
        password: signupPassword,
        role: selectedRole,
        phone,
        preferredWard,
        businessName,
        profession,
        serviceArea,
        department,
        designation,
        employeeId,
        inviteCode,
        specialization,
        employeeRef,
      });

      setSuccessMsg('Account created successfully! Verification email sent.');
      navigate('/verify-email');
    } catch (err: any) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  };

  const handleGoogleClick = async () => {
    setError(null);
    setSuccessMsg(null);
    try {
      setLoading(true);
      setLoadingText('Connecting Google...');
      await loginWithGoogleProvider();
    } catch (err: any) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  };

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F8FAFC] font-sans flex flex-col justify-between selection:bg-[#F5B800] selection:text-[#090B10]">
      {/* Navbar Branding Header */}
      <header className="border-b border-[#262D38] bg-[#0D1117]/80 backdrop-blur px-6 py-4 flex items-center justify-between z-20">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="p-2 bg-[#11151D] border border-[#262D38] rounded-xl group-hover:border-[#F5B800]/50 transition-colors">
            <img src="/logo.svg" alt="Municipal Operations Logo" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <span className="text-base font-black tracking-wider text-white uppercase block leading-tight">
              MUNICIPAL ROAD OPERATIONS
            </span>
            <span className="text-[10px] font-mono text-[#A8B0BE] uppercase tracking-widest block">
              CIVIC INFRASTRUCTURE CONTROL CENTER
            </span>
          </div>
        </Link>

        <Link
          to="/"
          className="text-xs font-mono font-bold text-[#A8B0BE] hover:text-[#F5B800] transition-colors flex items-center space-x-1"
        >
          <span>RETURN TO HOME</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 lg:p-12">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 bg-[#11151D] border border-[#262D38] rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Left Panel: Municipal Value Proposition */}
          <div className="lg:col-span-5 bg-[#0D1117] p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#262D38] relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#F5B800]/5 blur-3xl rounded-full pointer-events-none"></div>

            <div className="space-y-8 relative z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#11151D] border border-[#262D38] rounded-full text-[11px] font-mono font-bold text-[#F5B800]">
                <Shield className="h-3.5 w-3.5" />
                <span>OFFICIAL MUNICIPAL PLATFORM</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl lg:text-3xl font-black text-white tracking-wide uppercase leading-tight">
                  Transparent Road Operations & Maintenance
                </h1>
                <p className="text-sm text-[#A8B0BE] leading-relaxed">
                  Engineered priority allocation, algorithmic daily repair planning, real-time crew routing, and direct civic reporting.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-[#262D38]">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-[#11151D] border border-[#262D38] rounded-lg text-[#F5B800] shrink-0">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Citizens & Stakeholders</h4>
                    <p className="text-xs text-[#6B7280]">Report road hazards, track repair timelines with ticket numbers, and upvote local issues.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-[#11151D] border border-[#262D38] rounded-lg text-[#F5B800] shrink-0">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Field Repair Crews</h4>
                    <p className="text-xs text-[#6B7280]">Mobile-first job execution, before/after evidence capture, and turn-by-turn route optimization.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-[#11151D] border border-[#262D38] rounded-lg text-[#F5B800] shrink-0">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Municipal Authorities</h4>
                    <p className="text-xs text-[#6B7280]">5-factor priority engine control, daily plan generation, crew assignment, and hotspot diagnostics.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 text-[11px] font-mono text-[#6B7280] space-y-1 relative z-10 border-t border-[#262D38] mt-8">
              <p>JAIPUR MUNICIPAL CORPORATION • VER 2.0</p>
              <p>SECURE FIREBASE AUTHENTICATION GATEWAY</p>
            </div>
          </div>

          {/* Right Panel: Authentication Form & Tabs */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-12 bg-[#11151D] flex flex-col justify-center space-y-6">
            
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 bg-[#090B10] p-1 rounded-xl border border-[#262D38]">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2.5 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  mode === 'login'
                    ? 'bg-[#11151D] text-white shadow border border-[#262D38]'
                    : 'text-[#A8B0BE] hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2.5 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  mode === 'signup'
                    ? 'bg-[#11151D] text-white shadow border border-[#262D38]'
                    : 'text-[#A8B0BE] hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3.5 bg-red-950/40 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-start space-x-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Alert */}
            {successMsg && (
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-start space-x-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Google Sign-In (Common to both tabs) */}
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={loading}
              className="w-full py-3 px-4 bg-[#090B10] hover:bg-[#161C26] text-white font-bold rounded-xl border border-[#262D38] transition-all flex items-center justify-center space-x-3 text-xs shadow-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading && loadingText.includes('Google') ? 'CONNECTING GOOGLE...' : 'CONTINUE WITH GOOGLE'}</span>
            </button>

            <div className="flex items-center space-x-3 my-2">
              <div className="flex-1 h-px bg-[#262D38]"></div>
              <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-widest font-bold">OR EMAIL</span>
              <div className="flex-1 h-px bg-[#262D38]"></div>
            </div>

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold text-[#A8B0BE] uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-[#6B7280]" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="citizen@municipal.gov"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#090B10] border border-[#262D38] rounded-xl text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5B800] transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono font-bold text-[#A8B0BE] uppercase tracking-wider">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] font-mono text-[#F5B800] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-[#6B7280]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#090B10] border border-[#262D38] rounded-xl text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5B800] transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-[#6B7280] hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="uiverse-glow-btn text-xs font-black uppercase tracking-wider w-full sm:w-auto"
                  >
                    <span>{loading ? loadingText || 'SIGNING IN...' : 'SIGN IN'}</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-2 inline-block" />
                  </button>
                </div>
              </form>
            )}

            {/* SIGNUP FORM */}
            {mode === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold text-[#A8B0BE] uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="h-4 w-4 absolute left-3.5 top-3.5 text-[#6B7280]" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Rajesh Sharma"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#090B10] border border-[#262D38] rounded-xl text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5B800]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold text-[#A8B0BE] uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-[#6B7280]" />
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#090B10] border border-[#262D38] rounded-xl text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5B800]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold text-[#A8B0BE] uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-[#6B7280]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-[#090B10] border border-[#262D38] rounded-xl text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5B800]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-[#6B7280] hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold text-[#A8B0BE] uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-[#6B7280]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#090B10] border border-[#262D38] rounded-xl text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5B800]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password Requirement Checklist */}
                <div className="p-3 bg-[#090B10] border border-[#262D38] rounded-xl grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className={`flex items-center space-x-1.5 ${hasMinLen ? 'text-emerald-400' : 'text-[#6B7280]'}`}>
                    {hasMinLen ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    <span>8+ Characters</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${hasUpper ? 'text-emerald-400' : 'text-[#6B7280]'}`}>
                    {hasUpper ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    <span>Uppercase Letter</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${hasLower ? 'text-emerald-400' : 'text-[#6B7280]'}`}>
                    {hasLower ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    <span>Lowercase Letter</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${hasNumber ? 'text-emerald-400' : 'text-[#6B7280]'}`}>
                    {hasNumber ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    <span>Number (0-9)</span>
                  </div>
                </div>

                {/* Role Selector Cards */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono font-bold text-[#A8B0BE] uppercase tracking-wider block">
                    Select Platform Role
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    
                    {/* USER Role Card */}
                    <div
                      onClick={() => setSelectedRole('USER')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        selectedRole === 'USER'
                          ? 'bg-[#161C26] border-[#F5B800] ring-1 ring-[#F5B800]'
                          : 'bg-[#090B10] border-[#262D38] hover:border-[#6B7280]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <UserCheck className="h-4 w-4 text-[#F5B800]" />
                          <span className="text-xs font-bold text-white uppercase">USER</span>
                        </div>
                        <input
                          type="radio"
                          name="role"
                          checked={selectedRole === 'USER'}
                          onChange={() => setSelectedRole('USER')}
                          className="accent-[#F5B800]"
                        />
                      </div>
                      <p className="text-[11px] text-[#A8B0BE]">Report issues and track your civic requests.</p>
                    </div>

                    {/* PROFESSIONAL Role Card */}
                    <div
                      onClick={() => setSelectedRole('PROFESSIONAL')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        selectedRole === 'PROFESSIONAL'
                          ? 'bg-[#161C26] border-[#F5B800] ring-1 ring-[#F5B800]'
                          : 'bg-[#090B10] border-[#262D38] hover:border-[#6B7280]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4 text-[#F5B800]" />
                          <span className="text-xs font-bold text-white uppercase">PROFESSIONAL</span>
                        </div>
                        <input
                          type="radio"
                          name="role"
                          checked={selectedRole === 'PROFESSIONAL'}
                          onChange={() => setSelectedRole('PROFESSIONAL')}
                          className="accent-[#F5B800]"
                        />
                      </div>
                      <p className="text-[11px] text-[#A8B0BE]">Manage professional work and take part in municipal workflows.</p>
                    </div>

                    {/* AUTHORITY Role Card */}
                    <div
                      onClick={() => setSelectedRole('AUTHORITY')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        selectedRole === 'AUTHORITY'
                          ? 'bg-[#161C26] border-[#F5B800] ring-1 ring-[#F5B800]'
                          : 'bg-[#090B10] border-[#262D38] hover:border-[#6B7280]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-[#F5B800]" />
                          <span className="text-xs font-bold text-white uppercase">AUTHORITY</span>
                        </div>
                        <input
                          type="radio"
                          name="role"
                          checked={selectedRole === 'AUTHORITY'}
                          onChange={() => setSelectedRole('AUTHORITY')}
                          className="accent-[#F5B800]"
                        />
                      </div>
                      <p className="text-[11px] text-[#A8B0BE]">Manage municipal operations, priorities, work orders and resources.</p>
                    </div>

                    {/* WORKER Role Card */}
                    <div
                      onClick={() => setSelectedRole('WORKER')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        selectedRole === 'WORKER'
                          ? 'bg-[#161C26] border-[#F5B800] ring-1 ring-[#F5B800]'
                          : 'bg-[#090B10] border-[#262D38] hover:border-[#6B7280]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <Wrench className="h-4 w-4 text-[#F5B800]" />
                          <span className="text-xs font-bold text-white uppercase">WORKER</span>
                        </div>
                        <input
                          type="radio"
                          name="role"
                          checked={selectedRole === 'WORKER'}
                          onChange={() => setSelectedRole('WORKER')}
                          className="accent-[#F5B800]"
                        />
                      </div>
                      <p className="text-[11px] text-[#A8B0BE]">View assigned field work, execute repairs and submit evidence.</p>
                    </div>

                  </div>
                </div>

                {/* Role Specific Extra Fields */}
                {selectedRole === 'PROFESSIONAL' && (
                  <div className="p-4 bg-[#090B10] border border-[#262D38] rounded-xl space-y-3">
                    <h4 className="text-xs font-mono font-bold text-[#F5B800] uppercase">Professional Verification Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Business / Enterprise Name"
                        className="w-full px-3 py-2 bg-[#11151D] border border-[#262D38] rounded-lg text-xs text-white placeholder-[#6B7280]"
                      />
                      <input
                        type="text"
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        placeholder="Profession (e.g. Civil Engineer)"
                        className="w-full px-3 py-2 bg-[#11151D] border border-[#262D38] rounded-lg text-xs text-white placeholder-[#6B7280]"
                      />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone Number"
                        className="w-full px-3 py-2 bg-[#11151D] border border-[#262D38] rounded-lg text-xs text-white placeholder-[#6B7280]"
                      />
                      <input
                        type="text"
                        value={serviceArea}
                        onChange={(e) => setServiceArea(e.target.value)}
                        placeholder="Service Area / Ward Zone"
                        className="w-full px-3 py-2 bg-[#11151D] border border-[#262D38] rounded-lg text-xs text-white placeholder-[#6B7280]"
                      />
                    </div>
                  </div>
                )}

                {selectedRole === 'AUTHORITY' && (
                  <div className="p-4 bg-[#090B10] border border-[#262D38] rounded-xl space-y-3">
                    <h4 className="text-xs font-mono font-bold text-[#F5B800] uppercase">Municipal Authority Authorization</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="Department (e.g. Road Ops)"
                        className="w-full px-3 py-2 bg-[#11151D] border border-[#262D38] rounded-lg text-xs text-white placeholder-[#6B7280]"
                      />
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="Designation (e.g. Chief Officer)"
                        className="w-full px-3 py-2 bg-[#11151D] border border-[#262D38] rounded-lg text-xs text-white placeholder-[#6B7280]"
                      />
                      <input
                        type="text"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="Municipal Employee ID"
                        className="w-full px-3 py-2 bg-[#11151D] border border-[#262D38] rounded-lg text-xs text-white placeholder-[#6B7280]"
                      />
                      <input
                        type="text"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        placeholder="Optional Invite / Passcode"
                        className="w-full px-3 py-2 bg-[#11151D] border border-[#262D38] rounded-lg text-xs text-white placeholder-[#6B7280]"
                      />
                    </div>
                    <p className="text-[10px] text-[#6B7280] font-mono">
                      * Non-allowlisted authority accounts require approval from an existing municipal administrator.
                    </p>
                  </div>
                )}

                {selectedRole === 'WORKER' && (
                  <div className="p-4 bg-[#090B10] border border-[#262D38] rounded-xl space-y-3">
                    <h4 className="text-xs font-mono font-bold text-[#F5B800] uppercase">Field Crew Registration</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Contact Phone Number"
                        className="w-full px-3 py-2 bg-[#11151D] border border-[#262D38] rounded-lg text-xs text-white placeholder-[#6B7280]"
                      />
                      <input
                        type="text"
                        value={employeeRef}
                        onChange={(e) => setEmployeeRef(e.target.value)}
                        placeholder="Reference / Worker Badge ID"
                        className="w-full px-3 py-2 bg-[#11151D] border border-[#262D38] rounded-lg text-xs text-white placeholder-[#6B7280]"
                      />
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="Specialization (e.g. Asphalt Repair)"
                        className="w-full px-3 py-2 bg-[#11151D] border border-[#262D38] rounded-lg text-xs text-white placeholder-[#6B7280] sm:col-span-2"
                      />
                    </div>
                    <p className="text-[10px] text-[#6B7280] font-mono">
                      * Crew assignment is performed exclusively by municipal authorities after account creation.
                    </p>
                  </div>
                )}

                {/* Terms acknowledgement */}
                <div className="flex items-start space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 accent-[#F5B800]"
                  />
                  <label htmlFor="terms" className="text-xs text-[#A8B0BE]">
                    I acknowledge municipal terms of service and agree to submit verified civic reports.
                  </label>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="uiverse-glow-btn text-xs font-black uppercase tracking-wider w-full sm:w-auto"
                  >
                    <span>{loading ? loadingText || 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-2 inline-block" />
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>
      </main>

      <footer className="border-t border-[#262D38] bg-[#0D1117] py-4 px-6 text-center text-[11px] font-mono text-[#6B7280]">
        MUNICIPAL ROAD OPERATIONS & MAINTENANCE PLATFORM • JAIPUR CORPORATION
      </footer>
    </div>
  );
}
