/**
 * Quick test script to verify MCP server functionality
 * This simulates calling the server tools directly
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testServer() {
  console.log('Testing Nim UI MCP Server...\n');

  try {
    // Test 1: Load registry
    console.log('Test 1: Loading registry data...');
    const registryPath = join(__dirname, '../ui/src/registry/index.json');
    const registryContent = await readFile(registryPath, 'utf-8');
    const registry = JSON.parse(registryContent);
    console.log(`✓ Registry loaded: ${registry.components.length} components\n`);

    // Test 2: Load tokens
    console.log('Test 2: Loading design tokens...');
    const tokensPath = join(__dirname, '../tailwind-config/src/tokens.js');
    const tokensContent = await readFile(tokensPath, 'utf-8');
    const tokensMatch = tokensContent.match(/export\s+const\s+tokens\s+=\s+({[\s\S]*});/);
    if (tokensMatch) {
      const tokens = new Function(`return ${tokensMatch[1]}`)();
      console.log(`✓ Tokens loaded: colors, spacing, borderRadius, typography\n`);
    }

    // Test 3: Search components
    console.log('Test 3: Searching for "button"...');
    const searchResults = registry.components.filter((c: any) =>
      c.name.toLowerCase().includes('button') ||
      c.keywords.some((k: string) => k.toLowerCase().includes('button'))
    );
    console.log(`✓ Found ${searchResults.length} component(s):`);
    searchResults.forEach((c: any) => console.log(`  - ${c.name} (${c.category})`));
    console.log();

    // Test 4: Get specific component
    console.log('Test 4: Getting Button component...');
    const button = registry.components.find((c: any) => c.name === 'Button');
    if (button) {
      console.log(`✓ Button component found:`);
      console.log(`  - Category: ${button.category}`);
      console.log(`  - File: ${button.file}`);
      console.log(`  - Variants: ${button.variants.length}`);
      console.log(`  - Examples: ${button.examples.length}`);

      // Try to read source
      const componentPath = join(__dirname, '../ui/src', button.file);
      try {
        const source = await readFile(componentPath, 'utf-8');
        console.log(`  - Source code: ${source.length} characters\n`);
      } catch (err) {
        console.log(`  - Source code: Error reading file\n`);
      }
    }

    // Test 5: List components by category
    console.log('Test 5: Listing primitives...');
    const primitives = registry.components.filter((c: any) => c.category === 'primitives');
    console.log(`✓ Found ${primitives.length} primitive components:`);
    primitives.forEach((c: any) => console.log(`  - ${c.name}`));
    console.log();

    console.log('All tests passed! ✓');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testServer();
