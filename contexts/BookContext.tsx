import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { Book } from '@/types/book';
import { AVAILABLE_BOOKS } from '@/constants/books';
import { usePremium } from '@/contexts/PremiumContext';
import { Alert } from 'react-native';

const STORAGE_KEY = 'purchased_books';
const LAST_PURCHASE_KEY = 'last_book_purchase';

export const [BookProvider, useBooks] = createContextHook(() => {
  const [books, setBooks] = useState<Book[]>(AVAILABLE_BOOKS);
  const [lastPurchaseTime, setLastPurchaseTime] = useState<number>(0);
  const { isPremium } = usePremium();

  const booksQuery = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const purchasedData = stored ? JSON.parse(stored) : {};
      
      const lastPurchase = await AsyncStorage.getItem(LAST_PURCHASE_KEY);
      if (lastPurchase) {
        setLastPurchaseTime(parseInt(lastPurchase));
      }
      
      return AVAILABLE_BOOKS.map(book => ({
        ...book,
        isPurchased: purchasedData[book.id]?.isPurchased || false,
        readingProgress: purchasedData[book.id]?.readingProgress || 0,
      }));
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Book[]) => {
      const purchasedData = data.reduce((acc, book) => {
        acc[book.id] = {
          isPurchased: book.isPurchased,
          readingProgress: book.readingProgress,
        };
        return acc;
      }, {} as Record<string, { isPurchased: boolean; readingProgress: number }>);
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(purchasedData));
      return data;
    }
  });

  const { mutate: saveMutate } = saveMutation;

  useEffect(() => {
    if (booksQuery.data) {
      setBooks(booksQuery.data);
    }
  }, [booksQuery.data]);

  const purchaseBook = useCallback(async (bookId: string) => {
    Alert.alert(
      '💳 Real Money Purchase',
      'Books are purchased with real money through your app store account. This feature requires RevenueCat integration to be set up.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: async () => {
            setBooks(prev => {
              const updated = prev.map(book => 
                book.id === bookId ? { ...book, isPurchased: true } : book
              );
              saveMutate(updated);
              return updated;
            });
            
            const now = Date.now();
            setLastPurchaseTime(now);
            await AsyncStorage.setItem(LAST_PURCHASE_KEY, now.toString());
            
            Alert.alert(
              '✅ Purchase Successful',
              'Your book has been added to your library!',
              [{ text: 'Great!', style: 'default' }]
            );
          }
        }
      ]
    );
  }, [saveMutate]);

  const updateReadingProgress = useCallback((bookId: string, progress: number) => {
    setBooks(prev => {
      const updated = prev.map(book => 
        book.id === bookId ? { ...book, readingProgress: progress } : book
      );
      saveMutate(updated);
      return updated;
    });
  }, [saveMutate]);

  const getBookPrice = useCallback((book: Book) => {
    let price = book.price;
    
    if (isPremium) {
      price = price * 0.75;
    }
    
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    if (lastPurchaseTime && (now - lastPurchaseTime) < fiveMinutes) {
      price = price * 0.75;
    }
    
    return price;
  }, [isPremium, lastPurchaseTime]);

  const purchasedBooks = books.filter(book => book.isPurchased);
  const availableBooks = books.filter(book => !book.isPurchased);

  return {
    books,
    purchasedBooks,
    availableBooks,
    isLoading: booksQuery.isLoading,
    purchaseBook,
    updateReadingProgress,
    getBookPrice,
    hasRecentPurchase: !!(lastPurchaseTime && (Date.now() - lastPurchaseTime) < 5 * 60 * 1000),
  };
});
