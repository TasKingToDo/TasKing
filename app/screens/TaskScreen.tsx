import React, { useContext, useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList, Animated, Pressable} from 'react-native';
import { TruncatedTextView } from 'react-native-truncated-text-view';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import colors from '../config/colors';
import { SettingsContext } from '../SettingsContext';
import { FIREBASE_DB } from '@/firebaseConfig';


type Task = {
    id: string;
    name: string;
    date: string;
    time: string;
    repeat: string | {type: string, interval: number};
    completed?: boolean;
    createdAt: string;
};


const TaskScreen = () => {
    const settings = useContext(SettingsContext);
    const [tasks,setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTask, setExpandedTask] = useState<string | null>(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const querySnapshot = await getDocs(collection(FIREBASE_DB, "tasks"));
                let fetchedTasks: Task[] = querySnapshot.docs.map(doc => {
                    let data = JSON.parse(JSON.stringify(doc.data()));

                    return {
                        id: doc.id,
                        name: data["name"] ? String(data["name"].trim()) : "Unnamed Task",
                        date: data["date"] ? String(data["date"].trim()) : "No Date",
                        time: data["time"] ? String(data["time"].trim()) : "No Time",
                        repeat: data["repeat"] ? data["repeat"] : "none",
                        completed: data.completed ?? false,
                        createdAt: data["createdAt"] ? String(data["createdAt"]) : "No Timestamp",
                    };
                });

                // Process recurring tasks
                let allTasks = [];
                for (let task of fetchedTasks) {
                    if (task.repeat && task.repeat !== "none") {
                        allTasks = [...allTasks, ...generateRecurringTasks(task)];
                    } else {
                        allTasks.push(task);
                    }
                }

                setTasks(allTasks);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteDoc(doc(FIREBASE_DB, "tasks", taskId));
            setTasks(tasks.filter(task => task.id !== taskId));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const handleCompleteTask = async (task: Task) => {
        try {
            await updateDoc(doc(FIREBASE_DB, "tasks", task.id), {
                completed: !task.completed
            });
            setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };
    
    const formatRepeat = (repeat) => {
        if (!repeat || repeat === "none") return "";
    
        if (typeof repeat === 'object' && repeat !== null) {
            return `${repeat.interval} ${repeat.type}`;
        }
    
        return repeat.charAt(0).toUpperCase() + repeat.slice(1);
    };

    const renderLeftActions = (progress, dragX, taskId) => {
        const opacity = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return (
            <Animated.View style={[styles.deleteContainer, { opacity }]}>
                <Pressable onPress={() => handleDeleteTask(taskId)}>
                    <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
            </Animated.View>
        );
    };

    const renderRightActions = (progress, dragX, task) => {
        const opacity = dragX.interpolate({
            inputRange: [0, 100],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        });

        return (
            <Animated.View style={[styles.completeContainer, { opacity }]}>
                <Pressable onPress={() => handleCompleteTask(task)}>
                    <Text style={styles.completeText}>{task.completed ? "Undo" : "Complete"}</Text>
                </Pressable>
            </Animated.View>
        );
    };

    const handleTaskPress = (taskId: string) => {
        setExpandedTask(expandedTask === taskId ? null : taskId);
    };
    
    
    if (!settings) return null;
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <SafeAreaView>
                    {tasks.length === 0 ? (
                        <Text style={styles.noTasksText}>No tasks available</Text>
                    ) : (
                        <FlatList
                            data={tasks}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <Swipeable
                                    renderLeftActions={(progress, dragX) => renderLeftActions(progress, dragX, item.id)}
                                    renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
                                >
                                    <Pressable onPress={() => handleTaskPress(item.id)}>
                                        <View style={[
                                            styles.taskContainer,
                                            item.completed && styles.completedTask
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

                                            {expandedTask === item.id && (
                                                <Text style={[styles.taskDetails, { color: settings.darkMode ? colors.white : colors.black }]}>
                                                    More details here...
                                                </Text>
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

const generateRecurringTasks = (task: Task) => {
    let occurrences = [];
    let startDate = new Date(task.date);

    if (isNaN(startDate.getTime())) {
        console.error(`Invalid date for task: ${task.name}, Date: ${task.date}`);
        return [task];
    }

    for (let i = 1; i <= 3; i++) {
        let newDate = new Date(startDate);

        if (typeof task.repeat === "object") {
            let { type, interval } = task.repeat;

            if (type === "days") newDate.setDate(newDate.getDate() + (interval * i));
            if (type === "weeks") newDate.setDate(newDate.getDate() + (7 * interval * i));
            if (type === "months") {
                let tempMonth = newDate.getMonth() + (interval * i);
                newDate.setMonth(tempMonth);

                if (newDate.getDate() !== startDate.getDate()) {
                    newDate.setDate(0);
                }
            }
        } else {
            if (task.repeat === "daily") newDate.setDate(newDate.getDate() + i);
            if (task.repeat === "weekly") newDate.setDate(newDate.getDate() + (7 * i));
            if (task.repeat === "monthly") {
                let tempMonth = newDate.getMonth() + i;
                newDate.setMonth(tempMonth);

                if (newDate.getDate() !== startDate.getDate()) {
                    newDate.setDate(0);
                }
            }
        }

        if (!isNaN(newDate.getTime())) {
            occurrences.push({
                ...task,
                id: `${task.id}_${i}`,
                date: newDate.toISOString().split("T")[0],
            });
        } else {
            console.warn(`Skipped invalid generated date for task: ${task.name}`);
        }
    }

    return occurrences;
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
        backgroundColor: '#d4edda', // Light green for completed tasks
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
    taskContainer: {
        padding: 12,
        marginVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2, // For Android shadow
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