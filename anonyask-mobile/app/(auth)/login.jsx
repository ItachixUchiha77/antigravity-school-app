import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/index.js';
import { DEMO_ACCOUNTS } from '../../src/data/mockData.js';

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { login, loading }      = useAuthStore();

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Enter email and password');
      return;
    }
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(app)/qna');
    } catch (e) {
      Alert.alert('Login Failed', e.message);
    }
  }

  function quickLogin(account) {
    setEmail(account.email);
    setPassword(account.password);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-bg-primary"
    >
      <View className="flex-1 justify-center px-6">
        {/* Logo */}
        <View className="items-center mb-10">
          <View className="w-16 h-16 bg-accent-blue rounded-2xl items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">A</Text>
          </View>
          <Text className="text-text-primary text-3xl font-bold">AnonyASK</Text>
          <Text className="text-text-muted text-sm mt-1">School Q&A Platform</Text>
        </View>

        {/* Form */}
        <View className="gap-3">
          <TextInput
            className="bg-bg-elevated border border-border-default text-text-primary rounded-xl px-4 py-4 text-base"
            placeholder="Email address"
            placeholderTextColor="#64748B"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextInput
            className="bg-bg-elevated border border-border-default text-text-primary rounded-xl px-4 py-4 text-base"
            placeholder="Password"
            placeholderTextColor="#64748B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            className="bg-accent-blue rounded-xl py-4 items-center mt-1"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text className="text-white font-bold text-base">Sign In</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Demo accounts */}
        <View className="mt-8">
          <Text className="text-text-muted text-xs text-center mb-3">Demo accounts</Text>
          <View className="gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <TouchableOpacity
                key={acc.userId}
                onPress={() => quickLogin(acc)}
                className="bg-bg-elevated border border-border-default rounded-xl px-4 py-3 flex-row items-center justify-between"
              >
                <View>
                  <Text className="text-text-primary text-sm font-medium">{acc.label}</Text>
                  <Text className="text-text-muted text-xs">{acc.email}</Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${
                  acc.role === 'student' ? 'bg-accent-blue/20' :
                  acc.role === 'teacher' ? 'bg-warning/20' : 'bg-danger/20'
                }`}>
                  <Text className={`text-xs font-semibold capitalize ${
                    acc.role === 'student' ? 'text-accent-blue-light' :
                    acc.role === 'teacher' ? 'text-warning' : 'text-danger'
                  }`}>{acc.role}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
