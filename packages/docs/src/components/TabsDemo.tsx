import { Tabs, TabsList, TabsTrigger, TabsContent } from '@tiinno-ui/components';

export function TabsBasic() {
  return (
    <Tabs defaultValue="tab1" className="w-full">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="text-sm text-neutral-700 dark:text-neutral-300 p-4">Content for Tab 1. This is the first panel.</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="text-sm text-neutral-700 dark:text-neutral-300 p-4">Content for Tab 2. This is the second panel.</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="text-sm text-neutral-700 dark:text-neutral-300 p-4">Content for Tab 3. This is the third panel.</p>
      </TabsContent>
    </Tabs>
  );
}

export function TabsRichContent() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="pricing">Pricing</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Product Overview</h3>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            A comprehensive solution for modern web development. Built with performance and developer experience in mind.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="features">
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Key Features</h3>
          <ul className="list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
            <li>TypeScript support</li>
            <li>Accessible by default</li>
            <li>Dark mode built-in</li>
            <li>Responsive design</li>
          </ul>
        </div>
      </TabsContent>
      <TabsContent value="pricing">
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Pricing Plans</h3>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Free for open source projects. Enterprise plans available for teams.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export function TabsDisabled() {
  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="disabled" disabled>Disabled</TabsTrigger>
        <TabsTrigger value="another">Another</TabsTrigger>
      </TabsList>
      <TabsContent value="active">
        <p className="text-sm text-neutral-700 dark:text-neutral-300 p-4">This tab is active.</p>
      </TabsContent>
      <TabsContent value="another">
        <p className="text-sm text-neutral-700 dark:text-neutral-300 p-4">This tab is also available.</p>
      </TabsContent>
    </Tabs>
  );
}
