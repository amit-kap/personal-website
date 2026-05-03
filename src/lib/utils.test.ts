import { describe, it, expect } from 'vitest';
import { slugFromPath } from './utils';

describe('slugFromPath', () => {
  it('extracts slug from a works glob path', () => {
    expect(slugFromPath('../content/works/project-one/index.json')).toBe('project-one');
  });

  it('handles folder names with dashes', () => {
    expect(slugFromPath('../content/works/my-cool-project/01.jpg')).toBe('my-cool-project');
  });

  it('returns empty string for unrecognised paths', () => {
    expect(slugFromPath('some/other/path.json')).toBe('');
  });
});
