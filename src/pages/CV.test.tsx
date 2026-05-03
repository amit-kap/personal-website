import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CV from './CV';

vi.mock('../content/cv.md?raw', () => ({ default: '# Test Name\n\n## Experience\n\nSome experience.' }));

describe('CV', () => {
  it('renders the CV heading', () => {
    render(<CV />);
    expect(screen.getByRole('heading', { name: 'Test Name', level: 1 })).toBeInTheDocument();
  });

  it('renders a section heading', () => {
    render(<CV />);
    expect(screen.getByRole('heading', { name: 'Experience', level: 2 })).toBeInTheDocument();
  });
});
