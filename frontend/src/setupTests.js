import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Sin globals de Vitest, Testing Library no limpia el DOM automáticamente entre tests.
afterEach(() => {
  cleanup();
});
