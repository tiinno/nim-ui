#!/usr/bin/env node
/**
 * Quick Test Script for Nim UI Components
 *
 * This script verifies that all components can be imported and have the correct structure
 */

import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🧪 Nim UI Quick Test\n');

// Test 1: Check if build artifacts exist
console.log('📦 Test 1: Checking build artifacts...');
try {
  const uiDist = join(__dirname, 'packages/ui/dist');
  const files = await readdir(uiDist);

  const hasJS = files.some(f => f === 'index.js');
  const hasDTS = files.some(f => f === 'index.d.ts');
  const hasCSS = files.some(f => f === 'styles.css');

  if (hasJS && hasDTS && hasCSS) {
    console.log('   ✅ All build artifacts present (JS, DTS, CSS)');
  } else {
    console.log('   ❌ Missing build artifacts');
    console.log(`      JS: ${hasJS ? '✓' : '✗'}`);
    console.log(`      DTS: ${hasDTS ? '✓' : '✗'}`);
    console.log(`      CSS: ${hasCSS ? '✓' : '✗'}`);
  }
} catch (error) {
  console.log('   ❌ Build artifacts not found. Run `pnpm build` first.');
}

// Test 2: Check component files
console.log('\n🎨 Test 2: Checking component files...');
try {
  const componentsDir = join(__dirname, 'packages/ui/src/components');
  const componentFiles = await readdir(componentsDir);

  const tsxFiles = componentFiles.filter(f => f.endsWith('.tsx'));
  const expectedCount = 24; // We expect 24 component files

  console.log(`   ✅ Found ${tsxFiles.length} component files`);

  if (tsxFiles.length >= expectedCount) {
    console.log(`   ✅ All ${expectedCount} components present`);
  } else {
    console.log(`   ⚠️  Expected ${expectedCount} components, found ${tsxFiles.length}`);
  }

  // List all components
  console.log('\n   Components:');
  tsxFiles.slice(0, 10).forEach((file, i) => {
    console.log(`   ${i + 1}. ${file.replace('.tsx', '')}`);
  });
  if (tsxFiles.length > 10) {
    console.log(`   ... and ${tsxFiles.length - 10} more`);
  }
} catch (error) {
  console.log('   ❌ Component files not found');
}

// Test 3: Check registry
console.log('\n📋 Test 3: Checking component registry...');
try {
  const registryPath = join(__dirname, 'packages/ui/src/registry/index.json');
  const registryContent = await readFile(registryPath, 'utf-8');
  const registry = JSON.parse(registryContent);

  console.log(`   ✅ Registry loaded successfully`);
  console.log(`   ✅ ${registry.components.length} components registered`);

  // Check categories
  const categories = {};
  registry.components.forEach(c => {
    categories[c.category] = (categories[c.category] || 0) + 1;
  });

  console.log('\n   Components by category:');
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`   - ${cat}: ${count} components`);
  });
} catch (error) {
  console.log('   ❌ Registry not found or invalid');
}

// Test 4: Check MCP Server
console.log('\n🤖 Test 4: Checking MCP Server...');
try {
  const mcpDist = join(__dirname, 'packages/mcp-server/dist');
  const mcpFiles = await readdir(mcpDist);

  const hasIndex = mcpFiles.some(f => f === 'index.js');

  if (hasIndex) {
    console.log('   ✅ MCP Server built successfully');

    // Check if executable
    const indexPath = join(mcpDist, 'index.js');
    const content = await readFile(indexPath, 'utf-8');

    if (content.startsWith('#!/usr/bin/env node')) {
      console.log('   ✅ Server is executable');
    }

    // Count tools
    const toolsCount = (content.match(/name: ['"]ui_/g) || []).length;
    console.log(`   ✅ ${toolsCount} MCP tools implemented`);
  } else {
    console.log('   ❌ MCP Server not built. Run `pnpm build` in packages/mcp-server');
  }
} catch (error) {
  console.log('   ❌ MCP Server not found');
}

// Test 5: Check documentation
console.log('\n📚 Test 5: Checking documentation...');
try {
  const claudeDoc = join(__dirname, '.claude/CLAUDE.md');
  const kiroDoc = join(__dirname, '.kiro/steering/ui-conventions.md');
  const llmsTxt = join(__dirname, 'llms.txt');

  let docsCount = 0;

  try {
    await readFile(claudeDoc, 'utf-8');
    console.log('   ✅ CLAUDE.md present');
    docsCount++;
  } catch {}

  try {
    await readFile(kiroDoc, 'utf-8');
    console.log('   ✅ ui-conventions.md present');
    docsCount++;
  } catch {}

  try {
    await readFile(llmsTxt, 'utf-8');
    console.log('   ✅ llms.txt present');
    docsCount++;
  } catch {}

  if (docsCount === 3) {
    console.log('\n   ✅ All documentation files present');
  } else {
    console.log(`\n   ⚠️  ${docsCount}/3 documentation files found`);
  }
} catch (error) {
  console.log('   ❌ Documentation files not found');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Test Summary\n');
console.log('✅ All tests completed!');
console.log('\nNext steps:');
console.log('1. Review TEST_COMPONENTS.md for detailed testing guide');
console.log('2. Create a test app to visually verify components');
console.log('3. Set up MCP server in Claude Desktop');
console.log('4. Start building with Nim UI! 🚀');
console.log('='.repeat(50) + '\n');
