import React, { useContext, useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet, FlatList, Animated, Pressable} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { collection, deleteDoc, doc, getDocs, updateDoc, query, where, getDoc, onSnapshot } from "firebase/firestore";
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import colors from '../config/colors';
import { SettingsContext } from '../config/SettingsContext';
import { FIREBASE_DB } from '@/firebaseConfig';
import { authContext } from '../config/authContext';


type Subtask = {
    text: string;
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
                    subtasks: data.subtask ?? [] // fallback to empty array if undefined
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

    const handleCompleteTask = async (task: Task) => {
        if (!user) return;
    
        try {
            const taskRef = doc(FIREBASE_DB, "tasks", task.id);
            const userRef = doc(FIREBASE_DB, "users", user.uid);
    
            const taskSnap = await getDoc(taskRef);
            if (!taskSnap.exists()) {
                console.error("Task not found!");
                return;
            }
    
            const taskData = taskSnap.data();
            const taskXp = taskData.xp || 0;
            const taskBalance = taskData.balance || 0;
    
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                console.error("User not found!");
                return;
            }
    
            const userData = userSnap.data();
            const isTaskCompleted = task.completed;
    
            const newXp = isTaskCompleted ? (userData.xp || 0) - taskXp : (userData.xp || 0) + taskXp;
            const newBalance = isTaskCompleted ? (userData.balance || 0) - taskBalance : (userData.balance || 0) + taskBalance;
    
            await updateDoc(userRef, {
                xp: Math.max(0, newXp),
                balance: Math.max(0, newBalance),
            });
    
            if (!isTaskCompleted && task.repeat && task.repeat !== "none") {
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
    
                // Instead of creating a new task, update the existing task with the new date
                await updateDoc(taskRef, {
                    date: nextDate.toISOString().split("T")[0],
                    completed: false, // Reset completion status for the new occurrence
                });
            } else {
                // Just mark the task as completed
                await updateDoc(taskRef, { completed: !task.completed });
            }
    
            Toast.show({
                type: isTaskCompleted ? 'info' : 'success',
                text1: isTaskCompleted ? "Task Undone" : "Task Completed!",
                text2: isTaskCompleted
                    ? `You lost ${taskXp} XP and ${taskBalance} coins.`
                    : `You gained ${taskXp} XP and ${taskBalance} coins.`,
                position: 'top',
                visibilityTime: 5000,
            });            
        } catch (error) {
            console.error("Error updating task:", error);
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
    
    const formatRepeat = (repeat) => {
        if (!repeat || repeat === "none") return "";
    
        if (typeof repeat === 'object' && repeat !== null) {
            return `${repeat.interval} ${repeat.type}`;
        }
    
        return repeat.charAt(0).toUpperCase() + repeat.slice(1);
    };

    const renderLeftActions = (_progress: any, _dragX: any, taskId: string) => (
        <Animated.View style={styles.deleteContainer}>
            <Text style={styles.deleteText}>Deleting...</Text>
        </Animated.View>
    );

    const renderRightActions = (_progress: any, _dragX: any, task: Task) => (
        <Animated.View style={styles.completeContainer}>
            <Text style={styles.completeText}>{task.completed ? "Undoing..." : "Completing..."}</Text>
        </Animated.View>
    );
     

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
                                onSwipeableOpen={(direction) => {
                                    if (direction === 'left') handleDeleteTask(item.id);
                                    if (direction === 'right') handleCompleteTask(item);

                                    setTimeout(() => swipeableRefs[item.id]?.close(), 50);
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
                                                        <Text
                                                            key={index}
                                                            style={[styles.taskDetails, { color: settings.darkMode ? colors.white : colors.black }]}
                                                        >
                                                            • {subtask.text}
                                                        </Text>
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