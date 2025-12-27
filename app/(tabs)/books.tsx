import { StyleSheet, View, Text, Pressable, ScrollView, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, ShoppingBag, X, CheckCircle, BookMarked } from 'lucide-react-native';
import { useBooks } from '@/contexts/BookContext';
import { usePremium } from '@/contexts/PremiumContext';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Book } from '@/types/book';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

function BookCard({ book, onPress, discountedPrice, isPremium, hasRecentPurchase }: { book: Book; onPress: () => void; discountedPrice: number; isPremium: boolean; hasRecentPurchase: boolean }) {
  const hasDiscount = discountedPrice < book.price;
  
  return (
    <Pressable
      style={styles.bookCard}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <Image
        source={{ uri: book.coverUrl }}
        style={styles.bookCover}
        contentFit="cover"
      />
      <View style={styles.bookContent}>
        <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.bookAuthor}>{book.author}</Text>
        <Text style={styles.bookDescription} numberOfLines={3}>{book.description}</Text>
        
        {book.isPurchased ? (
          <View style={styles.purchasedBadge}>
            <CheckCircle color="#32CD32" size={16} />
            <Text style={styles.purchasedText}>Purchased</Text>
            {book.readingProgress > 0 && (
              <Text style={styles.progressText}>{book.readingProgress}%</Text>
            )}
          </View>
        ) : (
          <View style={styles.priceContainer}>
            <View style={styles.priceTag}>
              {hasDiscount && (
                <Text style={styles.originalPrice}>${book.price.toFixed(2)}</Text>
              )}
              <Text style={styles.priceText}>${discountedPrice.toFixed(2)}</Text>
            </View>
            {(isPremium || hasRecentPurchase) && (
              <View style={styles.discountBadges}>
                {isPremium && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>👑 50% OFF</Text>
                  </View>
                )}
                {hasRecentPurchase && (
                  <View style={styles.consecutiveBadge}>
                    <Text style={styles.discountText}>+25% OFF</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function BooksScreen() {
  const { purchasedBooks, availableBooks, purchaseBook, updateReadingProgress, getBookPrice, hasRecentPurchase } = useBooks();
  const { isPremium } = usePremium();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showReader, setShowReader] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const handlePurchase = (bookId: string) => {
    purchaseBook(bookId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSelectedBook(null);
  };

  const handleRead = (book: Book) => {
    setSelectedBook(book);
    setCurrentPage(Math.floor((book.readingProgress / 100) * book.pages.length));
    setShowReader(true);
  };

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (!selectedBook) return;
    
    const newPage = direction === 'next' 
      ? Math.min(currentPage + 1, selectedBook.pages.length - 1)
      : Math.max(currentPage - 1, 0);
    
    setCurrentPage(newPage);
    
    const progress = Math.round(((newPage + 1) / selectedBook.pages.length) * 100);
    updateReadingProgress(selectedBook.id, progress);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a1a', '#1a0a2e', '#2d1b4e']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <BookOpen color="#fff" size={32} />
              <Text style={styles.title}>Book Library</Text>
            </View>
            <Text style={styles.subtitle}>Expand your manifestation knowledge</Text>
          </View>

          {purchasedBooks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <BookMarked color="#FFD700" size={24} />
                <Text style={styles.sectionTitle}>My Books</Text>
              </View>
              {purchasedBooks.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onPress={() => handleRead(book)}
                  discountedPrice={book.price}
                  isPremium={isPremium}
                  hasRecentPurchase={hasRecentPurchase}
                />
              ))}
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ShoppingBag color="#FF69B4" size={24} />
              <Text style={styles.sectionTitle}>Available Books</Text>
            </View>
            {availableBooks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🎉</Text>
                <Text style={styles.emptyText}>You own all books!</Text>
                <Text style={styles.emptySubtext}>Check back for new releases</Text>
              </View>
            ) : (
              availableBooks.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onPress={() => setSelectedBook(book)}
                  discountedPrice={getBookPrice(book)}
                  isPremium={isPremium}
                  hasRecentPurchase={hasRecentPurchase}
                />
              ))
            )}
          </View>
        </ScrollView>

        {selectedBook && !showReader && (
          <Modal
            visible={true}
            transparent
            animationType="fade"
            onRequestClose={() => setSelectedBook(null)}
          >
            <View style={styles.modalOverlay}>
              <Pressable 
                style={styles.modalBackdrop}
                onPress={() => setSelectedBook(null)}
              />
              <View style={styles.detailModal}>
                <Pressable
                  style={styles.closeButton}
                  onPress={() => setSelectedBook(null)}
                >
                  <X color="#fff" size={24} />
                </Pressable>

                <ScrollView 
                  style={styles.modalScroll}
                  contentContainerStyle={styles.modalContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Image
                    source={{ uri: selectedBook.coverUrl }}
                    style={styles.modalCover}
                    contentFit="cover"
                  />

                  <Text style={styles.modalTitle}>{selectedBook.title}</Text>
                  <Text style={styles.modalAuthor}>{selectedBook.author}</Text>
                  
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{selectedBook.category}</Text>
                  </View>

                  <Text style={styles.modalDescription}>{selectedBook.description}</Text>

                  <View style={styles.bookInfo}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Pages</Text>
                      <Text style={styles.infoValue}>{selectedBook.pages.length}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Category</Text>
                      <Text style={styles.infoValue}>{selectedBook.category}</Text>
                    </View>
                  </View>

                  {selectedBook.isPurchased ? (
                    <Pressable
                      style={styles.readButton}
                      onPress={() => handleRead(selectedBook)}
                    >
                      <LinearGradient
                        colors={['#32CD32', '#228B22']}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <BookOpen color="#fff" size={20} />
                        <Text style={styles.buttonText}>
                          {selectedBook.readingProgress > 0 ? 'Continue Reading' : 'Start Reading'}
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  ) : (
                    <View>
                      {(isPremium || hasRecentPurchase) && (
                        <View style={styles.modalDiscountBadges}>
                          {isPremium && <Text style={styles.modalDiscountText}>👑 Premium: 50% OFF</Text>}
                          {hasRecentPurchase && <Text style={styles.modalDiscountText}>⚡ Consecutive Purchase: +25% OFF</Text>}
                        </View>
                      )}
                      <Pressable
                        style={styles.purchaseButton}
                        onPress={() => handlePurchase(selectedBook.id)}
                      >
                        <LinearGradient
                          colors={['#9370DB', '#FF69B4']}
                          style={styles.buttonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <ShoppingBag color="#fff" size={20} />
                          <View style={styles.priceButtonContent}>
                            {getBookPrice(selectedBook) < selectedBook.price && (
                              <Text style={styles.modalOriginalPrice}>${selectedBook.price.toFixed(2)}</Text>
                            )}
                            <Text style={styles.buttonText}>Purchase for ${getBookPrice(selectedBook).toFixed(2)}</Text>
                          </View>
                        </LinearGradient>
                      </Pressable>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}

        {showReader && selectedBook && (
          <Modal
            visible={true}
            animationType="slide"
            onRequestClose={() => setShowReader(false)}
          >
            <View style={styles.readerContainer}>
              <LinearGradient
                colors={['#f5f5dc', '#fff8dc']}
                style={styles.readerGradient}
              >
                <View style={styles.readerHeader}>
                  <Pressable
                    style={styles.readerCloseButton}
                    onPress={() => {
                      setShowReader(false);
                      setSelectedBook(null);
                    }}
                  >
                    <X color="#2d1b4e" size={28} />
                  </Pressable>
                  <View style={styles.readerProgress}>
                    <Text style={styles.readerPageNumber}>
                      Page {currentPage + 1} of {selectedBook.pages.length}
                    </Text>
                    <View style={styles.readerProgressBar}>
                      <View 
                        style={[
                          styles.readerProgressFill, 
                          { width: `${((currentPage + 1) / selectedBook.pages.length) * 100}%` }
                        ]} 
                      />
                    </View>
                  </View>
                </View>

                <ScrollView 
                  style={styles.readerScroll}
                  contentContainerStyle={styles.readerContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.readerText}>
                    {selectedBook.pages[currentPage].content}
                  </Text>
                </ScrollView>

                <View style={styles.readerFooter}>
                  <Pressable
                    style={[styles.readerNavButton, currentPage === 0 && styles.readerNavButtonDisabled]}
                    onPress={() => handlePageChange('prev')}
                    disabled={currentPage === 0}
                  >
                    <Text style={[styles.readerNavText, currentPage === 0 && styles.readerNavTextDisabled]}>
                      ← Previous
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.readerNavButton, 
                      currentPage === selectedBook.pages.length - 1 && styles.readerNavButtonDisabled
                    ]}
                    onPress={() => handlePageChange('next')}
                    disabled={currentPage === selectedBook.pages.length - 1}
                  >
                    <Text style={[
                      styles.readerNavText, 
                      currentPage === selectedBook.pages.length - 1 && styles.readerNavTextDisabled
                    ]}>
                      Next →
                    </Text>
                  </Pressable>
                </View>
              </LinearGradient>
            </View>
          </Modal>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#b8a9d9',
    marginLeft: 44,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#fff',
  },
  bookCard: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bookCover: {
    width: 100,
    height: 150,
  },
  bookContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#b8a9d9',
    marginBottom: 8,
  },
  bookDescription: {
    fontSize: 13,
    color: '#b8a9d9',
    lineHeight: 18,
    marginBottom: 12,
  },
  purchasedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  purchasedText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#32CD32',
  },
  progressText: {
    fontSize: 12,
    color: '#b8a9d9',
    marginLeft: 4,
  },
  priceContainer: {
    gap: 6,
  },
  priceTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#b8a9d9',
    textDecorationLine: 'line-through' as const,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  discountBadges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  discountBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  consecutiveBadge: {
    backgroundColor: 'rgba(255, 105, 180, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.5)',
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#fff',
  },
  modalDiscountBadges: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 6,
  },
  modalDiscountText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFD700',
    textAlign: 'center' as const,
  },
  priceButtonContent: {
    alignItems: 'center',
  },
  modalOriginalPrice: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.6)',
    textDecorationLine: 'line-through' as const,
    marginBottom: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#b8a9d9',
    textAlign: 'center' as const,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  detailModal: {
    backgroundColor: '#2d1b4e',
    borderRadius: 24,
    width: width * 0.9,
    maxWidth: 500,
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: 24,
    alignItems: 'center',
  },
  modalCover: {
    width: 200,
    height: 300,
    borderRadius: 12,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: '#fff',
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  modalAuthor: {
    fontSize: 16,
    color: '#b8a9d9',
    textAlign: 'center' as const,
    marginBottom: 16,
  },
  categoryTag: {
    backgroundColor: 'rgba(255, 105, 180, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 20,
  },
  categoryTagText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FF69B4',
    textTransform: 'capitalize' as const,
  },
  modalDescription: {
    fontSize: 16,
    color: '#b8a9d9',
    lineHeight: 24,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  bookInfo: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#b8a9d9',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    textTransform: 'capitalize' as const,
  },
  purchaseButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  readButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  readerContainer: {
    flex: 1,
  },
  readerGradient: {
    flex: 1,
  },
  readerHeader: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(45, 27, 78, 0.1)',
  },
  readerCloseButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  readerProgress: {
    alignItems: 'center',
  },
  readerPageNumber: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#2d1b4e',
    marginBottom: 8,
  },
  readerProgressBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(45, 27, 78, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  readerProgressFill: {
    height: '100%',
    backgroundColor: '#9370DB',
    borderRadius: 2,
  },
  readerScroll: {
    flex: 1,
  },
  readerContent: {
    padding: 24,
  },
  readerText: {
    fontSize: 18,
    lineHeight: 32,
    color: '#2d1b4e',
    fontWeight: '400' as const,
  },
  readerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(45, 27, 78, 0.1)',
  },
  readerNavButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(147, 112, 219, 0.2)',
    borderRadius: 12,
  },
  readerNavButtonDisabled: {
    opacity: 0.3,
  },
  readerNavText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#2d1b4e',
  },
  readerNavTextDisabled: {
    color: '#999',
  },
});
