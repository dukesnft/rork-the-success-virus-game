# RevenueCat Integration Guide for The Success Virus

This comprehensive guide will help you configure RevenueCat for your manifestation app with all products, subscriptions, and in-app purchases.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Variables](#environment-variables)
3. [Product Configuration](#product-configuration)
4. [Entitlements Setup](#entitlements-setup)
5. [Offerings Configuration](#offerings-configuration)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Prerequisites
- RevenueCat account (free tier available)
- iOS and/or Android app configured in RevenueCat
- Products created in App Store Connect and/or Google Play Console

### Installation

The SDK is already installed in your project:
```bash
npx expo install react-native-purchases
```

### Environment Variables Setup

Your API keys are already configured. The app uses:
- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` - iOS App-Specific Key
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` - Android App-Specific Key

⚠️ **Important**: Do NOT use the "Web Billing API Key" - it's only for web implementations.

## 🔐 Environment Variables

The app automatically selects the correct API key based on platform:
- **iOS**: Uses iOS App-Specific Key
- **Android**: Uses Android App-Specific Key  
- **Web**: RevenueCat features are disabled (shows helpful message to users)

## 🎯 Product Configuration

### Step 1: Create Products in Store

Before configuring RevenueCat, create all products in your app stores:

#### **App Store Connect (iOS)**
1. Go to App Store Connect → Your App → Features → In-App Purchases
2. Create products with the exact IDs listed below
3. Set pricing and descriptions

#### **Google Play Console (Android)**
1. Go to Google Play Console → Your App → Monetize → Products
2. Create products with matching IDs
3. Activate products

### Step 2: Add Products to RevenueCat

1. Log into [RevenueCat Dashboard](https://app.revenuecat.com/)
2. Select your app (iOS/Android)
3. Go to **Products** tab
4. Click **+ New** for each product
5. Enter the **exact product identifier** from App Store Connect/Google Play

## 🔑 Complete Product List

### Premium Subscriptions
Create these as **subscriptions** in both stores:

| Product ID | Type | Duration | Suggested Price | Description |
|------------|------|----------|-----------------|-------------|
| `premium_monthly` | Subscription | 1 month | $9.99/month | Monthly Premium Access |
| `premium_yearly` | Subscription | 1 year | $59.99/year | Yearly Premium Access (Save 50%) |

### Gems (Consumables)
Create these as **consumable** products:

| Product ID | Quantity | Suggested Price |
|------------|----------|----------------|
| `gems_100` | 100 Gems | $0.99 |
| `gems_500` | 500 Gems | $3.99 |
| `gems_1200` | 1,200 Gems | $7.99 |
| `gems_2500` | 2,500 Gems | $14.99 |
| `gems_6000` | 6,000 Gems | $29.99 |

### Seeds (Consumables)
Create these as **consumable** products:

| Product ID | Quantity | Suggested Price |
|------------|----------|----------------|
| `seeds_pack_10` | 10 Seeds | $2.99 |
| `seeds_pack_25` | 25 Seeds | $5.99 |
| `seeds_pack_50` | 50 Seeds | $9.99 |

### Energy Refills (Consumables)
Create these as **consumable** products:

| Product ID | Quantity | Suggested Price |
|------------|----------|----------------|
| `energy_5` | 5 Energy | $0.99 |
| `energy_10` | 10 Energy | $1.99 |
| `energy_25` | 25 Energy | $3.99 |
| `energy_50` | 50 Energy | $6.99 |

### Boosters (Consumables)
Create these as **consumable** products:

| Product ID | Quantity | Suggested Price |
|------------|----------|----------------|
| `booster_3` | 3 Boosters | $2.99 |
| `booster_10` | 10 Boosters | $7.99 |
| `booster_25` | 25 Boosters | $14.99 |

### Books (Non-Consumables)
Create these as **non-consumable** products:

| Product ID | Book Title | Suggested Price |
|------------|------------|----------------|
| `book_success-virus` | The Success Virus | $33.30 |
| `book_manifesting-your-magic` | Manifesting Your Magic | $22.20 |
| `book_everyday-spirituality` | Everyday Spirituality | $22.20 |
| `book_crystals-and-intentions` | Crystals and Intentions | $22.20 |

### Special Items (Non-Consumables)

| Product ID | Description | Suggested Price |
|------------|-------------|----------------|
| `auto_nurture` | Auto-Nurture Forever | $49.99 |

## 🎁 Entitlements Setup

Entitlements represent what users get access to after purchasing.

### Creating Entitlements

1. Go to RevenueCat Dashboard → **Entitlements**
2. Click **+ New Entitlement** for each one below:

| Entitlement ID | Description | Type |
|----------------|-------------|------|
| `premium` | Premium membership with all benefits | Subscription |
| `book_success-virus` | Access to The Success Virus book | One-Time |
| `book_manifesting-your-magic` | Access to Manifesting Your Magic book | One-Time |
| `book_everyday-spirituality` | Access to Everyday Spirituality book | One-Time |
| `book_crystals-and-intentions` | Access to Crystals and Intentions book | One-Time |

### Linking Products to Entitlements

After creating products and entitlements:

1. Go to **Products** tab
2. Click on each product
3. Under **Entitlements**, attach the corresponding entitlement:
   - `premium_monthly` → `premium` entitlement
   - `premium_yearly` → `premium` entitlement
   - `book_success-virus` → `book_success-virus` entitlement
   - `book_manifesting-your-magic` → `book_manifesting-your-magic` entitlement
   - `book_everyday-spirituality` → `book_everyday-spirituality` entitlement
   - `book_crystals-and-intentions` → `book_crystals-and-intentions` entitlement

⚠️ **Note**: Consumable products (gems, seeds, energy, boosters) do NOT need entitlements.

## 🎁 Offerings Configuration

Offerings are how you organize products for display in your app.

### Creating Offerings

1. Go to RevenueCat Dashboard → **Offerings**
2. Create the following offerings:

#### 1. **premium** (Make this "Current" ✅)
This is the main subscription offering shown in the Premium screen.

**Packages to add:**
- `$rc_monthly` → `premium_monthly` product
- `$rc_annual` → `premium_yearly` product

**How to create:**
1. Click **+ New Offering**
2. Identifier: `premium`
3. Click **Add Package**
4. Package Type: **Monthly** → Select `premium_monthly`
5. Click **Add Package** again
6. Package Type: **Annual** → Select `premium_yearly`
7. Click **Set as Current Offering** ⭐

#### 2. **gems**
**Products to add:**
- `gems_100`
- `gems_500` 
- `gems_1200`
- `gems_2500`
- `gems_6000`

#### 3. **seeds**
**Products to add:**
- `seeds_pack_10`
- `seeds_pack_25`
- `seeds_pack_50`

#### 4. **energy**
**Products to add:**
- `energy_5`
- `energy_10`
- `energy_25`
- `energy_50`

#### 5. **boosters**
**Products to add:**
- `booster_3`
- `booster_10`
- `booster_25`

#### 6. **books**
**Products to add:**
- `book_success-virus`
- `book_manifesting-your-magic`
- `book_everyday-spirituality`
- `book_crystals-and-intentions`

### Package Types

For the **premium** offering, use these standard package types:
- `$rc_monthly` - Monthly subscription (auto-detected)
- `$rc_annual` - Annual subscription (auto-detected)

For other offerings (consumables), use custom package identifiers matching the product ID.

## 🧪 Testing

### 1. Test in Development

The app includes comprehensive logging to help you debug:

```javascript
// Check console for these logs:
[RevenueCat] Configuring SDK...
[RevenueCat] Platform: ios
[RevenueCat] ✅ Configured successfully
[RevenueCat] Customer ID: $RCAnonymousID:...
[RevenueCat] Available offerings: ['premium', 'gems', 'seeds', 'energy', 'boosters', 'books']
[RevenueCat] Current offering: premium
[RevenueCat] Current offering packages: 2
  - $rc_monthly: $9.99/month (premium_monthly)
  - $rc_annual: $59.99/year (premium_yearly)
```

### 2. Test on Device

#### iOS Testing
1. Build the app with EAS or Expo Go
2. Go to Premium screen
3. You should see subscription options
4. Use StoreKit sandbox account for testing

#### Android Testing
1. Build the app with EAS or Expo Go  
2. Add test account in Google Play Console
3. Test purchases with test account

### 3. Verify Configuration

Run this command in your app to check offerings:

```javascript
import { getOfferings } from '@/utils/revenuecat';

const offerings = await getOfferings();
console.log('Offerings:', offerings);
```

Expected output:
```javascript
{
  current: {
    identifier: 'premium',
    availablePackages: [
      { identifier: '$rc_monthly', product: {...} },
      { identifier: '$rc_annual', product: {...} }
    ]
  },
  all: {
    premium: {...},
    gems: {...},
    seeds: {...},
    energy: {...},
    boosters: {...},
    books: {...}
  }
}
```

## 🔧 Troubleshooting

### Error: "Invalid API key. Use your Web Billing API key"

**Cause**: Using the wrong API key type

**Solution**:
1. ✅ Use **App-Specific API Keys** (iOS/Android)
2. ❌ DO NOT use "Web Billing API Key"
3. Check your environment variables:
   ```bash
   EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_xxx
   EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_xxx
   ```

### Error: "No products available"

**Possible causes:**
1. Products not created in App Store Connect/Google Play
2. Products not added to RevenueCat
3. Offering not set as "Current"
4. Wrong product identifiers

**Solution**:
1. Verify products exist in store console
2. Add products to RevenueCat dashboard
3. Check product IDs match exactly
4. Set "premium" as current offering
5. Wait 5-10 minutes for changes to propagate

### Error: "Product not found: book_xxx"

**Solution**:
1. Ensure book products are in the "books" offering
2. Verify product IDs match the book IDs in `constants/books.ts`
3. Book product IDs must follow pattern: `book_{bookId}`

### Premium subscription not working

**Checklist**:
1. ✅ `premium_monthly` and `premium_yearly` created in store
2. ✅ Both products added to RevenueCat
3. ✅ Both products attached to "premium" entitlement
4. ✅ Products added to "premium" offering
5. ✅ "premium" offering set as current
6. ✅ Package types set to `$rc_monthly` and `$rc_annual`

### Restore purchases not working

**Solution**:
1. Ensure the same RevenueCat anonymous ID is used
2. For signed-in users, set a user ID:
   ```javascript
   await Purchases.logIn(userId);
   ```
3. Test with a real purchase (not sandbox purchases for Android)

### Web platform shows error

**This is expected!** RevenueCat only works on iOS and Android. The app shows a friendly message to web users directing them to download the mobile app.

## 📊 Quick Reference

### Expected Product Counts

| Offering | Product Count | Type |
|----------|--------------|------|
| Premium | 2 | Subscriptions |
| Gems | 5 | Consumables |
| Seeds | 3 | Consumables |
| Energy | 4 | Consumables |
| Boosters | 3 | Consumables |
| Books | 4 | Non-Consumables |
| Special | 1 | Non-Consumable |
| **Total** | **22** | **Mixed** |

### App Integration Points

| Screen | Offering Used | Function |
|--------|--------------|----------|
| `app/premium.tsx` | `premium` | Subscribe to premium |
| `app/shop.tsx` | `gems`, `seeds`, `energy`, `boosters` | Purchase consumables |
| `app/(tabs)/books.tsx` | `books` | Unlock books |

### Entitlement Checks

```javascript
// Check premium status
const customerInfo = await getCustomerInfo();
const isPremium = customerInfo.entitlements.active['premium'];

// Check book purchase
const hasBook = customerInfo.entitlements.active['book_success-virus'];
```

## ✅ Configuration Checklist

Use this to verify your setup:

### Store Setup (App Store Connect / Google Play)
- [ ] All 22 products created with correct IDs
- [ ] Subscriptions configured as auto-renewable
- [ ] Consumables marked as consumable
- [ ] Non-consumables marked as non-consumable
- [ ] Pricing set for all products
- [ ] Products activated/approved

### RevenueCat Dashboard
- [ ] iOS app configured with app-specific API key
- [ ] Android app configured with app-specific API key
- [ ] All 22 products added to RevenueCat
- [ ] 5 entitlements created (premium + 4 books)
- [ ] Products linked to correct entitlements
- [ ] 6 offerings created (premium, gems, seeds, energy, boosters, books)
- [ ] Products added to correct offerings
- [ ] "premium" offering set as current ⭐

### Environment Variables
- [ ] `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` set
- [ ] `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` set
- [ ] Keys are app-specific (not web billing keys)

### Testing
- [ ] Premium subscription purchase works
- [ ] Premium restore works
- [ ] Book purchases work
- [ ] Gems/Seeds/Energy/Boosters purchases work
- [ ] Entitlements properly unlock features
- [ ] Console logs show successful initialization

## 📚 Additional Resources

- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [React Native SDK Reference](https://docs.revenuecat.com/docs/reactnative)
- [Testing Guide](https://docs.revenuecat.com/docs/testing)
- [Migration Guide](https://docs.revenuecat.com/docs/migrating-to-revenuecat)

## 🆘 Support

If you encounter issues:

1. Check the console logs for detailed error messages
2. Verify all products are configured correctly
3. Ensure API keys are correct
4. Review this guide's troubleshooting section
5. Check [RevenueCat Community](https://community.revenuecat.com/)

## 📝 Important Notes

- Premium members get 25% discount on all purchases
- Book IDs must match the ID in `constants/books.ts`
- All consumables should NOT have entitlements
- Auto-nurture is a one-time purchase (non-consumable)
- Book entitlements must follow pattern: `book_{bookId}`
- The app automatically handles web users with friendly messages

---

**Last Updated**: January 2026  
**SDK Version**: react-native-purchases ^9.6.12  
**Expo SDK**: ~54.0.0
