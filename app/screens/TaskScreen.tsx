import React, { useContext, useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet, FlatList, Animated, Pressable} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { collection, deleteDoc, doc, getDocs, updateDoc, query, where, getDoc, onSnapshot, increment, setDoc } from "firebase/firestore";
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import colors from '../config/colors';
import { SettingsContext } from '../config/SettingsContext';
import { FIREBASE_DB } from '@/firebaseConfig';
import { authContext } from '../config/authContext';


type Subtask = {
    text: string;
    completed: boolean;
}

type Task = {
    id: string;
    name: string;
    date: string;
    time: string;
    repeat: string | {type: string, interval: number};
    completed?: boolean;
    createdAt: string;
    subtasks: Subtask[]
};


const TaskScreen = () => {
    const settings = useContext(SettingsContext);
    const { user } = useContext(authContext);
    const [tasks,setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTask, setExpandedTask] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<string>('createdAt');
    const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

    useEffect(() => {
        if (!user) return;
    
        const q = query(collection(FIREBASE_DB, "tasks"), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let fetchedTasks: Task[] = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name,
                    date: data.date,
                    time: data.time,
                    repeat: data.repeat,
                    completed: data.completed,
                    createdAt: data.createdAt,
                    subtasks: (data.subtask ?? []).map((sub: any) => ({
                        text: sub.text,
                        completed: sub.completed ?? false,
                    }))                    
                };
            });
    
            setTasks(sortTasks(fetchedTasks, sortOption));
            setLoading(false);
        });
    
        return () => unsubscribe(); // Clean up listener on unmount
    }, [user, sortOption]);

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteDoc(doc(FIREBASE_DB, "tasks", taskId));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
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
        const todayStr = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
        const wasRewarded = taskData.rewarded || false;
    
        const newXp = markComplete
            ? (userData.xp || 0) + taskXp
            : (userData.xp || 0) - taskXp;
    
        const newBalance = markComplete
            ? (userData.balance || 0) + taskBalance
            : (userData.balance || 0) - taskBalance;
    
        // === Only update XP/balance/stats if reward state is changing ===
        if (markComplete && !wasRewarded) {
            await updateDoc(userRef, {
                xp: Math.max(0, newXp),
                balance: Math.max(0, newBalance),
            });
    
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
    
            // === Handle stats ===
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
    
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
    
                const lastCompleted = statsData.lastTaskCompletedDate
                    ? new Date(statsData.lastTaskCompletedDate)
                    : null;
                const completedThisWeek = lastCompleted && lastCompleted >= startOfWeek;
    
                updates.tasksCompletedThisWeek = completedThisWeek ? increment(1) : 1;
    
                const lastLogin = statsData.lastLoginDate;
                const lastDate = lastLogin ? new Date(lastLogin) : null;
                const lastDateStr = lastDate?.toISOString().split("T")[0] ?? null;
    
                if (lastDateStr !== todayStr) {
                    updates.lastLoginDate = todayStr;
                  
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toLocaleDateString('en-CA');
                    const isYesterday = lastDateStr === yesterdayStr;
                  
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
                }                  
    
                await updateDoc(statsRef, updates);
            }
    
        } else if (!markComplete && wasRewarded) {
            // === Undo reward ===
            await updateDoc(userRef, {
                xp: Math.max(0, newXp),
                balance: Math.max(0, newBalance),
            });
    
            const updates: any = {
                tasksCompleted: increment(-1),
                totalBalanceEarned: increment(-taskBalance),
                totalXpEarned: increment(-taskXp),
                tasksCompletedThisWeek: increment(-1),
            };
    
            await updateDoc(statsRef, updates);
            await updateDoc(taskRef, { completed: false, rewarded: false });
        } else {
            // No XP/stat updates needed
            await updateDoc(taskRef, { completed: markComplete });
        }
    
        Toast.show({
            type: markComplete ? 'success' : 'info',
            text1: markComplete ? "Task Completed!" : "Task Undone",
            text2: markComplete
                ? `You gained ${taskXp} XP and ${taskBalance} coins.`
                : `You lost ${taskXp} XP and ${taskBalance} coins.`,
            position: 'top',
            visibilityTime: 5000,
        });
    };        

    const handleCompleteTask = async (task: Task) => {
        const markComplete = !task.completed;
    
        // Update subtasks accordingly
        const updatedSubtasks = task.subtasks.map(sub => ({
            ...sub,
            completed: markComplete
        }));
    
        // Update subtasks in Firestore
        const taskRef = doc(FIREBASE_DB, "tasks", task.id);
        await updateDoc(taskRef, {
            subtask: updatedSubtasks
        });
    
        // Proceed with reward/stat logic
        await updateTaskCompletion({ ...task, subtasks: updatedSubtasks }, markComplete);
    };       

    const toggleSubtaskCompletion = async (taskId: string, subtaskIndex: number) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
    
        const updatedSubtasks = [...task.subtasks];
        const subtask = updatedSubtasks[subtaskIndex];
    
        updatedSubtasks[subtaskIndex] = {
            ...subtask,
            completed: !subtask.completed,
        };
    
        const allSubtasksCompleted = updatedSubtasks.every(sub => sub.completed);
        const taskRef = doc(FIREBASE_DB, "tasks", taskId);
    
        try {
            // Update just the subtask array first
            await updateDoc(taskRef, {
                subtask: updatedSubtasks,
                completed: allSubtasksCompleted
            });
    
            // Trigger full task logic if needed
            if (allSubtasksCompleted && !task.completed) {
                await updateTaskCompletion({ ...task, subtasks: updatedSubtasks }, true);
            } else if (!allSubtasksCompleted && task.completed) {
                await updateTaskCompletion({ ...task, subtasks: updatedSubtasks }, false);
            }
    
        } catch (error) {
            console.error("Error updating subtask:", error);
        }
    };    
    
    const sortTasks = (tasks: Task[], option: string): Task[] => {
        return [...tasks].sort((a, b) => {
            if (option === 'name') return a.name.localeCompare(b.name);
            if (option === 'date') return new Date(a.date).getTime() - new Date(b.date).getTime();
            if (option === 'createdAt') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (option === 'reverseCreatedAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            return 0;
        });
    };
    
    const formatRepeat = (repeat: string | { type: string; interval: number; } | null) => {
        if (!repeat || repeat === "none") return "";
    
        if (typeof repeat === 'object' && repeat !== null) {
            return `${repeat.interval} ${repeat.type}`;
        }
    
        return repeat.charAt(0).toUpperCase() + repeat.slice(1);
    };

    const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, taskId: string) => {
        const translateX = dragX.interpolate({
            inputRange: [0, 100],
            outputRange: [-100, 0],
            extrapolate: 'clamp',
        });
      
        const opacity = dragX.interpolate({
            inputRange: [80, 100],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        });
      
        return (
            <Animated.View style={[styles.deleteContainer, { transform: [{ translateX }], opacity }]}>
                <Text style={styles.deleteText}>Deleting...</Text>
            </Animated.View>
        );
    };
      
    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, task: Task) => {
        const translateX = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [0, 100],
            extrapolate: 'clamp',
        });
      
        const opacity = dragX.interpolate({
            inputRange: [-100, -80],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });
      
        return (
            <Animated.View style={[styles.completeContainer, { transform: [{ translateX }], opacity }]}>
                <Text style={styles.completeText}>{task.completed ? "Undoing..." : "Completing..."}</Text>
            </Animated.View>
        );
      };

    const handleTaskPress = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task || task.subtasks.length === 0) {
            return;
        }
    
        setExpandedTask(expandedTask === taskId ? null : taskId);
    };  
    
    if (!settings || !user) return null;
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <SafeAreaView>
                    {tasks.length > 0 && (
                        <View style={styles.sortContainer}>
                            <Text style={styles.sortLabel}>Sort By:</Text>
                            <Picker
                                selectedValue={sortOption}
                                onValueChange={(itemValue) => setSortOption(itemValue)}
                                style={styles.sortPicker}
                            >
                                <Picker.Item label="Name" value="name" />
                                <Picker.Item label="Date" value="date" />
                                <Picker.Item label="Time Created (Oldest First)" value="createdAt" />
                                <Picker.Item label="Time Created (Newest First)" value="reverseCreatedAt" />
                            </Picker>
                        </View>
                    )}
                    {tasks.length === 0 ? (
                        <Text style={styles.noTasksText}>No tasks available</Text>
                    ) : (
                        <FlatList
                            data={tasks}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <Swipeable
                                ref={(ref) => ref && (swipeableRefs[item.id] = ref)}
                                leftThreshold={100}
                                rightThreshold={100}
                                friction={2}
                                onSwipeableOpen={(direction) => {
                                    if (direction === 'left') {
                                      requestAnimationFrame(() => handleDeleteTask(item.id));
                                    } else if (direction === 'right') {
                                      requestAnimationFrame(() => handleCompleteTask(item));
                                    }
                                  
                                    requestAnimationFrame(() => swipeableRefs[item.id]?.close());
                                }}
                                    renderLeftActions={(progress, dragX) => renderLeftActions(progress, dragX, item.id)}
                                    renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
                                >
                                    <Pressable onPress={() => handleTaskPress(item.id)}>
                                        <View style={[
                                            styles.taskContainer,
                                            item.completed && styles.completedTask,
                                            {backgroundColor: settings.darkMode ? colors.black : colors.white}
                                        ]}>
                                            <Text style={[styles.taskTitle, { color: settings.darkMode ? colors.white : colors.black }]}>
                                                {item.name} {item.completed ? "✅" : ""}
                                            </Text>
                                            <Text style={[styles.taskDetails, { color: settings.darkMode ? colors.white : colors.black }]}>
                                                📅 {item.date} ⏰ {item.time}
                                            </Text>

                                            {item.repeat !== "none" && (
                                                <Text style={[styles.taskDetails, { color: settings.darkMode ? colors.white : colors.black }]}>
                                                    🔁 Repeat: {formatRepeat(item.repeat)}
                                                </Text>
                                            )}

                                            {expandedTask === item.id && item.subtasks && item.subtasks.length > 0 && (
                                                <View>
                                                {item.subtasks.map((subtask, index) => (
                                                    <Pressable key={index} onPress={() => toggleSubtaskCompletion(item.id, index)}>
                                                        <Text
                                                            style={[
                                                                styles.taskDetails,
                                                                { 
                                                                    color: settings.darkMode ? colors.white : colors.black,
                                                                    textDecorationLine: subtask.completed ? 'line-through' : 'none',
                                                                    opacity: subtask.completed ? 0.5 : 1,
                                                                }
                                                            ]}
                                                        >
                                                            • {subtask.text} {subtask.completed ? "✅" : ""}
                                                        </Text>
                                                    </Pressable>
                                                ))}
                                                </View>
                                            )}
                                        </View>
                                    </Pressable>
                                </Swipeable>
                            )}
                        />
                    )}
                </SafeAreaView>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
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
    completedTask: {
        backgroundColor: '#d4edda',
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
    noTasksText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 30,
        fontWeight: "bold",
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
    },
})

export default TaskScreen;