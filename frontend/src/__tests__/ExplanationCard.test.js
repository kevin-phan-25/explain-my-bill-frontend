import { render, screen } from '@testing-library/react';
import ExplanationCard from '../components/ExplanationCard';

const mockResult = {
  isPaid: false,
  pages: [{ page: 1, explanation: "Test explanation" }],
  fullExplanation: "Full test"
};

test('shows teaser and upgrade button for free user', () => {
  render(<ExplanationCard result={mockResult} onUpgrade={() => {}} />);
  expect(screen.getByText(/teaser/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Unlock Full Explanation/i })).toBeInTheDocument();
});
