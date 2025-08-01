# TODO - SocialSpark Development Tasks

## UI/UX Issues (High Priority)
- [ ] **CheckoutScreen scrolling issue** - User cannot scroll down to see "Continue to Payment" button
  - Tried multiple approaches: flexGrow, extra padding, simplified structure
  - Need to investigate ScrollView constraints or parent container issues
  - Priority: High - blocks user checkout flow

## Pending Development Tasks
- [ ] **Authentication Flow** - Implement user authentication (Onboarding, Role Selection, Login, Signup)
- [ ] **User Dashboard** - Build out User Dashboard (Home, Explore, Cart, Orders, Profile)
- [ ] **Seller Dashboard** - Implement Seller Dashboard (Products, Posts, Boost, Analytics, Integration)
- [ ] **Supabase Integration** - Connect app to Supabase backend
- [ ] **AI Feed System** - Develop AI recommendation function in Supabase

## Recently Deleted Files (Need Recreation)
- [ ] `src/components/Feed/Feed.tsx`
- [ ] `src/components/Feed/PostCard.tsx`
- [ ] `src/components/Feed/ProductCard.tsx`
- [ ] `src/components/Feed/ForYouFeed.tsx`
- [ ] `src/components/Feed/FollowingFeed.tsx`
- [ ] `database/schema.js`
- [ ] `supabase/functions/generate-post-embedding/index.ts`

## Next Priority
1. Fix checkout scrolling issue
2. Recreate deleted Feed components
3. Complete AI recommendation system
4. Implement authentication flow 