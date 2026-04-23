import React, { useState } from 'react';
import { useAuthStore } from '../../store/index.js';
import { useProfileStore } from '../../store/index.js';
import ProfileModal from '../profile/ProfileModal.jsx';
import { useUIStore } from '../../store/index.js';

export default function TopBar() {
  const currentUser  = useAuthStore((s) => s.currentUser);
  const { setSelectedConv } = useUIStore();
  const [profileUserId, setProfileUserId] = useState(null);

  return (
    <>
      <div className="px-4 py-2.5 border-b border-border-subtle bg-bg-secondary flex-shrink-0 flex items-center justify-center">
        <span className="text-text-muted text-sm font-medium">AnonyASK</span>
      </div>

      {profileUserId && (
        <ProfileModal
          userId={profileUserId}
          onClose={() => setProfileUserId(null)}
          onMessage={(convId) => { setSelectedConv(convId); setProfileUserId(null); }}
        />
      )}
    </>
  );
}
