import '@testing-library/jest-dom';

// jsdom has no matchMedia; GSAP's ScrollTrigger calls it at plugin registration.
// Reduced-motion queries report true so components skip entrance animations
// through their real production gate and stay queryable in tests.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
