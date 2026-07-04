import { describe, it, expect } from 'vitest';
import { render, screen, userEvent } from '../test/test-utils';
import { PasswordInput } from './password-input';

describe('PasswordInput', () => {
  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<PasswordInput placeholder="Password" />);

    const input = screen.getByPlaceholderText('Password');
    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(input).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(input).toHaveAttribute('type', 'password');
  });
});
