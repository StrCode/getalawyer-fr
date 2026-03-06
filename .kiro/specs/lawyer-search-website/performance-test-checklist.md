# Animation Performance Testing Checklist

## Manual Testing Instructions

### 1. Chrome DevTools Performance Testing

#### Setup:
1. Open the application in Chrome
2. Open DevTools (F12)
3. Go to Performance tab
4. Enable "Screenshots" and "Web Vitals"

#### Test Scenarios:

**A. Search Bar Animation (Scroll)**
- [ ] Start recording
- [ ] Scroll down to trigger search bar scale animation
- [ ] Stop recording after animation completes
- [ ] Verify: FPS stays at 60fps during animation
- [ ] Verify: No layout/reflow warnings
- [ ] Check: "Composite Layers" shows GPU acceleration

**B. Hover Animations (Lawyer Cards)**
- [ ] Start recording
- [ ] Hover over multiple lawyer cards
- [ ] Stop recording
- [ ] Verify: FPS stays at 60fps during hover
- [ ] Verify: Transform operations are GPU-accelerated
- [ ] Check: No paint operations on hover (only composite)

**C. Hero Section Fade-Up Animations**
- [ ] Reload page with Performance tab recording
- [ ] Let all fade-up animations complete
- [ ] Stop recording
- [ ] Verify: Staggered animations maintain 60fps
- [ ] Verify: No layout shifts (CLS = 0)

**D. Popover Slide Animations**
- [ ] Start recording
- [ ] Open search popover
- [ ] Navigate between sections (Practice Area → Location → Consultation)
- [ ] Stop recording
- [ ] Verify: Slide animations maintain 60fps
- [ ] Verify: Layout animations use GPU acceleration

### 2. Reduced Motion Testing

#### Setup:
1. Open System Preferences (macOS) or Settings (Windows)
2. Enable "Reduce Motion" preference
   - macOS: System Preferences → Accessibility → Display → Reduce motion
   - Windows: Settings → Ease of Access → Display → Show animations

#### Test Scenarios:
- [ ] Reload the page
- [ ] Verify: Hero section content appears instantly (no fade-up)
- [ ] Verify: Search bar scale animation is disabled
- [ ] Verify: Hover animations are disabled or instant
- [ ] Verify: Smooth scroll changes to instant scroll
- [ ] Check console: No animation-related errors

### 3. Cross-Browser Testing

#### Chrome/Edge (Chromium)
- [ ] All animations smooth at 60fps
- [ ] GPU acceleration working
- [ ] Reduced motion respected

#### Firefox
- [ ] All animations smooth at 60fps
- [ ] GPU acceleration working
- [ ] Reduced motion respected

#### Safari (macOS/iOS)
- [ ] All animations smooth at 60fps
- [ ] GPU acceleration working
- [ ] Reduced motion respected
- [ ] No webkit-specific issues

### 4. Mobile Performance Testing

#### iOS Safari
- [ ] Test on iPhone (physical device preferred)
- [ ] Verify: Animations smooth on 60Hz display
- [ ] Verify: Animations smooth on 120Hz display (ProMotion)
- [ ] Check: No jank during scroll
- [ ] Verify: Touch interactions responsive

#### Chrome Mobile (Android)
- [ ] Test on Android device
- [ ] Verify: Animations smooth at device refresh rate
- [ ] Check: No jank during scroll
- [ ] Verify: Touch interactions responsive

### 5. Lighthouse Performance Audit

#### Run Lighthouse:
```bash
# In Chrome DevTools
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "Performance" category
4. Click "Analyze page load"
```

#### Expected Scores:
- [ ] Performance: > 90
- [ ] First Contentful Paint: < 1.5s
- [ ] Largest Contentful Paint: < 2.5s
- [ ] Total Blocking Time: < 200ms
- [ ] Cumulative Layout Shift: < 0.1
- [ ] Speed Index: < 3.4s

### 6. Animation Property Verification

#### Using DevTools Layers Panel:
1. Open DevTools
2. Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
3. Type "Show Layers" and select it
4. Trigger animations and verify layers

#### Checklist:
- [ ] Search bar scale animation creates composite layer
- [ ] Hover transforms create composite layers
- [ ] Opacity animations don't trigger paint
- [ ] No "will-change" warnings in console

### 7. Network Throttling Test

#### Setup:
1. Open DevTools → Network tab
2. Set throttling to "Fast 3G"

#### Test:
- [ ] Page loads and animations work smoothly
- [ ] No animation jank due to resource loading
- [ ] Fonts load without causing layout shift

### 8. CPU Throttling Test

#### Setup:
1. Open DevTools → Performance tab
2. Click gear icon
3. Set CPU throttling to "4x slowdown"

#### Test:
- [ ] Record page load
- [ ] Verify animations still attempt 60fps
- [ ] Check for dropped frames
- [ ] Verify reduced motion still works

## Automated Testing Commands

```bash
# Build the application
npm run build

# Preview production build
npm run preview

# Run Lighthouse CI (if configured)
npm run lighthouse

# Check bundle size
npm run analyze
```

## Performance Metrics Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| FPS during animations | 60fps | TBD | ⏳ |
| GPU-accelerated properties | 100% | 100% | ✅ |
| Reduced motion support | 100% | 100% | ✅ |
| Lighthouse Performance | >90 | TBD | ⏳ |
| First Contentful Paint | <1.5s | TBD | ⏳ |
| Cumulative Layout Shift | <0.1 | TBD | ⏳ |

## Known Issues

None identified during code audit.

## Recommendations

1. **Monitor in Production**: Set up Real User Monitoring (RUM) to track animation performance
2. **Performance Budget**: Set up performance budgets in CI/CD
3. **Regular Audits**: Run Lighthouse audits on every deployment
4. **User Feedback**: Collect feedback on animation smoothness from users

## Sign-off

- [ ] Code audit completed
- [ ] Manual testing completed
- [ ] Cross-browser testing completed
- [ ] Mobile testing completed
- [ ] Lighthouse audit completed
- [ ] Performance metrics meet targets
- [ ] Documentation updated

**Auditor:** Kiro AI  
**Date:** 2024  
**Status:** Code audit complete, manual testing pending
