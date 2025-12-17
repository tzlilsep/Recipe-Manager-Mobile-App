// English comments only.

import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { liquidConversionTable, usefulInfoDatabase } from '../../model/usefulInfo';

export function UsefulInfoScreen() {
  const [amount, setAmount] = useState('');
  const [fromUnit, setFromUnit] = useState<keyof typeof liquidConversionTable>('כוס');
  const [toUnit, setToUnit] = useState<keyof typeof liquidConversionTable>('מ"ל');

  const [search, setSearch] = useState('');

  const result = useMemo(() => {
    const n = Number(amount);
    if (!amount || Number.isNaN(n)) return '0';
    const inMl = n * (liquidConversionTable[fromUnit] ?? 1);
    const out = inMl / (liquidConversionTable[toUnit] ?? 1);
    return out.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  }, [amount, fromUnit, toUnit]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return usefulInfoDatabase;
    return usefulInfoDatabase.filter(x => x.toLowerCase().includes(q));
  }, [search]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>המרת מידות</Text>

      <View style={styles.card}>
        <Text style={styles.label}>כמות</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          style={styles.input}
          textAlign="center"
          placeholder="0"
        />

        <View style={styles.row}>
          <UnitPill label={`המר מ: ${fromUnit}`} onPress={() => setFromUnit(nextUnit(fromUnit))} />
          <UnitPill label={`ל: ${toUnit}`} onPress={() => setToUnit(nextUnit(toUnit))} />
        </View>

        <View style={styles.resultBox}>
          <Text style={styles.resultText}>{result}</Text>
        </View>

        <Text style={styles.hint}>
          טיפ: לחיצה על היחידה מחליפה ליחידה הבאה.
        </Text>
      </View>

      <Text style={styles.title}>חיפוש מידע</Text>
      <TextInput
        value={search}
        onChangeText={setSearch}
        style={styles.input}
        textAlign="right"
        placeholder="לדוגמה: קמח, שמרים, ביצים..."
      />

      <FlatList
        data={filtered}
        keyExtractor={(item, idx) => `${idx}-${item.slice(0, 10)}`}
        contentContainerStyle={{ paddingBottom: 24, gap: 10, paddingTop: 12 }}
        renderItem={({ item }) => (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>{item}</Text>
          </View>
        )}
      />
    </View>
  );
}

function UnitPill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Text onPress={onPress} style={styles.pill}>
      {label}
    </Text>
  );
}

function nextUnit(current: keyof typeof liquidConversionTable) {
  const keys = Object.keys(liquidConversionTable) as Array<keyof typeof liquidConversionTable>;
  const idx = keys.indexOf(current);
  return keys[(idx + 1) % keys.length];
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  title: { textAlign: 'right', fontWeight: '900', color: '#111827', marginTop: 8 },
  card: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, padding: 12, gap: 10 },
  label: { textAlign: 'right', fontWeight: '800', color: '#111827' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#111827' },
  row: { flexDirection: 'row-reverse', gap: 10, justifyContent: 'space-between' },
  pill: { textAlign: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: '#E5E7EB', fontWeight: '800', color: '#111827' },
  resultBox: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14 },
  resultText: { textAlign: 'center', fontWeight: '900', fontSize: 18, color: '#111827' },
  hint: { textAlign: 'right', color: '#6B7280', fontSize: 12 },
  infoCard: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 12 },
  infoText: { textAlign: 'right', color: '#111827' },
});
