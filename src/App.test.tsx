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
    expect(screen.getByRole('heading', { level: 1, name: '潮落有迹，梦醒留痕。' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('presents product capabilities, tutorial, privacy and FAQ', () => {
    const { container } = render(<App />);
    expect(screen.getByRole('heading', { name: '把散落的片段，慢慢收回来' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '写下并保存一场梦' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '你的梦，首先属于你。' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '四步，开始保存你的梦境档案' })).toBeInTheDocument();
    expect(container.querySelectorAll('.tutorial-step')).toHaveLength(4);
    expect(container.querySelectorAll('.faq details')).toHaveLength(4);
  });

  it('explains both privacy browsing modes beside their videos', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { name: '决定哪些内容被看见' });
    const article = heading.closest('article');
    expect(article?.querySelector('video[src$="/media/不谈人间事.mp4"]')).toBeInTheDocument();
    expect(article?.querySelector('video[src$="/media/春梦了无痕.mp4"]')).toBeInTheDocument();
    expect(screen.getByText(/隐藏原名或显示化名/)).toBeVisible();
  });
});
