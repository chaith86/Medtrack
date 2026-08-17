import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { NewMedication } from '@/components/medication-provider';

export type MedicationFormValues = {
  name: string;
  dose: string;
  time: string;
  detail: string;
  category: string;
  purpose: string;
};

export const EMPTY_MEDICATION_FORM: MedicationFormValues = {
  name: '',
  dose: '',
  time: '',
  detail: '',
  category: '',
  purpose: '',
};

export function medicationToFormValues(item: {
  name: string;
  dose: string;
  time: string;
  detail: string;
  category: string;
  purpose: string;
}): MedicationFormValues {
  return {
    name: item.name,
    dose: item.dose,
    time: item.time,
    detail: item.detail,
    category: item.category,
    purpose: item.purpose,
  };
}

type MedicationFormProps = {
  mode: 'add' | 'edit';
  initialValues?: MedicationFormValues;
  onSave: (values: NewMedication) => void;
  onCancel: () => void;
  onDelete?: () => void;
  showExtendedFields?: boolean;
};

export function MedicationForm({
  mode,
  initialValues = EMPTY_MEDICATION_FORM,
  onSave,
  onCancel,
  onDelete,
  showExtendedFields = false,
}: MedicationFormProps) {
  const [form, setForm] = useState(initialValues);
  const canSave = form.name.trim() && form.dose.trim() && form.time.trim();

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      name: form.name,
      dose: form.dose,
      time: form.time,
      detail: form.detail || undefined,
      category: form.category || undefined,
      purpose: form.purpose || undefined,
    });
  };

  return (
    <View style={styles.form}>
      <Text style={styles.title}>{mode === 'add' ? 'Add a medicine' : 'Edit medicine'}</Text>
      <Text style={styles.hint}>
        {mode === 'add'
          ? 'It will appear on Home, Medicines, and Supply.'
          : 'Changes sync across all tabs.'}
      </Text>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Name</Text>
        <TextInput
          value={form.name}
          onChangeText={(name) => setForm((current) => ({ ...current, name }))}
          placeholder="e.g. Lisinopril"
          placeholderTextColor="#9AA5A2"
          style={styles.input}
        />
      </View>

      <View style={styles.fieldRow}>
        <View style={[styles.field, styles.fieldHalf]}>
          <Text style={styles.fieldLabel}>Dose</Text>
          <TextInput
            value={form.dose}
            onChangeText={(dose) => setForm((current) => ({ ...current, dose }))}
            placeholder="e.g. 10 mg"
            placeholderTextColor="#9AA5A2"
            style={styles.input}
          />
        </View>
        <View style={[styles.field, styles.fieldHalf]}>
          <Text style={styles.fieldLabel}>Time</Text>
          <TextInput
            value={form.time}
            onChangeText={(time) => setForm((current) => ({ ...current, time }))}
            placeholder="e.g. 8:00 AM"
            placeholderTextColor="#9AA5A2"
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Instructions (optional)</Text>
        <TextInput
          value={form.detail}
          onChangeText={(detail) => setForm((current) => ({ ...current, detail }))}
          placeholder="e.g. 1 tablet - After breakfast"
          placeholderTextColor="#9AA5A2"
          style={styles.input}
        />
      </View>

      {showExtendedFields ? (
        <>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Category (optional)</Text>
            <TextInput
              value={form.category}
              onChangeText={(category) => setForm((current) => ({ ...current, category }))}
              placeholder="e.g. Blood pressure"
              placeholderTextColor="#9AA5A2"
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Purpose (optional)</Text>
            <TextInput
              value={form.purpose}
              onChangeText={(purpose) => setForm((current) => ({ ...current, purpose }))}
              placeholder="e.g. Controls high blood pressure"
              placeholderTextColor="#9AA5A2"
              style={styles.input}
            />
          </View>
        </>
      ) : null}

      <View style={styles.actions}>
        <Pressable onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={handleSave}
          disabled={!canSave}
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          accessibilityState={{ disabled: !canSave }}>
          <MaterialIcons name="check" size={18} color="#FFF" />
          <Text style={styles.saveButtonText}>{mode === 'add' ? 'Save medicine' : 'Save changes'}</Text>
        </Pressable>
      </View>

      {mode === 'edit' && onDelete ? (
        <Pressable onPress={onDelete} style={styles.deleteButton} accessibilityLabel="Delete medicine">
          <MaterialIcons name="delete-outline" size={18} color="#A26B62" />
          <Text style={styles.deleteButtonText}>Delete medicine</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E3E8E5',
  },
  title: { color: '#1E302C', fontSize: 17, fontWeight: '700' },
  hint: { color: '#84908D', fontSize: 12, marginTop: 4, marginBottom: 14 },
  field: { marginBottom: 12 },
  fieldRow: { flexDirection: 'row', gap: 10 },
  fieldHalf: { flex: 1 },
  fieldLabel: {
    color: '#71827D',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  input: {
    height: 46,
    backgroundColor: '#F6F8F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E3E8E5',
    paddingHorizontal: 14,
    color: '#263A35',
    fontSize: 14,
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelButton: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CEDCD7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F8F6',
  },
  cancelButtonText: { color: '#356F61', fontSize: 13, fontWeight: '700' },
  saveButton: {
    flex: 1.4,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#356F61',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveButtonDisabled: { opacity: 0.45 },
  saveButtonText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  deleteButton: {
    marginTop: 12,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8CFCB',
    backgroundColor: '#FFF5F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deleteButtonText: { color: '#A26B62', fontSize: 13, fontWeight: '700' },
});
