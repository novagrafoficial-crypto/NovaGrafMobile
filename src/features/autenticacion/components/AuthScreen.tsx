import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PressableScale } from '@/shared/components/PressableScale';
import { FadeInView } from '@/shared/components/FadeInView';
import { brandColors, brandTints } from '@/constants/brand';

interface AuthScreenProps {
  headerTitle: string;
  title: string;
  subtitle?: string;
  error?: string | null;
  info?: string | null;
  children: React.ReactNode;
}

export const AuthScreen = ({
  headerTitle,
  title,
  subtitle,
  error,
  info,
  children,
}: AuthScreenProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: brandColors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <PressableScale onPress={() => router.back()} style={styles.backButton} hitSlop={12} scaleTo={0.85}>
          <Text style={styles.backIcon}>←</Text>
        </PressableScale>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <FadeInView style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {error && <Text style={styles.error}>{error}</Text>}
          {info && <Text style={styles.info}>{info}</Text>}
          {children}
        </FadeInView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: brandColors.primaryDark,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: brandColors.white, fontSize: 26, fontWeight: '600', lineHeight: 26 },
  headerTitle: { color: brandColors.white, fontSize: 17, fontWeight: '600' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: brandColors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: brandColors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: brandColors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: brandTints.textMuted,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
  },
  error: { color: brandColors.error, textAlign: 'center', marginBottom: 16, fontWeight: '500' },
  info: { color: brandColors.primary, textAlign: 'center', marginBottom: 16, fontWeight: '500' },
});