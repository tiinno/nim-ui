import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { FileUpload } from './file-upload';

describe('FileUpload', () => {
  it('gives the disabled dropzone a not-allowed cursor, not a pointer', () => {
    // The dropzone composes an unconditional `cursor-pointer` with a conditional
    // `cursor-not-allowed`. Both used to ship, and cursor-pointer is emitted later
    // in the stylesheet, so a disabled dropzone showed a pointer. cn() now resolves
    // the conflict in favour of the last-written class.
    const { container } = render(<FileUpload disabled />);
    const dropzone = container.querySelector('label') as HTMLLabelElement;

    expect(dropzone).toHaveClass('cursor-not-allowed');
    expect(dropzone).not.toHaveClass('cursor-pointer');
    expect(dropzone).toHaveClass('opacity-50');
  });

  it('accepts selected files', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const file = new File(['invoice'], 'invoice.pdf', {
      type: 'application/pdf',
    });

    const { container } = render(
      <FileUpload accept="application/pdf" onChange={handleChange} />
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    expect(handleChange).toHaveBeenCalledWith([file]);
    expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
  });

  it('rejects files larger than maxSize', async () => {
    const user = userEvent.setup();
    const handleReject = vi.fn();
    const file = new File(['too large'], 'large.txt', {
      type: 'text/plain',
    });

    const { container } = render(
      <FileUpload maxSize={2} onReject={handleReject} />
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    expect(handleReject).toHaveBeenCalledWith([
      { file, reason: 'max-size' },
    ]);
  });

  it('removes files from the selected list', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const file = new File(['invoice'], 'invoice.pdf', {
      type: 'application/pdf',
    });

    render(<FileUpload value={[file]} onChange={handleChange} />);

    await user.click(screen.getByRole('button', { name: /remove invoice.pdf/i }));

    expect(handleChange).toHaveBeenCalledWith([]);
  });
});
