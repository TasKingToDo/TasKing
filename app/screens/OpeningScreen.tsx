import React, { useState} from 'react';
import { StyleSheet, View, Button, Image, TextInput, Pressable, Text } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
// RUN npx expo install firebase
import { FIREBASE_APP } from '../../firebaseConfig'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, getAuth} from 'firebase/auth';

import colors from "../config/colors";

const OpeningScreen = ({navigation}) => {
    const [showLogin, setShowLogin] = useState(true);
    const [showSignUp, setShowSignUp] = useState(false);
    var [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const auth = getAuth(FIREBASE_APP);

    const toggleLogin = () => {
        setShowLogin(!showLogin);
        if (showSignUp == true) {
            setShowSignUp(false)
        }
    }

    const toggleSignup = () => {
        setShowSignUp(!showSignUp);
        if (showLogin == true) {
            setShowLogin(false)
        }
    }

    const signIn = async () => {
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log(response);
            alert('Sign in was successful')
            navigation.navigate('Home')
        } catch (error) {
            console.log(error);
            alert('sign in failed: ' + error.message)
        }
    }

    const signUp = async () => {
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            console.log(response);
            alert('sign up is probably successful')
            setShowLogin(false)
            setShowSignUp(false)
        } catch (error) {
            console.log(error);
            alert('sign up failed: ' + error.message)
        }
    }

    return (
        <SafeAreaProvider style={styles.background}>
            <SafeAreaView>
                <View style={styles.background}>
                    <Image style={styles.logo} source={require("../assets/images/react-logo.png")} />
                    <View style={styles.buttons}>
                        <Button color={colors.grey} title="Signup" onPress={toggleSignup}/>
                        {showSignUp && (
                            <View style={styles.textFields} >
                                <TextInput
                                    value={email}
                                    placeholder="Enter Email"
                                    autoCapitalize="none"
                                    onChangeText={(text) => setEmail(text)}
                                />
                                <TextInput 
                                    secureTextEntry={true}
                                    value={password}
                                    placeholder="Enter Password"
                                    autoCapitalize="none"
                                    onChangeText={(text) => setPassword(text)}
                                />
                                <Button color={colors.accept} title="Confirm Sign Up" onPress={signUp} />
                            </View>
                        )}
                        <View style={{width: 15}}/>
                        <Button color={colors.primary} title="Login" onPress={toggleLogin}/>
                        {showLogin && (
                            <View style={styles.textFields} >
                                <TextInput
                                placeholder="Enter Email"
                                />
                                <TextInput 
                                placeholder="Enter Password"
                                secureTextEntry={true}
                                />
                            <Button color={colors.accept} title="Confirm Login" onPress={signIn} />
                            </View>
                        )}
                    </View>
                    <Pressable>
                        <Text style={styles.forgotPassword}>Forgot Password? Click Here to Change it.</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    buttons: {
        height: 70,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    forgotPassword: {
        color: "blue",
        textDecorationLine: "underline"
    },
    logo: {
        width: 100,
        height: 100,
        position: "absolute",
        top: 10,
    },
    signUpButton: {
        backgroundColor: 'rgba(52,52,52,0.8)'
    },
    textFields: {
        position: "absolute",
        bottom: 70,
    },
})

export default OpeningScreen;