# 📚 Design System - Liste Complète des Composants

## 🎯 Vue d'Ensemble
Ce document liste tous les composants UI nécessaires pour créer un SaaS CRM/ERP moderne et stable. Chaque composant est conçu pour être réutilisable, accessible et performant.

## 🔧 Composants de Base

### 1. **Button**
- Variantes: primary, secondary, ghost, outline, danger, success
- Tailles: xs, sm, md, lg, xl
- États: default, hover, active, disabled, loading
- Props: icon (left/right), fullWidth, rounded
- Exemples: CTAs, actions formulaires, navigation

### 2. **Input**
- Types: text, email, password, number, tel, url, search
- Variantes: default, filled, outlined
- États: default, focus, error, disabled, readonly
- Features: prefix/suffix icons, clear button, character count
- Validation: temps réel avec messages d'erreur

### 3. **Select**
- Variantes: single, multi-select, searchable, grouped
- Features: virtualization pour grandes listes, async loading
- Custom rendering: avatars, badges dans les options
- États: default, open, disabled, loading

### 4. **Checkbox**
- Variantes: default, indeterminate
- Tailles: sm, md, lg
- Groupes: vertical, horizontal avec gestion d'état

### 5. **Radio**
- Groupes avec navigation clavier
- Custom rendering avec descriptions
- Variantes: cards, buttons

### 6. **Switch/Toggle**
- Tailles: sm, md, lg
- Labels: inline, stacked
- États animés avec transitions fluides

### 7. **Textarea**
- Auto-resize optionnel
- Character/word count
- Markdown preview option
- Mentions avec autocomplete

### 8. **Badge**
- Variantes: default, primary, success, warning, danger, info
- Tailles: xs, sm, md
- Features: dot indicator, removable, count overflow (+99)

### 9. **Avatar**
- Tailles: xs à 2xl
- Fallbacks: initiales, icône par défaut
- Variantes: circle, square, avec status indicator
- Groups: stack avatars avec overlap

### 10. **Icon**
- Bibliothèque: Lucide Icons + custom icons
- Tailles: xs à 2xl
- Animation: spin, pulse, bounce

## 📦 Composants de Layout

### 11. **Card**
- Variantes: default, bordered, elevated, interactive
- Sections: header, body, footer
- Features: collapsible, draggable, actions menu

### 12. **Container**
- Breakpoints responsive
- Max-width configurations
- Padding adaptatif

### 13. **Grid**
- CSS Grid wrapper
- Responsive columns
- Gap control

### 14. **Stack**
- Vertical/horizontal spacing
- Dividers optionnels
- Alignment control

### 15. **Divider**
- Orientations: horizontal, vertical
- Styles: solid, dashed, dotted
- Avec label optionnel

### 16. **Spacer**
- Fixed ou flexible
- Responsive sizing

## 🧭 Composants de Navigation

### 17. **Navbar**
- Variantes: fixed, sticky, transparent
- Responsive: hamburger menu mobile
- Features: mega menu, search integration, notifications

### 18. **Sidebar**
- Collapsible avec animation
- Multi-level navigation
- Mini variant (icons only)
- Persistent state

### 19. **Breadcrumb**
- Auto-generated from routes
- Dropdown for long paths
- Mobile responsive

### 20. **Tabs**
- Variantes: line, enclosed, soft
- Lazy loading content
- Closable tabs
- Drag to reorder

### 21. **Pagination**
- Variantes: default, simple, load more
- Jump to page
- Items per page selector

### 22. **Stepper**
- Orientations: horizontal, vertical
- Variantes: numbered, icon, progress
- États: completed, active, error, disabled

### 23. **CommandPalette**
- Global search (Cmd+K)
- Actions groupées
- Recent searches
- AI-powered suggestions

## 📊 Composants de Données

### 24. **Table**
- Features: sort, filter, column resize, row selection
- Virtualization pour performance
- Sticky header/columns
- Expandable rows
- Inline editing

### 25. **DataGrid**
- Excel-like editing
- Copy/paste support
- Cell validation
- Custom cell renderers
- Export CSV/Excel

### 26. **List**
- Variantes: simple, detailed, media
- Virtualization
- Drag & drop reorder
- Multi-select avec keyboard

### 27. **Tree**
- Expand/collapse nodes
- Checkbox selection
- Drag & drop
- Search/filter
- Lazy loading

### 28. **Timeline**
- Orientations: vertical, horizontal
- Variantes: simple, detailed, branched
- Interactive zoom
- Date grouping

### 29. **Calendar**
- Views: month, week, day, agenda
- Event creation/editing
- Drag & drop events
- Recurring events
- Multiple calendars

### 30. **Kanban Board**
- Drag & drop cards
- Columns with WIP limits
- Card templates
- Quick add cards
- Filters & search

## 📈 Composants de Visualisation

### 31. **Chart**
- Types: Line, Bar, Area, Pie, Donut, Scatter, Radar
- Interactive tooltips
- Zoom & pan
- Export image/PDF
- Real-time updates

### 32. **Gauge**
- Variantes: circular, linear
- Animated value changes
- Thresholds & zones
- Custom styling

### 33. **Sparkline**
- Mini charts inline
- Types: line, bar, win/loss
- Responsive sizing

### 34. **Heatmap**
- Color scales
- Interactive cells
- Time-based data
- Custom tooltips

### 35. **Progress**
- Variantes: linear, circular, steps
- Labels & percentages
- Animated updates
- Stacked progress

### 36. **Metric/KPI Card**
- Value with trend
- Sparkline integration
- Period comparison
- Click for details

## 💬 Composants de Feedback

### 37. **Toast/Notification**
- Positions: top, bottom, corners
- Types: success, error, warning, info
- Actions buttons
- Auto-dismiss with timer
- Stacking behavior

### 38. **Alert**
- Variantes: inline, banner, floating
- Types: info, success, warning, error
- Dismissible option
- Actions integration

### 39. **Modal/Dialog**
- Sizes: xs à full-screen
- Backdrop blur
- Nested modals support
- Confirm dialogs preset

### 40. **Drawer**
- Positions: left, right, top, bottom
- Sizes configurables
- Push content option
- Multi-level support

### 41. **Popover**
- Smart positioning
- Trigger options: click, hover, focus
- Arrow pointing
- Max-width control

### 42. **Tooltip**
- Positions: top, bottom, left, right
- Delay configuration
- Multi-line support
- Interactive content

### 43. **Loading/Spinner**
- Variantes: spinner, dots, bars, pulse
- Sizes: xs à xl
- Full-page loading overlay
- Skeleton screens

### 44. **Skeleton**
- Shapes: text, title, avatar, image, button
- Animation: wave, pulse, none
- Custom compositions

### 45. **EmptyState**
- Illustrations/icons
- Title & description
- Action buttons
- Custom content

### 46. **ErrorBoundary**
- Fallback UI
- Error reporting
- Retry functionality
- Development mode details

## 📝 Composants de Formulaire

### 47. **Form**
- Validation integration
- Error summary
- Dirty state tracking
- Submit handling

### 48. **FormField**
- Label, input, error, helper text
- Required indicator
- Character count
- Tooltip help

### 49. **DatePicker**
- Single date, range, multiple
- Time selection
- Presets (Today, Last 7 days, etc.)
- Min/max dates
- Disabled dates

### 50. **TimePicker**
- 12/24 hour format
- Minute intervals
- Timezone support
- Quick selections

### 51. **ColorPicker**
- Formats: HEX, RGB, HSL
- Palettes presets
- Eyedropper tool
- Opacity support

### 52. **Slider**
- Single, range
- Steps & marks
- Custom tooltips
- Vertical option

### 53. **Rating**
- Stars, hearts, custom icons
- Half ratings
- Sizes variées
- Read-only mode

### 54. **FileUpload**
- Drag & drop zone
- Multiple files
- Progress tracking
- Preview (images, PDFs)
- Validation (size, type)

### 55. **TagInput**
- Autocomplete
- Validation
- Duplicate prevention
- Keyboard navigation

### 56. **SearchInput**
- Debounced search
- Search history
- Suggestions dropdown
- Clear button
- Loading state

### 57. **PasswordInput**
- Show/hide toggle
- Strength meter
- Requirements checklist
- Generate button

### 58. **PinInput**
- OTP/verification codes
- Auto-focus next
- Paste support
- Masked option

### 59. **RichTextEditor**
- Toolbar customizable
- Markdown support
- Media embedding
- Mentions/hashtags
- Code highlighting

### 60. **CodeEditor**
- Syntax highlighting
- Multiple languages
- Theme support
- Line numbers
- Auto-completion

## 🎨 Composants d'Interaction

### 61. **Dropdown**
- Single/multi level
- Icons support
- Keyboard navigation
- Search filtering

### 62. **ContextMenu**
- Right-click menus
- Nested items
- Icons & shortcuts
- Disabled items

### 63. **Accordion**
- Single/multiple open
- Icons customizable
- Smooth animations
- Nested accordions

### 64. **Collapsible**
- Trigger customizable
- Animation duration
- Lazy content loading

### 65. **Carousel**
- Touch/swipe support
- Autoplay option
- Indicators
- Thumbnails nav
- Infinite loop

### 66. **DragDropList**
- Sortable items
- Between lists
- Handle option
- Ghost preview
- Auto-scroll

### 67. **Resizable**
- Panels/panes
- Min/max constraints
- Persist sizes
- Handle styling

### 68. **VirtualScroll**
- Fixed height items
- Variable height
- Horizontal scroll
- Buffer configuration

## 🔧 Composants Utilitaires

### 69. **Portal**
- Render outside parent
- Z-index management
- Event bubbling control

### 70. **FocusTrap**
- Tab navigation lock
- Initial focus
- Return focus
- Escape handling

### 71. **ClickOutside**
- Detect outside clicks
- Ignore elements
- Touch support

### 72. **IntersectionObserver**
- Lazy loading
- Infinite scroll
- Animations trigger
- Analytics tracking

### 73. **MediaQuery**
- Responsive rendering
- SSR safe
- Performance optimized

### 74. **Transition**
- Enter/exit animations
- Multiple children
- Stagger support
- Custom easings

### 75. **LazyLoad**
- Images
- Components
- Placeholder support
- Error handling

## 🎭 Composants Avancés

### 76. **Tour/Onboarding**
- Step-by-step guide
- Highlights elements
- Progress tracking
- Skip option

### 77. **Mentions**
- @mentions in inputs
- User search
- Custom rendering
- Keyboard navigation

### 78. **EmojiPicker**
- Categories
- Search
- Skin tones
- Recent emojis

### 79. **ImageCropper**
- Aspect ratios
- Zoom control
- Rotate option
- Preview

### 80. **SignaturePad**
- Touch/mouse draw
- Clear/undo
- Export formats
- Color options

### 81. **QRCode**
- Generate from data
- Custom styling
- Logo embedding
- Download options

### 82. **Barcode**
- Multiple formats
- Scanner integration
- Validation

### 83. **VideoPlayer**
- Controls customizable
- Playback speed
- Subtitles support
- Picture-in-picture

### 84. **AudioPlayer**
- Waveform visualization
- Playlist support
- Speed control
- Download option

### 85. **PDFViewer**
- Page navigation
- Zoom controls
- Print support
- Annotations

### 86. **Map**
- Markers/polygons
- Clustering
- Search integration
- Custom tiles

### 87. **OrgChart**
- Hierarchical view
- Expand/collapse
- Search & filter
- Export options

### 88. **Gantt Chart**
- Tasks & dependencies
- Drag to reschedule
- Resource view
- Critical path

### 89. **FlowChart**
- Nodes & connections
- Drag & drop
- Custom node types
- Auto-layout

### 90. **Spreadsheet**
- Excel-like features
- Formulas support
- Cell formatting
- Import/export

## 🔐 Composants de Sécurité

### 91. **PasswordStrength**
- Visual indicator
- Requirements check
- Tips display

### 92. **TwoFactorAuth**
- QR code display
- Backup codes
- SMS/App options

### 93. **BiometricPrompt**
- Fingerprint/Face ID
- Fallback options
- Platform detection

### 94. **SessionTimeout**
- Warning dialog
- Auto logout
- Activity detection

### 95. **RateLimiter**
- Visual feedback
- Countdown timer
- Retry information

## 🌐 Composants d'Intégration

### 96. **SocialShare**
- Multiple platforms
- Custom content
- Analytics tracking

### 97. **PaymentForm**
- Card input formatting
- Validation
- 3D Secure support
- Multiple gateways

### 98. **LocationPicker**
- Map integration
- Address search
- Current location
- Coordinates display

### 99. **LanguageSwitcher**
- Dropdown/flags
- Auto-detect
- RTL support

### 100. **ThemeSwitcher**
- Light/dark/auto
- Custom themes
- Persist preference
- Smooth transitions

## 📋 Standards et Guidelines

### Accessibilité
- ARIA labels sur tous les composants
- Navigation clavier complète
- Screen reader support
- Focus indicators clairs
- Contrast ratios WCAG AAA

### Performance
- Lazy loading par défaut
- Memoization stratégique
- Virtual DOM optimisé
- Bundle size minimal
- Tree-shaking friendly

### Responsive Design
- Mobile-first approach
- Touch-friendly (44px minimum)
- Breakpoints cohérents
- Orientation support
- Adaptive layouts

### Internationalisation
- RTL support natif
- Date/number formatting
- Pluralization rules
- Currency handling
- Timezone awareness

### Documentation
- Props détaillées avec types
- Exemples interactifs
- Best practices
- Accessibility notes
- Performance tips