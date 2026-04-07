# ClipShift - Mobile App Interface Design

## Overview

ClipShift is a marketplace platform for video professionals. Users can upload raw footage for editing, book videographers for shoots, or request combined shoot + edit services. The app emphasizes fast delivery (6-24 hours), AI-powered professional matching, and seamless payments.

---

## Design Principles

- **Mobile-First Portrait (9:16):** All screens optimized for one-handed usage on portrait orientation
- **Apple Human Interface Guidelines (HIG):** Clean, minimal, iOS-native feel with smooth interactions
- **Fast & Intuitive:** Minimal steps from upload → selection → payment → completion
- **Dark & Light Mode:** Full support for system theme preferences
- **Accessibility:** Clear hierarchy, readable text, sufficient touch targets

---

## Color Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| **Primary** | `#0a7ea4` | `#0a7ea4` | Buttons, links, accents |
| **Background** | `#ffffff` | `#151718` | Screen backgrounds |
| **Surface** | `#f5f5f5` | `#1e2022` | Cards, elevated surfaces |
| **Foreground** | `#11181C` | `#ECEDEE` | Primary text |
| **Muted** | `#687076` | `#9BA1A6` | Secondary text |
| **Border** | `#E5E7EB` | `#334155` | Dividers, borders |
| **Success** | `#22C55E` | `#4ADE80` | Confirmations |
| **Warning** | `#F59E0B` | `#FBBF24` | Warnings |
| **Error** | `#EF4444` | `#F87171` | Errors |

---

## Screen List & User Flows

### Authentication Screens

#### 1. **Welcome / Splash Screen**
- App logo and tagline
- "Sign In" and "Sign Up" buttons
- Google login option

#### 2. **Sign Up Screen**
- Email input
- Password input
- Confirm password
- Terms & conditions checkbox
- "Sign Up" button
- Link to "Already have an account? Sign In"

#### 3. **Role Selection Screen**
- Three large cards: Client, Editor, Videographer
- Description under each role
- Select role → proceed to profile creation

#### 4. **Profile Creation Screen**
- Avatar upload (camera or gallery)
- Full name input
- Bio/description (textarea)
- Location (for Videographers)
- Availability (for Editors/Videographers)
- "Complete Profile" button

#### 5. **Sign In Screen**
- Email input
- Password input
- "Forgot Password?" link
- "Sign In" button
- "Don't have an account? Sign Up" link
- Google login option

---

### Client Screens

#### 6. **Client Home Screen (Tab 1)**
- Welcome banner with user's name
- Quick action buttons:
  - "Upload Video for Editing"
  - "Book Videographer"
  - "Shoot + Edit Bundle"
- Recent orders list (scrollable)
  - Order ID, thumbnail, status, deadline
  - Tap to view details

#### 7. **Upload Video Screen**
- Video file picker (mp4, mov)
- Video preview with duration
- Add instructions (text input)
- Add voice note button
- Next button

#### 8. **Select Service Type Screen**
- Three options:
  1. Editing Only
  2. Videography Only
  3. Shoot + Edit Bundle
- Description and pricing estimate for each
- Select → proceed

#### 9. **Editing Style Selection Screen**
- Three style cards: Basic, Advanced, Premium
- AI suggestion badge (if applicable)
- Price breakdown for each style
- Delivery time options (6h, 12h, 24h)
- Live price estimation
- "Continue" button

#### 10. **Videographer Booking Screen**
- Location input
- Date/time picker
- Duration (in hours)
- Service type (shoot only, shoot + edit)
- Estimated price
- "Search Videographers" button

#### 11. **Professional Matching Screen**
- List of matched professionals (sorted by rating)
- Each card shows:
  - Avatar, name, rating (5-star)
  - Specialization, response time
  - Price per hour
  - "View Profile" / "Book" buttons
- Filters: Rating, Price, Speed

#### 12. **Professional Profile Screen**
- Avatar, name, rating, verified badge
- Bio and specializations
- Portfolio (image gallery)
- Reviews (scrollable list)
- Pricing breakdown
- Availability calendar
- "Book Now" button

#### 13. **Payment Screen**
- Order summary (service, price, deadline)
- Payment method selection:
  - UPI (Google Pay, PhonePe, Paytm)
  - Debit/Credit Card
  - Net Banking
  - Wallet
  - Cash on Delivery (if applicable)
- Promo code input
- Final price with breakdown
- "Pay Now" button

#### 14. **Order Tracking Screen**
- Order status timeline:
  - Pending → Assigned → In Progress → Completed
- Current status highlighted
- Assigned professional info
- Chat button to contact professional
- Estimated delivery time
- Download button (when ready)

#### 15. **Chat Screen (Client)**
- Conversation with assigned professional
- Message list (scrollable)
- Text input at bottom
- Attachment button (images, files)
- Voice note button
- Timestamp for each message
- Typing indicator

#### 16. **Video Preview & Download Screen**
- Full-screen video player
- Download button
- Request revision button
- Rate & review button

#### 17. **Rate & Review Screen**
- 5-star rating selector
- Written review textarea
- "Submit Review" button

#### 18. **Client Profile Screen (Tab 4)**
- User avatar and name
- Bio
- Total orders, total spent
- Average rating given
- Edit profile button
- Payment methods
- Settings button
- Logout button

---

### Editor Screens

#### 19. **Editor Home Screen (Tab 1)**
- Welcome banner
- Quick stats:
  - Pending jobs, completed jobs, earnings this month
- Available jobs list:
  - Job title, client name, video duration, deadline
  - "View Details" button
- Accepted jobs list (in progress)
  - Status, deadline, client name
  - "View Details" button

#### 20. **Job Details Screen (Editor)**
- Client name and rating
- Video duration and file size
- Instructions (text + voice note playback)
- Editing style required
- Delivery deadline
- Price offered
- "Accept Job" / "Reject Job" buttons

#### 21. **Editor Chat Screen**
- Same as Client chat but for editor-client communication
- File sharing for edited video upload

#### 22. **Upload Edited Video Screen**
- Video file picker
- Preview
- "Upload" button
- Confirmation message

#### 23. **Editor Earnings Dashboard (Tab 2)**
- Total earnings (this month, all time)
- Earnings chart (line graph, weekly/monthly)
- Recent transactions list:
  - Date, job, amount, status
- Payout history
- "Request Payout" button

#### 24. **Editor Profile Screen (Tab 4)**
- Avatar, name, bio
- Specializations (tags)
- Portfolio gallery (image/video thumbnails)
- Rating and review count
- Pricing settings:
  - Price per hour
  - Delivery speed options
  - Minimum project size
- Availability toggle
- Edit profile button
- Settings, logout

---

### Videographer Screens

#### 25. **Videographer Home Screen (Tab 1)**
- Welcome banner
- Quick stats: Pending bookings, completed shoots, earnings
- Available bookings list:
  - Client name, location, date/time, duration
  - "View Details" button
- Accepted bookings (in progress)
  - Status, date, client name
  - "View Details" button

#### 26. **Booking Details Screen (Videographer)**
- Client name and rating
- Location and date/time
- Duration and service type
- Special instructions
- Price offered
- "Accept Booking" / "Decline Booking" buttons

#### 27. **Videographer Chat Screen**
- Same as client/editor chat
- File sharing for raw footage upload

#### 28. **Upload Raw Footage Screen**
- Video file picker (multiple files)
- Preview thumbnails
- "Upload" button

#### 29. **Videographer Earnings Dashboard (Tab 2)**
- Total earnings (this month, all time)
- Earnings chart
- Recent transactions
- Payout history
- "Request Payout" button

#### 30. **Calendar Screen (Tab 3)**
- Month/week view of bookings
- Tap date to see details
- Add availability slots
- Block dates if unavailable

#### 31. **Videographer Profile Screen (Tab 4)**
- Avatar, name, bio, location
- Specializations
- Portfolio gallery
- Rating and reviews
- Availability status toggle
- Service area (map or radius)
- Edit profile, settings, logout

---

### Admin Screens

#### 32. **Admin Dashboard (Tab 1)**
- Key metrics:
  - Total users, total orders, total revenue
  - Orders this month, active disputes
- Recent orders list
- Pending professional approvals
- Recent transactions

#### 33. **User Management Screen (Tab 2)**
- List of all users (searchable, filterable by role)
- Each user row: name, role, email, status, actions
- "View Profile" / "Approve" / "Suspend" / "Delete" buttons
- User detail view with full profile

#### 34. **Order Management Screen**
- List of all orders (filterable by status)
- Order details: ID, client, professional, amount, status
- "View Details" / "Resolve Dispute" buttons

#### 35. **Payment Monitoring Screen**
- List of all transactions
- Filters: status, date range, payment method
- Transaction details: ID, user, amount, method, status
- "Refund" button (if applicable)

#### 36. **Dispute Resolution Screen**
- List of open disputes
- Dispute details: parties involved, issue description, evidence
- "Approve Refund" / "Reject" / "Custom Resolution" buttons
- Chat with both parties

#### 37. **Analytics Dashboard**
- Charts:
  - Revenue over time
  - User growth
  - Order completion rate
  - Average rating by professional
- Filters: date range, user role, service type

#### 38. **Admin Settings Screen**
- Commission percentage settings
- Delivery time options
- Pricing tiers
- Payment method settings
- Notification templates
- Logout

---

## Key User Flows

### Flow 1: Client Uploads Video for Editing (Happy Path)
1. Client Home → "Upload Video for Editing"
2. Upload Video Screen (select file, add instructions)
3. Select Service Type → "Editing Only"
4. Editing Style Selection (choose style, delivery time)
5. Professional Matching (view matched editors)
6. Professional Profile (view details, ratings)
7. Payment Screen (select payment method)
8. Order Tracking (wait for assignment)
9. Chat with Editor (communicate)
10. Video Preview & Download (review final video)
11. Rate & Review (submit feedback)

### Flow 2: Client Books Videographer
1. Client Home → "Book Videographer"
2. Videographer Booking Screen (enter location, date, duration)
3. Professional Matching (view videographers)
4. Professional Profile (view details)
5. Payment Screen
6. Order Tracking (wait for shoot date)
7. Chat with Videographer
8. Receive raw footage / edited video
9. Rate & Review

### Flow 3: Editor Accepts & Completes Job
1. Editor Home (view available jobs)
2. Job Details Screen (review requirements)
3. Accept Job
4. Chat with Client (ask clarifications if needed)
5. Upload Edited Video
6. Notification to Client (video ready)
7. Earnings Dashboard (track payment)

### Flow 4: Videographer Accepts & Completes Booking
1. Videographer Home (view available bookings)
2. Booking Details (review requirements)
3. Accept Booking
4. Calendar (mark shoot date)
5. Chat with Client (confirm details)
6. Upload Raw Footage
7. Earnings Dashboard (track payment)

### Flow 5: Admin Reviews & Resolves Dispute
1. Admin Dashboard (view pending disputes)
2. Dispute Resolution Screen (review case)
3. Chat with both parties
4. Approve Refund / Custom Resolution
5. Notify both parties

---

## Navigation Structure

### Tab Bar (Bottom)
- **Tab 1: Home** - Main feed/dashboard (changes per role)
- **Tab 2: Activity/Earnings** - Orders, jobs, or earnings (role-specific)
- **Tab 3: Calendar/Messages** - Calendar or chat list (role-specific)
- **Tab 4: Profile** - User profile and settings (same for all)

### Modal Screens (Full-Screen or Half-Sheet)
- Chat (can be full-screen or modal)
- Payment (full-screen modal)
- Professional Profile (full-screen modal or push)
- Settings (full-screen modal)

---

## Interaction Patterns

### Press Feedback
- **Primary buttons:** Scale 0.97 + haptic feedback
- **List items / cards:** Opacity 0.7 on press
- **Icons / minor actions:** Opacity 0.6 on press

### Loading States
- Skeleton screens for lists
- Spinner overlay for critical actions
- Disable buttons during submission

### Empty States
- Friendly message when no orders/jobs/messages
- Call-to-action button to create first item

### Error Handling
- Toast notifications for quick feedback
- Error screens with retry button for critical failures
- Validation messages on form fields

---

## Accessibility

- Minimum touch target: 44×44 pt
- Color contrast ratio: 4.5:1 for text
- Font sizes: 16pt minimum for body text
- VoiceOver support (iOS) and TalkBack support (Android)
- Clear labels for all interactive elements

---

## Responsive Considerations

- **Portrait (9:16):** Primary layout
- **Landscape (16:9):** Supported but not optimized (can use horizontal scrolling)
- **Tablet (iPad):** Split-view layout for chat and details (future enhancement)

---

## Dark Mode

- All colors automatically adapt via CSS variables
- No `dark:` prefix needed in Tailwind classes
- ThemeProvider handles switching
- Test all screens in both light and dark modes

---

## Next Steps

1. Create database schema (Users, Orders, Payments, Reviews, Chat, etc.)
2. Build backend APIs for authentication, orders, payments, and chat
3. Implement frontend screens starting with auth flow
4. Integrate AI features (matching, pricing, style detection)
5. Add real-time chat functionality
6. Integrate payment gateway (Razorpay/Stripe)
7. Build admin panel
8. Testing and deployment
