import { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { formatNumber, parseNumber, type Settings, type WeekHours } from '../logic';
import { colors, WEEKDAYS } from '../theme';

type Props = {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
  onPrivacyOptions: () => void;
};

export default function SettingsModal({ settings, onSave, onClose, onPrivacyOptions }: Props) {
  const [limitText, setLimitText] = useState(formatNumber(settings.limitPercent));
  const [hourTexts, setHourTexts] = useState(settings.weekHours.map(formatNumber));

  const limit = parseNumber(limitText);
  const hours = hourTexts.map(parseNumber);
  const limitValid = limit !== null && limit >= 0 && limit <= 100;
  const hoursValid = hours.map((h) => h !== null && h >= 0 && h <= 24);
  const valid = limitValid && hoursValid.every(Boolean);

  const save = () => {
    if (!valid) return;
    onSave({ limitPercent: limit!, weekHours: hours as WeekHours });
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={{ gap: 10 }} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Einstellungen</Text>

            <Text style={styles.section}>Maximaler Homeoffice-Anteil</Text>
            <View style={styles.row}>
              <TextInput style={[styles.input, !limitValid && styles.inputError]} value={limitText}
                onChangeText={setLimitText} keyboardType="decimal-pad" accessibilityLabel="Maximaler Homeoffice-Anteil in Prozent" />
              <Text style={styles.unit}>%</Text>
            </View>

            <Text style={styles.section}>Soll-Stunden pro Wochentag</Text>
            {WEEKDAYS.map((name, i) => (
              <View key={name} style={styles.row}>
                <Text style={styles.label}>{name}</Text>
                <TextInput style={[styles.input, !hoursValid[i] && styles.inputError]} value={hourTexts[i]}
                  onChangeText={(text) => setHourTexts((prev) => prev.map((t, j) => (j === i ? text : t)))}
                  keyboardType="decimal-pad" accessibilityLabel={`Soll-Stunden ${name}`} />
                <Text style={styles.unit}>h</Text>
              </View>
            ))}
            <Text style={styles.hint}>Tage mit 0 h gelten als arbeitsfrei.</Text>

            {Platform.OS !== 'web' && (
              <Pressable onPress={onPrivacyOptions}>
                <Text style={styles.link}>Datenschutz-Einstellungen für Werbung</Text>
              </Pressable>
            )}

            <View style={[styles.row, { justifyContent: 'flex-end', marginTop: 8 }]}>
              <Pressable style={styles.secondaryButton} onPress={onClose}>
                <Text style={styles.secondaryText}>Abbrechen</Text>
              </Pressable>
              <Pressable style={[styles.primaryButton, !valid && styles.disabled]} disabled={!valid} onPress={save}>
                <Text style={styles.primaryText}>Speichern</Text>
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
});
