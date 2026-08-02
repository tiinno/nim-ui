import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

/**
 * The server wiring, driven over the real protocol.
 *
 * NIMUI-65 closed the four registry tools by extracting their documents into
 * pure functions, and stated what that left uncovered: `setupHandlers`, the
 * tool schemas, and the dispatch switch. Reaching those from a unit test means
 * changing how `index.ts` starts, which is a change to a shipped binary's entry
 * path — not something to do on the back of a test refactor.
 *
 * So this does not import the server. It **spawns the built binary** and speaks
 * JSON-RPC to it over stdio, which is exactly what a client does. That was
 * being run by hand after every change to this package; running it by hand is
 * how it stops being run.
 *
 * `test:run` already declares `dependsOn: ["build"]` in `turbo.json`, so
 * `dist/index.js` exists by the time this runs — asserted below rather than
 * assumed, because the alternative is a suite that silently tests nothing.
 *
 * Correlation is by request id with a real timeout, not by sleeping. Fixed
 * sleeps are what make process tests flaky on a loaded CI machine.
 */

const DIST = resolve(__dirname, '../dist/index.js');

interface Response {
  id?: number;
  result?: { content?: Array<{ type: string; text: string }>; tools?: Array<{ name: string; inputSchema: unknown }>; serverInfo?: { name: string } };
  error?: { message: string };
}

class Client {
  private child: ChildProcessWithoutNullStreams;
  private buffer = '';
  private pending = new Map<number, (value: Response) => void>();
  private nextId = 1;
  stderr = '';

  constructor() {
    this.child = spawn(process.execPath, [DIST], { stdio: ['pipe', 'pipe', 'pipe'] });
    this.child.stderr.on('data', (d) => (this.stderr += String(d)));
    this.child.stdout.on('data', (d) => {
      this.buffer += String(d);
      let newline: number;
      while ((newline = this.buffer.indexOf('\n')) !== -1) {
        const line = this.buffer.slice(0, newline).trim();
        this.buffer = this.buffer.slice(newline + 1);
        if (!line) continue;
        try {
          const message = JSON.parse(line) as Response;
          if (message.id !== undefined) this.pending.get(message.id)?.(message);
        } catch {
          // Not a JSON-RPC frame; the server also writes progress to stderr.
        }
      }
    });
  }

  request(method: string, params?: unknown, timeoutMs = 10_000): Promise<Response> {
    const id = this.nextId++;
    return new Promise((resolveResponse, rejectResponse) => {
      const timer = setTimeout(
        () => rejectResponse(new Error(`No response to ${method} in ${timeoutMs}ms. stderr:\n${this.stderr}`)),
        timeoutMs
      );
      this.pending.set(id, (value) => {
        clearTimeout(timer);
        resolveResponse(value);
      });
      this.child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
    });
  }

  notify(method: string): void {
    this.child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method })}\n`);
  }

  async call(name: string, args: Record<string, unknown>): Promise<string> {
    const response = await this.request('tools/call', { name, arguments: args });
    const text = response.result?.content?.[0]?.text;
    if (typeof text !== 'string') {
      throw new Error(`No text content from ${name}: ${JSON.stringify(response).slice(0, 300)}`);
    }
    return text;
  }

  kill(): void {
    this.child.kill();
  }
}

let client: Client;

beforeAll(async () => {
  expect(
    existsSync(DIST),
    `The built server is missing at ${DIST}. \`test:run\` declares \`dependsOn: ["build"]\`, so ` +
      'if this fails the pipeline changed and every assertion below would have been skipped.'
  ).toBe(true);

  client = new Client();
  await client.request('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'nim-integration-test', version: '0' },
  });
  client.notify('notifications/initialized');
}, 30_000);

afterAll(() => client?.kill());

describe('the built server over stdio', () => {
  it('completes the initialize handshake as nim-ui-mcp', async () => {
    const fresh = new Client();
    try {
      const response = await fresh.request('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'nim-integration-test', version: '0' },
      });
      expect(response.result?.serverInfo?.name).toBe('nim-ui-mcp');
    } finally {
      fresh.kill();
    }
  }, 30_000);

  it('advertises exactly the five tools, each with an input schema', async () => {
    const response = await client.request('tools/list');
    const tools = response.result?.tools ?? [];

    expect(tools.map((t) => t.name).sort()).toEqual([
      'ui_get_component',
      'ui_get_example',
      'ui_get_tokens',
      'ui_list_components',
      'ui_search_components',
    ]);
    for (const tool of tools) {
      expect(tool.inputSchema, `${tool.name} advertises no input schema.`).toBeTruthy();
    }
  });

  it('serves the whole component list, and one category', async () => {
    const all = await client.call('ui_list_components', {});
    expect(all).toContain('# Nim UI Components');
    expect(all).toContain('### Button');

    const commerce = await client.call('ui_list_components', { category: 'commerce' });
    expect(commerce).toContain('# Nim UI Components (commerce)');
    expect(commerce).not.toContain('## Primitives');
  });

  it('serves a component with its source, matched case-insensitively', async () => {
    const output = await client.call('ui_get_component', { name: 'button' });

    expect(output).toContain('# Button');
    expect(output).toContain('## Source Code');
    expect(output, 'The source fence is empty — the file read failed inside the built server.').toContain(
      'buttonVariants'
    );
  });

  it('searches, and says so when nothing matches', async () => {
    expect(await client.call('ui_search_components', { query: 'chart' })).toContain('# Search Results');
    expect(await client.call('ui_search_components', { query: 'zzzznotathing' })).toBe(
      'No components found matching "zzzznotathing"'
    );
  });

  it('serves examples in both forms', async () => {
    expect(await client.call('ui_get_example', { name: 'Button' })).toContain('# Examples for Button');
    expect(await client.call('ui_get_example', { name: 'Button', exampleIndex: 0 })).toContain('```tsx');
  });

  it('serves tokens, and reports the spacing scale it does not have', async () => {
    const all = await client.call('ui_get_tokens', { tokenType: 'all' });

    for (const section of ['## Colors', '## Spacing', '## BorderRadius', '## Typography', '## Animation']) {
      expect(all, `${section} is missing from the token document.`).toContain(section);
    }
    expect(all).toContain('declares no spacing tokens');
    expect(all, 'The colour values did not survive the load.').toMatch(/oklch\(/);
  });

  // The dispatch switch and the catch around it — the parts a unit test of an
  // extracted renderer cannot see at all.

  it('answers an unknown tool with an error instead of dying', async () => {
    expect(await client.call('ui_does_not_exist', {})).toBe('Error: Unknown tool: ui_does_not_exist');
  });

  it('answers a missing component with an error instead of dying', async () => {
    expect(await client.call('ui_get_component', { name: 'Nonesuch' })).toBe(
      'Error: Component "Nonesuch" not found'
    );
  });

  it('rejects arguments the schema forbids, and stays up', async () => {
    const rejected = await client.call('ui_search_components', {});
    expect(rejected).toMatch(/^Error: /);

    // Still serving afterwards — a validation failure must not take the process
    // with it, which is the whole reason the handlers sit inside a try/catch.
    expect(await client.call('ui_list_components', {})).toContain('# Nim UI Components');
  });
});
