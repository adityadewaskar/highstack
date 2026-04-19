# @highstack/antd-utils

Better Ant Design primitives — Zod-powered forms, imperative modals & drawers with automatic z-index stacking.

- **Single Provider** — one `<HighstackAntDProvider>` replaces separate modal and drawer providers
- **Imperative API** — `openModal(content, opts)` / `openDrawer(content, opts)` from anywhere
- **Zod-first forms** — `useForm(form, schema)` generates Ant Design rules from Zod schemas
- **Auto z-index** — modals and drawers stack correctly regardless of open order
- **Zod v3 + v4** — works across both versions

## Installation

```bash
npm install @highstack/antd-utils
# or
pnpm add @highstack/antd-utils
```

**Peer dependencies:** `react >= 18`, `react-dom >= 18`, `antd >= 5`, `zod >= 3`

## Setup

Wrap your app once with `HighstackAntDProvider`:

```tsx
import { HighstackAntDProvider } from '@highstack/antd-utils';

function App() {
  return (
    <HighstackAntDProvider>
      <YourApp />
    </HighstackAntDProvider>
  );
}
```

Optionally set a custom base z-index (default: `1000`):

```tsx
<HighstackAntDProvider zIndex={2000}>
```

---

## useModal

Imperative modal management. Open modals from any component — no `visible` state needed.

```tsx
import { useModal } from '@highstack/antd-utils';

function MyComponent() {
  const { openModal, hideModal } = useModal();

  const handleClick = () => {
    openModal(
      <EditUserForm onSave={(data) => { save(data); hideModal(); }} />,
      { title: 'Edit User', width: 600 }
    );
  };

  return <Button onClick={handleClick}>Edit</Button>;
}
```

### API

```ts
const { openModal, hideModal } = useModal();

openModal(content: ReactNode, opts?: ModalOptions): void
hideModal(): void  // closes the topmost modal
```

### ModalOptions

All [Ant Design Modal props](https://ant.design/components/modal) are supported, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `ReactNode \| null` | — | Modal title. Pass `null` for no header. |
| `width` | `number` | antd default | Modal width in pixels. |
| `closable` | `boolean` | `true` | Whether clicking the mask closes the modal. |
| `keyboardClosable` | `boolean` | `true` | Whether pressing ESC closes the modal. |
| `fullScreen` | `boolean` | `false` | Sets body height to `80vh`. |
| `lazy` | `boolean` | `false` | Wraps content in `<Suspense>` for lazy loading. |
| `onClose` | `() => void` | — | Custom close handler (replaces default `hideModal`). |
| `footer` | `(close) => ReactNode` | `null` | Render function for custom footer. Receives `close` callback. |

### Stacking

Multiple modals can be open simultaneously. Each new modal gets a higher z-index automatically.

```tsx
// Opens on top of any existing modals
openModal(<ConfirmDialog />, { title: 'Are you sure?' });
```

### Injected Props

The content component automatically receives `closeModal` and `openModal` as props:

```tsx
function EditUserForm({ closeModal }: { closeModal?: () => void }) {
  return (
    <Form onFinish={(values) => { save(values); closeModal?.(); }}>
      {/* ... */}
    </Form>
  );
}
```

---

## useDrawer

Same imperative pattern for drawers.

```tsx
import { useDrawer } from '@highstack/antd-utils';

function Sidebar() {
  const { openDrawer, hideDrawer } = useDrawer();

  const showFilters = () => {
    openDrawer(
      <FilterPanel onApply={(filters) => { apply(filters); hideDrawer(); }} />,
      { title: 'Filters', placement: 'right', width: 400 }
    );
  };

  return <Button onClick={showFilters}>Filters</Button>;
}
```

### API

```ts
const { openDrawer, hideDrawer } = useDrawer();

openDrawer(content: ReactNode, opts?: DrawerOptions): void
hideDrawer(): void  // closes the topmost drawer
```

### DrawerOptions

All [Ant Design Drawer props](https://ant.design/components/drawer) are supported, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `ReactNode` | — | Drawer title. |
| `width` | `number \| string` | antd default | Drawer width. |
| `placement` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | Drawer position. |
| `closable` | `boolean` | `true` | Whether clicking the mask closes the drawer. |
| `keyboardClosable` | `boolean` | `true` | Whether pressing ESC closes the drawer. |
| `lazy` | `boolean` | `false` | Wraps content in `<Suspense>`. |
| `bodyStyle` | `CSSProperties` | — | Styles for the drawer body. |
| `onClose` | `() => void` | — | Custom close handler. |
| `footer` | `(close) => ReactNode` | `null` | Render function for custom footer. |

### Injected Props

Content components receive `closeDrawer` and `openDrawer` as props:

```tsx
function FilterPanel({ closeDrawer }: { closeDrawer?: () => void }) {
  return <Button onClick={closeDrawer}>Done</Button>;
}
```

---

## useForm

Connects an Ant Design form to a Zod schema. Generates per-field rules and provides typed submit handling.

```tsx
import { Form, Input, Button } from 'antd';
import { useForm } from '@highstack/antd-utils';
import { loginSchema } from './schemas';

function LoginForm() {
  const [form] = Form.useForm();
  const { rules, handleSubmit } = useForm(form, loginSchema);

  return (
    <Form form={form} onFinish={handleSubmit(async (values) => {
      // `values` is fully typed as z.infer<typeof loginSchema>
      await login(values);
    })}>
      <Form.Item name="email" rules={rules.email}>
        <Input placeholder="Email" />
      </Form.Item>
      <Form.Item name="password" rules={rules.password}>
        <Input.Password placeholder="Password" />
      </Form.Item>
      <Button type="primary" htmlType="submit">Log in</Button>
    </Form>
  );
}
```

### API

```ts
const { rules, handleSubmit, validate } = useForm(form, schema);
```

| Return | Type | Description |
|--------|------|-------------|
| `rules` | `Record<string, Rule[]>` | Per-field Ant Design rules. Supports nested objects — `rules.phone.number`. |
| `handleSubmit` | `(handler) => () => Promise<void>` | Wraps your handler with full Zod validation. On failure, sets field-level errors on the form. |
| `validate` | `() => Promise<T \| null>` | Manually trigger validation. Returns parsed value on success, `null` on failure (and sets form errors). |

### Nested Objects

Rules follow the same nesting as your Zod schema:

```tsx
const schema = z.object({
  name: z.string().min(1),
  phone: z.object({
    number: z.string().regex(/^[0-9]{10}$/),
    countryCode: z.string().default('91'),
  }),
  settings: z.object({
    language: z.object({
      app: z.string().optional(),
    }).optional(),
  }).optional(),
});

const { rules } = useForm(form, schema);

// Access nested rules directly
<Form.Item name={['phone', 'number']} rules={rules.phone.number}>
<Form.Item name={['phone', 'countryCode']} rules={rules.phone.countryCode}>
```

### Schemas with `.refine()` and `.transform()`

Both are fully supported. Refinements are unwrapped to extract the inner object shape, and validators run the full Zod parse (including refinements) at the field level:

```tsx
const schema = z.object({
  password: z.string().min(8).refine(p => /[A-Z]/.test(p), {
    message: 'Must contain uppercase',
  }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const { rules } = useForm(form, schema);
// rules.password validates min length + uppercase
// Cross-field refinement runs via handleSubmit
```

---

## zodToAntdRules

Standalone utility if you don't need the full `useForm` hook. Same function that `useForm` uses internally.

```tsx
import { zodToAntdRules } from '@highstack/antd-utils';

const rules = zodToAntdRules(mySchema);

<Form.Item name="email" rules={rules.email}>
```

### Dynamic Schemas

Works with schemas built at runtime:

```tsx
const shape = {};
fields.forEach(field => {
  shape[field.name] = field.required
    ? z.string().min(1, `${field.label} is required`)
    : z.string().optional();
});

const rules = zodToAntdRules(z.object(shape));
```

---

## useHighstackAntD

Convenience hook that returns both modal and drawer APIs:

```tsx
import { useHighstackAntD } from '@highstack/antd-utils';

const { openModal, hideModal, openDrawer, hideDrawer } = useHighstackAntD();
```

---

## Z-Index Stacking

All modals and drawers share a single z-index counter. Each `openModal` or `openDrawer` call increments it by 1, so the last one opened is always on top — regardless of whether it's a modal or drawer.

```
openModal(A)   → z-index 1001
openDrawer(B)  → z-index 1002  (on top of A)
openModal(C)   → z-index 1003  (on top of B)
```

---

## Migration from separate providers

If you're migrating from separate `ModalProvider` + `DrawerProvider`:

```diff
- import { ModalProvider } from './ModalContext';
- import { DrawerProvider } from './DrawerContext';

- <ModalProvider>
-   <DrawerProvider>
-     <App />
-   </DrawerProvider>
- </ModalProvider>

+ import { HighstackAntDProvider } from '@highstack/antd-utils';

+ <HighstackAntDProvider>
+   <App />
+ </HighstackAntDProvider>
```

Hooks stay the same:

```diff
- import { useModal } from './ModalContext';
- import { useDrawer } from './DrawerContext';
- import { zodToAntdRules } from './zod-to-antd';

+ import { useModal, useDrawer, zodToAntdRules } from '@highstack/antd-utils';
```

## License

MIT
