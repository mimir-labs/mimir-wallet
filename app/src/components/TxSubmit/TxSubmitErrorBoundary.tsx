// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ErrorInfo, ReactNode } from 'react';
import type { Endpoint } from '@mimir-wallet/polkadot-core';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import Bytes from '@/components/Bytes';
import Hash from '@/components/Hash';
import { Component, useEffect, useRef } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Alert, AlertDescription, AlertTitle, Button, Card } from '@mimir-wallet/ui';

interface ChainInfo {
  metadataHash?: string;
  runtimeChainName?: string;
  metadata?: string;
  specName?: string;
  specVersion?: number;
  chainInfo?: Endpoint;
}

interface TxSubmitErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  chainInfo?: ChainInfo;
}

interface TxSubmitErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class TxSubmitErrorBoundary extends Component<TxSubmitErrorBoundaryProps, TxSubmitErrorBoundaryState> {
  constructor(props: TxSubmitErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<TxSubmitErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('TxSubmitErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      errorInfo
    });

    // Call the optional onError callback
    this.props.onError?.(error, errorInfo);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      const error = this.state.error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      const errorName = error instanceof Error ? error.name : 'Unknown Error';
      const componentStack = this.state.errorInfo?.componentStack;
      const chainInfo = this.props.chainInfo;

      return (
        <div className='bg-content1 border-divider-300 shadow-small relative w-full max-w-4xl overflow-hidden rounded-[20px] border'>
          {/* Abstract graphic design element */}
          <div className='bg-danger-500/10 absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl'></div>
          <div className='bg-danger-500/10 absolute bottom-0 left-0 h-48 w-48 -translate-x-1/3 translate-y-1/3 rounded-full blur-3xl'></div>

          {/* Header */}
          <div className='border-divider-300 relative border-b p-4 pb-6'>
            <h2 className='text-foreground text-2xl font-bold'>Transaction Submission Error</h2>
            <p className='text-foreground/80 mt-2'>
              The transaction submission encountered an unexpected error ({errorName})
            </p>
          </div>

          {/* Content */}
          <div className='relative p-4'>
            <div className='space-y-4'>
              {/* Error Message */}
              <Alert variant='destructive'>
                <AlertTitle>Error Message</AlertTitle>
                <AlertDescription className='font-mono text-xs break-words whitespace-pre-wrap'>
                  {errorMessage}
                </AlertDescription>
              </Alert>

              {/* Chain Information */}
              {chainInfo && (
                <Card className='border-divider-300'>
                  <div className='p-4'>
                    <h3 className='text-foreground mb-3 text-lg font-semibold'>Chain Information</h3>
                    <div className='space-y-3 text-sm'>
                      {chainInfo.chainInfo && (
                        <div className='flex items-center gap-2'>
                          <span className='text-foreground/60 min-w-[120px]'>Network:</span>
                          <span className='text-foreground'>{chainInfo.chainInfo.name}</span>
                        </div>
                      )}

                      {chainInfo.runtimeChainName && (
                        <div className='flex items-center gap-2'>
                          <span className='text-foreground/60 min-w-[120px]'>Runtime Chain:</span>
                          <span className='text-foreground'>{chainInfo.runtimeChainName}</span>
                        </div>
                      )}

                      {chainInfo.specName && (
                        <div className='flex items-center gap-2'>
                          <span className='text-foreground/60 min-w-[120px]'>Spec Name:</span>
                          <span className='text-foreground'>{chainInfo.specName}</span>
                        </div>
                      )}

                      {chainInfo.specVersion && (
                        <div className='flex items-center gap-2'>
                          <span className='text-foreground/60 min-w-[120px]'>Spec Version:</span>
                          <span className='text-foreground'>{chainInfo.specVersion}</span>
                        </div>
                      )}

                      {chainInfo.metadataHash && (
                        <div className='flex items-center gap-2'>
                          <span className='text-foreground/60 min-w-[120px]'>Metadata Hash:</span>
                          <Hash value={chainInfo.metadataHash} withCopy />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Runtime Metadata */}
              {chainInfo?.metadata && (
                <details className='group border-divider-300 overflow-hidden rounded-lg border'>
                  <summary className='bg-content2 hover:bg-content3 flex cursor-pointer items-center px-4 py-3'>
                    <h3 className='text-foreground text-sm font-medium'>Runtime Metadata</h3>
                    <div className='ml-auto flex items-center gap-2'>
                      <Bytes value={chainInfo.metadata} />
                      <ArrowDown className='text-foreground transform transition-transform group-open:rotate-180' />
                    </div>
                  </summary>
                  <div className='bg-content1 rounded-b-lg'>
                    <pre className='text-foreground max-h-64 overflow-x-auto overflow-y-auto p-4 font-mono text-xs break-all'>
                      {chainInfo.metadata}
                    </pre>
                  </div>
                </details>
              )}

              {/* Error Stack */}
              <details className='group border-divider-300 overflow-hidden rounded-lg border' open>
                <summary className='bg-danger-50 flex cursor-pointer items-center px-4 py-3'>
                  <div className='bg-danger-500 mr-2 h-1.5 w-1.5 rounded-full'></div>
                  <h3 className='text-danger-700 text-sm font-medium'>Stack Trace</h3>
                  <div className='ml-auto'>
                    <ArrowDown className='text-danger transform transition-transform group-open:rotate-180' />
                  </div>
                </summary>
                <div className='bg-content1 rounded-b-lg'>
                  <pre className='text-danger max-h-64 overflow-x-auto overflow-y-auto p-4 font-mono text-xs break-words whitespace-pre-wrap'>
                    {errorStack || 'Stack trace not available'}
                  </pre>
                </div>
              </details>

              {/* Component Stack Trace */}
              {componentStack && (
                <details className='group border-divider-300 overflow-hidden rounded-lg border'>
                  <summary className='bg-danger-50 flex cursor-pointer items-center px-4 py-3'>
                    <div className='bg-danger-500 mr-2 h-1.5 w-1.5 rounded-full'></div>
                    <h3 className='text-danger-700 text-sm font-medium'>Component Stack Trace</h3>
                    <div className='ml-auto'>
                      <ArrowDown className='text-danger transform transition-transform group-open:rotate-180' />
                    </div>
                  </summary>
                  <div className='bg-content1 rounded-b-lg'>
                    <pre className='text-danger max-h-64 overflow-x-auto overflow-y-auto p-4 font-mono text-xs break-words whitespace-pre-wrap'>
                      {componentStack}
                    </pre>
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className='flex gap-2 pt-2'>
                <Button variant='bordered' onClick={() => window.location.reload()} className='flex-1'>
                  Reload Page
                </Button>
                <Button variant='bordered' onClick={() => window.history.back()} className='flex-1'>
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component that captures API context and injects it into the error boundary
function TxSubmitErrorBoundaryWrapper({ children, onError }: Omit<TxSubmitErrorBoundaryProps, 'chainInfo'>) {
  const { api, chain, isApiReady } = useApi();
  const chainInfoRef = useRef<ChainInfo | null>(null);

  useEffect(() => {
    if (!isApiReady || !api || !chain) return;

    try {
      const chainInfo: ChainInfo = {
        chainInfo: chain,
        runtimeChainName: api.runtimeChain?.toString(),
        specName: api.runtimeVersion?.specName?.toString(),
        specVersion: api.runtimeVersion?.specVersion?.toNumber()
      };

      // Get metadata hash if available
      if (api.runtimeMetadata) {
        try {
          chainInfo.metadataHash = api.runtimeMetadata.hash.toHex();
          chainInfo.metadata = api.runtimeMetadata.toHex();
        } catch (e) {
          console.warn('Failed to get metadata hash:', e);
        }
      }

      chainInfoRef.current = chainInfo;
    } catch (e) {
      console.warn('Failed to capture chain info:', e);
    }
  }, [api, chain, isApiReady]);

  return (
    <TxSubmitErrorBoundary onError={onError} chainInfo={chainInfoRef.current || undefined}>
      {children}
    </TxSubmitErrorBoundary>
  );
}

export default TxSubmitErrorBoundaryWrapper;
