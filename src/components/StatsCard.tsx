import { StyleSheet, Text, View } from 'react-native';

import { formatNumber, type MonthStats } from '../logic';
import { colors } from '../theme';

export default function StatsCard({ stats, limitPercent }: { stats: MonthStats; limitPercent: number }) {
  const statusColor = stats.overLimit ? colors.danger : colors.ok;
  const fill = Math.min(stats.percent, 100);
  const marker = Math.min(limitPercent, 100);

  return (
    <View style={styles.card}>
      <View style={styles.headline}>
        <Text style={[styles.percent, { color: statusColor }]}>{formatNumber(Math.round(stats.percent * 10) / 10)} %</Text>
        <Text style={styles.limit}>Homeoffice-Anteil (max. {formatNumber(limitPercent)} %)</Text>
      </View>

      <View style={styles.bar} accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(stats.percent) }}>
        <View style={[styles.fill, { width: `${fill}%`, backgroundColor: statusColor }]} />
        <View style={[styles.marker, { left: `${marker}%` }]} />
      </View>

      <Row label="Soll-Arbeitszeit" value={`${formatNumber(stats.total)} h`} />
      <Row label="Homeoffice" value={`${formatNumber(stats.home)} h`} />
      <Text style={[styles.budget, { color: statusColor }]}>
        {stats.remaining >= 0
          ? `Noch ${formatNumber(stats.remaining)} h Homeoffice möglich`
          : `Limit um ${formatNumber(-stats.remaining)} h überschritten`}
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
