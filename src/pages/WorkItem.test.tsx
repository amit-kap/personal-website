import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import WorkItem from './WorkItem';

vi.mock('@/lib/content', () => ({
  getWorkDetail: vi.fn((slug: string) => {
    if (slug === 'project-a') {
      return {
        slug: 'project-a',
        title: 'Project A',
        year: '2024',
        description: 'A great project.',
        thumbnail: '/img/01.jpg',
        images: ['/img/01.jpg', '/img/02.jpg'],
      };
    }
    return undefined;
  }),
}));

function renderWorkItem(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/work/${slug}`]}>
      <Routes>
        <Route path="/work/:slug" element={<WorkItem />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('WorkItem', () => {
  it('renders the project title', () => {
    renderWorkItem('project-a');
    expect(screen.getByRole('heading', { name: 'Project A' })).toBeInTheDocument();
  });

  it('renders year and description', () => {
    renderWorkItem('project-a');
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('A great project.')).toBeInTheDocument();
  });

  it('renders all images', () => {
    renderWorkItem('project-a');
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
  });

  it('shows not found for unknown slug', () => {
    renderWorkItem('unknown');
    expect(screen.getByText(/not found/i)).toBeInTheDocument();
  });
});
