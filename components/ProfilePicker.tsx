'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getProfiles } from '@/lib/database';
import type { Profile } from '@/types';
import './ProfilePicker.css';

export default function ProfilePicker() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    try {
      setError(null);
      const data = await getProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('Failed to load profiles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  function handleSelectProfile(profile: Profile) {
    localStorage.setItem('family_app_selected_profile_id', profile.id);
    router.push(`/dashboard?profileId=${profile.id}`);
  }

  function handleClearProfile() {
    localStorage.removeItem('family_app_selected_profile_id');
    window.location.reload();
  }

  if (loading) {
    return (
      <div className="profile-picker">
        <div className="profile-picker__loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-picker">
        <div className="profile-picker__error">
          <div className="profile-picker__error-title">Something went wrong</div>
          <div className="profile-picker__error-message">{error}</div>
          <button
            className="profile-picker__retry-btn"
            onClick={() => {
              setLoading(true);
              loadProfiles();
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="profile-picker">
        <div className="profile-picker__empty">
          <div className="profile-picker__empty-title">No profiles found</div>
          <div className="profile-picker__empty-message">
            Add profiles to your Supabase database to get started.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-picker">
      <h1 className="profile-picker__title">Who&apos;s here?</h1>
      <p className="profile-picker__subtitle">Tap your profile to get started</p>

      <div className="profile-picker__grid">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            className="profile-picker__card"
            onClick={() => handleSelectProfile(profile)}
            style={{ backgroundColor: profile.color }}
          >
            <span className="profile-picker__name">{profile.name}</span>
          </button>
        ))}
      </div>

      <button className="profile-picker__switch-btn" onClick={handleClearProfile}>
        Switch Profile
      </button>
    </div>
  );
}
