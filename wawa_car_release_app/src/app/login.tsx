import { Button, StyleSheet, Text, View, TextInput } from 'react-native'
import { ThemedView } from '@/components/themed-view'

export default function LoginScreen() {
    return (
        <ThemedView style={styles.container}>
            <View>
                <Text style={{color: "#000000"}}>LoginScreen</Text>
                <TextInput placeholder="Username" style={styles.input} />
                <TextInput placeholder="Password" style={styles.input} />
                <Button title="Login" onPress={() => { }} />
            </View>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        width: '100%',
        paddingHorizontal: 20,
    },
    input: {
        borderWidth: 1,
        
    }
})