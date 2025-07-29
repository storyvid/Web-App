# Tab Jumping Fix Documentation

## Problem
The ProjectDetail page tabs (Overview, Milestones, Files, Team) cause the page to "jump" when switching between them due to inconsistent content heights.

## Root Cause
1. **Fixed heights**: Cards with `height: "300px"` instead of `minHeight`
2. **No container constraint**: Tab content container had no minimum height
3. **Variable content**: Each tab had different content heights causing layout shifts

## Solution Applied (2025-07-29)

### 1. Tab Content Container
Added a consistent minimum height container around all tab content:

```javascript
<Box sx={{ 
  minHeight: '800px', // Consistent height to prevent jumping
  width: '100%'
}}>
```

### 2. Card Height Changes
- Changed `height: "350px"` → `minHeight: "350px"`
- Changed `height: "300px"` → `minHeight: "300px"`
- Changed `width: "800px"` → `maxWidth: "800px"`
- Changed `height="300px"` → `sx={{ minHeight: "300px" }}`

### 3. Documentation Added
Added comprehensive comments explaining:
- Why the container height is important
- What to check when modifying tab content
- Testing requirements

## Prevention Guidelines

**BEFORE modifying tab content:**
1. ✅ Test switching between ALL tabs
2. ✅ Ensure minHeight is maintained or adjusted for ALL tabs
3. ✅ Use `minHeight` instead of fixed `height` where possible
4. ✅ Consider responsive behavior on mobile

**Files to watch:**
- `/src/pages/ProjectDetail.js` (lines 548-551 - main container)
- Any tab content modifications

## Testing Checklist
- [ ] Switch from Overview → Milestones → Files → Team
- [ ] Switch backwards: Team → Files → Milestones → Overview
- [ ] Test on mobile viewport
- [ ] Verify no visible jumping or layout shifts
- [ ] Check all content is properly contained

## Emergency Rollback
If jumping returns, restore the main container:
```javascript
<Box sx={{ minHeight: '800px', width: '100%' }}>
```

And check all cards use `minHeight` instead of `height`.