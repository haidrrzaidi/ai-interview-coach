import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

const QuestionCard = ({ question, topic, questionNumber, totalQuestions }) => {
  return (
    <View style={styles.card}>
      <View style={styles.chipsRow}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>
            Q {questionNumber}/{totalQuestions}
          </Text>
        </View>
        {topic ? (
          <View style={[styles.chip, styles.chipAccent]}>
            <Text style={[styles.chipText, styles.chipTextAccent]}>{topic}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.question}>{question}</Text>
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
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.md,
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipAccent: {
    backgroundColor: 'rgba(64,102,255,0.2)',
    borderColor: 'rgba(64,102,255,0.4)',
  },
  chipText: {
    color: theme.colors.textMuted,
    fontSize: theme.font.tiny,
    fontWeight: '600',
  },
  chipTextAccent: { color: '#bfd3ff' },
  question: {
    color: theme.colors.text,
    fontSize: theme.font.h3,
    fontWeight: '600',
    lineHeight: 26,
  },
});

export default QuestionCard;
