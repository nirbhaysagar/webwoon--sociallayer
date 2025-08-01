import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from './components/HeaderWithMenu';

const faqs = [
  {
    q: 'How do I add a new product?',
    a: 'Go to the Products page and tap the + button. Fill in the product details and save.',
  },
  {
    q: 'How do I contact support?',
    a: 'Use the contact form below or email us at support@socialspark.ai.',
  },
  {
    q: 'How do I withdraw my earnings?',
    a: 'Go to Profile > Payout Settings and add your bank details.',
  },
];

export default function HelpSupportScreen() {
  const [expanded, setExpanded] = useState(-1);
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState('');

  return (
    <View style={styles.container}>
      <HeaderWithMenu />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.sectionTitle}>FAQs</Text>
        <View style={styles.card}>
          {faqs.map((faq, i) => (
            <View key={faq.q}>
              <TouchableOpacity style={styles.faqRow} onPress={() => setExpanded(expanded === i ? -1 : i)}>
                <Ionicons name={expanded === i ? 'chevron-down' : 'chevron-forward'} size={18} color={colors.secondary} style={{ marginRight: 8 }} />
                <Text style={styles.faqQ}>{faq.q}</Text>
              </TouchableOpacity>
              {expanded === i && <Text style={styles.faqA}>{faq.a}</Text>}
            </View>
          ))}
        </View>
        <Text style={styles.sectionTitle}>Contact Support</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Your Message</Text>
          <TextInput
            style={styles.input}
            placeholder="Describe your issue or question..."
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity style={styles.sendBtn}>
            <Ionicons name="send" size={18} color={colors.primary} />
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>Report Issue / Feedback</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Your Feedback</Text>
          <TextInput
            style={styles.input}
            placeholder="Share your feedback or report a bug..."
            placeholderTextColor={colors.textSecondary}
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity style={styles.sendBtn}>
            <Ionicons name="bug-outline" size={18} color={colors.discount} />
            <Text style={[styles.sendText, { color: colors.discount }]}>Report</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>Links & Policies</Text>
        <View style={styles.linksRow}>
          <TouchableOpacity onPress={() => Linking.openURL('https://socialspark.ai/terms')} style={styles.linkBtn}>
            <Ionicons name="document-text-outline" size={18} color={colors.secondary} />
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://socialspark.ai/privacy')} style={styles.linkBtn}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.secondary} />
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.m,
    paddingBottom: 80,
  },
  title: {
    fontSize: typography.title,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
    ...shadows.card,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  faqQ: {
    fontSize: 15,
    color: colors.text,
    fontWeight: 'bold',
  },
  faqA: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 26,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.s,
    minHeight: 44,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...shadows.card,
  },
  sendText: {
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.l,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...shadows.card,
  },
  linkText: {
    color: colors.secondary,
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
  },
}); 