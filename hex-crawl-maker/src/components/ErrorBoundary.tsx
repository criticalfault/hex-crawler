import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const ErrorContainer = styled.div`
  padding: 20px;
  margin: 20px;
  border: 2px solid #ff6b6b;
  border-radius: 8px;
  background-color: #fff5f5;
  color: #c53030;
`;

const ErrorTitle = styled.h2`
  margin: 0 0 16px 0;
  color: #c53030;
  font-size: 1.5rem;
`;

const ErrorMessage = styled.p`
  margin: 0 0 16px 0;
  font-weight: 500;
`;

const ErrorDetails = styled.details`
  margin-top: 16px;
  
  summary {
    cursor: pointer;
    font-weight: 500;
    margin-bottom: 8px;
    
    &:hover {
      color: #9c2626;
    }
  }
`;

const ErrorStack = styled.pre`
  background-color: #fed7d7;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
`;

const RetryButton = styled.button`
  background-color: #3182ce;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-right: 8px;
  
  &:hover {
    background-color: #2c5aa0;
  }
  
  &:active {
    background-color: #2a4d8d;
  }
`;

const ReloadButton = styled.button`
  background-color: #38a169;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: #2f855a;
  }
  
  &:active {
    background-color: #276749;
  }
`;

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    if (import.meta.env.PROD) {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorContainer>
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorMessage>
            The application encountered an unexpected error. You can try to continue
            by clicking "Retry" or reload the page to start fresh.
          </ErrorMessage>
          
          <div>
            <RetryButton onClick={this.handleRetry}>
              Retry
            </RetryButton>
            <ReloadButton onClick={this.handleReload}>
              Reload Page
            </ReloadButton>
          </div>

          {this.state.error && (
            <ErrorDetails>
              <summary>Error Details</summary>
              <ErrorMessage>
                <strong>Error:</strong> {this.state.error.message}
              </ErrorMessage>
              {this.state.errorInfo && (
                <ErrorStack>
                  {this.state.errorInfo.componentStack}
                </ErrorStack>
              )}
              {this.state.error.stack && (
                <ErrorStack>
                  {this.state.error.stack}
                </ErrorStack>
              )}
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;