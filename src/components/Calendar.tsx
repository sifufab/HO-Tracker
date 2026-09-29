import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useI18n } from '../i18n';
import { daysInMonth, homeHours, isoDate, targetHours, weekdayIndex, type Days, type Settings } from '../logic';
import { colors } from '../theme';

type Props = {
  year: number;
  month: number;
  settings: Settings;
  days: Days;
  onPressDay: (day: number) => void;
};

export default function Calendar({ year, month, settings, days, onPressDay }: Props) {
  const { t } = useI18n();
  const cells: (number | null)[] = Array(weekdayIndex(year, month, 1)).fill(null);
  for (let day = 1; day <= daysInMonth(year, month); day++) cells.push(day);
  while (cells.length % 7) cells.push(null);

  return (
    <View>
      <View style={styles.row}>
        {t.weekdays.map((name) => (
          <Text key={name} style={styles.weekday}>
            {name}
          </Text>
        ))}
      </View>
      {Array.from({ length: cells.length / 7 }, (_, week) => (
        <View key={week} style={styles.row}>
          {cells.slice(week * 7, week * 7 + 7).map((day, i) =>
            day === null ? (
              <View key={i} style={styles.cell} />
            ) : (
              <DayCell key={i} day={day} target={targetHours(settings, year, month, day)}
                entry={days[isoDate(year, month, day)]} onPress={() => onPressDay(day)} />
            ),
          )}
        </View>
      ))}
    </View>
  );
}

function DayCell({ day, target, entry, onPress }: {
  day: number;
  target: number;
  entry: Days[string] | undefined;
  onPress: () => void;
}) {
  const { t, num } = useI18n();
  if (target <= 0) {
    return (
      <View style={styles.cell}>
        <Text style={[styles.dayNumber, { color: colors.muted }]}>{day}</Text>
      </View>
    );
  }
  const home = homeHours(entry, target);
  const absent = entry?.kind === 'absent';
  const background = absent ? colors.absent : home >= target ? colors.home : home > 0 ? colors.homePartial : colors.office;
  const label = absent ? t.absentShort : home > 0 ? `${num(home)} h` : '';

  return (
    <Pressable style={styles.cell} onPress={onPress} accessibilityRole="button"
      accessibilityLabel={`${t.dayA11y(day)}${label ? `, ${label}` : ''}`}>
      <View style={[styles.dayBox, { backgroundColor: background }]}>
        <Text style={[styles.dayNumber, home >= target && !absent && { color: '#fff' }]}>{day}</Text>
        {label !== '' && <Text style={[styles.dayLabel, home >= target && !absent && { color: '#fff' }]}>{label}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontWeight: '600', color: colors.muted, paddingVertical: 6 },
  cell: { flex: 1, aspectRatio: 1, padding: 2, alignItems: 'center', justifyContent: 'center' },
  dayBox: { flex: 1, alignSelf: 'stretch', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  dayNumber: { fontSize: 16, fontWeight: '600', color: colors.text },
  dayLabel: { fontSize: 11, color: colors.text },
});
