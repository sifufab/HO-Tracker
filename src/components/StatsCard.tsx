import { StyleSheet, Text, View } from 'react-native';

import { useI18n } from '../i18n';
import { type MonthStats } from '../logic';
import { colors } from '../theme';

export default function StatsCard({ stats, limitPercent }: { stats: MonthStats; limitPercent: number }) {
  const { t, num } = useI18n();
  const statusColor = stats.overLimit ? colors.danger : colors.ok;
  const fill = Math.min(stats.percent, 100);
  const marker = Math.min(limitPercent, 100);

  return (
    <View style={styles.card}>
      <View style={styles.headline}>
        <Text style={[styles.percent, { color: statusColor }]}>{num(Math.round(stats.percent * 10) / 10)} %</Text>
        <Text style={styles.limit}>{t.homeShare(num(limitPercent))}</Text>
      </View>

      <View style={styles.bar} accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(stats.percent) }}>
        <View style={[styles.fill, { width: `${fill}%`, backgroundColor: statusColor }]} />
        <View style={[styles.marker, { left: `${marker}%` }]} />
      </View>

      <Row label={t.targetHours} value={`${num(stats.total)} h`} />
      <Row label={t.homeOffice} value={`${num(stats.home)} h`} />
      <Text style={[styles.budget, { color: statusColor }]}>
        {stats.remaining >= 0
          ? t.remaining(num(stats.remaining))
          : t.exceeded(num(-stats.remaining))}
      </Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 16, gap: 8 },
  headline: { flexDirection: 'row', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' },
  percent: { fontSize: 32, fontWeight: '700' },
  limit: { color: colors.muted },
  bar: { height: 10, borderRadius: 5, backgroundColor: colors.office, overflow: 'hidden', marginBottom: 4 },
  fill: { height: '100%' },
  marker: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { color: colors.muted },
  rowValue: { color: colors.text, fontWeight: '600' },
  budget: { fontWeight: '600', marginTop: 4 },
});
