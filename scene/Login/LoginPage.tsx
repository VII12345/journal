import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { DATABASE_URL } from '../net';

interface LoginPageProps {
  onLoginSuccess: (userId: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleLogin = async () => {
    try {
        const response = await fetch(`${DATABASE_URL}/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
            method: 'GET', // 修改为 GET 请求
        });
        const data = await response.json();
        if (response.ok) {
            Alert.alert('登录成功');
            onLoginSuccess(data.user_id.toString()); // 假设后端返回了用户 ID
        } else {
            Alert.alert('登录失败', data.error);
        }
    } catch (error) {
        console.error('登录出错:', error);
        Alert.alert('登录出错', '请稍后重试');
    }
};


    return (
        <View style={styles.container}>
            <Text style={styles.header}>登录</Text>
            <TextInput
                style={styles.input}
                placeholder="用户名"
                placeholderTextColor="#888"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="密码"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>登录</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 8,
        marginBottom: 16,
    },
    loginButton: {
        backgroundColor: '#007aff',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 4,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default LoginPage;