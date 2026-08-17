import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMedications } from '@/components/medication-provider';

type Filter = 'All' | 'Low stock' | 'In stock';

export default function SupplyScreen() {
  const { medications, refillMedication } = useMedications();
  const [filter, setFilter] = useState<Filter>('All');
  const [refilled, setRefilled] = useState<number | null>(null);

  const lowStock = medications.filter((item) => item.remaining <= 10);
  const totalUnits = medications.reduce((sum, item) => sum + item.remaining, 0);
  const visible = useMemo(() => medications.filter((item) => {
    if (filter === 'Low stock') return item.remaining <= 10;
    if (filter === 'In stock') return item.remaining > 10;
    return true;
  }), [filter, medications]);

  const handleRefill = (id: number) => {
    refillMedication(id);
    setRefilled(id);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>MEDICINE INVENTORY</Text><Text style={styles.title}>Supply</Text></View>
          <Pressable style={styles.historyButton} accessibilityLabel="View refill history"><MaterialIcons name="history" size={22} color="#356F61" /></Pressable>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}><MaterialIcons name="inventory-2" size={25} color="#356F61" /></View>
            <View style={styles.heroText}><Text style={styles.heroLabel}>TOTAL SUPPLY</Text><Text style={styles.heroValue}>{totalUnits} doses on hand</Text></View>
            <View style={styles.healthBadge}><View style={styles.healthDot} /><Text style={styles.healthText}>Tracked</Text></View>
          </View>
          <View style={styles.divider} />
          <View style={styles.metrics}>
            <View><Text style={styles.metricValue}>{medications.length}</Text><Text style={styles.metricLabel}>Medicines</Text></View>
            <View style={styles.metricDivider} />
            <View><Text style={[styles.metricValue, lowStock.length > 0 && styles.warningValue]}>{lowStock.length}</Text><Text style={styles.metricLabel}>Need attention</Text></View>
            <View style={styles.metricDivider} />
            <View><Text style={styles.metricValue}>{medications.length - lowStock.length}</Text><Text style={styles.metricLabel}>Well stocked</Text></View>
          </View>
        </View>

        {lowStock.length > 0 ? <View style={styles.alertCard}>
          <View style={styles.alertIcon}><MaterialIcons name="notifications-active" size={21} color="#B67429" /></View>
          <View style={styles.alertContent}><Text style={styles.alertTitle}>Refill check-in</Text><Text style={styles.alertText}>{lowStock.length} {lowStock.length === 1 ? 'medicine is' : 'medicines are'} running low. Refill now to stay on schedule.</Text></View>
        </View> : null}

        <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Your inventory</Text><Text style={styles.sectionSubtitle}>Synced with My medicines</Text></View><MaterialIcons name="sync" size={18} color="#82908C" /></View>

        <View style={styles.filters}>
          {(['All', 'Low stock', 'In stock'] as Filter[]).map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, item === filter && styles.filterSelected]}><Text style={[styles.filterText, item === filter && styles.filterTextSelected]}>{item}</Text></Pressable>)}
        </View>

        <View style={styles.list}>
          {visible.map((item) => {
            const isLow = item.remaining <= 10;
            const fill = Math.min(item.remaining / 30, 1);
            return <View key={item.id} style={styles.supplyCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.medicationIcon, { backgroundColor: `${item.color}18` }]}><MaterialIcons name={item.icon} size={27} color={item.color} /></View>
                <View style={styles.medicationInfo}><Text style={styles.medicationName}>{item.name}</Text><Text style={styles.medicationDose}>{item.dose} · once daily</Text></View>
                <View style={[styles.stockBadge, isLow ? styles.stockBadgeLow : styles.stockBadgeGood]}><Text style={[styles.stockBadgeText, isLow ? styles.stockTextLow : styles.stockTextGood]}>{isLow ? 'LOW' : 'IN STOCK'}</Text></View>
              </View>
              <View style={styles.supplyRow}><Text style={styles.supplyLabel}>Remaining supply</Text><Text style={[styles.supplyCount, isLow && styles.warningValue]}>{item.remaining} doses</Text></View>
              <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${fill * 100}%`, backgroundColor: isLow ? '#D58B3A' : '#4C8B79' }]} /></View>
              <View style={styles.daysRow}><MaterialIcons name="event" size={15} color="#82908C" /><Text style={styles.daysText}>About {item.remaining} days remaining</Text></View>
              <Pressable onPress={() => handleRefill(item.id)} style={[styles.refillButton, !isLow && styles.refillButtonSecondary]} accessibilityLabel={`Refill ${item.name}`}>
                <MaterialIcons name={refilled === item.id ? 'check' : 'add-shopping-cart'} size={18} color={isLow ? '#FFF' : '#356F61'} />
                <Text style={[styles.refillButtonText, !isLow && styles.refillButtonTextSecondary]}>{refilled === item.id ? '30 doses added' : isLow ? 'Refill now' : 'Add refill'}</Text>
              </Pressable>
            </View>;
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F8F5' },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 20, paddingBottom: 36 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  eyebrow: { color: '#71827D', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 4 },
  title: { color: '#1D302C', fontSize: 28, fontWeight: '700', letterSpacing: -0.7 },
  historyButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E2EEE9', alignItems: 'center', justifyContent: 'center' },
  heroCard: { backgroundColor: '#DDEBE5', borderRadius: 24, padding: 18 },
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  heroIcon: { width: 47, height: 47, borderRadius: 15, backgroundColor: '#F5FAF8', alignItems: 'center', justifyContent: 'center' },
  heroText: { flex: 1, marginLeft: 12 }, heroLabel: { color: '#698078', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 }, heroValue: { color: '#21453C', fontSize: 18, fontWeight: '700', marginTop: 4 },
  healthBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F4FAF7', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 12 }, healthDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CA174' }, healthText: { color: '#527268', fontSize: 9, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#C9DDD5', marginVertical: 17 },
  metrics: { flexDirection: 'row', justifyContent: 'space-around' }, metricValue: { textAlign: 'center', color: '#24473E', fontSize: 20, fontWeight: '800' }, metricLabel: { color: '#6B7D77', fontSize: 10, marginTop: 3 }, metricDivider: { width: 1, backgroundColor: '#C9DDD5' }, warningValue: { color: '#BB7226' },
  alertCard: { flexDirection: 'row', backgroundColor: '#FFF1DD', borderRadius: 18, padding: 14, marginTop: 16 }, alertIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#FFF9EF', alignItems: 'center', justifyContent: 'center', marginRight: 11 }, alertContent: { flex: 1 }, alertTitle: { color: '#754E22', fontSize: 13, fontWeight: '700' }, alertText: { color: '#927044', fontSize: 11, lineHeight: 16, marginTop: 3 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 25 }, sectionTitle: { color: '#203530', fontSize: 20, fontWeight: '700' }, sectionSubtitle: { color: '#88938F', fontSize: 11, marginTop: 3 },
  filters: { flexDirection: 'row', gap: 8, marginVertical: 15 }, filter: { paddingHorizontal: 14, height: 35, borderRadius: 18, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDE4E1', alignItems: 'center', justifyContent: 'center' }, filterSelected: { backgroundColor: '#356F61', borderColor: '#356F61' }, filterText: { color: '#657570', fontSize: 11, fontWeight: '600' }, filterTextSelected: { color: '#FFF' },
  list: { gap: 13 }, supplyCard: { backgroundColor: '#FFF', borderRadius: 21, padding: 16, borderWidth: 1, borderColor: '#E7ECE9' }, cardHeader: { flexDirection: 'row', alignItems: 'center' }, medicationIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 11 }, medicationInfo: { flex: 1 }, medicationName: { color: '#213530', fontSize: 15, fontWeight: '700' }, medicationDose: { color: '#899591', fontSize: 10.5, marginTop: 4 },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 9 }, stockBadgeLow: { backgroundColor: '#FFF0DD' }, stockBadgeGood: { backgroundColor: '#E5F1EC' }, stockBadgeText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.4 }, stockTextLow: { color: '#B76D24' }, stockTextGood: { color: '#3C7667' },
  supplyRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 17 }, supplyLabel: { color: '#71807C', fontSize: 11 }, supplyCount: { color: '#354A45', fontSize: 11, fontWeight: '700' }, progressTrack: { height: 7, backgroundColor: '#E6EBE9', borderRadius: 4, overflow: 'hidden', marginTop: 8 }, progressFill: { height: '100%', borderRadius: 4 }, daysRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 9 }, daysText: { color: '#82908C', fontSize: 10.5 },
  refillButton: { height: 39, borderRadius: 13, backgroundColor: '#356F61', marginTop: 14, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' }, refillButtonSecondary: { backgroundColor: '#F4F8F6', borderWidth: 1, borderColor: '#CEDCD7' }, refillButtonText: { color: '#FFF', fontSize: 12, fontWeight: '700' }, refillButtonTextSecondary: { color: '#356F61' },
});
