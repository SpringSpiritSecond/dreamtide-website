import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./hooks/useLatestRelease', () => ({
  useLatestRelease: () => ({ status: 'unavailable', reason: 'no-release' }),
}));

describe('App', () => {
  it('introduces Dreamtide and exposes the primary page landmarks', () => {
    render(<App />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: '梦醒以后，仍有迹可循',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('presents the four real product capabilities and tutorial steps', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', {
        name: '把散落的片段，慢慢收回来',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '趁记忆还清晰，写下梦' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '梦留在你的设备里' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '从写下第一场梦开始' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });
});
