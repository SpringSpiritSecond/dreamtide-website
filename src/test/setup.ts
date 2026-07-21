import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

vi.stubEnv('BASE_URL', '/dreamtide-website/');

afterEach(() => {
  cleanup();
});
