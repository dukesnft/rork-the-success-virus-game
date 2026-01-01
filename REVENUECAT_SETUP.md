# RevenueCat Configuration Guide

This document contains all the product IDs, entitlements, and offerings that need to be configured in your RevenueCat dashboard.

## 🔑 Entitlements

Configure these entitlements in RevenueCat Dashboard → Entitlements:

1. **premium** - Premium membership access
2. **book_success-virus** - The Success Virus book
3. **book_manifesting-your-magic** - Manifesting Your Magic book
4. **book_everyday-spirituality** - Everyday Spirituality book
5. **book_crystals-and-intentions** - Crystals and Intentions book

## 📦 Products to Create in App Store Connect / Google Play Console

### Premium Subscriptions
- `premium_month` - 1 Month Premium ($9.99/month)
- `premium_year` - 1 Year Premium ($59.99/year)

### Books (Non-Consumables)
- `book_success-virus` - The Success Virus ($33.30)
- `book_manifesting-your-magic` - Manifesting Your Magic ($22.20)
- `book_everyday-spirituality` - Everyday Spirituality ($22.20)
- `book_crystals-and-intentions` - Crystals and Intentions ($22.20)

### Gems (Consumables)
- `gems_small` - 100 Gems ($0.99)
- `gems_medium` - 500 Gems ($3.99)
- `gems_large` - 1,200 Gems ($7.99)
- `gems_huge` - 2,500 Gems ($14.99)
- `gems_mega` - 6,000 Gems ($29.99)
- `gems_ultra` - 15,000 Gems ($69.99)
- `gems_ultimate` - 40,000 Gems ($149.99)
- `gems_legendary` - 100,000 Gems ($299.99)

### Seeds (Consumables)
- `seeds_common` - 10 Common Seeds ($2.99)
- `seeds_rare` - 5 Rare Seeds ($4.99)
- `seeds_epic` - 3 Epic Seeds ($9.99)
- `seeds_legendary` - 1 Legendary Seed ($19.99)
- `seeds_bundle` - Mixed Seed Bundle ($12.99)

### Boosters (Consumables)
- `booster_small` - 10 Growth Boosters ($2.99)
- `booster_medium` - 30 Growth Boosters ($7.99)
- `booster_large` - 100 Growth Boosters ($19.99)

### Energy (Consumables)
- `energy_pack` - 10 Energy Refills ($4.99)

### Special Items (Non-Consumables)
- `auto_nurture` - Auto-Nurture Forever ($49.99)

## 🎁 Offerings Configuration

Create these offerings in RevenueCat Dashboard → Offerings:

### 1. **premium** (Current Offering)
- Attach: `premium_month`, `premium_year`
- Entitlement: `premium`

### 2. **books**
- Attach: All book products
- Entitlements: Map each to corresponding book entitlement

### 3. **gems**
- Attach: All gem products
- No entitlements needed (consumables)

### 4. **seeds**
- Attach: All seed products
- No entitlements needed (consumables)

### 5. **boosters**
- Attach: All booster products
- No entitlements needed (consumables)

### 6. **energy**
- Attach: All energy products
- No entitlements needed (consumables)

## 📱 Product Type Configuration

### iOS (App Store Connect)

**Subscriptions:**
- premium_month → Auto-renewable subscription
- premium_year → Auto-renewable subscription

**Non-Consumables:**
- All book_* products
- auto_nurture

**Consumables:**
- All gems_* products
- All seeds_* products
- All booster_* products
- All energy_* products

### Android (Google Play Console)

**Subscriptions:**
- premium_month → Subscription
- premium_year → Subscription

**One-Time Products:**
- All book_* products → Non-consumable
- auto_nurture → Non-consumable
- All gems_* products → Consumable
- All seeds_* products → Consumable
- All booster_* products → Consumable
- All energy_* products → Consumable

## 🔗 Entitlement Mapping

In RevenueCat Dashboard, map products to entitlements:

| Product ID | Entitlement |
|------------|-------------|
| premium_month | premium |
| premium_year | premium |
| book_success-virus | book_success-virus |
| book_manifesting-your-magic | book_manifesting-your-magic |
| book_everyday-spirituality | book_everyday-spirituality |
| book_crystals-and-intentions | book_crystals-and-intentions |

## ✅ Verification Checklist

- [ ] All entitlements created in RevenueCat
- [ ] All products created in App Store Connect (iOS)
- [ ] All products created in Google Play Console (Android)
- [ ] Products attached to correct offerings
- [ ] Entitlements properly mapped to products
- [ ] Premium offering set as "Current"
- [ ] Test purchases work on both platforms
- [ ] Restore purchases functionality tested
- [ ] Book unlocking tested
- [ ] Consumable products properly consume

## 🔍 Testing Commands

Use these to verify setup:

```javascript
// Check all offerings
const offerings = await getOfferings();
console.log('Available offerings:', Object.keys(offerings.all));

// Check specific offering
const booksOffering = offerings.all['books'];
console.log('Books products:', booksOffering?.availablePackages.length);

// Verify entitlements after purchase
const customerInfo = await getCustomerInfo();
console.log('Active entitlements:', Object.keys(customerInfo.entitlements.active));
```

## 📊 Expected Product Counts

When properly configured, you should see:
- **Premium Offering**: 2 products
- **Books Offering**: 4 products
- **Gems Offering**: 8 products
- **Seeds Offering**: 5 products
- **Boosters Offering**: 3 products
- **Energy Offering**: 1 product

**Total: 23 unique products**

## 🚨 Common Issues

1. **"Invalid API key"** - Use Web Billing API key for web builds
2. **"Product not found"** - Ensure product ID matches exactly (case-sensitive)
3. **"Entitlement not active"** - Check entitlement mapping in RevenueCat
4. **Books not restoring** - Verify book entitlements start with "book_" prefix
5. **Consumables not working** - Ensure marked as consumable in store

## 📝 Notes

- Premium members get 25% discount on all purchases
- Book IDs must match the ID in `constants/books.ts`
- All consumables should NOT have entitlements
- Auto-nurture is a one-time purchase (non-consumable)
- Book entitlements must follow pattern: `book_{bookId}`
