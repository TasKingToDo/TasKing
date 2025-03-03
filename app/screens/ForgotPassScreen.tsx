import React, { useState, useContext } from 'react';
import { View, StyleSheet, Image, Button, TextInput, Alert, KeyboardAvoidingView, Keyboard, Platform, Pressable, Text} from 'react-native';
import auth from 'firebase/auth';
import colors from '../config/colors';
import { GestureHandlerRootView, TouchableWithoutFeedback } from 'react-native-gesture-handler';

function ForgotPassScreen({navigation}) {
    const [email, setEmail] = useState('');

    const resetPassword = async () => {
        try {
            if (!email) {
                Alert.alert("Error", "Please enter your email");
                return;
            }
            await auth().sendPasswordResetEmail(email);
            Alert.alert("Success", "Check your email for password reset instructions.");
            navigation.navigate('Welcome');
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <GestureHandlerRootView style={styles.background}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
                    <View style={styles.background}>
                        <Image style={styles.logo} source={{ uri: "https://firebasestorage.googleapis.com/v0/b/tasking-c1d66.firebasestorage.app/o/logo_small.png?alt=media&token=b6f39eef-61b9-41d9-bf22-f1cf04163409" }} />
                        <View style={styles.textFields} >
                            <TextInput
                                value={email}
                                placeholder="Enter Email"
                                autoCapitalize="none"
                                onChangeText={(text) => setEmail(text)}
                                style={styles.text}
                            />
                        </View>
                        <View style={styles.buttons}>
                            <Button color={colors.accept} title="Confirm Password Change" onPress={resetPassword} />
                        </View>
                        <View style={styles.backLoginLine}>
                            <Pressable onPress={() => navigation.navigate("Welcome")}>
                                <Text style={styles.backLogin}>Back to Login</Text>
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex: 1,
    },
    buttons: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    logo: {
        width: 100,
        height: 100,
        position: "absolute",
        top: 10,
    },
    text: {
        fontSize: 25
    },
    textFields: {
        alignItems: "center",
        justifyContent: "center",

    },
    backLoginLine: {
        alignItems: "center",
        justifyContent: "center",
        width: "70%",
        marginVertical: "10%",
    },
    backLogin: {
        color: "blue",
        textDecorationLine: "underline",
        fontSize: 20
    },
})

export default ForgotPassScreen;