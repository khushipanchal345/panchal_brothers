import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, User, Shield } from 'lucide-react-native';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(username.trim(), password);
      router.replace('/admin/(dashboard)');
    } catch (e: any) {
      setError(e?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.topSection}>
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <Shield size={36} color={Colors.textInverse} />
          </View>
          <Text style={styles.heroTitle}>panchal_brothers</Text>
          <Text style={styles.heroSub}>Admin Portal</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrap}>
              <User size={18} color={Colors.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="admin"
                placeholderTextColor={Colors.textTertiary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Lock size={18} color={Colors.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                {showPassword
                  ? <EyeOff size={18} color={Colors.textTertiary} />
                  : <Eye size={18} color={Colors.textTertiary} />}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.hint}>

          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginBtnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  topSection: { padding: Spacing.md },
  backLink: { alignSelf: 'flex-start' },
  backText: { ...Typography.labelLarge, color: Colors.textSecondary },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  heroTitle: { ...Typography.displayMedium, color: Colors.textPrimary },
  heroSub: { ...Typography.bodyMedium, color: Colors.textSecondary },
  form: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  errorBox: {
    backgroundColor: Colors.errorLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: { ...Typography.bodyMedium, color: Colors.error },
  field: { gap: 6 },
  label: { ...Typography.labelLarge, color: Colors.textPrimary },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  input: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    paddingVertical: 2,
  },
  hint: { alignItems: 'center' },
  hintText: { ...Typography.bodySmall, color: Colors.textTertiary },
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadows.md,
  },
  loginBtnText: { ...Typography.labelLarge, color: Colors.textInverse, fontSize: 16 },
});
