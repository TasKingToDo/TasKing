import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '@/firebaseConfig';
import { Platform, View, ActivityIndicator, AppState } from 'react-native';

interface AuthContextType {
  user: User | null;
}

export const authContext = createContext<AuthContextType>({ user: null });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(FIREBASE_AUTH, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        const statsRef = doc(FIREBASE_DB, 'stats', currentUser.uid);
        const userRef = doc(FIREBASE_DB, 'users', currentUser.uid);
        const statsSnap = await getDoc(statsRef);

        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        const defaultStats = {
          tasksCompleted: 0,
          tasksCreated: 0,
          totalXpEarned: 0,
          totalBalanceEarned: 0,
          coinsSpent: 0,
          tasksCompletedThisWeek: 0,
          currentStreak: 0,
          longestStreak: 0,
          daysActive: 0,
          lastLoginDate: todayStr,
          lastTaskCompletedDate: '',
          xp: 0,
          balance: 0,
          accountCreated: currentUser.metadata?.creationTime || todayStr,
        };

        // Presence: mark user online
        await updateDoc(userRef, { online: true });

        if (statsSnap.exists()) {
          const statsData = statsSnap.data();
          const lastLogin = statsData.lastLoginDate ? new Date(statsData.lastLoginDate) : null;
        
          const lastLoginWasToday = lastLogin?.toDateString() === today.toDateString();
        
          const updates: any = {};
        
          if (!lastLoginWasToday) {
            updates.daysActive = (statsData.daysActive ?? 0) + 1;
            updates.lastLoginDate = todayStr;
          }
        
          await updateDoc(statsRef, updates);
        } else {
          await setDoc(statsRef, defaultStats);
        }        

        // Offline handler
        const goOffline = async () => {
          try {
            await updateDoc(userRef, { online: false });
          } catch (e) {
            console.warn("Failed to mark offline:", e);
          }
        };

        // Web: before tab closes
        if (Platform.OS === 'web') {
          window.addEventListener("beforeunload", goOffline);
        } else {
          // Mobile: AppState listener
          const handleAppStateChange = (state: string) => {
            if (state === 'background' || state === 'inactive') {
              goOffline();
            } else if (state === 'active') {
              updateDoc(userRef, { online: true });
            }
          };
          const subscription = AppState.addEventListener("change", handleAppStateChange);

          // Clean up
          return () => {
            subscription.remove();
            goOffline();
          };
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <authContext.Provider value={{ user }}>{children}</authContext.Provider>;
};