import React, { useState} from 'react';
import { StyleSheet, View, Button, Image, TextInput } from 'react-native';

import colors from "../config/colors";
import HomeScreen from './HomeScreen';

function OpeningScreen(props) {
    const [showLogin, setShowLogin] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

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

    const navigateHome = () => {
        <HomeScreen />
    }

    return (
        <View style={styles.background}>
            <Image style={styles.logo} source={require("../assets/images/react-logo.png")} />
            <View style={styles.buttons}>
                <Button color="#fc5c65" title="Signup" onPress={toggleSignup}/>
                {showSignUp && (
                    <View style={styles.textFields} >
                        <TextInput
                            placeholder="Create Username"
                        />
                        <TextInput 
                            placeholder="Create Password"
                        />
                        <TextInput 
                            placeholder="Re-enter Password"
                        />
                    </View>
                )}
                <Button color="#4ecd24" title="Login" onPress={toggleLogin}/>
                {showLogin && (
                    <View style={styles.textFields} >
                        <TextInput
                        placeholder="Enter Username"
                        />
                        <TextInput 
                        placeholder="Enter Password"
                        />
                    </View>
                )}
            </View>
            <View>
                <Button title="Confirm" onPress={navigateHome} />
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