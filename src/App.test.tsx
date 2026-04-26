import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { vi, describe, test, expect, beforeEach } from 'vitest';

// Mock the framer-motion components to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion') as Record<string, unknown>;
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
    },
  };
});

// Mock the Gemini API
const mockSendMessage = vi.fn().mockResolvedValue({
  response: {
    text: () => "This is a mocked response from Democracy Guide.",
  },
});

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          startChat: () => ({
            sendMessage: mockSendMessage,
          }),
        };
      }
    }
  };
});

// Mock Firebase Analytics
vi.mock('./firebase', () => ({
  analytics: {},
  isFirebaseConfigured: true
}));

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(),
  logEvent: vi.fn(),
  isSupported: vi.fn().mockResolvedValue(true)
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders header correctly', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Democracy Guide/i })).toBeInTheDocument();
  });

  test('renders initial welcome message', () => {
    render(<App />);
    expect(screen.getByText(/How can I help you understand the election process/i)).toBeInTheDocument();
  });

  test('allows typing and sending a message', async () => {
    render(<App />);
    
    const textarea = screen.getByPlaceholderText(/Ask Democracy Guide/i);
    const sendButton = screen.getByLabelText(/Send message/i);

    fireEvent.change(textarea, { target: { value: 'How do I register?' } });
    fireEvent.click(sendButton);

    expect(screen.getByText('How do I register?')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/This is a mocked response/i)).toBeInTheDocument();
    });
  });

  test('toggles dark mode', () => {
    render(<App />);
    const themeToggle = screen.getByLabelText(/Toggle dark mode/i);
    
    // Initially dark (based on state)
    expect(document.body.classList.contains('dark')).toBe(true);
    
    fireEvent.click(themeToggle);
    expect(document.body.classList.contains('dark')).toBe(false);
  });
});
