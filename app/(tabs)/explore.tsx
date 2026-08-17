import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MedicationForm, medicationToFormValues } from '@/components/medication-form';
import { useMedications } from '@/components/medication-provider';

const filters = ['All', 'Morning', 'Afternoon', 'Evening'];

export default function MedicinesScreen() {
  const { medications, toggleMedication, cartIds, toggleCart, addMedication, updateMedication, deleteMedication } = useMedications();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [showCart, setShowCart] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const cartItems = medications.filter((item) => cartIds.includes(item.id));
  const editingMedication = medications.find((item) => item.id === editingId);
  const visible = useMemo(() => medications.filter((item) => {
    const matches = `${item.name} ${item.dose} ${item.category}`.toLowerCase().includes(query.toLowerCase());
    const hour = Number(item.time.split(':')[0]);
    const period = item.time.includes('AM') ? 'Morning' : hour < 5 ? 'Afternoon' : 'Evening';
    return matches && (filter === 'All' || filter === period);
  }), [filter, medications, query]);
  const lowStock = medications.filter((item) => item.remaining <= 10).length;

  const closeForm = () => {
    setShowAddForm(false);
    setEditingId(null);
  };

  const confirmDelete = (id: number, name: string) => {
    Alert.alert('Delete medicine', `Remove ${name} from your cabinet?`, [
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
          <View><Text style={styles.eyebrow}>YOUR CABINET</Text><Text style={styles.title}>My medicines</Text></View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => {
                closeForm();
                setShowAddForm((current) => !current);
              }}
              style={[styles.headerButton, showAddForm && styles.headerButtonActive]}
              accessibilityLabel={showAddForm ? 'Close add medicine form' : 'Add medicine'}>
              <MaterialIcons name={showAddForm ? 'close' : 'add'} size={22} color="#FFF" />
            </Pressable>
            <Pressable onPress={() => setShowCart((current) => !current)} style={[styles.headerButton, showCart && styles.cartHeaderActive]} accessibilityLabel={`Open cart with ${cartIds.length} items`}>
              <MaterialIcons name="shopping-cart" size={22} color="#FFF" />
              {cartIds.length > 0 ? <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartIds.length}</Text></View> : null}
            </Pressable>
          </View>
        </View>
        {showAddForm ? (
          <MedicationForm
            mode="add"
            showExtendedFields
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
            showExtendedFields
            initialValues={medicationToFormValues(editingMedication)}
            onSave={(values) => {
              updateMedication(editingMedication.id, values);
              closeForm();
            }}
            onCancel={closeForm}
            onDelete={() => confirmDelete(editingMedication.id, editingMedication.name)}
          />
        ) : null}
        {showCart ? <View style={styles.cartPanel}>
          <View style={styles.cartPanelHeader}><View><Text style={styles.cartTitle}>Your cart</Text><Text style={styles.cartSubtitle}>{cartItems.length} {cartItems.length === 1 ? 'medicine' : 'medicines'} selected</Text></View><Pressable onPress={() => setShowCart(false)} hitSlop={10}><MaterialIcons name="close" size={21} color="#71807C" /></Pressable></View>
          {cartItems.length ? <>
            <View style={styles.cartList}>{cartItems.map((item) => <View key={item.id} style={styles.cartItem}><View style={[styles.cartItemIcon, { backgroundColor: `${item.color}18` }]}><MaterialIcons name={item.icon} size={20} color={item.color} /></View><View style={styles.cartItemInfo}><Text style={styles.cartItemName}>{item.name}</Text><Text style={styles.cartItemDose}>{item.dose} · 30-day supply</Text></View><Pressable onPress={() => toggleCart(item.id)} hitSlop={10} accessibilityLabel={`Remove ${item.name}`}><MaterialIcons name="delete-outline" size={20} color="#A26B62" /></Pressable></View>)}</View>
            <Pressable onPress={() => Alert.alert('Cart ready', `${cartItems.length} ${cartItems.length === 1 ? 'medicine is' : 'medicines are'} ready for checkout.`)} style={styles.checkoutButton}><Text style={styles.checkoutText}>Continue to checkout</Text><MaterialIcons name="arrow-forward" size={18} color="#FFF" /></Pressable>
          </> : <View style={styles.emptyCart}><MaterialIcons name="shopping-cart" size={27} color="#9CA8A4" /><Text style={styles.emptyCartText}>Your cart is empty</Text></View>}
        </View> : null}
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={22} color="#74827E" />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search medicines or dosage" placeholderTextColor="#9AA5A2" style={styles.searchInput} />
          {query ? <Pressable onPress={() => setQuery('')}><MaterialIcons name="cancel" size={19} color="#A8B1AE" /></Pressable> : null}
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.activeCard]}><View style={styles.statIcon}><MaterialIcons name="medication" size={22} color="#356F61" /></View><Text style={styles.statNumber}>{medications.length}</Text><Text style={styles.statLabel}>Active medicines</Text></View>
          <View style={[styles.statCard, styles.refillCard]}><View style={[styles.statIcon, styles.refillIcon]}><MaterialIcons name="inventory-2" size={21} color="#B67429" /></View><Text style={styles.statNumber}>{lowStock}</Text><Text style={styles.statLabel}>Refills coming up</Text></View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, item === filter && styles.filterSelected]}><Text style={[styles.filterText, item === filter && styles.filterTextSelected]}>{item}</Text></Pressable>)}
        </ScrollView>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{filter === 'All' ? 'All medicines' : filter}</Text><Text style={styles.resultCount}>{visible.length} items</Text></View>
        <View style={styles.list}>
          {visible.map((item) => {
            const low = item.remaining <= 10;
            const inCart = cartIds.includes(item.id);
            return <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.medicationIcon, { backgroundColor: `${item.color}18` }]}><MaterialIcons name={item.icon} size={29} color={item.color} /></View>
                <View style={styles.mainInfo}><View style={styles.nameRow}><Text style={styles.name}>{item.name}</Text><View style={[styles.categoryBadge, { backgroundColor: `${item.color}12` }]}><Text style={[styles.categoryText, { color: item.color }]}>{item.category}</Text></View></View><Text style={styles.purpose}>{item.purpose}</Text></View>
                <Pressable
                  onPress={() => {
                    setShowAddForm(false);
                    setEditingId(item.id);
                  }}
                  hitSlop={10}
                  accessibilityLabel={`Edit ${item.name}`}>
                  <MaterialIcons name="edit" size={22} color="#356F61" />
                </Pressable>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailsRow}>
                <View><Text style={styles.detailLabel}>DOSAGE</Text><Text style={styles.detailValue}>{item.dose}</Text></View>
                <View><Text style={styles.detailLabel}>NEXT STRIP</Text><Text style={styles.detailValue}>{item.time}</Text></View>
                <View><Text style={styles.detailLabel}>SUPPLY</Text><Text style={[styles.detailValue, low && styles.lowStock]}>{item.remaining} strips</Text></View>
              </View>
              {low ? <View style={styles.refillNotice}><MaterialIcons name="info-outline" size={16} color="#B67429" /><Text style={styles.refillText}>Running low - plan a refill soon</Text></View> : null}
              <View style={styles.actionRow}>
                <Pressable onPress={() => toggleMedication(item.id)} style={[styles.doseButton, item.taken && styles.doseButtonTaken]} accessibilityRole="checkbox" accessibilityState={{ checked: item.taken }}>
                  <MaterialIcons name={item.taken ? 'check-circle' : 'radio-button-unchecked'} size={18} color={item.taken ? '#FFF' : '#356F61'} /><Text style={[styles.doseButtonText, item.taken && styles.doseButtonTextTaken]}>{item.taken ? 'Taken' : 'Take'}</Text>
                </Pressable>
                <Pressable onPress={() => toggleCart(item.id)} style={[styles.cartButton, inCart && styles.cartButtonAdded]} accessibilityRole="button" accessibilityState={{ selected: inCart }} accessibilityLabel={`${inCart ? 'Remove' : 'Add'} ${item.name} ${inCart ? 'from' : 'to'} cart`}>
                  <MaterialIcons name={inCart ? 'check' : 'add-shopping-cart'} size={18} color={inCart ? '#356F61' : '#FFF'} /><Text style={[styles.cartButtonText, inCart && styles.cartButtonTextAdded]}>{inCart ? 'Added' : 'Add to cart'}</Text>
                </Pressable>
              </View>
            </View>;
          })}
          {!visible.length ? <View style={styles.empty}><MaterialIcons name="search-off" size={36} color="#9BA7A3" /><Text style={styles.emptyTitle}>No medicines found</Text><Text style={styles.emptyText}>Try another search or time of day.</Text></View> : null}
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
  headerActions: { flexDirection: 'row', gap: 10 },
  headerButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#356F61', alignItems: 'center', justifyContent: 'center' },
  headerButtonActive: { backgroundColor: '#244F44' },
  cartHeaderActive: { backgroundColor: '#244F44' },
  cartBadge: { position: 'absolute', right: -2, top: -3, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#E78961', borderWidth: 2, borderColor: '#F6F8F5', alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  cartPanel: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#DDE6E2' },
  cartPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartTitle: { color: '#213530', fontSize: 17, fontWeight: '700' }, cartSubtitle: { color: '#87938F', fontSize: 10.5, marginTop: 2 },
  cartList: { marginTop: 12 }, cartItem: { minHeight: 49, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EDF0EE', paddingVertical: 9 },
  cartItemIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 9 }, cartItemInfo: { flex: 1 }, cartItemName: { color: '#344843', fontSize: 12.5, fontWeight: '700' }, cartItemDose: { color: '#899591', fontSize: 9.5, marginTop: 2 },
  checkoutButton: { height: 42, borderRadius: 13, backgroundColor: '#356F61', marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, checkoutText: { color: '#FFF', fontSize: 12.5, fontWeight: '700' },
  emptyCart: { alignItems: 'center', paddingVertical: 22 }, emptyCartText: { color: '#899591', fontSize: 11.5, marginTop: 6 },
  searchBox: { height: 52, backgroundColor: '#FFF', borderRadius: 17, borderWidth: 1, borderColor: '#E3E8E5', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 10 },
  searchInput: { flex: 1, color: '#263A35', fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  statCard: { flex: 1, minHeight: 112, borderRadius: 20, padding: 15 },
  activeCard: { backgroundColor: '#DDEBE5' }, refillCard: { backgroundColor: '#FFF1DD' },
  statIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F3FAF7', alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  refillIcon: { backgroundColor: '#FFF8EE' }, statNumber: { color: '#243A35', fontSize: 22, fontWeight: '800' }, statLabel: { color: '#687A75', fontSize: 11, fontWeight: '600', marginTop: 2 },
  filters: { gap: 8, paddingVertical: 20 },
  filter: { height: 36, paddingHorizontal: 16, borderRadius: 18, borderWidth: 1, borderColor: '#DDE4E1', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  filterSelected: { backgroundColor: '#356F61', borderColor: '#356F61' }, filterText: { color: '#657570', fontSize: 12, fontWeight: '600' }, filterTextSelected: { color: '#FFF' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 }, sectionTitle: { color: '#203530', fontSize: 19, fontWeight: '700' }, resultCount: { color: '#8A9693', fontSize: 12 }, list: { gap: 13 },
  card: { backgroundColor: '#FFF', borderRadius: 21, padding: 16, borderWidth: 1, borderColor: '#E8ECE9' }, cardTop: { flexDirection: 'row', alignItems: 'center' },
  medicationIcon: { width: 51, height: 51, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 }, mainInfo: { flex: 1 }, nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7 }, name: { color: '#213530', fontSize: 16, fontWeight: '700' },
  categoryBadge: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 }, categoryText: { fontSize: 9, fontWeight: '700' }, purpose: { color: '#84908D', fontSize: 11.5, marginTop: 5 }, divider: { height: 1, backgroundColor: '#EDF0EE', marginVertical: 14 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between' }, detailLabel: { color: '#9AA4A1', fontSize: 8, fontWeight: '800', letterSpacing: 0.5 }, detailValue: { color: '#394B47', fontSize: 11.5, fontWeight: '700', marginTop: 2 }, lowStock: { color: '#B67429' },
  refillNotice: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: '#FFF5E7', padding: 9, borderRadius: 10, marginTop: 13 }, refillText: { color: '#9B6427', fontSize: 10.5, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 13 },
  doseButton: { flex: 0.8, height: 39, borderRadius: 13, borderWidth: 1, borderColor: '#B7CCC6', flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' }, doseButtonTaken: { backgroundColor: '#3B7567', borderColor: '#3B7567' }, doseButtonText: { color: '#356F61', fontSize: 12, fontWeight: '700' }, doseButtonTextTaken: { color: '#FFF' },
  cartButton: { flex: 1.2, height: 39, borderRadius: 13, backgroundColor: '#356F61', flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' }, cartButtonAdded: { backgroundColor: '#E2EEE9', borderWidth: 1, borderColor: '#BFD3CC' }, cartButtonText: { color: '#FFF', fontSize: 12, fontWeight: '700' }, cartButtonTextAdded: { color: '#356F61' },
  empty: { alignItems: 'center', paddingVertical: 42 }, emptyTitle: { color: '#41524E', fontSize: 16, fontWeight: '700', marginTop: 10 }, emptyText: { color: '#8B9693', fontSize: 12, marginTop: 4 },
});
