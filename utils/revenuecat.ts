import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

let isConfigured = false;

export function getRCApiKey(): string {
  if (Platform.OS === 'web') {
    return '';
  }
  
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '',
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || '',
    default: '',
  });
}

export async function configureRevenueCat() {
  if (isConfigured) {
    console.log('[RevenueCat] Already configured');
    return;
  }

  if (Platform.OS === 'web') {
    console.log('[RevenueCat] Running on web - RevenueCat features disabled');
    isConfigured = true;
    return;
  }

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('RevenueCat configuration timeout')), 5000);
  });

  try {
    const apiKey = getRCApiKey();
    
    if (!apiKey) {
      console.warn('[RevenueCat] No API key found for platform:', Platform.OS);
      isConfigured = true;
      return;
    }

    console.log('[RevenueCat] Configuring SDK...');
    console.log('[RevenueCat] Platform:', Platform.OS);
    
    Purchases.setLogLevel(LOG_LEVEL.WARN);
    
    await Promise.race([
      Purchases.configure({ apiKey }),
      timeoutPromise
    ]);
    
    isConfigured = true;
    console.log('[RevenueCat] ✅ Configured successfully');
    
    const customerInfo = await Purchases.getCustomerInfo();
    console.log('[RevenueCat] Customer ID:', customerInfo.originalAppUserId);
  } catch (error: any) {
    console.error('[RevenueCat] ❌ Configuration error:', error?.message || error);
    console.log('[RevenueCat] App will continue without RevenueCat features');
    isConfigured = true;
  }
}

export async function getOfferings() {
  if (Platform.OS === 'web') {
    console.log('[RevenueCat] Web platform - returning mock offerings');
    return null;
  }
  
  try {
    const offerings = await Purchases.getOfferings();
    console.log('[RevenueCat] Available offerings:', Object.keys(offerings.all));
    console.log('[RevenueCat] Current offering:', offerings.current?.identifier || 'none');
    
    if (offerings.current) {
      console.log('[RevenueCat] Current offering packages:', offerings.current.availablePackages.length);
      offerings.current.availablePackages.forEach(pkg => {
        console.log(`  - ${pkg.identifier}: ${pkg.product.priceString} (${pkg.product.identifier})`);
      });
    }
    
    return offerings;
  } catch (error) {
    console.error('[RevenueCat] Error fetching offerings:', error);
    return null;
  }
}

export async function purchasePackage(packageToPurchase: any) {
  if (Platform.OS === 'web') {
    throw new Error('Purchases are not supported on web');
  }
  
  try {
    console.log('[RevenueCat] Purchasing package:', packageToPurchase.identifier);
    console.log('[RevenueCat] Product ID:', packageToPurchase.product.identifier);
    
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    
    console.log('[RevenueCat] ✅ Purchase successful');
    console.log('[RevenueCat] Active entitlements:', Object.keys(customerInfo.entitlements.active));
    
    return customerInfo;
  } catch (error: any) {
    if (error.userCancelled) {
      console.log('[RevenueCat] Purchase cancelled by user');
    } else {
      console.error('[RevenueCat] ❌ Purchase error:', error);
    }
    throw error;
  }
}

export async function restorePurchases() {
  if (Platform.OS === 'web') {
    throw new Error('Restore purchases is not supported on web');
  }
  
  try {
    console.log('[RevenueCat] Restoring purchases...');
    const customerInfo = await Purchases.restorePurchases();
    
    console.log('[RevenueCat] ✅ Restore complete');
    console.log('[RevenueCat] Active entitlements:', Object.keys(customerInfo.entitlements.active));
    
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] ❌ Restore error:', error);
    throw error;
  }
}

export async function getCustomerInfo() {
  if (Platform.OS === 'web') {
    return null;
  }
  
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    console.log('[RevenueCat] Customer ID:', customerInfo.originalAppUserId);
    console.log('[RevenueCat] Active entitlements:', Object.keys(customerInfo.entitlements.active));
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Error getting customer info:', error);
    return null;
  }
}

export async function purchaseStoreProduct(storeProduct: any) {
  if (Platform.OS === 'web') {
    throw new Error('Purchases are not supported on web');
  }
  
  try {
    console.log('[RevenueCat] Purchasing store product:', storeProduct.identifier);
    const { customerInfo } = await Purchases.purchaseStoreProduct(storeProduct);
    
    console.log('[RevenueCat] ✅ Purchase successful');
    console.log('[RevenueCat] Active entitlements:', Object.keys(customerInfo.entitlements.active));
    
    return customerInfo;
  } catch (error: any) {
    if (error.userCancelled) {
      console.log('[RevenueCat] Purchase cancelled by user');
    } else {
      console.error('[RevenueCat] ❌ Purchase error:', error);
    }
    throw error;
  }
}

export async function getProducts(offeringIdentifier: string) {
  try {
    const offerings = await Purchases.getOfferings();
    console.log('[RevenueCat] All offerings:', Object.keys(offerings.all));
    
    const offering = offerings.all[offeringIdentifier];
    if (offering) {
      console.log(`[RevenueCat] Found ${offeringIdentifier} with ${offering.availablePackages.length} packages`);
      return offering.availablePackages;
    }
    
    console.warn(`[RevenueCat] Offering '${offeringIdentifier}' not found`);
    return [];
  } catch (error) {
    console.error('[RevenueCat] Error getting products:', error);
    return [];
  }
}

export async function getGemsProducts() {
  return getProducts('gems');
}

export async function getSeedsProducts() {
  return getProducts('seeds');
}

export async function getBoostersProducts() {
  return getProducts('boosters');
}

export async function getEnergyProducts() {
  return getProducts('energy');
}

export async function getBooksProducts() {
  return getProducts('books');
}

export async function getBookProduct(bookId: string) {
  try {
    const booksProducts = await getBooksProducts();
    const bookProduct = booksProducts.find(
      (pkg: any) => pkg.product.identifier === `book_${bookId}` || pkg.identifier === bookId
    );
    
    if (!bookProduct) {
      console.warn('[RevenueCat] Book product not found:', bookId);
      return null;
    }
    
    return bookProduct;
  } catch (error) {
    console.error('[RevenueCat] Error getting book product:', error);
    return null;
  }
}

export async function getAllShopProducts() {
  try {
    const offerings = await Purchases.getOfferings();
    const products: any = {
      gems: [],
      seeds: [],
      boosters: [],
      energy: [],
      books: [],
    };
    
    if (offerings.all['gems']) products.gems = offerings.all['gems'].availablePackages;
    if (offerings.all['seeds']) products.seeds = offerings.all['seeds'].availablePackages;
    if (offerings.all['boosters']) products.boosters = offerings.all['boosters'].availablePackages;
    if (offerings.all['energy']) products.energy = offerings.all['energy'].availablePackages;
    if (offerings.all['books']) products.books = offerings.all['books'].availablePackages;
    
    console.log('[RevenueCat] Loaded shop products:', {
      gems: products.gems.length,
      seeds: products.seeds.length,
      boosters: products.boosters.length,
      energy: products.energy.length,
      books: products.books.length,
    });
    
    return products;
  } catch (error) {
    console.error('[RevenueCat] Error getting all shop products:', error);
    return { gems: [], seeds: [], boosters: [], energy: [], books: [] };
  }
}

export async function purchaseProduct(productIdentifier: string) {
  try {
    console.log('[RevenueCat] Purchasing product:', productIdentifier);
    const { customerInfo } = await Purchases.purchaseProduct(productIdentifier);
    console.log('[RevenueCat] Product purchase successful:', customerInfo);
    return customerInfo;
  } catch (error: any) {
    if (!error.userCancelled) {
      console.error('[RevenueCat] Product purchase error:', error);
    }
    throw error;
  }
}

export async function checkBookPurchase(bookId: string) {
  try {
    const customerInfo = await getCustomerInfo();
    if (!customerInfo) return false;
    
    const bookEntitlement = `book_${bookId}`;
    return !!(customerInfo.entitlements.active[bookEntitlement]);
  } catch (error) {
    console.error('[RevenueCat] Error checking book purchase:', error);
    return false;
  }
}

export async function checkAllPurchases() {
  try {
    const customerInfo = await getCustomerInfo();
    if (!customerInfo) return { premium: false, books: [], products: {} };
    
    const purchases = {
      premium: !!(customerInfo.entitlements.active['premium']),
      books: [] as string[],
      products: {} as Record<string, any>,
    };
    
    Object.keys(customerInfo.entitlements.active).forEach(key => {
      if (key.startsWith('book_')) {
        purchases.books.push(key.replace('book_', ''));
      } else if (key !== 'premium') {
        purchases.products[key] = customerInfo.entitlements.active[key];
      }
    });
    
    return purchases;
  } catch (error) {
    console.error('[RevenueCat] Error checking all purchases:', error);
    return { premium: false, books: [], products: {} };
  }
}
