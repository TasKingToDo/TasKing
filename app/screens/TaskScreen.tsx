import React, { useContext, useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet, FlatList, Animated, Pressable} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TruncatedTextView } from 'react-native-truncated-text-view';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { collection, deleteDoc, doc, getDocs, updateDoc, query, where } from "firebase/firestore";
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import colors from '../config/colors';
import { SettingsContext } from '../config/SettingsContext';
import { FIREBASE_DB } from '@/firebaseConfig';
import { authContext } from '../config/authContext';


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
    const { user } = useContext(authContext);
    const [tasks,setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTask, setExpandedTask] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<string>('createdAt');
    const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

    useEffect(() => {
        if (!user) return;

        const fetchTasks = async () => {
            try {
                const q = query(collection(FIREBASE_DB, "tasks"), where("userId", "==", user.uid));
                const querySnapshot = await getDocs(q);
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

                let allTasks = fetchedTasks.flatMap(task =>
                    task.repeat && task.repeat !== "none" ? generateRecurringTasks(task) : task
                );

                setTasks(sortTasks(allTasks, sortOption));
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [sortOption]);

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteDoc(doc(FIREBASE_DB, "tasks", taskId));
            const querySnapshot = await getDocs(collection(FIREBASE_DB, "tasks"));
            setTasks(sortTasks(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)), sortOption));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };
    

    const handleCompleteTask = async (task: Task) => {
        try {
            const taskRef = doc(FIREBASE_DB, "tasks", task.id);
            const updatedStatus = !task.completed;
            await updateDoc(taskRef, { completed: updatedStatus });

            const querySnapshot = await getDocs(collection(FIREBASE_DB, "tasks"));
            setTasks(sortTasks(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)), sortOption));
        } catch (error) {
            console.error("Error marking task as complete:", error);
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