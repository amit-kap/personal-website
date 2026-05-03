import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Work from './Work';

vi.mock('@/lib/content', () => ({
  getAllWorks: vi.fn(() => [
    { slug: 'project-a', title: 'Project A', year: '2024', description: 'Desc A', thumbnail: '' },
    { slug: 'project-b', title: 'Project B', year: '2023', description: 'Desc B', thumbnail: '' },
  ]),
}));

describe('Work', () => {
  it('renders all work item titles', () => {
    render(<MemoryRouter><Work /></MemoryRouter>);
    expect(screen.getByText('Project A')).toBeInTheDocument();
    expect(screen.getByText('Project B')).toBeInTheDocument();
  });

  it('renders years', () => {
    render(<MemoryRouter><Work /></MemoryRouter>);
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  it('links each card to its work item', () => {
    render(<MemoryRouter><Work /></MemoryRouter>);
    const links = screen.getAllByRole('link');
    expect(links.some(l => l.getAttribute('href') === '/work/project-a')).toBe(true);
  });
});
