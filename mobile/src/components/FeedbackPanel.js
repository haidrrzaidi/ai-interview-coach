import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

const scoreStyle = (s) => {
  if (s >= 8) return { bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.35)', color: theme.colors.success };
  if (s >= 6) return { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)', color: theme.colors.warn };
  return { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.35)', color: theme.colors.danger };
};

const FeedbackPanel = ({ feedback }) => {
  if (!feedback) return null;
  const { score = 0, strengths = [], weaknesses = [], correctAnswer, summary } = feedback;
  const sc = scoreStyle(score);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Feedback</Text>
        <View style={[styles.score, { backgroundColor: sc.bg, borderColor: sc.border }]}>
          <Text style={[styles.scoreText, { color: sc.color }]}>{score}/10</Text>
        </View>
      </View>

      {summary ? <Text style={styles.summary}>{summary}</Text> : null}

      {strengths.length > 0 && (
        <View style={[styles.block, styles.blockOk]}>
          <Text style={[styles.blockTitle, { color: theme.colors.success }]}>✓ Strengths</Text>
          {strengths.map((s, i) => (
            <Text key={i} style={styles.bullet}>• {s}</Text>
          ))}
        </View>
      )}

      {weaknesses.length > 0 && (
        <View style={[styles.block, styles.blockBad]}>
          <Text style={[styles.blockTitle, { color: theme.colors.danger }]}>! Weaknesses</Text>
          {weaknesses.map((w, i) => (
            <Text key={i} style={styles.bullet}>• {w}</Text>
          ))}
        </View>
      )}

      {correctAnswer ? (
        <View style={[styles.block, styles.blockBrand]}>
          <Text style={[styles.blockTitle, { color: '#bfd3ff' }]}>Model answer</Text>
          <Text style={styles.bodyText}>{correctAnswer}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: { color: theme.colors.text, fontSize: theme.font.h3, fontWeight: '700' },
  score: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scoreText: { fontWeight: '800', fontSize: 16 },
  summary: {
    color: theme.colors.textMuted,
    fontSize: theme.font.body,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  block: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  blockOk: { backgroundColor: 'rgba(52,211,153,0.05)', borderColor: 'rgba(52,211,153,0.25)' },
  blockBad: { backgroundColor: 'rgba(248,113,113,0.05)', borderColor: 'rgba(248,113,113,0.25)' },
  blockBrand: { backgroundColor: 'rgba(64,102,255,0.08)', borderColor: 'rgba(64,102,255,0.25)' },
  blockTitle: { fontSize: theme.font.small, fontWeight: '700', marginBottom: 6 },
  bullet: { color: theme.colors.text, fontSize: theme.font.small, lineHeight: 20, marginBottom: 2 },
  bodyText: { color: theme.colors.text, fontSize: theme.font.small, lineHeight: 20 },
});

export default FeedbackPanel;
