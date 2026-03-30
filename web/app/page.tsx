'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfiles } from '@/lib/database';
import type { Profile } from '@/types';

export default function ProfilePicker() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedProfile = localStorage.getItem('family_app_selected_profile_id');
    if (savedProfile) {
      router.push(`/dashboard?profileId=${savedProfile}`);
      return;
    }
    loadProfiles();
  }, [router]);

  async function loadProfiles() {
    try {
      const data = await getProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectProfile(profile: Profile) {
    localStorage.setItem('family_app_selected_profile_id', profile.id);
    router.push(`/dashboard?profileId=${profile.id}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const cubeSize = typeof window !== 'undefined' ? (window.innerWidth - 80) / 2 : 150;

  return (
    <div className="min-h-screen bg-background px-8 pt-20">
      <h1 className="text-3xl font-bold text-white text-center mb-2">Who&apos;s here?</h1>
      <p className="text-gray-400 text-center mb-12">Tap your profile to get started</p>

      <div className="grid grid-cols-2 gap-6">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => handleSelectProfile(profile)}
            className="aspect-square rounded-2xl items-center justify-center flex flex-col"
            style={{ 
              backgroundColor: profile.color,
              boxShadow: `0 8px 32px ${profile.color}80`
            }}
          >
            <span style={{ fontSize: cubeSize * 0.36 }}>{profile.emoji}</span>
            <span className="text-white text-lg font-semibold mt-3">{profile.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
