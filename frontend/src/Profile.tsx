import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from './api';
import { Lock, AlertTriangle, Camera, Edit2, User as UserIcon, Mail } from 'lucide-react';
import { User } from './types';
import { ModeToggle } from "@/components/mode-toggle";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Profile State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editFirstname, setEditFirstname] = useState('');
  const [editLastname, setEditLastname] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editProfileError, setEditProfileError] = useState('');
  const [editProfileSuccess, setEditProfileSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Password Visibility State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const userData = await authAPI.getProfile();
        setUser(userData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleOpenEditProfile = () => {
    if (user) {
      setEditFirstname(user.firstname);
      setEditLastname(user.lastname);
      setEditEmail(user.email);
      setPreviewUrl(user.profilePicture ? `data:image/jpeg;base64,${user.profilePicture}` : null);
      setSelectedFile(null);
      setEditProfileError('');
      setEditProfileSuccess('');
      setShowEditProfileModal(true);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditProfileError('');
    setEditProfileSuccess('');

    try {
      if (selectedFile) {
        await authAPI.uploadProfilePicture(selectedFile);
      }

      const updatedUser = await authAPI.updateProfile(editFirstname, editLastname, editEmail);
      setUser(updatedUser);
      setEditProfileSuccess('Profile updated successfully');
      setTimeout(() => {
        setShowEditProfileModal(false);
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setEditProfileError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    try {
      await authAPI.changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowPasswordModal(false), 2000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-white font-medium">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-red-500/30 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
            <p className="text-slate-400 mb-8">{error}</p>
            <button 
              onClick={handleBack} 
              className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700 hover:border-slate-600 shadow-lg hover:shadow-xl active:scale-95"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] dark:from-slate-900 dark:via-slate-950 dark:to-black flex flex-col items-center justify-center py-12 transition-colors">
      <div className="w-full max-w-2xl p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800/50 shadow-2xl mx-4 transition-colors">
        <header className="flex flex-col items-center mb-12">
          <div className="relative group cursor-default">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-6 shadow-xl shadow-emerald-500/20 overflow-hidden">
              {user.profilePicture ? (
                <img src={`data:image/jpeg;base64,${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{user.firstname.charAt(0)}{user.lastname.charAt(0)}</span>
              )}
            </div>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{user.firstname} {user.lastname}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{user.email}</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-xl transition-colors">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-500 dark:text-emerald-400">👤</span>
              Profile Information
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/30 transition-colors">
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1">Full Name</p>
                <p className="text-slate-900 dark:text-white font-medium text-lg">{user.firstname} {user.lastname}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/30 transition-colors">
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-slate-900 dark:text-white font-medium text-lg">{user.email}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/30 transition-colors">
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1">Member Since</p>
                <p className="text-slate-900 dark:text-white font-medium text-lg">
                  {new Date(user.id ? Date.now() - user.id * 1000 : Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-xl transition-colors">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-500 dark:text-emerald-400">⚙️</span>
              Account Settings
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/30 transition-colors">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Theme</span>
                <ModeToggle />
              </div>
              
              <div className="pt-4 space-y-3">
                <button 
                  onClick={handleOpenEditProfile}
                  className="w-full py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Edit2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-300 transition-colors" />
                  <span className="group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">Edit Profile</span>
                </button>
                
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-300 transition-colors" />
                  <span className="group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">Change Password</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button 
            onClick={handleBack} 
            className="w-full py-4 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold rounded-xl transition-all duration-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-center gap-2"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white/90 dark:bg-slate-900/30 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all scale-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
            <div className="flex justify-center items-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white drop-shadow-md">Edit Profile</h3>
            </div>
            
            {editProfileSuccess ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="text-emerald-400 font-medium text-lg animate-pulse">Profile updated successfully!</p>
                <p className="text-slate-400 text-sm mt-2">Redirecting...</p>
              </div>
            ) : (
            <form className="space-y-6" onSubmit={handleUpdateProfile}>
              <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer" onClick={() => document.getElementById('modal-profile-upload')?.click()}>
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-emerald-500/20 overflow-hidden border-4 border-slate-800">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span>{editFirstname.charAt(0)}{editLastname.charAt(0)}</span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute bottom-0 right-0 bg-emerald-500 rounded-full p-1.5 border-4 border-slate-800">
                    <Edit2 className="w-3 h-3 text-white" />
                  </div>
                </div>
                <input 
                  type="file" 
                  id="modal-profile-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <p className="text-slate-400 text-xs mt-2">Click to change photo</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">First Name</label>
                  <div className="relative group/input">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within/input:text-emerald-500 dark:group-focus-within/input:text-emerald-400 transition-colors">
                      <UserIcon size={20} />
                    </div>
                    <input 
                      type="text"
                      value={editFirstname}
                      onChange={(e) => setEditFirstname(e.target.value)}
                      required 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Last Name</label>
                  <div className="relative group/input">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within/input:text-emerald-500 dark:group-focus-within/input:text-emerald-400 transition-colors">
                      <UserIcon size={20} />
                    </div>
                    <input 
                      type="text"
                      value={editLastname}
                      onChange={(e) => setEditLastname(e.target.value)}
                      required 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Email Address</label>
                <div className="relative group/input">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within/input:text-emerald-500 dark:group-focus-within/input:text-emerald-400 transition-colors">
                    <Mail size={20} />
                  </div>
                  <input 
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                  />
                </div>
              </div>
              
              {editProfileError && (
                <p className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-200 dark:border-red-500/20">
                  {editProfileError}
                </p>
              )}
              
              {editProfileSuccess && (
                <p className="text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                  {editProfileSuccess}
                </p>
              )}

              <div className="flex gap-3 mt-8">
                <button 
                  type="button" 
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-medium transition-colors" 
                  onClick={() => setShowEditProfileModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white/90 dark:bg-slate-900/30 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all scale-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
            <div className="flex justify-center items-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white drop-shadow-md">Change Password</h3>
            </div>
            <form className="space-y-6" onSubmit={handleChangePassword}>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Current Password</label>
                <div className="relative group/input">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within/input:text-emerald-500 dark:group-focus-within/input:text-emerald-400 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input 
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required 
                    className="w-full pl-10 pr-16 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                  />
                  <span 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 text-xs font-medium cursor-pointer select-none transition-colors uppercase tracking-wider"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {showCurrentPassword ? 'hide' : 'show'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">New Password</label>
                <div className="relative group/input">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within/input:text-emerald-500 dark:group-focus-within/input:text-emerald-400 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input 
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required 
                    className="w-full pl-10 pr-16 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                  />
                  <span 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 text-xs font-medium cursor-pointer select-none transition-colors uppercase tracking-wider"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {showNewPassword ? 'hide' : 'show'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Confirm New Password</label>
                <div className="relative group/input">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within/input:text-emerald-500 dark:group-focus-within/input:text-emerald-400 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                    className="w-full pl-10 pr-16 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                  />
                  <span 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 text-xs font-medium cursor-pointer select-none transition-colors uppercase tracking-wider"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {showConfirmPassword ? 'hide' : 'show'}
                  </span>
                </div>
              </div>
              
              {passwordError && (
                <p className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-200 dark:border-red-500/20">
                  {passwordError}
                </p>
              )}
              
              {passwordSuccess && (
                <p className="text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                  {passwordSuccess}
                </p>
              )}

              <div className="flex gap-3 mt-8">
                <button 
                  type="button" 
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-medium transition-colors" 
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Update Password
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;