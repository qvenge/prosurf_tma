# PaymentLayout Widget

A reusable layout component for payment pages with configurable tabs.

## Features

- **Configurable tabs**: Define multiple tabs with custom content
- **Flexible layout**: Top section with scrollable content + fixed footer
- **Loading/Error states**: Built-in support for loading and error display
- **Type-safe**: Full TypeScript support with generics
- **Responsive**: Adapts to different screen sizes

## Usage

```tsx
import { PaymentLayout } from '@/widgets/payment-layout';
import type { TabConfig } from '@/widgets/payment-layout';

function MyPaymentPage() {
  const [activeTab, setActiveTab] = useState<'subscription' | 'single'>('subscription');

  const tabs: TabConfig<'subscription' | 'single'>[] = [
    {
      id: 'subscription',
      label: 'Абонемент',
      content: <SubscriptionContent />
    },
    {
      id: 'single',
      label: 'Разовая тренировка',
      content: <SingleSessionContent />
    }
  ];

  return (
    <PaymentLayout
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      optionsContent={<PaymentOptions />}
      summaryContent={<PaymentSummary />}
    />
  );
}
```

## Props

### `PaymentLayoutProps<T>`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `tabs` | `TabConfig<T>[]` | Yes | Array of tab configurations |
| `activeTab` | `T` | Yes | Currently active tab ID |
| `onTabChange` | `(tabId: T) => void` | Yes | Callback when tab changes |
| `topContent` | `ReactNode` | No | Content to render above tabs |
| `optionsContent` | `ReactNode` | No | Payment options section (e.g., cashback) |
| `summaryContent` | `ReactNode` | No | Payment summary footer |
| `isLoading` | `boolean` | No | Show loading state |
| `error` | `string \| null` | No | Error message to display |
| `className` | `string` | No | Additional CSS class |

### `TabConfig<T>`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `T` | Unique tab identifier |
| `label` | `string` | Display label |
| `content` | `ReactNode` | Tab content |

## Layout Structure

```
┌─────────────────────────────┐
│ topContent (optional)       │
├─────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │Tab 1│ │Tab 2│ │Tab 3│    │ (tabs)
│ └─────┘ └─────┘ └─────┘    │
├─────────────────────────────┤
│                             │
│ Active Tab Content          │ (scrollable)
│                             │
├─────────────────────────────┤
│ optionsContent (optional)   │
├─────────────────────────────┤
│ summaryContent (fixed)      │
└─────────────────────────────┘
```

## Examples

### Basic Usage

```tsx
<PaymentLayout
  tabs={[
    { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
    { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> }
  ]}
  activeTab="tab1"
  onTabChange={(id) => console.log(id)}
/>
```

### With All Options

```tsx
<PaymentLayout
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  topContent={<Header />}
  optionsContent={
    <>
      <CashbackToggle />
      <CertificateToggle />
    </>
  }
  summaryContent={
    <PaymentSummary
      total={finalPrice}
      onPay={handlePayment}
    />
  }
  isLoading={isLoading}
  error={error}
/>
```

### Single Tab (Hides Selector)

```tsx
// When only one tab, selector is hidden
<PaymentLayout
  tabs={[{ id: 'single', label: 'Payment', content: <Content /> }]}
  activeTab="single"
  onTabChange={() => {}}
/>
```
