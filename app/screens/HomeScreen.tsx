import React, { useContext, useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet, Pressable, TouchableOpacity, Modal, Dimensions, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { collection, deleteDoc, doc, updateDoc, query, where, getDoc, onSnapshot, increment, setDoc } from "firebase/firestore";
import { GestureHandlerRootView, Gesture, GestureDetector, NativeViewGestureHandler, } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, interpolate } from 'react-native-reanimated';
import { CirclePlus, Bell, SquarePen, } from 'lucide-react-native';
import { useNavigation } from "@react-navigation/native";
import * as Progress from 'react-native-progress';

import useTheme from '@/config/useTheme';
import { themes } from '@/config/colors';
import { FIREBASE_DB } from '@/firebaseConfig';
import { authContext } from '@/config/authContext';
import CustomMenu from '@/config/customMenu';
import ShopScreen from './ShopScreen';
import PressableButton from '@/config/PressableButton';

// Constants
const screenHeight = Dimensions.get('window').height;

// Types
type Subtask = {
    text: string;
    completed: boolean;
}

type Task = {
    id: string;
    name: string;
    date: string;
    time: string;
    repeat: string | { type: string; interval: number };
    completed?: boolean;
    createdAt: string;
    subtasks: Subtask[];
    notificationPreset?: number | null;
    userId?: string,
    collaboratorId?: string,
    collaboratorPermission: string,
};

const SwipeableTask = ({
    item, getSharingLabel, formatRepeat, colors, navigation, onPress, onDelete, onComplete, canEditTask, handleNotificationPress, onToggleSubtask, expandedTask, scrollRef
} : {
    item: Task;
    getSharingLabel: (task: Task) => string | null;
    formatRepeat: (r: Task['repeat']) => string;
    colors: any;
    navigation: any;
    onPress: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    onComplete: (task: Task) => void;
    canEditTask: (task: Task) => boolean;
    handleNotificationPress: (taskId: string) => void;
    onToggleSubtask: (taskId: string, subtaskIndex: number) => void;
    expandedTask: string | null;
    scrollRef: React.RefObject<any>;
}) => {
        // Task swiping
        const translateX = useSharedValue(0);
      
        const swipeGesture = Gesture.Pan()
            .onUpdate((event) => {
                translateX.value = event.translationX * 0.6;
            })
            .onEnd(() => {
                if (translateX.value > 120) {
                runOnJS(onDelete)(item.id);
                } else if (translateX.value < -120) {
                runOnJS(onComplete)(item);
                }
                translateX.value = withSpring(0, {
                damping: 25,
                stiffness: 200,
                });
            })
            .failOffsetY([-10, 10])
            .simultaneousWithExternalGesture(scrollRef);

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ translateX: translateX.value }],
        }));

        const deleteBoxStyle = useAnimatedStyle(() => ({
            width: Math.max(0, translateX.value),
            opacity: translateX.value > 10 ? 1 : 0,
            justifyContent: 'center',
            alignItems: 'center',
        }));
        
        const completeBoxStyle = useAnimatedStyle(() => ({
            width: Math.max(0, -translateX.value),
            opacity: translateX.value < -10 ? 1 : 0,
            justifyContent: 'center',
            alignItems: 'center',
        }));
        
        const showDeleteText = useAnimatedStyle(() => {
            const opacity = interpolate(translateX.value, [80, 120], [0, 1], 'clamp');
            const scale = interpolate(translateX.value, [80, 120], [0.9, 1], 'clamp');
            return {
              opacity,
              transform: [{ scale }],
            };
        });
        
        const showCompleteText = useAnimatedStyle(() => {
            const opacity = interpolate(translateX.value, [-120, -80], [1, 0], 'clamp');
            const scale = interpolate(translateX.value, [-120, -80], [1, 0.9], 'clamp');
            return {
              opacity,
              transform: [{ scale }],
            };
        });
      
        return (
            <View style={styles.swipeableWrapper}>
                {/* Background Action Boxes */}
                <Animated.View style={[styles.swipeBackgroundBox, {backgroundColor: colors.decline, left: 0}, deleteBoxStyle]}>
                    <Animated.View style={showDeleteText}>
                        <Text style={{fontWeight: 'bold', color: themes.light.black}}>Deleting...</Text>
                    </Animated.View>
                </Animated.View>

                <Animated.View style={[styles.swipeBackgroundBox, {backgroundColor: colors.accept, right: 0}, completeBoxStyle]}>
                    <Animated.View style={showCompleteText}>
                        <Text style={[{fontWeight: 'bold', color: themes.light.black}, ]}>{item.completed ? 'Undoing...' : 'Completing...'}</Text>
                    </Animated.View>
                </Animated.View>

                {/* Swipeable Foreground */}
                <GestureDetector gesture={swipeGesture}>
                    <Animated.View style={ animatedStyle }>
                        <Pressable onPress={() => onPress(item.id)}>
                            <View style={[styles.taskContainer, { backgroundColor: colors.white }]}>
                                {/* Task Name, Edit Button, and Notif Bell */}
                                <View style={styles.headerRow}>
                                    <Text style={[styles.taskTitle, { color: colors.black }]} numberOfLines={1} ellipsizeMode='tail'>
                                        {item.name} {item.completed ? "✅" : ""}
                                    </Text>
                                    <View style={styles.iconRow}>
                                        {canEditTask(item) && (
                                            <PressableButton onPress={() => navigation.navigate("Create Task", { taskId: item.id })} style={styles.iconButton}>
                                                <SquarePen size={20} color={colors.grey} />
                                            </PressableButton>
                                        )}
                                        <PressableButton onPress={() => handleNotificationPress(item.id)} style={styles.iconButton}>
                                            <Bell size={20} color={item.notificationPreset ? 'orange' : 'gray'} />
                                        </PressableButton>
                                    </View>
                                </View>

                                {/* Date and Time */}
                                <Text style={[styles.taskDetails, { color: colors.black }]}>
                                    📅 {item.date} ⏰ {item.time}
                                </Text>
                                                
                                {/* Repeat */}
                                {item.repeat !== "none" && (
                                    <Text style={[styles.taskDetails, { color: colors.black }]}>
                                        🔁 Repeat: {formatRepeat(item.repeat)}
                                    </Text>
                                )}

                                {/* Shared */}
                                {getSharingLabel(item) && <Text style={[styles.sharingLabel, { color: colors.secondary }]}>{getSharingLabel(item)}</Text>}

                                {/* Subtasks */}
                                {expandedTask === item.id && item.subtasks && item.subtasks.length > 0 && (
                                    <View>
                                        {item.subtasks.map((subtask, index) => (
                                            <Pressable key={index} onPress={() => onToggleSubtask(item.id, index)}>
                                                <Text style={[styles.taskDetails, { color: colors.black, textDecorationLine: subtask.completed ? 'line-through' : 'none', opacity: subtask.completed ? 0.5 : 1, }]}>
                                                    • {subtask.text} {subtask.completed ? "✅" : ""}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </Pressable>
                    </Animated.View>
                </GestureDetector>
            </View>
        );
    };

// Main Screen
const HomeScreen = () => {
    // Constants
    const colors = useTheme();
    const { user } = useContext(authContext);
    const [rawTasks, setRawTasks] = useState<any[]>([]);
    const [sortOption, setSortOption] = useState<string>('createdAt');
    const [showOnlyShared, setShowOnlyShared] = useState<boolean>(false);
    const [userMap, setUserMap] = useState<Record<string, string>>({});
    const [expandedTask, setExpandedTask] = useState<string | null>(null);
    // Nav constant
    const navigation = useNavigation();
    // XP and Level constants
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(0);
    const [xpProgress, setXpProgress] = useState(0);
    // Notification constants
    const [notificationModalVisible, setNotificationModalVisible] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [inAppNotifications, setInAppNotifications] = useState<Array<{ id: string, title: string, message: string }>>([]);
    // Drag constants
    const snapPoints = {
        top: screenHeight * 0.015,
        middle: screenHeight * 0.45,
        bottom: screenHeight * 0.90,
    };
    const dragY = useSharedValue(snapPoints.middle);
    const startY = useSharedValue(0);
    const scrollRef = useRef<NativeViewGestureHandler>(null);

    // XP calculator function
    const calculateLevel = (xp: number) => {
        let level = 0;
        let xpThreshold = 0;
        let nextThreshold = 20;

        while (xp >= xpThreshold + nextThreshold) {
            xpThreshold += nextThreshold;
            level++;
        }

        return { level, xpThreshold, nextThreshold };
    };

    // Grab XP and Level from Database
    useEffect(() => {
        if (!user) return;

        const userDocRef = doc(FIREBASE_DB, "users", user.uid);

        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                const userXp = userData?.xp || 0;
                setXp(userXp);

                const { level, xpThreshold, nextThreshold } = calculateLevel(userXp);
                
                setLevel(level);

                const xpIntoCurrentLevel = userXp - xpThreshold;
                const xpProgress = nextThreshold > 0 ? Math.max(0, Math.min(1, xpIntoCurrentLevel / nextThreshold)) : 0;
                setXpProgress(xpProgress);

                if (userData.level !== level) {
                    updateDoc(userDocRef, { level: level })
                }
            }
        });

        return () => unsubscribe();
    }, [user]);

    // Grabs tasks to display to both collaborators and users.
    useEffect(() => {
        if (!user) return;

        const tasksRef = collection(FIREBASE_DB, "tasks");

        const ownerQuery = query(tasksRef, where("userId", "==", user.uid));
        const collaboratorQuery = query(tasksRef, where("collaboratorId", "==", user.uid));

        const unsubOwner = onSnapshot(ownerQuery, (ownerSnapshot) => {
            const ownerTasks = ownerSnapshot.docs.map(doc => normalizeTask(doc.id, doc.data()));
            setRawTasks(prev => mergeTaskLists(prev, ownerTasks));
        });

        const unsubCollaborator = onSnapshot(collaboratorQuery, (collabSnapshot) => {
            const collabTasks = collabSnapshot.docs.map(doc => normalizeTask(doc.id, doc.data()));
            setRawTasks(prev => mergeTaskLists(prev, collabTasks));
        });

        return () => {
            unsubOwner();
            unsubCollaborator();
        };
    }, [user]);

    // Properly sorts task based on certain criteria
    const sortTasks = (tasks: Task[], option: string): Task[] => {
        return [...tasks].sort((a, b) => {
            if (option === 'name') return a.name.localeCompare(b.name);
            if (option === 'date') return new Date(a.date).getTime() - new Date(b.date).getTime();
            if (option === 'createdAt') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (option === 'reverseCreatedAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            return 0;
        });
    };

    const allTasks = React.useMemo(() => sortTasks(rawTasks, sortOption), [rawTasks, sortOption]);
    const filteredTasks = showOnlyShared ? allTasks.filter(t => (t.userId === user.uid && !!t.collaboratorId) || t.collaboratorId === user.uid) : allTasks;

    // Grabs task to be sorted between shared or all.
    useEffect(() => {
        const fetchUsers = async () => {
            const usersSnapshot = await getDoc(doc(FIREBASE_DB, "users", user.uid));
            const userMapData: Record<string, string> = {};

            if (usersSnapshot.exists()) {
                userMapData[user.uid] = usersSnapshot.data().username;
            }

            const taskUsers = allTasks.reduce<string[]>((acc, task) => {
                if (task.userId && !acc.includes(task.userId)) acc.push(task.userId);
                if (task.collaboratorId && !acc.includes(task.collaboratorId)) acc.push(task.collaboratorId);
                return acc;
            }, []);

            await Promise.all(taskUsers.map(async (uid) => {
                if (!userMapData[uid]) {
                    const snap = await getDoc(doc(FIREBASE_DB, "users", uid));
                    if (snap.exists()) userMapData[uid] = snap.data().username;
                }
            }));

            setUserMap(userMapData);
        };

        if (user && allTasks?.length >= 0) fetchUsers();
    }, [allTasks]);

    // Sets of grabbing information for notifications.
    useEffect(() => {
        if (!user) return;
    
        const notifRef = collection(FIREBASE_DB, `users/${user.uid}/notifications`);
        const unsubscribe = onSnapshot(notifRef, (snapshot) => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                const data = change.doc.data();
                Toast.show({
                    type: 'success',
                    text1: data.title,
                    text2: data.message,
                    position: 'top',
                    visibilityTime: 5000,
                });
                }
            });
        });
    
        return () => unsubscribe();
    }, [user]);

    // Gesture Handler
    const dragGesture = Gesture.Pan()
        .onStart(() => {
            startY.value = dragY.value;
        })
        .onUpdate((e) => {
            dragY.value = Math.min(
                Math.max(startY.value + e.translationY, snapPoints.top), snapPoints.bottom
            );
        })
        .onEnd(() => {
            if (dragY.value < snapPoints.middle * 0.75) {
                dragY.value = withSpring(snapPoints.top);
            } else if (dragY.value > snapPoints.middle * 1.25) {
                dragY.value = withSpring(snapPoints.bottom);
            } else {
                dragY.value = withSpring(snapPoints.middle);
            }
        })

    // Animated task view
    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: dragY.value }],
    }));

    // Navbar Style for animation
    const navbarAnimatedStyle = useAnimatedStyle(() => {
        const fadeStart = snapPoints.middle;
        const fadeEnd = snapPoints.bottom;
        const range = fadeEnd - fadeStart;
        const progress = (dragY.value - fadeStart) / range;
      
        const clamped = Math.max(0, Math.min(progress, 1));
        const opacity = 1 - clamped;
        const translateY = clamped * 80;
      
        return {
            opacity,
            transform: [{ translateY }],
        };
    });

    const normalizeTask = (id: string, data: any): Task => {
        return {
            id,
            ...data,
            subtasks: Array.isArray(data.subtask) ? data.subtask.map((sub: any) => ({text: sub.text, completed: sub.completed ?? false})) : []
        };
    };
    
    const mergeTaskLists = (prev: any[], incoming: any[]) => {
        const map = new Map(prev.map(task => [task.id, task]));
        for (let task of incoming) {
          map.set(task.id, task);
        }
        return Array.from(map.values()); // no sort here anymore
    };    

    const updateTaskCompletion = async (task: Task, markComplete: boolean) => {
        if (!user) return;
    
        const taskRef = doc(FIREBASE_DB, "tasks", task.id);
        const userRef = doc(FIREBASE_DB, "users", user.uid);
        const statsRef = doc(FIREBASE_DB, "stats", user.uid);
    
        const [taskSnap, userSnap, statsSnap] = await Promise.all([
            getDoc(taskRef),
            getDoc(userRef),
            getDoc(statsRef)
        ]);
    
        if (!taskSnap.exists() || !userSnap.exists()) {
            console.error("Task or user not found!");
            return;
        }
    
        const taskData = taskSnap.data();
        const userData = userSnap.data();
        const statsData = statsSnap.exists() ? statsSnap.data() : null;
    
        const taskXp = taskData.xp || 0;
        const taskBalance = taskData.balance || 0;
        const now = new Date();
        const todayStr = new Date().toLocaleDateString('en-CA');
        const wasRewarded = taskData.rewarded || false;
    
        let baseXp = userData.xp || 0;
        let baseBalance = userData.balance || 0;
    
        let newXp = markComplete ? baseXp + taskXp : baseXp - taskXp;
        let newBalance = markComplete ? baseBalance + taskBalance : baseBalance - taskBalance;
    
        // Only update XP/balance/stats if reward state is changing
        if (markComplete && !wasRewarded) {
            // Bonus incentives for shared tasks
            if (taskData.collaboratorId) {
                const bonusXp = Math.floor(taskXp * 0.3);
                const bonusBalance = Math.floor(taskBalance * 0.3);

                const totalXp = taskXp + bonusXp;
                const totalBalance = taskBalance + bonusBalance;

                const creatorRef = doc(FIREBASE_DB, "users", taskData.userId);
                const collaboratorRef = doc(FIREBASE_DB, "users", taskData.collaboratorId);

                await Promise.all([
                    updateDoc(creatorRef, {
                        xp: increment(totalXp),
                        balance: increment(totalBalance),
                    }),
                    updateDoc(collaboratorRef, {
                        xp: increment(totalXp),
                        balance: increment(totalBalance),
                    }),
                ]);
            }
    
            // Handle repeat task scheduling
            if (task.repeat && task.repeat !== "none") {
                let nextDate = new Date(task.date);
                if (typeof task.repeat === "object") {
                if (task.repeat.type === "days") nextDate.setDate(nextDate.getDate() + task.repeat.interval);
                if (task.repeat.type === "weeks") nextDate.setDate(nextDate.getDate() + task.repeat.interval * 7);
                if (task.repeat.type === "months") nextDate.setMonth(nextDate.getMonth() + task.repeat.interval);
                } else if (task.repeat === "daily") {
                    nextDate.setDate(nextDate.getDate() + 1);
                } else if (task.repeat === "weekly") {
                    nextDate.setDate(nextDate.getDate() + 7);
                } else if (task.repeat === "monthly") {
                    nextDate.setMonth(nextDate.getMonth() + 1);
                }
    
                await updateDoc(taskRef, {
                    date: nextDate.toISOString().split("T")[0],
                    completed: false,
                    rewarded: false
                });
            } else {
                await updateDoc(taskRef, {
                completed: true,
                rewarded: true
                });
            }
    
            // Handle stats
            if (!statsData) {
                await setDoc(statsRef, {
                    tasksCompleted: 1,
                    totalBalanceEarned: taskBalance,
                    totalXpEarned: taskXp,
                    tasksCompletedThisWeek: 1,
                    daysActive: 1,
                    lastLoginDate: todayStr,
                    currentStreak: 1,
                    longestStreak: 1,
                    lastTaskCompletedDate: now.toISOString(),
                }, { merge: true });
            } else {
                const updates: any = {
                    tasksCompleted: increment(1),
                    totalBalanceEarned: increment(taskBalance),
                    totalXpEarned: increment(taskXp),
                    lastTaskCompletedDate: now.toISOString(),
            };
    
            // Handles streaks which are based on completing atleast one task on a newly logged day
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
    
            const lastCompleted = statsData.lastTaskCompletedDate ? new Date(statsData.lastTaskCompletedDate) : null;
            const completedThisWeek = lastCompleted && lastCompleted >= startOfWeek;
    
            updates.tasksCompletedThisWeek = completedThisWeek ? increment(1) : 1;
    
            const lastCompletedStr = lastCompleted?.toISOString().split("T")[0] ?? null;
    
            if (lastCompletedStr !== todayStr) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split("T")[0];
    
                const isYesterday = lastCompletedStr === yesterdayStr;
    
                if (isYesterday) {
                    const nextStreak = (statsData.currentStreak || 0) + 1;
                    updates.currentStreak = nextStreak;
                    if (nextStreak > (statsData.longestStreak || 0)) {
                        updates.longestStreak = nextStreak;
                    }
                } else {
                    updates.currentStreak = 1;
                    if ((statsData.longestStreak || 0) < 1) {
                        updates.longestStreak = 1;
                    }
                }
    
                updates.lastTaskCompletedDate = now.toISOString();
            }
    
            await updateDoc(statsRef, updates);
        }
    
        } else if (!markComplete && wasRewarded) {
            await updateDoc(userRef, {
                xp: Math.max(0, newXp),
            });
    
            const updates: any = {
                tasksCompleted: increment(-1),
                totalXpEarned: increment(-taskXp),
                tasksCompletedThisWeek: increment(-1),
            };
    
            await updateDoc(statsRef, updates);
            await updateDoc(taskRef, { completed: false, rewarded: false });
    
            if (taskData.collaboratorId) {
                const bonusXp = Math.floor(taskXp * 0.3);
        
                const creatorRef = doc(FIREBASE_DB, "users", taskData.userId);
                const collaboratorRef = doc(FIREBASE_DB, "users", taskData.collaboratorId);
        
                await Promise.all([
                    updateDoc(creatorRef, {
                        xp: increment(-bonusXp),
                    }),
                    updateDoc(collaboratorRef, {
                        xp: increment(-bonusXp),
                    }),
                ]);
            }
        } else {
            await updateDoc(taskRef, { completed: markComplete });
        }
    
        Toast.show({
            type: markComplete ? 'success' : 'info',
            text1: markComplete ? "Task Completed!" : "Task Undone",
            text2: markComplete ? `You gained ${taskXp} XP and ${taskBalance} coins.` + (taskData.collaboratorId ? ` (+${Math.floor(taskXp * 0.3)} bonus XP & +${Math.floor(taskBalance * 0.3)} bonus coins for collaboration)` : '') : `You lost ${taskXp} XP.` + (taskData.collaboratorId ? ` (+${Math.floor(taskXp * 0.3)} bonus XP)` : ''),
            position: 'top',
            visibilityTime: 5000,
        });
    
        if (taskData.collaboratorId) {
            const collaboratorNotifRef = doc(FIREBASE_DB, `users/${taskData.collaboratorId}/notifications`, task.id);
          
            await setDoc(collaboratorNotifRef, {
                title: markComplete ? "Shared Task Completed 🎉" : "Task Reopened ✏️",
                message: markComplete ? `${userData.username || 'Your friend'} completed "${task.name}"` : `${userData.username || 'Your friend'} reopened "${task.name}"`,
                createdAt: new Date().toISOString(),
            });
        }
          
        if (markComplete && !wasRewarded) {
            const collaboratorNotifRef = doc(FIREBASE_DB, `users/${taskData.collaboratorId}/notifications`, task.id);
          
            await setDoc(collaboratorNotifRef, {
                title: "Shared Task Completed 🎉",
                message: `${userData.username || 'Your friend'} completed "${task.name}"`,
                createdAt: new Date().toISOString(),
            });
        }
    }; 
    
    // Handles completeting a task
    const handleCompleteTask = async (task: Task) => {
        const markComplete = !task.completed;
        const updatedSubtasks = task.subtasks.map(sub => ({ ...sub, completed: markComplete }));

        setRawTasks(prev =>
            prev.map(t =>  t.id === task.id ? { ...t, completed: markComplete, subtasks: updatedSubtasks } : t)
        );
      
        try {
            const taskRef = doc(FIREBASE_DB, "tasks", task.id);
            await updateDoc(taskRef, { completed: markComplete, subtask: updatedSubtasks });
            await updateTaskCompletion({ ...task, subtasks: updatedSubtasks }, markComplete);
        } catch (error) {
            console.error("Failed to update task:", error);
        }
    };      
    
    // Handles deleting a task
    const handleDeleteTask = async (taskId: string) => {
        setRawTasks(prev => prev.filter(t => t.id !== taskId));
      
        try {
            const taskRef = doc(FIREBASE_DB, "tasks", taskId);
            await deleteDoc(taskRef);
        } catch (error) {
            console.error("Failed to delete task:", error);
        }
    };
    
    // Handles subtask completion
    const toggleSubtaskCompletion = async (taskId: string, subtaskIndex: number) => {
        const task = allTasks.find(t => t.id === taskId);
        if (!task) return;
    
        const updatedSubtasks = task.subtasks.map((sub, index) =>
            index === subtaskIndex ? { ...sub, completed: !sub.completed } : sub
        );
        const allSubtasksCompleted = updatedSubtasks.every(sub => sub.completed);
        const taskRef = doc(FIREBASE_DB, "tasks", taskId);
    
        await updateDoc(taskRef, {
            subtask: updatedSubtasks,
            completed: allSubtasksCompleted
        });
    
        if (allSubtasksCompleted && !task.completed) {
            await updateTaskCompletion({ ...task, subtasks: updatedSubtasks }, true);
        } else if (!allSubtasksCompleted && task.completed) {
            await updateTaskCompletion({ ...task, subtasks: updatedSubtasks }, false);
        }
    };
    
    // Sets up the formatting for how repeats appear
    const formatRepeat = (repeat: string | { type: string; interval: number; } | null) => {
        if (!repeat || repeat === "none") return "";
    
        if (typeof repeat === 'object' && repeat !== null) {
            return `${repeat.interval} ${repeat.type}`;
        }
    
        return repeat.charAt(0).toUpperCase() + repeat.slice(1);
    };             
    
    // Handles expanding a task
    const handleTaskPress = (taskId: string) => {
        const task = allTasks.find(t => t.id === taskId);
        if (!task || !Array.isArray(task.subtasks) || task.subtasks.length === 0) {
            return;
        }
        setExpandedTask(expandedTask === taskId ? null : taskId);
    };
    
    const canEditTask = (task: Task): boolean => {
        return (
          task.userId === user.uid ||
          (task.collaboratorId === user.uid && task.collaboratorPermission === 'edit')
        );
    };
    
    // Shows the proper label for if a task is shared to someone or shared to you
    const getSharingLabel = (task: Task): string | null => {
        if (!user || !userMap) return null;
        if (task.userId === user.uid && task.collaboratorId) {
          return `Shared with ${userMap[task.collaboratorId] || 'collaborator'}`;
        }
        if (task.collaboratorId === user.uid) {
          return `Shared by ${userMap[task.userId] || 'creator'}`;
        }
        return null;
    };
    
    // Notification functions
    const scheduleNotification = async (task: Task, presetHours: number) => {
        const taskDueDate = new Date(`${task.date}T${task.time}`);
        const triggerTime = new Date(taskDueDate.getTime() - presetHours * 60 * 60 * 1000);
        
        const now = Date.now();
    
        if (triggerTime.getTime() <= now) {
            console.warn("Notification time is in the past. Cannot schedule.");
            return;
        }
    
        const delay = triggerTime.getTime() - now;
    
        setTimeout(() => {
            Toast.show({
                type: 'info',
                text1: "Upcoming Task Reminder",
                text2: `${task.name} is due in ${presetHours} hour(s)!`,
                position: 'top',
                visibilityTime: 5000, // The banner will be visible for 5 seconds.
            });
        }, delay);
    
        // This doesn't really do much until I actually make notifications work work
        await updateDoc(doc(FIREBASE_DB, "tasks", task.id), {
            notificationPreset: presetHours,
        });
    };
    
    const handleNotificationPress = (taskId: string) => {
        setSelectedTaskId(taskId);
        setNotificationModalVisible(true);
    };
    
    const handlePresetSelection = async (presetHours: number) => {
        setNotificationModalVisible(false);
        const task = allTasks.find(t => t.id === selectedTaskId);
        if (task) {
            await scheduleNotification(task, presetHours);
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <SafeAreaView style={styles.container}>
                    {/* In-App Notification Banner */}
                    {inAppNotifications.map(notification => (
                    <View key={notification.id} style={styles.notificationBanner}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        <Text style={styles.notificationMessage}>{notification.message}</Text>
                    </View>
                    ))}

                    {/* Shop Screen */}
                    <ShopScreen />

                    {/* Main Task Content */}
                    <Animated.View style={[styles.sheetContainer, { backgroundColor: colors.primarySoft }, sheetStyle]}>
                        {/* Drag Bar*/}
                        <GestureDetector gesture={dragGesture}>
                            <View style={styles.dragHandleContainer}>
                                <View style={[styles.dragHandle, {backgroundColor: colors.black}]} />
                            </View>
                        </GestureDetector>
                        
                        {/* Task Sorter */}
                        {filteredTasks.length > 0 && (
                            <View style={styles.sortContainer}>
                                <Text style={[styles.sortLabel, { color: colors.black}]}>Sort By:</Text>
                                <Picker
                                    selectedValue={sortOption}
                                    onValueChange={(itemValue) => setSortOption(itemValue)}
                                    style={[styles.sortPicker, { color: colors.black}]}
                                    mode="dropdown"
                                    dropdownIconColor={colors.black}
                                >
                                    <Picker.Item label="Name" value="name" />
                                    <Picker.Item label="Date" value="date" />
                                    <Picker.Item label="Time Created (Oldest First)" value="createdAt" />
                                    <Picker.Item label="Time Created (Newest First)" value="reverseCreatedAt" />
                                </Picker>
                                <TouchableOpacity onPress={() => setShowOnlyShared(!showOnlyShared)} style={styles.sharedToggle}>
                                    <Text style={{ color: colors.black, fontSize: 16 }}>{showOnlyShared ? 'Show All Tasks' : 'Show Shared Only'}</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Task List */}
                        {Array.isArray(filteredTasks) && filteredTasks.length === 0 ? (
                            <Text style={styles.noTasksText}>No tasks available</Text>
                        ) : (
                            <NativeViewGestureHandler ref={scrollRef}>
                                <FlatList
                                    data={filteredTasks}
                                    scrollEnabled
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator
                                    keyExtractor={(item) => item.id}
                                    style={{ flexGrow: 0 }}
                                    contentContainerStyle={{ paddingBottom: 200, }}
                                    renderItem={({item}) => (
                                        <SwipeableTask 
                                            item={item}
                                            getSharingLabel={getSharingLabel}
                                            formatRepeat={formatRepeat}
                                            colors={colors}
                                            navigation={navigation}
                                            onPress={handleTaskPress}
                                            onDelete={handleDeleteTask}     
                                            onComplete={handleCompleteTask} 
                                            onToggleSubtask={toggleSubtaskCompletion}
                                            expandedTask={expandedTask}
                                            canEditTask={canEditTask}
                                            handleNotificationPress={handleNotificationPress}
                                            scrollRef={scrollRef}
                                        />
                                    )}
                                />
                            </NativeViewGestureHandler>
                        )}
                    </Animated.View>

                    {/* Navbar */}
                    <Animated.View style={[styles.navbar, { backgroundColor: colors.primary}, navbarAnimatedStyle]} pointerEvents='box-none'>
                        <CustomMenu />
                        <View style={styles.levelContainer}>
                            <View style={styles.progressBarContainer}>
                                <Progress.Bar 
                                    progress={xpProgress}
                                    width={150}
                                    height={30}
                                    color={colors.accept}
                                    borderColor={themes.light.black}
                                />
                                    <Text style={[styles.progressText, {color: themes.light.black}]}>
                                        {Math.round(xpProgress * 100)}%
                                    </Text>
                            </View>
                            <View style={{width: "7%"}} />
                            <Text style={[styles.levelText, { color: themes.light.black }]}>
                                Lvl. {level}
                            </Text>
                        </View>
                        <PressableButton style={styles.createTask} onPress={() => navigation.navigate('Create Task')}>
                            <CirclePlus size={70} color={themes.light.black} strokeWidth={1.5} />
                        </PressableButton>
                    </Animated.View>

                    {/* Notification Preset Modal */}
                    <Modal
                        transparent={true}
                        animationType="slide"
                        visible={notificationModalVisible}
                        onRequestClose={() => setNotificationModalVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Select Notification Preset</Text>
                                <TouchableOpacity onPress={() => handlePresetSelection(1)} style={styles.presetButton}>
                                    <Text style={styles.presetButtonText}>1 Hour Before</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handlePresetSelection(2)} style={styles.presetButton}>
                                    <Text style={styles.presetButtonText}>2 Hours Before</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handlePresetSelection(24)} style={styles.presetButton}>
                                    <Text style={styles.presetButtonText}>24 Hours Before</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setNotificationModalVisible(false)} style={styles.cancelButton}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </SafeAreaView>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    cancelButton: {
        marginTop: 10
    },
    cancelButtonText: {
        color: 'red',
        fontSize: 16
    },
    completeContainer: {
        backgroundColor: 'green',
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
    },
    completeText: { 
        color: 'white', 
        fontSize: 18, 
        fontWeight: 'bold' 
    },
    container: {
        flex: 1,
    },
    createTask: {
        height: 75,
        width: "17.5%",
        justifyContent: "center",
        alignItems: "center",
    },
    deleteContainer: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
    },
    deleteText: { 
        color: 'white', 
        fontSize: 18, 
        fontWeight: 'bold' 
    },
    dragHandle: {
        width: 70,
        height: 6,
        borderRadius: 3,
    },
    dragHandleContainer: {
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconButton: {
        marginLeft: 8,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    levelContainer: {
        height: 75,
        width: "65%",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
    levelText: {
        fontSize: 25,
        fontWeight: "bold",
        marginBottom: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 20,
        alignItems: 'center'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15
    },
    navbar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 75,
        zIndex: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 2,
        paddingHorizontal: 15,
    },
    notificationBanner: {
        backgroundColor: '#f0ad4e',
        padding: 10,
        margin: 10,
        borderRadius: 8,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#fff',
    },
    notificationTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#fff',
    },
    noTasksText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 30,
        fontWeight: "bold",
    },
    presetButton: {
        backgroundColor: '#2196F3',
        padding: 10,
        borderRadius: 8,
        marginVertical: 5,
        width: '80%',
        alignItems: 'center'
    },
    presetButtonText: {
        color: 'white',
        fontSize: 16
    },
    progressBarContainer: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    progressText: {
        position: "absolute",
        fontSize: 20,
        fontWeight: "bold",
    },
    sharedToggle: { 
        padding: 8, 
        borderRadius: 8 
    },
    sharingLabel: {
        fontStyle: 'italic',
        fontSize: 13,
        marginTop: 2,
        marginLeft: 4,
    },
    sheetContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 75,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        overflow: 'hidden',
    },
    sortContainer: { 
        flexDirection: "row", 
        alignItems: "center", 
        padding: 10,
    },
    sortLabel: { 
        fontSize: 16, 
        fontWeight: "bold", 
        marginRight: 10 
    },
    sortPicker: { 
        width: 200, 
        height: 50,
    },
    swipeBackgroundBox: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 120,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    swipeableWrapper: {
        position: 'relative',
        marginHorizontal: 16,
        marginVertical: 4,
    },
    taskContainer: {
        padding: 12,
        marginVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    taskDetails: {
        fontSize: 14,
        marginTop: 2,
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: "bold",
        maxWidth: '85%',
    },
    xpText: {
        fontSize: 15,
        marginTop: 5,
    },
});

export default HomeScreen;