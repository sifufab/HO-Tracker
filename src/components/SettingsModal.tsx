import { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useI18n } from '../i18n';
import { parseNumber, type Settings, type WeekHours } from '../logic';
import { colors } from '../theme';

const LANGUAGE_OPTIONS: Settings['language'][] = ['auto', 'de', 'en'];
// Language names stay in their own language so users can always find theirs.
const LANGUAGE_NAMES = { de: 'Deutsch', en: 'English' };

type Props = {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
  onPrivacyOptions: () => void;
};

export default function SettingsModal({ settings, onSave, onClose, onPrivacyOptions }: Props) {
  const { t, num } = useI18n();
  const [language, setLanguage] = useState(settings.language);
  const [limitText, setLimitText] = useState(num(settings.limitPercent));
  const [hourTexts, setHourTexts] = useState(settings.weekHours.map(num));

  const limit = parseNumber(limitText);
  const hours = hourTexts.map(parseNumber);
  const limitValid = limit !== null && limit >= 0 && limit <= 100;
  const hoursValid = hours.map((h) => h !== null && h >= 0 && h <= 24);
  const valid = limitValid && hoursValid.every(Boolean);

  const save = () => {
    if (!valid) return;
    onSave({ limitPercent: limit!, weekHours: hours as WeekHours, language });
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={{ gap: 10 }} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>{t.settings}</Text>

            <Text style={styles.section}>{t.language}</Text>
            <View style={styles.segments}>
              {LANGUAGE_OPTIONS.map((option) => (
                <Pressable key={option} accessibilityRole="button" accessibilityState={{ selected: language === option }}
                  style={[styles.segment, language === option && styles.segmentActive]} onPress={() => setLanguage(option)}>
                  <Text style={[styles.segmentText, language === option && styles.segmentTextActive]}>
                    {option === 'auto' ? t.languageAuto : LANGUAGE_NAMES[option]}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.section}>{t.maxHomeShare}</Text>
            <View style={styles.row}>
              <TextInput style={[styles.input, !limitValid && styles.inputError]} value={limitText}
                onChangeText={setLimitText} keyboardType="decimal-pad" accessibilityLabel={t.maxHomeShareA11y} />
              <Text style={styles.unit}>%</Text>
            </View>

            <Text style={styles.section}>{t.hoursPerWeekday}</Text>
            {t.weekdays.map((name, i) => (
              <View key={name} style={styles.row}>
                <Text style={styles.label}>{name}</Text>
                <TextInput style={[styles.input, !hoursValid[i] && styles.inputError]} value={hourTexts[i]}
                  onChangeText={(text) => setHourTexts((prev) => prev.map((t, j) => (j === i ? text : t)))}
                  keyboardType="decimal-pad" accessibilityLabel={t.hoursPerWeekdayA11y(name)} />
                <Text style={styles.unit}>h</Text>
              </View>
            ))}
            <Text style={styles.hint}>{t.zeroHoursHint}</Text>

            {Platform.OS !== 'web' && (
              <Pressable accessibilityRole="button" onPress={onPrivacyOptions}>
                <Text style={styles.link}>{t.adPrivacy}</Text>
              </Pressable>
            )}

            <View style={[styles.row, { justifyContent: 'flex-end', marginTop: 8 }]}>
              <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={onClose}>
                <Text style={styles.secondaryText}>{t.cancel}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" style={[styles.primaryButton, !valid && styles.disabled]} disabled={!valid} onPress={save}>
                <Text style={styles.primaryText}>{t.save}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 20 },
  sheet: { backgroundColor: colors.card, borderRadius: 14, padding: 20, maxHeight: '90%', maxWidth: 480, width: '100%', alignSelf: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  section: { marginTop: 6, fontWeight: '600', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { width: 32, color: colors.text },
  input: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15 },
  inputError: { borderColor: colors.danger },
  unit: { width: 20, color: colors.muted },
  hint: { color: colors.muted, fontSize: 13 },
  link: { color: colors.primary, marginTop: 6 },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  primaryText: { color: '#fff', fontWeight: '600' },
  secondaryButton: { paddingHorizontal: 16, paddingVertical: 10 },
  secondaryText: { color: colors.primary, fontWeight: '600' },
  disabled: { opacity: 0.4 },
  segments: { flexDirection: 'row', borderWidth: 1, borderColor: colors.border, borderRadius: 10, overflow: 'hidden' },
  segment: { flex: 1, paddingVertical: 9, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { color: colors.text, fontWeight: '600' },
  segmentTextActive: { color: '#fff' },
});
