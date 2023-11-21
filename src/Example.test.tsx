import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Example } from './Example';

it('renders correctly', () => {
  render(<Example text="Clicked this many times" />);

  expect(screen.getByText(/Clicked this many times 0/)).toBeInTheDocument();
});

it('should update when clicked', () => {
  render(<Example text="Clicked this many times" />);

  expect(screen.getByText(/Clicked this many times 0/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button')); // trigger click event on the element

  expect(screen.getByText(/Clicked this many times 1/)).toBeInTheDocument();
});
