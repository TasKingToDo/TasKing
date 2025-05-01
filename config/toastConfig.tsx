import { BaseToast } from "react-native-toast-message";

const toastConfig = {
    success: (props) => (
        <BaseToast
            {...props}
            style={{
                borderLeftColor: '#2ecc71', // Green for success (TaskScreen)
                backgroundColor: '#1E1E1E', // Dark background for readability
                width: '90%', 
                borderRadius: 10,
                paddingVertical: 10, 
            }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#ffffff'
            }}
            text2Style={{
                fontSize: 16,
                color: '#dddddd'
            }}
        />
    ),
    info: (props) => (
        <BaseToast
            {...props}
            style={{
                borderLeftColor: '#3498db', // Blue for friend request
                backgroundColor: '#1E1E1E',
                width: '90%',
                borderRadius: 10,
                paddingVertical: 10,
            }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#ffffff'
            }}
            text2Style={{
                fontSize: 16,
                color: '#dddddd'
            }}
        />
    ),
};

export default toastConfig;