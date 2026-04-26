import { render, screen } from '@testing-library/react';
import App from './App';
import { vi, describe, test, expect } from 'vitest';

// Mock the framer-motion components to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion') as any;
  return {
    ...actual,
    AnimatePresence: ({ children }: any) => <>{children}</>,
    motion: {
      div: ({ children, className }: any) => <div className={className}>{children}</div>,
    },
  };
});

// Mock the Gemini API
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          startChat: () => ({
            sendMessage: vi.fn().mockResolvedValue({
              response: {
                text: () => "This is a mocked response from Democracy Guide.",
              },
            }),
          }),
        };
      }
    }
  };
});

describe('App Component', () => {
  test('renders header correctly', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Democracy Guide/i })).toBeInTheDocument();
  });

  test('renders initial welcome message', () => {
    render(<App />);
    expect(screen.getByText(/How can I help you understand the election process/i)).toBeInTheDocument();
  });
});
