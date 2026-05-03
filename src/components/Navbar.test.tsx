import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';

function renderNavbar(path = '/work') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Navbar siteName="AK" />
    </MemoryRouter>
  );
}

describe('Navbar', () => {
  it('renders the site name', () => {
    renderNavbar();
    expect(screen.getByText('AK')).toBeInTheDocument();
  });

  it('renders CV and Work links', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: 'CV' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Work' })).toBeInTheDocument();
  });

  it('marks the active link', () => {
    renderNavbar('/cv');
    const cvLink = screen.getByRole('link', { name: 'CV' });
    expect(cvLink).toHaveAttribute('aria-current', 'page');
  });
});
