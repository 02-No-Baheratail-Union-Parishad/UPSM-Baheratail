import { useState, useEffect } from 'react';
import { auth, AdminUserRecord } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export type UserRole = 'citizen' | 'udc' | 'secretary' | 'chairman' | 'super_admin' | 'developer' | 'member';

export interface UserSession {
  email: string;
  name: string;
  role: UserRole;
  designation?: string;
  phone?: string;
  nid?: string;
  photoUrl?: string;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [session, setSession] = useState<UserSession>(() => {
    // Check saved session on initial load
    const savedAdmin = localStorage.getItem('bup_active_admin_session');
    if (savedAdmin) {
      try {
        const parsed = JSON.parse(savedAdmin);
        return {
          email: parsed.email || 'admin@baheratailup.gov.bd',
          name: parsed.name || 'অফিসিয়াল ইউজার',
          role: (parsed.role as UserRole) || 'secretary',
          designation: parsed.designation || 'ইউনিয়ন কর্মকর্তা',
          phone: parsed.phone || '01834333300',
          photoUrl: parsed.photoUrl,
          isAuthenticated: true
        };
      } catch (e) {
        console.warn('Failed to parse admin session:', e);
      }
    }

    const savedCitizen = localStorage.getItem('bup_active_citizen_session');
    if (savedCitizen) {
      try {
        const parsed = JSON.parse(savedCitizen);
        return {
          email: parsed.email || '',
          name: parsed.name || 'সম্মানিত নাগরিক',
          role: 'citizen',
          designation: 'সাধারণ নাগরিক',
          phone: parsed.phone || parsed.mobile || '',
          nid: parsed.nid || parsed.birthRegNo || '',
          isAuthenticated: true
        };
      } catch (e) {
        console.warn('Failed to parse citizen session:', e);
      }
    }

    // Default Guest Citizen
    return {
      email: '',
      name: 'সম্মানিত নাগরিক (গেস্ট)',
      role: 'citizen',
      designation: 'সাধারণ নাগরিক',
      phone: '',
      nid: '',
      isAuthenticated: false
    };
  });

  useEffect(() => {
    // Listen for Firebase Auth changes
    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const email = fbUser.email?.toLowerCase() || '';
        let assignedRole: UserRole = 'secretary';
        if (email === 'baheratailunion@gmail.com') {
          assignedRole = 'developer';
        }

        const newSession: UserSession = {
          email,
          name: fbUser.displayName || 'অফিসিয়াল ইউজার',
          role: assignedRole,
          designation: assignedRole === 'developer' ? 'সিস্টেম ডেভেলপার' : 'ইউপি কর্মকর্তা',
          photoUrl: fbUser.photoURL || undefined,
          isAuthenticated: true
        };
        setSession(newSession);
      }
    });

    // Custom event listener for session changes
    const handleAdminAuthChanged = (e: CustomEvent<AdminUserRecord | null>) => {
      if (e.detail) {
        setSession({
          email: e.detail.email,
          name: e.detail.name,
          role: (e.detail.role as UserRole) || 'secretary',
          designation: e.detail.designation || 'ইউনিয়ন কর্মকর্তা',
          isAuthenticated: true
        });
      } else {
        // Fallback check
        const savedCitizen = localStorage.getItem('bup_active_citizen_session');
        if (savedCitizen) {
          try {
            const parsed = JSON.parse(savedCitizen);
            setSession({
              email: parsed.email || '',
              name: parsed.name || 'সম্মানিত নাগরিক',
              role: 'citizen',
              designation: 'সাধারণ নাগরিক',
              phone: parsed.phone || '',
              nid: parsed.nid || '',
              isAuthenticated: true
            });
            return;
          } catch (err) {}
        }

        setSession({
          email: '',
          name: 'সম্মানিত নাগরিক (গেস্ট)',
          role: 'citizen',
          designation: 'সাধারণ নাগরিক',
          phone: '',
          nid: '',
          isAuthenticated: false
        });
      }
    };

    window.addEventListener('adminAuthChanged' as any, handleAdminAuthChanged);

    return () => {
      unsubscribe();
      window.removeEventListener('adminAuthChanged' as any, handleAdminAuthChanged);
    };
  }, []);

  const switchRole = (newRole: UserRole) => {
    const updated: UserSession = {
      ...session,
      role: newRole,
      isAuthenticated: true,
      designation: 
        newRole === 'citizen' ? 'সাধারণ নাগরিক' :
        newRole === 'udc' ? 'ইউডিজি উদ্যোক্তা' :
        newRole === 'secretary' ? 'ইউপি সচিব' :
        newRole === 'chairman' ? 'ইউপি চেয়ারম্যান' :
        newRole === 'super_admin' ? 'সুপার এডমিন' : 'সিস্টেম ডেভেলপার'
    };
    setSession(updated);

    if (newRole !== 'citizen') {
      const adminObj: AdminUserRecord = {
        email: updated.email || 'admin@baheratailup.gov.bd',
        name: updated.name,
        role: newRole as any,
        designation: updated.designation,
        addedAt: new Date().toISOString(),
        status: 'active'
      };
      localStorage.setItem('bup_active_admin_session', JSON.stringify(adminObj));
      window.dispatchEvent(new CustomEvent('adminAuthChanged', { detail: adminObj }));
    } else {
      localStorage.removeItem('bup_active_admin_session');
      window.dispatchEvent(new CustomEvent('adminAuthChanged', { detail: null }));
    }
  };

  const logout = () => {
    localStorage.removeItem('bup_active_admin_session');
    localStorage.removeItem('bup_active_citizen_session');
    setSession({
      email: '',
      name: 'সম্মানিত নাগরিক (গেস্ট)',
      role: 'citizen',
      designation: 'সাধারণ নাগরিক',
      phone: '',
      nid: '',
      isAuthenticated: false
    });
    window.dispatchEvent(new CustomEvent('adminAuthChanged', { detail: null }));
  };

  return {
    session,
    role: session.role,
    user: session,
    isAuthenticated: session.isAuthenticated,
    isCitizen: session.role === 'citizen',
    isUdc: session.role === 'udc' || session.role === 'member',
    isSecretary: session.role === 'secretary',
    isChairman: session.role === 'chairman',
    isSuperAdmin: session.role === 'super_admin',
    isDeveloper: session.role === 'developer',
    switchRole,
    logout
  };
}
