import { render, screen, fireEvent } from '@testing-library/react';
import BillUploader from '../components/BillUploader';

test('renders upload area and button', () => {
  render(<BillUploader onResult={() => {}} onLoading={() => {}} />);
  expect(screen.getByText(/Upload Your Bill/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Analyze My Bill/i })).toBeDisabled();
});

test('enables button when file selected', () => {
  render(<BillUploader onResult={() => {}} onLoading={() => {}} />);
  const input = screen.getByLabelText(/Select bill file/i);
  fireEvent.change(input, { target: { files: [new File(['test'], 'test.pdf', { type: 'application/pdf' })] } });
  expect(screen.getByRole('button', { name: /Analyze My Bill/i })).toBeEnabled();
});
