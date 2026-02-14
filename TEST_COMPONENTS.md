# Testing Nim UI Components

## วิธีที่ 1: Storybook (แนะนำสำหรับ production)

```bash
cd packages/ui
pnpm add -D @storybook/react @storybook/addon-essentials
pnpm dlx storybook@latest init
```

## วิธีที่ 2: สร้าง Simple Test Page

### 2.1 สร้าง test-app ใน packages

```bash
cd packages
mkdir test-app
cd test-app
```

### 2.2 สร้าง package.json

```json
{
  "name": "test-app",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "@nim-ui/components": "workspace:*",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.0",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.2",
    "typescript": "^5.9.3"
  }
}
```

### 2.3 สร้าง index.html

```html
<!DOCTYPE html>
<html lang="en" class="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nim UI Test</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 2.4 สร้าง src/main.tsx

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@nim-ui/components/styles';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 2.5 สร้าง src/App.tsx

```tsx
import React from 'react';
import {
  Button,
  Input,
  Badge,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Modal,
  ModalTrigger,
  ModalContent,
  ModalTitle,
  ModalDescription,
  Hero,
  ProductCard,
  DataCard,
  Stat,
} from '@nim-ui/components';

function App() {
  const [darkMode, setDarkMode] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
            Nim UI Components Test
          </h1>
          <Button
            variant="outline"
            size="md"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Buttons */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
            Buttons
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
          </div>
        </section>

        {/* Inputs */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
            Inputs
          </h2>
          <div className="space-y-4 max-w-md">
            <Input placeholder="Default input" />
            <Input placeholder="Error state" variant="error" />
            <Input placeholder="Success state" variant="success" />
            <Input placeholder="Small size" size="sm" />
            <Input placeholder="Large size" size="lg" />
          </div>
        </section>

        {/* Badges */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
            Badges
          </h2>
          <div className="flex flex-wrap gap-4">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
            Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Card Title</h3>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 dark:text-neutral-400">
                  This is a card with header, content, and footer.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="outline">
              <CardHeader>
                <h3 className="text-lg font-semibold">Outline Card</h3>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Card with outline variant.
                </p>
              </CardContent>
            </Card>

            <DataCard
              label="Total Revenue"
              value="$45,231"
              trend={{ value: 12.5, isPositive: true }}
            />
          </div>
        </section>

        {/* Stats */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
            Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Stat label="Users" value="1,234" />
            <Stat label="Revenue" value="$56.7K" variant="card" />
            <Stat label="Growth" value="+23%" />
            <Stat label="Active" value="892" variant="card" />
          </div>
        </section>

        {/* Modal */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
            Modal
          </h2>
          <Modal>
            <ModalTrigger asChild>
              <Button>Open Modal</Button>
            </ModalTrigger>
            <ModalContent>
              <ModalTitle>Modal Title</ModalTitle>
              <ModalDescription>
                This is a modal dialog built with Radix UI primitives.
              </ModalDescription>
              <div className="mt-4 flex gap-2">
                <Button variant="default">Confirm</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </ModalContent>
          </Modal>
        </section>

        {/* Hero */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
            Hero Section
          </h2>
          <Hero
            title="Build Beautiful UIs Faster"
            subtitle="A modern, accessible React component library with Tailwind CSS and TypeScript"
            alignment="center"
          >
            <div className="flex gap-4 justify-center">
              <Button size="lg">Get Started</Button>
              <Button variant="outline" size="lg">Learn More</Button>
            </div>
          </Hero>
        </section>

        {/* Product Cards */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
            Product Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ProductCard
              title="Wireless Headphones"
              price={299.99}
              description="Premium noise-cancelling headphones"
              image="https://via.placeholder.com/300x200"
            />
            <ProductCard
              title="Smart Watch"
              price={199.99}
              variant="compact"
              image="https://via.placeholder.com/300x200"
            />
            <ProductCard
              title="Laptop Stand"
              price={89.99}
              description="Ergonomic aluminum laptop stand"
              image="https://via.placeholder.com/300x200"
            />
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
        <p className="text-center text-neutral-600 dark:text-neutral-400">
          Nim UI Component Library - All 24 components ready to test!
        </p>
      </div>
    </div>
  );
}

export default App;
```

### 2.6 สร้าง src/index.css

```css
@import '@nim-ui/components/styles';

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### 2.7 สร้าง vite.config.ts

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});
```

### 2.8 สร้าง tsconfig.json

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  },
  "include": ["src"]
}
```

### 2.9 รันและทดสอบ

```bash
# ติดตั้ง dependencies
pnpm install

# รัน dev server
cd packages/test-app
pnpm dev
```

เปิดบราวเซอร์ที่ `http://localhost:3000` จะเห็น:
- ✅ ทุก components แสดงผลถูกต้อง
- ✅ Dark/Light mode toggle
- ✅ ทุก variants ของแต่ละ component
- ✅ Responsive design
- ✅ Interactive elements (Modal, Buttons, etc.)

## วิธีที่ 3: ทดสอบโดยตรงใน Node REPL

```bash
cd packages/ui
node --experimental-modules
```

```javascript
import { Button } from './dist/index.js';
console.log(Button); // ดู component definition
```

## วิธีที่ 4: ใช้ MCP Server ทดสอบ

```bash
# รัน MCP server
cd packages/mcp-server
node dist/index.js
```

จากนั้นใช้ Claude Desktop สั่ง:
- "Show me all Nim UI components"
- "Get the Button component source code"
- "Search for card components"

## วิธีที่ 5: Visual Testing with Browser

สร้างไฟล์ HTML เดียว:

```html
<!DOCTYPE html>
<html>
<head>
  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@19",
      "react-dom/client": "https://esm.sh/react-dom@19/client"
    }
  }
  </script>
  <link href="/packages/ui/dist/styles.css" rel="stylesheet">
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    // Import your components here
  </script>
</body>
</html>
```

## Checklist การทดสอบ

สำหรับแต่ละ component ให้ทดสอบ:

- [ ] Render ถูกต้องใน light mode
- [ ] Render ถูกต้องใน dark mode
- [ ] ทุก variants แสดงผลถูกต้อง
- [ ] ทุก sizes แสดงผลถูกต้อง
- [ ] Props ทำงานถูกต้อง
- [ ] Responsive บน mobile/tablet/desktop
- [ ] Keyboard navigation
- [ ] Hover/Focus states
- [ ] TypeScript types ทำงานถูกต้อง
- [ ] No console errors

ผมแนะนำให้เริ่มจาก**วิธีที่ 2** (Vite + React) เพราะง่ายและรวดเร็วที่สุดครับ!
