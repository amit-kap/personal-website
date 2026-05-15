import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Work from './Work';

vi.mock('../lib/content', () => ({
  getCoverImage: () => undefined,
}));

describe('Work', () => {
  it('renders project cards', () => {
    render(
      <MemoryRouter>
        <Work />
      </MemoryRouter>
    );
    expect(screen.getByText('Onyxia Cyber')).toBeInTheDocument();
    expect(screen.getByText('Veriti')).toBeInTheDocument();
    expect(screen.getByText('Check Point')).toBeInTheDocument();
  });

  it('renders nav links', () => {
    render(
      <MemoryRouter>
        <Work />
      </MemoryRouter>
    );
    expect(screen.getAllByText('Work').length).toBeGreaterThan(0);
    expect(screen.getAllByText('About').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Playground').length).toBeGreaterThan(0);
  });
});
