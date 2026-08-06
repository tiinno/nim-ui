/**
 * A minimal JSON-RPC client that speaks to a built server over stdio.
 *
 * Extracted from `server.integration.test.ts` so `packaged-layout.test.ts` can
 * drive a *different copy* of the same binary. Both tests spawn `dist/index.js`
 * and talk the protocol a real client talks; they differ only in which copy
 * they point at, which is exactly the difference NIMUI-93 turned out to hinge
 * on.
 *
 * Not shipped: nothing in `src/index.ts` imports it, so tsup never bundles it,
 * and the package's `files` allowlist covers `dist` only.
 *
 * Correlation is by request id with a real timeout, not by sleeping. Fixed
 * sleeps are what make process tests flaky on a loaded CI machine.
 */
import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';

export interface Response {
  id?: number;
  result?: {
    content?: Array<{ type: string; text: string }>;
    tools?: Array<{ name: string; inputSchema: unknown }>;
    serverInfo?: { name: string; version?: string };
  };
  error?: { message: string };
}

export class StdioClient {
  private child: ChildProcessWithoutNullStreams;
  private buffer = '';
  private pending = new Map<number, (value: Response) => void>();
  private nextId = 1;
  stderr = '';

  constructor(entry: string) {
    this.child = spawn(process.execPath, [entry], { stdio: ['pipe', 'pipe', 'pipe'] });
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
        () =>
          rejectResponse(
            new Error(`No response to ${method} in ${timeoutMs}ms. stderr:\n${this.stderr}`)
          ),
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

  /** The initialize handshake every client performs before calling a tool. */
  async handshake(): Promise<Response> {
    const response = await this.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'nim-integration-test', version: '0' },
    });
    this.notify('notifications/initialized');
    return response;
  }

  kill(): void {
    this.child.kill();
  }
}
