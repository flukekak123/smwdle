import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { GuessInput } from '../../src/components/GuessInput';
import { catalog } from '../../src/lib/index';
import { renderWithIntl } from '../testUtils';

// Pick a real monster from the committed dataset so the test is data-agnostic.
const sample = catalog.getAllMonsters()[0]!;

describe('GuessInput', () => {
  it('suggests matches and emits the chosen monster', () => {
    const onGuess = vi.fn();
    renderWithIntl(<GuessInput guessedIds={[]} disabled={false} onGuess={onGuess} />);

    const input = screen.getByTestId('guess-input');
    fireEvent.change(input, { target: { value: sample.name } });

    const option = screen.getByTestId(`guess-option-${sample.id}`);
    expect(option).toHaveTextContent(sample.name);

    fireEvent.mouseDown(option);
    expect(onGuess).toHaveBeenCalledTimes(1);
    expect(onGuess.mock.calls[0][0].id).toBe(sample.id);
  });

  it('shows element and stars so same-named monsters are distinguishable', () => {
    renderWithIntl(<GuessInput guessedIds={[]} disabled={false} onGuess={vi.fn()} />);
    fireEvent.change(screen.getByTestId('guess-input'), { target: { value: sample.name } });
    const option = screen.getByTestId(`guess-option-${sample.id}`);
    expect(option).toHaveTextContent(sample.element);
    expect(option).toHaveTextContent(`${sample.naturalStars}★`);
  });

  it('excludes already-guessed monsters from suggestions', () => {
    const onGuess = vi.fn();
    renderWithIntl(<GuessInput guessedIds={[sample.id]} disabled={false} onGuess={onGuess} />);
    fireEvent.change(screen.getByTestId('guess-input'), { target: { value: sample.name } });
    expect(screen.queryByTestId(`guess-option-${sample.id}`)).not.toBeInTheDocument();
  });

  it('is disabled when the puzzle is solved', () => {
    renderWithIntl(<GuessInput guessedIds={[]} disabled onGuess={vi.fn()} />);
    expect(screen.getByTestId('guess-input')).toBeDisabled();
  });
});
