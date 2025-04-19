# UI Component Library

This directory contains reusable UI components that follow our design system guidelines. These components are designed to be flexible, accessible, and consistent across the application.

## Components

### Chip

`Chip` is a versatile component for displaying tags, filters, and small pieces of information.

#### Usage

```tsx
import Chip from '@/app/components/ui/Chip';

// Basic usage
<Chip>Default Chip</Chip>

// With variants
<Chip variant="active">Active</Chip>
<Chip variant="inactive">Inactive</Chip>
<Chip variant="highlight">Highlight</Chip>

// With icon
<Chip 
  icon={<svg>...</svg>}
  iconPosition="left"
>
  With Icon
</Chip>

// With click handler
<Chip onClick={() => handleChipClick()}>
  Clickable
</Chip>

// Small size
<Chip size="sm">Small</Chip>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Content of the chip |
| `variant` | 'default' \| 'active' \| 'inactive' \| 'highlight' | 'default' | Visual style of the chip |
| `size` | 'sm' \| 'md' | 'md' | Size of the chip |
| `icon` | ReactNode | - | Optional icon to display |
| `iconPosition` | 'left' \| 'right' | 'right' | Position of the icon |
| `onClick` | (e: React.MouseEvent) => void | - | Click handler |
| `className` | string | '' | Additional CSS classes |

### Card

`Card` is a container component that provides a consistent visual structure for content.

#### Features

- **Enhanced Hover Effects**: When `isHoverable` is true, cards feature a subtle elevation effect, enhanced shadow, and slight background color change on hover for improved visual feedback.

#### Usage

```tsx
import Card from '@/app/components/ui/Card';

// Basic usage
<Card>
  <p>Card content goes here</p>
</Card>

// With title and tag
<Card
  title="Card Title"
  tag={<Chip>Tag</Chip>}
>
  <p>Card content</p>
</Card>

// With header content
<Card
  title="Card with Header"
  headerContent={
    <div className="flex gap-2">
      <Chip>8 × 12</Chip>
      <Chip>30s rest</Chip>
    </div>
  }
>
  <p>Main content</p>
</Card>

// Clickable card
<Card
  onClick={() => handleCardClick()}
  isClickable={true}
>
  <p>Click me!</p>
</Card>

// Using Card.Section for consistent spacing
<Card>
  <Card.Section>
    <h3>Section 1</h3>
    <p>Content for section 1</p>
  </Card.Section>
  
  <Card.Section>
    <h3>Section 2</h3>
    <p>Content for section 2</p>
  </Card.Section>
</Card>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Main content of the card |
| `onClick` | () => void | - | Click handler |
| `isHoverable` | boolean | true | Whether the card should change appearance on hover |
| `isClickable` | boolean | false | Whether the card is clickable |
| `className` | string | '' | Additional CSS classes |
| `tag` | ReactNode | - | Tag displayed in the top-right corner |
| `title` | ReactNode | - | Title of the card |
| `headerContent` | ReactNode | - | Additional content displayed in the header |
| `footerContent` | ReactNode | - | Content displayed in the footer |

### Card.Section

A sub-component of Card that provides consistent spacing for content sections.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Content of the section |
| `className` | string | '' | Additional CSS classes |

## CSS Utilities

Add these CSS utilities to your global styles:

```css
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tracking-tighter {
  letter-spacing: -0.025em;
}
.shadow-inner-sm {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.2);
}
.box-shadow-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}
``` 