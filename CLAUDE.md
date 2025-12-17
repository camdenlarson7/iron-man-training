# Ironman Training Tracker

## 📋 Project Overview
A responsive web app to track a 49-week Ironman training plan with automatic Strava integration. Shows current week's planned vs actual training hours across swim, bike, and run disciplines.

## 🏗️ Existing Setup
- **Next.js 14+** with App Router and TypeScript
- **Tailwind CSS** for styling  
- **shadcn/ui** component library partially installed
- **Strava API integration** already set up in `src/strava.ts`

## 📦 Available Components
**Already installed shadcn/ui components:**
- Button, Card, Chart, Drawer, Pagination, Separator, Table

**Install if needed:**
```bash
npx shadcn@latest add progress
npx shadcn@latest add badge  
npx shadcn@latest add skeleton
```

## 🎯 Core Features
1. **Week View** - Display current training week (Monday-Sunday)
2. **Strava Integration** - Use existing `strava.ts` for OAuth and activity fetching
3. **Progress Tracking** - Compare actual vs planned hours with visual indicators
4. **Week Navigation** - Simple prev/next week browsing
5. **Mobile-First** - Optimized for iPhone usage

## 🔧 Implementation Notes
- **Use existing Strava code** - Don't recreate what's in `src/strava.ts`
- **Leverage shadcn components** - Build UI with existing Card, Button, Chart, etc.
- **Mobile-first design** - Touch-friendly, responsive layout
- **Week-based view** - Focus on single week (Monday-Sunday) display
- **Real-time sync** - Fetch Strava activities for current week automatically

## 📁 Target Structure
```
src/
├── app/page.tsx (main dashboard)
├── components/
│   ├── ui/ (existing shadcn components)
│   ├── WeekView.tsx
│   ├── StravaAuth.tsx  
│   ├── ActivitySummary.tsx
│   ├── WeekNavigator.tsx
│   └── ProgressBars.tsx
├── data/trainingPlan.json
├── lib/ (existing utilities)
└── strava.ts (existing Strava integration)
```

## 🚀 Getting Started
1. **Analyze existing code** - Understand what's already built
2. **Use existing Strava functions** - Leverage the current integration
3. **Build with shadcn components** - Consistent, accessible UI
4. **Focus on week view** - Keep it simple and focused
5. **Test on mobile** - Ensure great iPhone experience
