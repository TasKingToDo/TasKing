import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';

import colors from "../config/colors";

function OpeningScreen(props) {
    function moveToLogin() {

    }

    function moveToSignup() {

    }

    return (
        <View style={styles.background}>
            <View style={styles.loginButton}>
                <Button color="#fc5c65" title="Signup" onPress={moveToSignup}/>
                <Button color="#4ecd24" title="Login" onPress={moveToLogin}/>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: "center",

    },
    loginButton: {
        width: "100%",
        height: 70,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
})

export default OpeningScreen;