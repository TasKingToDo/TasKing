import React, { useEffect, useState, useContext } from 'react';
import { Button, Text, View, StyleSheet, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { doc, setDoc, onSnapshot} from "firebase/firestore";

import useTheme from '@/config/useTheme';
import { SettingsContext } from '@/config/SettingsContext';
import { FIREBASE_DB } from '@/firebaseConfig';
import { authContext } from '@/config/authContext';

const StatisticsScreen = ({ navigation }) => {
    const settings = useContext(SettingsContext);
    const colors = useTheme();
    const { user } = useContext(authContext);
    const [stats, setStats] = useState<any>(null); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
    
        const statsRef = doc(FIREBASE_DB, "stats", user.uid);
    
        const unsubscribe = onSnapshot(statsRef, async (docSnap) => {
            try {
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
                    lastLoginDate: '',
                    accountCreated: user?.metadata?.creationTime || '',
                  };
    
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const mergedStats = { ...defaultStats, ...data };
    
                    // Update Firestore if there are missing fields
                    if (Object.keys(data).length < Object.keys(defaultStats).length) {
                        await setDoc(statsRef, mergedStats); // fill in gaps
                    }
    
                    setStats(mergedStats);
                } else {
                    await setDoc(statsRef, defaultStats);
                    setStats(defaultStats);
                }
    
                setLoading(false);
            } catch (error) {
                console.error("Error with real-time stats:", error);
            }
        });
    
        return () => unsubscribe();
    }, [user]);

    if (!settings || !user || loading || !stats) {
        return <ActivityIndicator style={{ flex: 1 }} />;
    }

    const textColor = colors.black;

    // Days since joined
    const localToday = new Date();
    localToday.setHours(0, 0, 0, 0);

    const createdDate = stats.accountCreated ? new Date(stats.accountCreated) : null;
    if (createdDate) createdDate.setHours(0, 0, 0, 0);

    const daysSinceJoined = createdDate ? Math.round((localToday.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;


    const categorizedStats = [
        {
            title: "Account Info",
            data: [
                { label: "Account Created", value: stats.accountCreated  ? new Date(stats.accountCreated).toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'})  : "N/A" },
                { label: "Days Since Joined", value: daysSinceJoined },
            ]
        },
        {
          title: "General Stats",
          data: [
                { label: "Tasks Completed", value: stats.tasksCompleted },
                { label: "Tasks Created", value: stats.tasksCreated },
                { label: "Tasks This Week", value: stats.tasksCompletedThisWeek },
          ]
        },
        {
          title: "Time-Based Stats",
          data: [
                { label: "Current Streak", value: stats.currentStreak },
                { label: "Longest Streak", value: stats.longestStreak },
                { label: "Days Active", value: stats.daysActive },
          ]
        },
        {
          title: "Currency Stats",
          data: [
                { label: "Total XP Earned", value: stats.totalXpEarned },
                { label: "Total Coins Earned", value: stats.totalBalanceEarned },
                { label: "Coins Spent", value: stats.coinsSpent },
          ]
        },
      ];

    return (
        <View style={[styles.background, { backgroundColor: colors.white }]}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <View style={{ position: 'absolute', left: 15, top: Platform.OS === 'ios' ? 50 : 30 }}>
                    <Button title="Back" color={colors.secondary} onPress={() => navigation.goBack()} />
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={[styles.headerText, { color: colors.black }]}>
                        Your Stats
                    </Text>
                </View>
            </View>

            {/* Categorized Stats */}
            <ScrollView contentContainerStyle={styles.statsContainer}>
                {categorizedStats.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={{ marginBottom: 30 }}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>{section.title}</Text>
                        {section.data.map((item, itemIndex) => (
                            <Text key={itemIndex} style={[styles.stat, { color: textColor }]}>
                                {item.label}: {item.value}
                            </Text>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        position: 'relative',
    },
    headerText: {
        fontSize: 26,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    stat: {
        fontSize: 20,
        marginVertical: 10,
    },
    statsContainer: {
        marginTop: 30,
        paddingBottom: 100,
        paddingHorizontal: 20,
        marginLeft: 20,
    },
});

export default StatisticsScreen;
