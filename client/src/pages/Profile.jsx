import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, MapPin, Bell, Palette, Save, LogOut, Shield, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    climateZone: user?.climateZone || '',
    notifications: user?.preferences?.notifications ?? true
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile({
        name: form.name,
        climateZone: form.climateZone,
        preferences: { notifications: form.notifications }
      });
      updateUser(data.user);
      setEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6 animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <User className="w-6 h-6 text-gray-500" />
          Profile
        </h1>
      </div>

      {/* Avatar + Name */}
      <div className="card p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-leaf-100 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-leaf-700">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Climate Zone</label>
              <input
                type="text"
                value={form.climateZone}
                onChange={(e) => setForm({ ...form, climateZone: e.target.value })}
                className="input-field"
                placeholder="e.g., Tropical, Arid, Mediterranean"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-600">Notifications</label>
              <button
                type="button"
                onClick={() => setForm({ ...form, notifications: !form.notifications })}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  form.notifications ? 'bg-leaf-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form.notifications ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save
                  </>
                )}
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {user?.climateZone || 'Climate zone not set'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Bell className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                Notifications {user?.preferences?.notifications ? 'enabled' : 'disabled'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                Member since {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
              </span>
            </div>
            <button
              onClick={() => setEditing(true)}
              className="btn-secondary w-full mt-4 text-sm"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* App Info */}
      <div className="card p-4 mb-4">
        <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-400" />
          About PlantSense
        </h3>
        <div className="space-y-2 text-sm text-gray-500">
          <p>Version 1.0.0</p>
          <p>AI-powered plant identification and health diagnosis using computer vision.</p>
          <p className="text-xs text-gray-400 pt-1">
            Built with Groq API (LLaMA Vision) • MongoDB Atlas • React
          </p>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="btn-danger w-full flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Log Out
      </button>
    </div>
  );
}
