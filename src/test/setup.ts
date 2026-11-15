import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

vi.stubEnv('BASE_URL', '/dreamtide-website/');
vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);
vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

afterEach(() => {
  cleanup();
});
