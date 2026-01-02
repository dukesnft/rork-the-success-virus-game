import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { JournalEntry } from '@/types/journal';
import { getEasternDateString } from '@/utils/dateUtils';

const STORAGE_KEY = 'journal_entries';

export const [JournalProvider, useJournal] = createContextHook(() => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  const entriesQuery = useQuery({
    queryKey: ['journalEntries'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    },
    initialData: [],
  });

  const saveMutation = useMutation({
    mutationFn: async (data: JournalEntry[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  });

  const { mutate: saveMutate } = saveMutation;

  useEffect(() => {
    if (entriesQuery.data) {
      setEntries(entriesQuery.data);
    }
  }, [entriesQuery.data]);

  const addEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    
    const updated = [newEntry, ...entries];
    setEntries(updated);
    saveMutate(updated);
  }, [entries, saveMutate]);

  const updateEntry = useCallback((id: string, updates: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>) => {
    const updated = entries.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    );
    setEntries(updated);
    saveMutate(updated);
  }, [entries, saveMutate]);

  const deleteEntry = useCallback((id: string) => {
    const updated = entries.filter(entry => entry.id !== id);
    setEntries(updated);
    saveMutate(updated);
  }, [entries, saveMutate]);

  const getTodayEntry = useCallback(() => {
    const today = getEasternDateString();
    return entries.find(entry => entry.date === today);
  }, [entries]);

  return {
    entries,
    isLoading: entriesQuery.isLoading,
    addEntry,
    updateEntry,
    deleteEntry,
    getTodayEntry,
  };
});
