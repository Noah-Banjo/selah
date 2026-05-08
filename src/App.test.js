import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Selah hero tagline', () => {
  render(<App />);
  const tagline = screen.getByText(/explore the biblical world/i);
  expect(tagline).toBeInTheDocument();
});
