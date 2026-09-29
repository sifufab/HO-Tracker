import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import AdBanner from './src/ads/AdBanner';
import { openPrivacyOptions } from './src/ads/privacy';
import Calendar from './src/components/Calendar';
import DayEditor from './src/components/DayEditor';
import SettingsModal from './src/components/SettingsModal';
import StatsCard from './src/components/StatsCard';
import { deviceLocale, I18nProvider, useI18n } from './src/i18n';
import { isoDate, monthStats, resolveLanguage, targetHours, type DayEntry } from './src/logic';
import { loadData, saveData, type AppData } from './src/storage';
import { colors } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <Tracker />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function Tracker() {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    loadData().then(setData);
  }, []);

  if (!data) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  const update = (next: AppData) => {
    setData(next);
    saveData(next).catch(() => {});
  };

  return (
    <I18nProvider lang={resolveLanguage(data.settings.language, deviceLocale())}>
      <TrackerScreen data={data} update={update} />
    </I18nProvider>
  );
}

function TrackerScreen({ data, update }: { data: AppData; update: (next: AppData) => void }) {
  const { t } = useI18n();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [editDay, setEditDay] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const stats = useMemo(() => monthStats(data.settings, data.days, year, month), [data, year, month]);

  const setEntry = (day: number, entry: DayEntry | undefined) => {
    const days = { ...data.days };
    const key = isoDate(year, month, day);
    if (entry) days[key] = entry;
    else delete days[key];
    update({ ...data, days });
  };

  const shiftMonth = (delta: number) => {
    const index = year * 12 + (month - 1) + delta;
    setYear(Math.floor(index / 12));
    setMonth((index % 12) + 1);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>HO-Tracker</Text>
          <Pressable onPress={() => setShowSettings(true)} accessibilityRole="button" hitSlop={10}>
            <Text style={styles.settingsLink}>{t.settings}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.nav}>
            <NavButton label="‹" onPress={() => shiftMonth(-1)} accessibilityLabel={t.previousMonth} />
            <Text style={styles.monthTitle}>{t.months[month - 1]} {year}</Text>
            <NavButton label="›" onPress={() => shiftMonth(1)} accessibilityLabel={t.nextMonth} />
          </View>
          <Calendar year={year} month={month} settings={data.settings} days={data.days} onPressDay={setEditDay} />
          <Legend />
        </View>

        <StatsCard stats={stats} limitPercent={data.settings.limitPercent} />
      </ScrollView>

      <AdBanner />

      {editDay !== null && (
        <DayEditor
          title={t.dayTitle(editDay, t.months[month - 1], year)}
          target={targetHours(data.settings, year, month, editDay)}
          entry={data.days[isoDate(year, month, editDay)]}
          onSave={(entry) => setEntry(editDay, entry)}
          onClose={() => setEditDay(null)}
        />
      )}
      {showSettings && (
        <SettingsModal
          settings={data.settings}
          onSave={(settings) => update({ ...data, settings })}
          onClose={() => setShowSettings(false)}
          onPrivacyOptions={openPrivacyOptions}
        />
      )}
    </View>
  );
}

function NavButton({ label, onPress, accessibilityLabel }: { label: string; onPress: () => void; accessibilityLabel: string }) {
  return (
    <Pressable style={styles.navButton} onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
      <Text style={styles.navText}>{label}</Text>
    </Pressable>
  );
}

function Legend() {
  const { t } = useI18n();
  const items = [
    { label: t.legendOffice, color: colors.office },
    { label: t.legendHomeFull, color: colors.home },
    { label: t.legendHomePartial, color: colors.homePartial },
    { label: t.legendAbsent, color: colors.absent },
  ];
  return (
    <View style={styles.legend}>
      {items.map((item) => (
        <View key={item.label} style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: item.color }]} />
          <Text style={styles.legendText}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 16, maxWidth: 560, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  settingsLink: { color: colors.primary, fontWeight: '600' },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 12 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  navButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 28, color: colors.primary },
  monthTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  swatch: { width: 12, height: 12, borderRadius: 3 },
  legendText: { fontSize: 12, color: colors.muted },
});
