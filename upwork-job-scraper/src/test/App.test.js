import { render, screen } from '@testing-library/react';
import Popup from '../main/popup/Popup';

test('renders learn react link', () => {
  render(<Popup />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
