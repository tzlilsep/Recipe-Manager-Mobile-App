// Frontend/src/features/shoppingList/ui/editList/styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ecd7c2ff', paddingHorizontal: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    flex: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: { flexDirection: 'row-reverse', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minWidth: 120,
  },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  renameRow: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 8 },
  sharedNote: { fontSize: 12, color: '#6B7280' },
  empty: { textAlign: 'center', color: '#6B7280', paddingVertical: 16 },
  ml2: { marginLeft: 8 },
  editIconBtn: {
    marginRight: 12,
    width: 15,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});
