# Real-Time Ranking System with Progress Bars

## Overview
Implemented a comprehensive real-time ranking system that automatically upgrades user ranks based on problems solved. The system combines both duel performance and problem-solving activity to calculate ratings, with visual progress bars showing advancement to next rank.

## Features Implemented

### 1. Dynamic Rating Calculation
- **Base Rating**: 1000 (starting point)
- **Easy Problems**: +5 points each
- **Medium Problems**: +10 points each  
- **Hard Problems**: +20 points each
- **Duel Wins**: +10 points
- **Duel Losses**: -5 points

### 2. Combined Rating System
The system now uses the HIGHER of:
- Duel rating (from wins/losses)
- Problems rating (from solved problems)

This means solving problems OR winning duels both contribute to rank upgrades!

### 3. Expanded Rank Tiers (19 Tiers Total)
```
Unranked      - 0+     (—)

Bronze Tier:
Bronze III    - 900+   (🥉)
Bronze II     - 950+   (🥉)
Bronze I      - 1000+  (🥉)

Silver Tier:
Silver III    - 1050+  (🥈)
Silver II     - 1100+  (🥈)
Silver I      - 1150+  (🥈)

Gold Tier:
Gold III      - 1200+  (🏅)
Gold II       - 1300+  (🏅)
Gold I        - 1400+  (🏅)

Platinum Tier:
Platinum III  - 1500+  (💎)
Platinum II   - 1600+  (💎)
Platinum I    - 1700+  (💎)

Diamond Tier:
Diamond III   - 1800+  (💠)
Diamond II    - 1900+  (💠)
Diamond I     - 2000+  (💠)

Master Tier:
Master III    - 2100+  (👑)
Master II     - 2200+  (👑)
Master I      - 2300+  (👑)
```

### 4. Progress Bar to Next Rank

#### Profile Page
- Shows current rank badge with large icon and tier name
- **Visual progress bar** showing advancement to next tier
- Displays "X pts needed" to reach next rank
- Shows percentage progress (0-100%)
- Displays current tier → next tier with arrow
- Shows "+X" indicator when rating increases
- Real-time subscription to database changes
- Automatically recalculates rating when problems are solved

#### Rank Ladder View
- Complete list of all 19 rank tiers
- Shows which tiers you've unlocked (checkmark)
- Highlights your current tier
- Displays rating requirement for each tier
- Scrollable list for easy viewing

### 5. Leaderboard Enhancements

#### Main Table
- Ranks users by combined rating (not just problems solved)
- Shows rank tier icon and name for each user
- Calculates rating based on difficulty breakdown
- Real-time sorting by rating
- Highlights current user
- Responsive 2-column layout (table + rank info)

#### Rank Tiers Sidebar
- Shows all 19 tiers with icons and colors
- Displays rating requirements
- Compact, scrollable design
- Helpful tip about climbing ranks

### 6. Duels Lobby
- Shows combined rating (duels + problems)
- Displays current rank tier with icon
- Shows win/loss record and streak

## Files Modified

### Core Rating System
- `src/features/dsa/duels/duelRating.ts`
  - Expanded rank tiers from 13 to 19 (added III, II, I subdivisions)
  - Added `getNextRankTier()` function
  - Added `getRankProgress()` function (returns progress %, points needed, etc.)
  - Added `getAllRankTiers()` function for displaying rank ladder
  - Added `calculateProblemsRating()` function
  - Added `updateRatingFromProblems()` function
  - Added `getCombinedRating()` function
  - Added `getProblemPoints()` helper

### Profile Page
- `src/pages/dsa/DsaProfile.tsx`
  - Imports `getRankProgress`, `getAllRankTiers`
  - Added progress bar showing advancement to next rank
  - Shows "X pts needed" and percentage progress
  - Displays current → next tier with arrow icon
  - Added complete rank ladder showing all 19 tiers
  - Highlights current tier and shows unlocked tiers
  - Shows "+X" indicator for rating increases

### Leaderboard
- `src/pages/dsa/DsaLeaderboard.tsx`
  - Complete rewrite with 2-column layout
  - Main table shows top users with tier badges
  - Sidebar shows all 19 rank tiers with requirements
  - Sorts by rating (descending)
  - Shows tier column with icon and colored name
  - Responsive grid layout (stacks on mobile)

### Duels Lobby
- `src/pages/dsa/DsaDuelsLobby.tsx`
  - Changed from `getDuelRating()` to `getCombinedRating()`
  - Shows combined rating that includes problem-solving

## How It Works

### Progress Bar Calculation
```typescript
// Example: User at 1075 rating (Silver III)
Current Tier: Silver III (1050)
Next Tier: Silver II (1100)
Tier Range: 1100 - 1050 = 50 points
Points in Current Tier: 1075 - 1050 = 25 points
Progress: (25 / 50) * 100 = 50%
Points Needed: 1100 - 1075 = 25 points
```

### Visual Progress Bar
```
Silver III ──────────────────────────────────> Silver II
           [████████████████░░░░░░░░░░░░░░░░]
           50% complete • 25 pts needed
```

### Rating Calculation Example
```
User solves: 2 Easy, 3 Medium, 1 Hard
Rating = 1000 + (2×5) + (3×10) + (1×20)
Rating = 1000 + 10 + 30 + 20 = 1060
Rank Tier = Silver III (1050+)
Progress to Silver II = 40/50 = 80%
```

### Rank Progression on Defeat/Leave
- When you lose a duel: -5 points
- Progress bar moves backward
- Can drop to lower tier if rating falls below threshold
- Visual feedback shows rating decrease

## Benefits

✅ **Visual Progress**: See exactly how close you are to next rank
✅ **Motivating**: Clear goal with percentage and points needed
✅ **Real-time**: Updates immediately when problems are solved
✅ **Fair**: Both duels and practice contribute to rank
✅ **Comprehensive**: 19 tiers provide long-term progression
✅ **Transparent**: Shows exactly how many points each difficulty gives
✅ **Competitive**: Leaderboard ranks by actual skill (rating)
✅ **Informative**: Rank ladder shows all tiers and requirements

## Testing

To test the system:
1. Log in to your account
2. Go to Profile - see your current rank and progress bar
3. Go to Problems and solve a problem
4. Return to Profile - rating increases, progress bar advances
5. Check Leaderboard - your rank updates, see rank tiers sidebar
6. Solve more problems to see rank tier upgrades
7. Lose a duel to see rating decrease and progress bar move backward

Example progression:
- Start: 1000 (Bronze I) → 0% to Silver III
- Solve 5 Easy: 1025 (Bronze I) → 50% to Silver III
- Solve 3 Medium: 1055 (Silver III) ⬆️ → 10% to Silver II
- Solve 2 Hard: 1095 (Silver II) ⬆️ → 90% to Silver I
- Solve 10 more Medium: 1195 (Gold III) ⬆️ → 0% to Gold II

## UI Components

### Progress Bar Component
- Smooth gradient fill (primary color)
- Animated width transition (500ms)
- Shows percentage visually
- Text labels above and below
- Arrow icon between current and next tier

### Rank Ladder Component
- Scrollable list of all tiers
- Current tier highlighted with primary background
- Unlocked tiers show green checkmark
- Locked tiers show muted colors
- Compact design fits in sidebar

### Leaderboard Layout
- 2-column grid on desktop (table + sidebar)
- Stacks to 1 column on mobile
- Table shows top 20 users per page
- Sidebar shows all 19 tiers
- Pagination for large leaderboards

## Future Enhancements

Possible additions:
- Rank up animations/confetti
- Push notifications for rank changes
- Rank history graph over time
- Seasonal rankings with resets
- Rank decay for inactive users
- Bonus points for daily streaks
- Achievement badges for rank milestones
- Rank-based rewards/unlocks
