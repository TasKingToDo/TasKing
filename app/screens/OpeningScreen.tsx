import React, { useState} from 'react';
import { StyleSheet, View, Button, Image, TextInput } from 'react-native';
// RUN npx expo install firebase
import { FIREBASE_AUTH } from '../../firebaseConfig'
import { signInWithEmailAndPassword } from 'firebase/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';

import colors from "../config/colors";

const OpeningScreen = ({navigation}) => {
    const [showLogin, setShowLogin] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const auth = FIREBASE_AUTH;

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
            alert('sign in is probably successful')
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
        } catch (error) {
            console.log(error);
            alert('sign up failed: ' + error.message)
        }
    }

    return (
        <View style={styles.background}>
            <Image style={styles.logo} source={require("../assets/images/react-logo.png")} />
            <View style={styles.buttons}>
                <Button color="#fc5c65" title="Signup" onPress={toggleSignup}/>
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
                        <Button title="Confirm Sign Up" onPress={signUp} />
                    </View>
                )}
                <Button color="#4ecd24" title="Login" onPress={toggleLogin}/>
                {showLogin && (
                    <View style={styles.textFields} >
                        <TextInput
                        placeholder="Enter Email"
                        />
                        <TextInput 
                        placeholder="Enter Password"
                        />
                    <Button title="Confirm Sign In" onPress={signIn} />
                    </View>
                )}
            <Button title="Home" onPress={() => navigation.navigate('Home')} />
            </View>
        </View>
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
    logo: {
        width: 100,
        height: 100,
        position: "absolute",
        top: 10,
    },
    textFields: {
        position: "absolute",
        bottom: 70,
        borderStyle: "solid",
        borderColor: colors.black,
    },
})

export default OpeningScreen;
