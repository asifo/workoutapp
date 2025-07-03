# BJJ Kettlebell Conditioning App - Style Guide

## Overview
This style guide defines the design system, visual identity, and development standards for the BJJ Kettlebell Conditioning app. It ensures consistency across all components and features.

---

## 🎨 Brand Colors

### Primary Colors
- **BJJ Blue**: `#1e3c72` - Main brand color, used for headers, primary buttons, and key text
- **BJJ Light Blue**: `#2a5298` - Secondary brand color, used for gradients and accents

### Semantic Colors
```css
/* Success (Green) */
--color-success-500: #10b981
--color-success-600: #059669
--color-success-700: #047857

/* Error/Strength (Red) */
--color-error-500: #ef4444
--color-error-600: #dc2626
Strength Badge: #b91c1c on #fef2f2

/* Cardio (Green) */
Cardio Badge: #15803d on #f0fdf4

/* Mobility (Blue) */
Mobility Badge: #1d4ed8 on #eff6ff
```

### Neutral Colors
```css
/* Text Colors */
Primary Text: #374151 (dark gray)
Secondary Text: #6b7280 (medium gray)
Light Text: #9ca3af (light gray)

/* Background Colors */
White: #ffffff
Light Gray: #f9fafb
Border Gray: #e5e7eb
```

---

## 📝 Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Monospace**: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono' (for timer display)

### Font Scale
```css
--text-xs: 0.75rem    /* 12px */
--text-sm: 0.875rem   /* 14px */
--text-base: 1rem     /* 16px */
--text-lg: 1.125rem   /* 18px */
--text-xl: 1.25rem    /* 20px */
--text-2xl: 1.5rem    /* 24px */
--text-3xl: 1.875rem  /* 30px */
--text-4xl: 2.25rem   /* 36px */
--text-5xl: 3rem      /* 48px */
```

### Font Weights
```css
--font-light: 300
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Typography Usage
- **Headings**: BJJ Blue (`#1e3c72`) with semibold/bold weight
- **Body Text**: Dark gray (`#374151`) with medium weight for readability
- **Secondary Text**: Medium gray (`#6b7280`) with normal weight
- **Interactive Text**: Blue theme colors for buttons and links

---

## 🧩 Component Styles

### Cards
```css
Background: white
Border: 2px solid #e5e7eb
Border Radius: 1rem (--radius-2xl)
Shadow: --shadow-md
Padding: 1.25rem (--space-5)
Hover: translateY(-2px) with --shadow-lg
```

### Buttons

#### Primary Button
```css
Background: linear-gradient(135deg, #1e3c72, #2a5298)
Color: white
Border Radius: 1.5rem (--radius-2xl)
Shadow: --shadow-lg
Hover: translateY(-2px) with enhanced shadow
```

#### Exercise Card Button (.btn--exercise)
```css
Background: transparent
Color: #1e40af
Border: 1px solid #93c5fd
Border Radius: --radius-md (better text fit)
Padding: --space-2 --space-3 (optimized for text)
Display: inline-flex with center alignment
White-space: nowrap (prevents text wrapping)
Hover: background #eff6ff, border #3b82f6
```

#### Secondary Button
```css
Background: linear-gradient(135deg, #f3f4f6, #e5e7eb)
Color: #1f2937
Border: 2px solid #d1d5db
Hover: BJJ blue theme colors
```

### Exercise Cards
```css
Layout: flexbox column with gap: --space-4
Header: flex justify-between for name and type badge
Name: --text-lg, semibold, BJJ blue (#1e3c72)
Description: --text-sm, medium weight, dark gray (#374151)
Button: positioned at bottom with margin-top: auto
```

### Type Badges
```css
Strength: #b91c1c on #fef2f2
Cardio: #15803d on #f0fdf4  
Mobility: #1d4ed8 on #eff6ff
Font: --text-xs, uppercase, letter-spacing: 0.5px
```

### Workout Details Section
```css
Layout: structured header with workout information
Title: --text-2xl, bold, BJJ blue (#1e3c72)
Focus: --text-lg, medium weight, dark gray (#374151)
Duration: --text-base, medium weight, gray (#6b7280) with timer icon
Header: border-bottom with --color-gray-100
```

### Phase Cards
```css
Layout: CSS grid with auto-fit columns (min 280px)
Background: white with --shadow-md
Border: 2px solid --color-gray-200
Border Radius: --radius-2xl
Padding: --space-5
Hover: border-color --color-primary-300, translateY(-2px)
```

#### Phase Card Variants
```css
Optional Phase (.phase-card--optional):
- Border: dashed style with --color-warning-500
- Background: --color-warning-50
- Icon: 📋 positioned top-right
```

### Phase Elements
```css
Phase Title:
- Font: --text-xl, semibold, BJJ blue (#1e3c72)
- Layout: flex with gap for potential icons

Phase Duration:
- Font: --text-base, medium weight, gray (#6b7280)
- Icon: ⏲️ prefix
- Layout: inline-flex with gap

Phase Repeat:
- Font: --text-sm, medium weight, info blue (#2563eb)
- Background: --color-info-50 with --color-info-200 border
- Icon: 🔄 prefix
- Border Radius: --radius-lg
```

### Exercise List
```css
Exercise List (.exercise-list):
- Layout: flexbox column with gap --space-2
- List style: none
- Padding and margin: 0

Exercise Item (.exercise-item):
- Layout: flexbox row with gap --space-3
- Background: --color-primary-50 (consistent theme color)
- Border: 1px solid --color-primary-200
- Border Radius: --radius-lg

Exercise Info Container (.exercise-info):
- Layout: flexbox column with gap --space-1
- Flex: 1 (takes available space)
- Contains exercise name and description

Exercise Name:
- Font: --text-sm, medium weight, BJJ blue (#1e3c72)
- Color: --color-primary-700
- Layout: flex item

Exercise Description (.exercise-description):
- Font: --text-sm, bold weight, pure black (#000000)
- Background: transparent (matches container background)
- Padding: --space-3 --space-4 (generous spacing for readability)
- Border-left: 4px solid --color-primary-500 (visual accent)
- Border-radius: --radius-lg
- Line-height: 1.6 (improved readability)
- Margin-top: --space-2 (separation from exercise name)
- Contains detailed exercise sequences (e.g., "1. 5 One-arm swings → 2. 5 Cleans → 3. 5 Overhead presses → 4. 5 Front squats")
- Padding: --space-3 --space-4
- Hover: background --color-primary-100, translateX(4px)

Exercise Number (.exercise-number):
- Size: 24px circle
- Background: --color-primary-100
- Color: --color-primary-600
- Font: --text-xs, bold
- Layout: flexbox center alignment

Exercise Name (.exercise-name):
- Font: --text-sm, medium weight
- Color: --color-primary-700 (theme integrated)
- Flex: 1 (takes remaining space)
- Clean text without separate background

Exercise Duration (.exercise-duration):
- Font: --text-xs, medium weight
- Color: --color-gray-600
- Background: --color-gray-100
- Border: 1px solid --color-gray-300
- Border Radius: --radius-md
- Padding: --space-1 --space-2
```

### Phase Exercise Container
```css
Layout: sequential list display
Top border: 1px solid --color-gray-200
Spacing: margin-top and padding-top --space-4
```

### Settings Panel
```css
Toggle Button: 60px circle, white background, --shadow-lg
Toggle Hover: rotate(45deg) with primary color theme
Content Panel: 300px width, positioned bottom-right
Content Animation: translateY with opacity transition
```

---

## 📏 Spacing & Layout

### Spacing Scale
```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
```

### Border Radius
```css
--radius-lg: 0.5rem
--radius-xl: 0.75rem
--radius-2xl: 1rem
--radius-3xl: 1.5rem
--radius-full: 9999px
```

### Grid Layouts
- **Day Buttons**: `grid-cols-2 md:grid-cols-4 lg:grid-cols-7`
- **Exercise Library**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Gap**: Consistent `gap-4` or `gap-5` for visual breathing room

---

## 🎯 Design Principles

### 1. Accessibility First
- High contrast ratios (minimum 4.5:1 for normal text)
- **Maximum contrast for critical information**: Pure black (#000000) text for exercise descriptions
- Focus indicators with 2px solid outline
- ARIA labels and semantic HTML
- Screen reader support
- Keyboard navigation
- **Transparent backgrounds** for text elements to ensure consistent contrast

### 2. Mobile-First Responsive
- Breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)
- Touch-friendly button sizes (minimum 44px height)
- Responsive typography scaling
- Flexible grid layouts

### 3. Performance Optimization
- Minimal animation for reduced motion users
- Efficient CSS with design tokens
- Optimized font loading
- Progressive enhancement

### 4. Visual Hierarchy
- BJJ blue for primary elements and headings
- Consistent spacing using design tokens
- Clear typography scale
- Strategic use of shadows and elevation

---

## 🔧 Technical Standards

### CSS Architecture
- **Design Tokens**: Centralized in `design-tokens.css`
- **Components**: Modular styles in `components.css`
- **Naming**: BEM-inspired with component-based naming
- **Variables**: CSS custom properties for maintainability

### JavaScript Integration
- Event delegation for performance
- Accessible DOM manipulation
- Smooth animations using CSS transitions
- Error handling for graceful degradation

### File Structure
```
src/
├── styles/
│   ├── design-tokens.css
│   └── components.css
├── js/
│   ├── app.js
│   └── utils/
└── assets/
```

---

## 📱 Responsive Behavior

### Breakpoint Usage
```css
/* Mobile First */
.component { /* base mobile styles */ }

/* Tablet */
@media (min-width: 768px) { /* md styles */ }

/* Desktop */
@media (min-width: 1024px) { /* lg styles */ }
```

### Component Responsiveness
- **Cards**: Stack on mobile, grid on larger screens
- **Buttons**: Full width on mobile, auto width on desktop
- **Typography**: Slightly smaller on mobile
- **Spacing**: Reduced padding/margins on mobile

---

## ✅ Quality Checklist

### Before Committing Changes
- [ ] Colors match the brand palette
- [ ] Text has sufficient contrast (use browser dev tools)
- [ ] **Exercise descriptions are clearly visible** with maximum contrast
- [ ] **Critical text uses pure black (#000000)** for optimal readability
- [ ] **Background colors don't interfere** with text visibility
- [ ] Components work on mobile and desktop
- [ ] Hover states are implemented
- [ ] Focus indicators are visible
- [ ] Animations respect reduced motion preferences
- [ ] Code follows naming conventions
- [ ] Design tokens are used instead of hardcoded values

### Testing Requirements
- [ ] Test on Chrome, Firefox, and Safari
- [ ] Test with keyboard navigation
- [ ] Test with screen reader (basic functionality)
- [ ] Test on mobile device or responsive mode
- [ ] Verify performance with browser dev tools

---

## 🚀 Future Considerations

### Planned Enhancements
- Dark mode support (tokens already structured for this)
- Custom color themes for different training phases
- Enhanced animations and micro-interactions
- Progressive Web App (PWA) optimizations

### Recent Updates
- **Exercise Description Visibility Fix**: Changed from colored backgrounds to transparent backgrounds with pure black text (#000000) for maximum contrast and readability
- **Improved Exercise Information Layout**: Added `.exercise-info` container with flexbox column layout for better organization of exercise names and descriptions
- **Enhanced Typography for Critical Information**: Used bold font weight and increased line-height (1.6) for exercise descriptions to ensure optimal readability during workouts

### Maintenance Notes
- Review and update design tokens quarterly
- Monitor web performance metrics
- Keep accessibility standards up to date
- Consider user feedback for design iterations

---

*Last Updated: December 2024*
*Version: 1.0* 