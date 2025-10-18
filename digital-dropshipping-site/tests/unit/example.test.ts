import { render, screen } from '@testing-library/react';
import ExampleComponent from '../../src/components/ExampleComponent'; // Adjust the import based on your actual component

describe('ExampleComponent', () => {
  test('renders the component correctly', () => {
    render(<ExampleComponent />);
    const element = screen.getByText(/example text/i); // Replace with actual text to test
    expect(element).toBeInTheDocument();
  });
});