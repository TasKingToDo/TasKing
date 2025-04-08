import React, { useState, useContext } from 'react';
import { View, StyleSheet, Image, Button, TextInput, Alert, KeyboardAvoidingView, Keyboard, Platform, Pressable, Text} from 'react-native';
import auth from 'firebase/auth';
import { themes } from '../config/colors';
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
                                style={[styles.textInput, { borderColor: themes.light.black}]}
                                value={email}
                                placeholder="Enter Email"
                                autoCapitalize="none"
                                onChangeText={(text) => setEmail(text)}
                            />
                        </View>
                        <View style={styles.buttons}>
                            <Button color={themes.light.accept} title="Confirm Change" onPress={resetPassword} />
                        </View>
                        <View style={styles.backLoginLine}>
                            <Pressable onPress={() => navigation.navigate("Welcome")}>
                                <Text style={styles.backLogin}>Back to Login.</Text>
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
        justifyContent: "flex-start",
        alignItems: "center",
    },
    backLogin: {
        color: "blue",
        textDecorationLine: "underline"
    },
    backLoginLine: {
        marginTop: 20,
        alignItems: "center",
    },
    buttons: {
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 20,
    },
    container: {
        flex: 1,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 200,
        marginTop: 20
    },
    textFields: {
        width: "100%",
        alignItems: "center",
        marginTop: 10,
    },
    textInput: {
        width: 280,
        height: 60,
        fontSize: 18,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
})

export default ForgotPassScreen;