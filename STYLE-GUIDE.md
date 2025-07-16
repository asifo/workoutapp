# BJJ Kettlebell Conditioning App - Style Guide

## Overview
This style guide defines the design system, visual identity, and development standards for the BJJ Kettlebell Conditioning app. It ensures consistency across all components and features with a **BJJ Blackbelt Theme** featuring predominantly black, red, white, and yellow colors.

---

## 🎨 Brand Colors

### Primary Colors (BJJ Blackbelt Theme)
- **BJJ Black**: `#1a1a1a` - Primary background color, representing the blackbelt
- **BJJ Deep Black**: `#000000` - Headers, primary text, and deep backgrounds
- **BJJ Red**: `#dc2626` - Accent color representing belt stripes and martial arts tradition
- **BJJ Bright Red**: `#ef4444` - Interactive elements and highlights

### Secondary Colors
- **BJJ White**: `#ffffff` - Text on dark backgrounds, card backgrounds
- **BJJ Off-White**: `#f8fafc` - Subtle backgrounds and borders
- **BJJ Yellow**: `#fbbf24` - Button highlights and contrast elements
- **BJJ Gold**: `#f59e0b` - Premium accents and success states

### Semantic Colors
```css
/* Success (Gold/Yellow) */
--color-success-500: #f59e0b
--color-success-600: #d97706
--color-success-700: #b45309

/* Error/Danger (Red) */
--color-error-500: #ef4444
--color-error-600: #dc2626
Strength Badge: #dc2626 on #fef2f2

/* Cardio (Yellow) */
Cardio Badge: #f59e0b on #fffbeb

/* Mobility (Red) */
Mobility Badge: #dc2626 on #fef2f2

/* Warning (Yellow) */
--color-warning-500: #fbbf24
--color-warning-600: #f59e0b
```

### Neutral Colors
```css
/* Text Colors */
Primary Text: #ffffff (white on dark backgrounds)
Secondary Text: #d1d5db (light gray on dark backgrounds)
Dark Text: #1a1a1a (black on light backgrounds)
Light Text: #9ca3af (medium gray for subtle text)

/* Background Colors */
Primary Background: #1a1a1a (BJJ Black)
Secondary Background: #000000 (Deep Black)
Card Background: #ffffff (White cards on dark background)
Border Color: #374151 (dark gray borders)
Light Border: #e5e7eb (light borders on white cards)
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
- **Headings**: BJJ Red (`#dc2626`) with semibold/bold weight on dark backgrounds
- **Body Text**: White (`#ffffff`) with medium weight on dark backgrounds
- **Card Text**: Black (`#1a1a1a`) with medium weight on white card backgrounds
- **Interactive Text**: Yellow (`#fbbf24`) for buttons and active states

---

## 🧩 Component Styles

### Cards
```css
Background: white (#ffffff)
Border: 2px solid #374151 (dark gray)
Border Radius: 1rem (--radius-2xl)
Shadow: enhanced shadows for contrast on dark background
Padding: 1.25rem (--space-5)
Hover: translateY(-2px) with red accent border (#dc2626)
```

### Buttons

#### Primary Button (Yellow Theme)
```css
Background: linear-gradient(135deg, #fbbf24, #f59e0b)
Color: #1a1a1a (dark text for contrast)
Border Radius: 1.5rem (--radius-2xl)
Shadow: --shadow-lg
Hover: translateY(-2px) with enhanced yellow gradient
```

#### Secondary Button (Red Theme)
```css
Background: linear-gradient(135deg, #dc2626, #ef4444)
Color: #ffffff (white text)
Border Radius: 1.5rem (--radius-2xl)
Shadow: --shadow-lg
Hover: translateY(-2px) with enhanced red gradient
```

#### Exercise Card Button (.btn--exercise)
```css
Background: transparent
Color: #fbbf24 (yellow)
Border: 1px solid #f59e0b (gold border)
Border Radius: --radius-md
Padding: --space-2 --space-3
Display: inline-flex with center alignment
White-space: nowrap
Hover: background #1a1a1a, border #fbbf24
```

### Exercise Cards
```css
Background: white (#ffffff)
Layout: flexbox column with gap: --space-4
Header: flex justify-between for name and type badge
Name: --text-lg, semibold, BJJ black (#1a1a1a)
Description: --text-sm, medium weight, dark gray (#374151)
Button: positioned at bottom with margin-top: auto
Border: 2px solid #374151 with red hover accent
```

### Type Badges
```css
Strength: #ffffff on #dc2626 (white on red)
Cardio: #1a1a1a on #fbbf24 (black on yellow)
Mobility: #ffffff on #1a1a1a (white on black)
Font: --text-xs, uppercase, letter-spacing: 0.5px
```

### Workout Details Section
```css
Background: #1a1a1a (dark background)
Layout: structured header with workout information
Title: --text-2xl, bold, BJJ red (#dc2626)
Focus: --text-lg, medium weight, white (#ffffff)
Duration: --text-base, medium weight, light gray (#d1d5db) with timer icon
Header: border-bottom with dark gray (#374151)
```

### Phase Cards
```css
Background: white (#ffffff)
Layout: CSS grid with auto-fit columns (min 280px)
Shadow: enhanced --shadow-xl for dark background contrast
Border: 2px solid #374151 (dark border)
Border Radius: --radius-2xl
Padding: --space-5
Hover: border-color #dc2626 (red), translateY(-2px)
```

#### Phase Card Variants
```css
Optional Phase (.phase-card--optional):
- Border: dashed style with #fbbf24 (yellow)
- Background: #fffbeb (light yellow)
- Icon: 📋 positioned top-right
```

### Phase Elements
```css
Phase Title:
- Font: --text-xl, semibold, BJJ red (#dc2626)
- Layout: flex with gap for potential icons

Phase Duration:
- Font: --text-base, medium weight, dark gray (#374151)
- Icon: ⏲️ prefix
- Layout: inline-flex with gap

Phase Repeat:
- Font: --text-sm, medium weight, yellow (#f59e0b)
- Background: #fffbeb with #fbbf24 border
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
- Background: #f8fafc (light background on white cards)
- Border: 1px solid #e5e7eb (light border)
- Border Radius: --radius-lg
- Hover: background #dc2626 (red), color #ffffff (white text)

Exercise Info Container (.exercise-info):
- Layout: flexbox column with gap --space-1
- Flex: 1 (takes available space)
- Contains exercise name and description

Exercise Name:
- Font: --text-sm, medium weight, black (#1a1a1a)
- Layout: flex item
- Hover: color #ffffff (white on red background)

Exercise Description (.exercise-description):
- Font: --text-sm, bold weight, pure black (#000000)
- Background: transparent
- Padding: --space-3 --space-4
- Border-left: 4px solid #dc2626 (red accent)
- Border-radius: --radius-lg
- Line-height: 1.6
- Margin-top: --space-2
- Hover: color #ffffff (white text on red background)

Exercise Number (.exercise-number):
- Size: 24px circle
- Background: #1a1a1a (black)
- Color: #fbbf24 (yellow)
- Font: --text-xs, bold
- Layout: flexbox center alignment

Exercise Duration (.exercise-duration):
- Font: --text-xs, medium weight
- Color: #374151 (dark gray)
- Background: #f8fafc (light background)
- Border: 1px solid #e5e7eb
- Border Radius: --radius-md
- Padding: --space-1 --space-2
```

### Phase Exercise Container
```css
Layout: sequential list display
Top border: 1px solid #e5e7eb (light border on white cards)
Spacing: margin-top and padding-top --space-4
```

### Settings Panel
```css
Background: #1a1a1a (dark background)
Toggle Button: 60px circle, white background, --shadow-lg
Toggle Hover: background #dc2626 (red), color #ffffff (white)
Content Panel: 300px width, positioned bottom-right
Content Background: white (#ffffff)
Content Border: 2px solid #374151 (dark border)
Content Animation: translateY with opacity transition
```

### App Background
```css
Body Background: #1a1a1a (BJJ Black)
Main Container: #1a1a1a with white cards floating on top
Navigation: #000000 (deep black) with red and yellow accents
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

### 1. BJJ Blackbelt Aesthetic
- **Predominantly black backgrounds** representing the blackbelt
- **Red accents** for belt stripes and martial arts tradition
- **White cards** floating on dark backgrounds for content clarity
- **Yellow highlights** for interactive elements and energy

### 2. Accessibility First
- High contrast ratios with white text on dark backgrounds
- **Yellow buttons** provide excellent contrast against black backgrounds
- **White cards** ensure readability for detailed content
- Focus indicators with yellow (#fbbf24) for visibility on dark backgrounds
- ARIA labels and semantic HTML
- Screen reader support
- Keyboard navigation

### 3. Mobile-First Responsive
- Breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)
- Touch-friendly button sizes (minimum 44px height)
- Responsive typography scaling
- Flexible grid layouts

### 4. Performance Optimization
- Minimal animation for reduced motion users
- Efficient CSS with design tokens
- Optimized font loading
- Progressive enhancement

### 5. Visual Hierarchy
- **Red for primary headings** and important elements
- **Yellow for interactive elements** and calls-to-action
- **White cards** for content sections
- **Black backgrounds** for focus and elegance

---

## 🔧 Technical Standards

### CSS Architecture
- **Design Tokens**: Centralized in `design-tokens.css`
- **Components**: Modular styles in `components.css`
- **Naming**: BEM-inspired with component-based naming
- **Variables**: CSS custom properties for maintainability

### Color Variables (Updated for Blackbelt Theme)
```css
:root {
  /* Primary Colors */
  --color-primary-500: #dc2626;    /* BJJ Red */
  --color-primary-600: #b91c1c;    /* Darker Red */
  --color-primary-700: #991b1b;    /* Deep Red */
  
  /* Secondary Colors */
  --color-secondary-500: #fbbf24;  /* BJJ Yellow */
  --color-secondary-600: #f59e0b;  /* Gold */
  --color-secondary-700: #d97706;  /* Deep Gold */
  
  /* Background Colors */
  --color-bg-primary: #1a1a1a;     /* BJJ Black */
  --color-bg-secondary: #000000;   /* Deep Black */
  --color-bg-card: #ffffff;        /* White Cards */
  
  /* Text Colors */
  --color-text-primary: #ffffff;   /* White on dark */
  --color-text-secondary: #d1d5db; /* Light gray */
  --color-text-dark: #1a1a1a;      /* Black on light */
}
```

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
.component { /* base mobile styles with dark theme */ }

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
- **Dark theme**: Consistent across all breakpoints

---

## ✅ Quality Checklist

### Before Committing Changes
- [ ] Colors match the BJJ blackbelt theme (black, red, white, yellow)
- [ ] **White text has sufficient contrast** on dark backgrounds
- [ ] **Yellow buttons are clearly visible** against black backgrounds
- [ ] **White cards stand out** against dark backgrounds
- [ ] **Red accents are used sparingly** for maximum impact
- [ ] Components work on mobile and desktop
- [ ] Hover states use theme colors (red/yellow)
- [ ] Focus indicators are visible (yellow on dark)
- [ ] Animations respect reduced motion preferences
- [ ] Code follows naming conventions
- [ ] Design tokens are used instead of hardcoded values

### Testing Requirements
- [ ] Test on Chrome, Firefox, and Safari
- [ ] Test with keyboard navigation (yellow focus indicators)
- [ ] Test with screen reader (basic functionality)
- [ ] Test on mobile device or responsive mode
- [ ] Verify dark theme performance with browser dev tools
- [ ] Test contrast ratios for accessibility compliance

---

## 🚀 Future Considerations

### Planned Enhancements
- Light mode toggle (maintaining BJJ theme with inverted colors)
- Custom red/yellow accent themes for different belt levels
- Enhanced animations with martial arts-inspired transitions
- Progressive Web App (PWA) optimizations

### Recent Updates
- **Complete BJJ Blackbelt Theme Implementation**: Changed from blue theme to black, red, white, and yellow
- **Dark Background with White Cards**: Floating card design for better content readability
- **Enhanced Contrast**: Yellow buttons and red accents for optimal visibility
- **Martial Arts Aesthetic**: Color choices reflect BJJ tradition and belt progression

### Maintenance Notes
- Review and update design tokens quarterly
- Monitor web performance metrics with dark theme
- Keep accessibility standards up to date
- Consider user feedback for design iterations
- Maintain consistent theme across all components

---

*Last Updated: December 2024*
*Version: 2.0 - BJJ Blackbelt Theme* 