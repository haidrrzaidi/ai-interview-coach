import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { useInterview, useInterviewOptions } from '../hooks/useInterview';

const DIFFICULTY_META = {
  easy: { emoji: '🌱', desc: '0–2 yrs · fundamentals' },
  medium: { emoji: '⚡', desc: '2–4 yrs · applied' },
  hard: { emoji: '🔥', desc: '4+ yrs · senior' },
};

const ROLE_EMOJI = {
  frontend: '🎨',
  backend: '⚙️',
  fullstack: '🧩',
  mobile: '📱',
  devops: '🚀',
  data: '📊',
  ml: '🤖',
  android: '🤖',
  ios: '🍎',
};

const HomeScreen = ({ navigation }) => {
  const { options, loading: optLoading, error: optError } = useInterviewOptions();
  const { start, loading, error } = useInterview();

  const [candidateName, setCandidateName] = useState('');
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium');

  const handleStart = async () => {
    if (!role || !difficulty) return;
    try {
      const data = await start({ role, difficulty, candidateName });
      navigation.navigate('Interview', { session: data });
    } catch (_) {}
  };

  if (optLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.brand} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Ace Your Interview</Text>
        <Text style={styles.subtitle}>
          Practice technical interviews with Claude Opus 4.7. Real-time
          feedback and a final report.
        </Text>

        {optError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Backend unreachable: {optError}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.label}>Your name (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Alex Morgan"
            placeholderTextColor={theme.colors.textFaint}
            value={candidateName}
            onChangeText={setCandidateName}
            maxLength={60}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Pick a role</Text>
          <View style={styles.grid}>
            {options.roles.map((r) => {
              const selected = role === r.id;
              return (
                <Pressable
                  key={r.id}
                  onPress={() => setRole(r.id)}
                  style={[styles.roleItem, selected && styles.roleItemSelected]}
                >
                  <Text style={styles.roleEmoji}>{ROLE_EMOJI[r.id] || '💼'}</Text>
                  <Text style={styles.roleLabel}>{r.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Difficulty</Text>
          <View style={styles.diffRow}>
            {options.difficulties.map((d) => {
              const selected = difficulty === d.id;
              const meta = DIFFICULTY_META[d.id] || {};
              return (
                <Pressable
                  key={d.id}
                  onPress={() => setDifficulty(d.id)}
                  style={[styles.diffItem, selected && styles.diffItemSelected]}
                >
                  <Text style={styles.diffEmoji}>{meta.emoji}</Text>
                  <Text style={styles.diffLabel}>{d.label}</Text>
                  <Text style={styles.diffDesc}>{d.questionCount} questions</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleStart}
          disabled={!role || loading}
          style={({ pressed }) => [
            styles.btn,
            (!role || loading) && styles.btnDisabled,
            pressed && !loading && styles.btnPressed,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Start Interview</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg },
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: 48 },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.h1,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.font.body,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.font.body,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.text,
    fontSize: theme.font.body,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleItem: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  roleItemSelected: {
    backgroundColor: 'rgba(64,102,255,0.18)',
    borderColor: theme.colors.brand,
  },
  roleEmoji: { fontSize: 24, marginBottom: 6 },
  roleLabel: { color: theme.colors.text, fontSize: theme.font.small, fontWeight: '600' },
  diffRow: { flexDirection: 'row', gap: 8 },
  diffItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'flex-start',
  },
  diffItemSelected: {
    backgroundColor: 'rgba(64,102,255,0.18)',
    borderColor: theme.colors.brand,
  },
  diffEmoji: { fontSize: 22, marginBottom: 4 },
  diffLabel: { color: theme.colors.text, fontWeight: '700', fontSize: theme.font.body },
  diffDesc: { color: theme.colors.textFaint, fontSize: theme.font.tiny, marginTop: 2 },
  btn: {
    backgroundColor: theme.colors.brand,
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  btnDisabled: { opacity: 0.5 },
  btnPressed: { backgroundColor: theme.colors.brandDark },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  errorBox: {
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  errorText: { color: theme.colors.danger, fontSize: theme.font.small },
});

export default HomeScreen;
