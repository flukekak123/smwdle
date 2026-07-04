import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { HintCell } from '../../src/components/HintCell';
import { renderWithIntl } from '../testUtils';

describe('HintCell', () => {
  it('renders value plus an accessible label with status (not color alone)', () => {
    renderWithIntl(
      <HintCell attribute={{ key: 'element', status: 'match', guessValue: 'Fire' }} />,
    );
    const cell = screen.getByTestId('hint-cell-element');
    expect(cell).toBeInTheDocument();
    expect(cell.getAttribute('aria-label')).toContain('Fire');
    expect(cell.getAttribute('aria-label')).toContain('match');
  });

  it('shows directional status for stars', () => {
    renderWithIntl(
      <HintCell attribute={{ key: 'naturalStars', status: 'higher', guessValue: '3★' }} />,
    );
    const cell = screen.getByTestId('hint-cell-naturalStars');
    expect(cell.getAttribute('aria-label')).toContain('higher');
  });
});
