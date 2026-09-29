import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { formatNumber, parseNumber, type DayEntry } from '../logic';
import { colors } from '../theme';

type Props = {
  title: string;
  target: number;
  entry: DayEntry | undefined;
  onSave: (entry: DayEntry | undefined) => void;
  onClose: () => void;
};

export default function DayEditor({ title, target, entry, onSave, onClose }: Props) {
  const [hoursText, setHoursText] = useState(entry?.kind === 'home' ? formatNumber(entry.hours) : '');

  const hours = parseNumber(hoursText);
  const hoursValid = hours !== null && hours > 0 && hours <= target;

  const choose = (value: DayEntry | undefined) => {
    onSave(value);
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Soll: {formatNumber(target)} h</Text>

          <Option label="Büro" color={colors.office} onPress={() => choose(undefined)} />
          <Option label={`Ganzer Tag Homeoffice (${formatNumber(target)} h)`} color={colors.home} textColor="#fff"
            onPress={() => choose({ kind: 'home', hours: target })} />
          <Option label="Abwesend (Urlaub, Feiertag, krank)" color={colors.absent} onPress={() => choose({ kind: 'absent' })} />

          <Text style={styles.section}>Teilweise Homeoffice</Text>
          <View style={styles.partialRow}>
            <TextInput style={[styles.input, hoursText !== '' && !hoursValid && styles.inputError]}
              value={hoursText} onChangeText={setHoursText} keyboardType="decimal-pad"
              placeholder="Stunden, z. B. 4" accessibilityLabel="Homeoffice-Stunden" />
            <Pressable style={[styles.saveButton, !hoursValid && styles.disabled]} disabled={!hoursValid}
              onPress={() => hours !== null && choose({ kind: 'home', hours })}>
              <Text style={styles.saveText}>Speichern</Text>
            </Pressable>
          </View>
          {hoursText !== '' && !hoursValid && (
            <Text style={styles.error}>Bitte eine Zahl zwischen 0 und {formatNumber(target)} eingeben.</Text>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Option({ label, color, textColor = colors.text, onPress }: {
  label: string;
  color: string;
  textColor?: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.option, { backgroundColor: color }]} onPress={onPress} accessibilityRole="button">
      <Text style={[styles.optionText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 20 },
  sheet: { backgroundColor: colors.card, borderRadius: 14, padding: 20, gap: 10, maxWidth: 480, width: '100%', alignSelf: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  subtitle: { color: colors.muted, marginBottom: 4 },
  option: { borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14 },
  optionText: { fontSize: 15, fontWeight: '600' },
  section: { marginTop: 8, fontWeight: '600', color: colors.text },
  partialRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  inputError: { borderColor: colors.danger },
  saveButton: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  saveText: { color: '#fff', fontWeight: '600' },
  disabled: { opacity: 0.4 },
  error: { color: colors.danger, fontSize: 13 },
});
