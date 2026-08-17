import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MedicationForm, medicationToFormValues } from '@/components/medication-form';
import { useMedications } from '@/components/medication-provider';

const week = [
  ['Mon', 1], ['Tue', 2], ['Wed', 3], ['Thu', 4], ['Fri', 5], ['Sat', 6], ['Sun', 7],
] as const;

export default function HomeScreen() {
  const { medications, toggleMedication, addMedication, updateMedication, deleteMedication } = useMedications();
  const [selectedDate, setSelectedDate] = useState(4);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const taken = useMemo(() => medications.filter((item) => item.taken).length, [medications]);
  const progress = medications.length ? taken / medications.length : 0;
  const editingMedication = medications.find((item) => item.id === editingId);

  const closeForm = () => {
    setShowAddForm(false);
    setEditingId(null);
  };

  const confirmDelete = (id: number, name: string) => {
    Alert.alert('Delete medicine', `Remove ${name} from your schedule?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteMedication(id);
          closeForm();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>SATURDAY, JULY 4</Text>
            <Text style={styles.greeting}>Good morning, Kris</Text>
          </View>
          <Pressable style={styles.avatar} accessibilityLabel="Open profile">
            <Text style={styles.avatarText}>K</Text><View style={styles.onlineDot} />
          </Pressable>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>TODAY&apos;S PROGRESS</Text>
              <Text style={styles.summaryTitle}>{taken} of {medications.length} doses taken</Text>
            </View>
            <View style={styles.progressBadge}><Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text></View>
          </View>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View>
          <View style={styles.summaryFooter}>
            <MaterialIcons name="schedule" size={17} color="#56736B" />
            <Text style={styles.summaryHint}>{taken === medications.length ? 'All done for today — nice work!' : `Next dose at ${medications.find((item) => !item.taken)?.time}`}</Text>
          </View>
        </View>

        <View style={styles.calendarHeader}>
          <MaterialIcons name="chevron-left" size={24} color="#253B36" />
          <Text style={styles.month}>July 2026</Text>
          <MaterialIcons name="chevron-right" size={24} color="#253B36" />
        </View>
        <View style={styles.week}>
          {week.map(([day, date]) => {
            const selected = date === selectedDate;
            return (
              <Pressable key={date} onPress={() => setSelectedDate(date)} style={[styles.day, selected && styles.daySelected]} accessibilityState={{ selected }}>
                <Text style={[styles.dayName, selected && styles.dayTextSelected]}>{day}</Text>
                <Text style={[styles.dayDate, selected && styles.dayTextSelected]}>{date}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Today&apos;s medications</Text>
            <Text style={styles.sectionSubtitle}>{medications.length} {medications.length === 1 ? 'dose' : 'doses'} scheduled</Text>
          </View>
          <Pressable
            onPress={() => {
              if (showAddForm) {
                closeForm();
              } else {
                setEditingId(null);
                setShowAddForm(true);
              }
            }}
            style={[styles.addButton, showAddForm && styles.addButtonActive]}
            accessibilityLabel={showAddForm ? 'Close add medicine form' : 'Add medicine'}>
            <MaterialIcons name={showAddForm ? 'close' : 'add'} size={20} color="#FFF" />
            <Text style={styles.addButtonText}>{showAddForm ? 'Close' : 'Add'}</Text>
          </Pressable>
        </View>

        {showAddForm ? (
          <MedicationForm
            mode="add"
            onSave={(values) => {
              addMedication(values);
              closeForm();
            }}
            onCancel={closeForm}
          />
        ) : null}

        {editingMedication ? (
          <MedicationForm
            mode="edit"
            initialValues={medicationToFormValues(editingMedication)}
            onSave={(values) => {
              updateMedication(editingMedication.id, values);
              closeForm();
            }}
            onCancel={closeForm}
            onDelete={() => confirmDelete(editingMedication.id, editingMedication.name)}
          />
        ) : null}

        <View style={styles.medicationList}>
          {medications.map((item) => (
            <View key={item.id} style={styles.medicationCard}>
              <Pressable
                onPress={() => toggleMedication(item.id)}
                style={({ pressed }) => [styles.medicationMain, pressed && styles.cardPressed]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: item.taken }}>
                <View style={[styles.medicationIcon, { backgroundColor: `${item.color}18` }]}>
                  <MaterialIcons name={item.icon} size={28} color={item.color} />
                </View>
                <View style={styles.medicationInfo}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.medicationName, item.taken && styles.takenText]}>{item.name}</Text>
                    <Text style={styles.dose}>{item.dose}</Text>
                  </View>
                  <Text style={styles.detail}>{item.detail}</Text>
                </View>
                <View style={styles.timeColumn}>
                  {item.time.split(' ').map((part) => (
                    <Text key={part} style={part.length === 2 ? styles.period : styles.time}>{part}</Text>
                  ))}
                </View>
                <View style={[styles.check, item.taken && styles.checkTaken]}>
                  {item.taken ? <MaterialIcons name="check" size={18} color="#FFF" /> : null}
                </View>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowAddForm(false);
                  setEditingId(item.id);
                }}
                style={styles.editButton}
                accessibilityLabel={`Edit ${item.name}`}>
                <MaterialIcons name="edit" size={18} color="#356F61" />
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}><MaterialIcons name="lightbulb-outline" size={22} color="#B17226" /></View>
          <View style={styles.tipContent}><Text style={styles.tipTitle}>A little reminder</Text><Text style={styles.tipText}>Taking your medication at the same time each day helps build a lasting routine.</Text></View>
          <MaterialIcons name="close" size={19} color="#9C8A70" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F8F5' },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  eyebrow: { color: '#71827D', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 5 },
  greeting: { color: '#1D302C', fontSize: 26, fontWeight: '700', letterSpacing: -0.7 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#DCE9E3', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#365D52' },
  onlineDot: { position: 'absolute', right: 1, bottom: 2, width: 11, height: 11, borderRadius: 6, backgroundColor: '#4AAE78', borderWidth: 2, borderColor: '#F6F8F5' },
  summaryCard: { backgroundColor: '#DDEBE5', borderRadius: 24, padding: 20, marginBottom: 25 },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: '#527168', fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginBottom: 7 },
  summaryTitle: { color: '#1C3E35', fontSize: 20, fontWeight: '700' },
  progressBadge: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#F4FAF7', alignItems: 'center', justifyContent: 'center' },
  progressPercent: { color: '#2B6758', fontSize: 16, fontWeight: '800' },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: '#C3D8CF', overflow: 'hidden', marginTop: 18 },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#3C7C6C' },
  summaryFooter: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12 },
  summaryHint: { color: '#56736B', fontSize: 13, fontWeight: '500' },
  calendarHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20, marginBottom: 13 },
  month: { color: '#263C37', fontSize: 15, fontWeight: '700' },
  week: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 29 },
  day: { width: 43, height: 61, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  daySelected: { backgroundColor: '#336E5F' },
  dayName: { color: '#86928F', fontSize: 11, fontWeight: '600', marginBottom: 6 },
  dayDate: { color: '#2F403C', fontSize: 16, fontWeight: '700' },
  dayTextSelected: { color: '#FFF' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: '#1E302C', fontSize: 20, fontWeight: '700' },
  sectionSubtitle: { color: '#84908D', fontSize: 12, marginTop: 3 },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#356F61', paddingHorizontal: 14, height: 38, borderRadius: 19 },
  addButtonActive: { backgroundColor: '#244F44' },
  addButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  medicationList: { gap: 12 },
  medicationCard: {
    minHeight: 92,
    backgroundColor: '#FFF',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECE8',
    overflow: 'hidden',
  },
  medicationMain: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 14, paddingRight: 8 },
  editButton: {
    width: 44,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#E9ECE8',
    backgroundColor: '#F4F8F6',
  },
  cardPressed: { opacity: 0.72 },
  medicationIcon: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  medicationInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 7 },
  medicationName: { color: '#223632', fontSize: 16, fontWeight: '700' },
  takenText: { textDecorationLine: 'line-through', color: '#73817E' },
  dose: { color: '#8A9693', fontSize: 11, fontWeight: '600' },
  detail: { color: '#82908C', fontSize: 12, marginTop: 6 },
  timeColumn: { alignItems: 'flex-end', marginHorizontal: 10 },
  time: { color: '#2D403B', fontSize: 15, fontWeight: '700' },
  period: { color: '#8B9693', fontSize: 10, fontWeight: '700', marginTop: 1 },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: '#C5CECB', alignItems: 'center', justifyContent: 'center' },
  checkTaken: { backgroundColor: '#387667', borderColor: '#387667' },
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF5E5', borderRadius: 18, padding: 15, marginTop: 20 },
  tipIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#FFE9C7', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  tipContent: { flex: 1, paddingRight: 8 },
  tipTitle: { color: '#5D4A2E', fontSize: 13, fontWeight: '700', marginBottom: 3 },
  tipText: { color: '#806C51', fontSize: 12, lineHeight: 17 },
});
