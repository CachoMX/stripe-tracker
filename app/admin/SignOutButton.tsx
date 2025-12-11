'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  return (
    <button
      onClick={handleSignOut}
      className="px-3 py-1 rounded transition text-sm"
      style={{
        background: 'var(--color-danger)',
        color: '#ffffff',
      }}
    >
      Sign Out
    </button>
  );
}
