import React, { useState, useContext } from 'react';
import { View, StyleSheet, Image, Button, TextInput } from 'react-native';
import colors from '../config/colors';
import { SettingsContext } from '../config/SettingsContext';

function ForgotPassScreen({navigation}) {
    const settings = useContext(SettingsContext);
    var [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const passchange = () => {
        alert('Your password has been changed')
        navigation.navigate('Welcome')
    }

    return (
        <View style={styles.background}>
        <Image style={styles.logo} source={{ uri: "https://firebasestorage.googleapis.com/v0/b/tasking-c1d66.firebasestorage.app/o/logo_small.png?alt=media&token=b6f39eef-61b9-41d9-bf22-f1cf04163409" }} />
            <View style={styles.buttons}>
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
                    <Button color={colors.accept} title="Confirm Password Change" onPress={passchange} />
                </View>
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
        height: '30%',
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
    },
})

export default ForgotPassScreen;