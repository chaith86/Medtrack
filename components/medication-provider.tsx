import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

export type Medication = {
  id: number;
  name: string;
  dose: string;
  time: string;
  detail: string;
  color: string;
  icon: 'medication' | 'vaccines';
  taken: boolean;
  category: string;
  purpose: string;
  remaining: number;
};

const initialMedications: Medication[] = [
  { id: 1, name: 'Lisinopril', dose: '10 mg', time: '8:00 AM', detail: '1 tablet - After breakfast', color: '#5E7EE8', icon: 'medication', taken: true, category: 'Blood pressure', purpose: 'Controls high blood pressure', remaining: 24 },
  { id: 2, name: 'Metformin', dose: '500 mg', time: '1:00 PM', detail: '1 tablet - With lunch', color: '#EA936D', icon: 'medication', taken: false, category: 'Diabetes', purpose: 'Helps manage blood sugar', remaining: 12 },
  { id: 3, name: 'Vitamin D3', dose: '1000 IU', time: '8:00 PM', detail: '1 softgel - After dinner', color: '#D1A43A', icon: 'vaccines', taken: false, category: 'Supplement', purpose: 'Supports bone and immune health', remaining: 8 },
];

export type NewMedication = {
  name: string;
  dose: string;
  time: string;
  detail?: string;
  category?: string;
  purpose?: string;
};

const palette = ['#5E7EE8', '#EA936D', '#D1A43A', '#4C8B79', '#9B6BB8', '#E07A7A'];

type MedicationContextValue = {
  medications: Medication[];
  cartIds: number[];
  toggleMedication: (id: number) => void;
  refillMedication: (id: number) => void;
  toggleCart: (id: number) => void;
  addMedication: (input: NewMedication) => void;
  updateMedication: (id: number, input: NewMedication) => void;
  deleteMedication: (id: number) => void;
};

const MedicationContext = createContext<MedicationContextValue | null>(null);

export function MedicationProvider({ children }: PropsWithChildren) {
  const [medications, setMedications] = useState(initialMedications);
  const [cartIds, setCartIds] = useState<number[]>([]);

  const value = useMemo(() => ({
    medications,
    cartIds,
    toggleMedication: (id: number) => setMedications((current) =>
      current.map((item) => item.id === id ? { ...item, taken: !item.taken } : item)
    ),
    refillMedication: (id: number) => setMedications((current) =>
      current.map((item) => item.id === id ? { ...item, remaining: item.remaining + 30 } : item)
    ),
    toggleCart: (id: number) => setCartIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ),
    addMedication: (input: NewMedication) => setMedications((current) => {
      const id = current.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      const color = palette[(id - 1) % palette.length];
      return [...current, {
        id,
        name: input.name.trim(),
        dose: input.dose.trim(),
        time: input.time.trim(),
        detail: input.detail?.trim() || '1 dose - as directed',
        color,
        icon: 'medication' as const,
        taken: false,
        category: input.category?.trim() || 'General',
        purpose: input.purpose?.trim() || 'Added to your schedule',
        remaining: 30,
      }];
    }),
    updateMedication: (id: number, input: NewMedication) => setMedications((current) =>
      current.map((item) => item.id === id ? {
        ...item,
        name: input.name.trim(),
        dose: input.dose.trim(),
        time: input.time.trim(),
        detail: input.detail?.trim() || item.detail,
        category: input.category?.trim() || item.category,
        purpose: input.purpose?.trim() || item.purpose,
      } : item)
    ),
    deleteMedication: (id: number) => {
      setMedications((current) => current.filter((item) => item.id !== id));
      setCartIds((current) => current.filter((item) => item !== id));
    },
  }), [cartIds, medications]);

  return <MedicationContext.Provider value={value}>{children}</MedicationContext.Provider>;
}

export function useMedications() {
  const value = useContext(MedicationContext);
  if (!value) throw new Error('useMedications must be used inside MedicationProvider');
  return value;
}
