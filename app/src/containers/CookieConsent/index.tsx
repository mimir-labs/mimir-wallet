// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CookieConsentConfig, CookieConsentState, CookiePreference } from './types';

import { COOKIE_CONSENT_STORAGE_KEY } from '@/constants';
import React, { useCallback, useState } from 'react';

import { useLocalStore } from '@mimir-wallet/service';
import { Button, cn } from '@mimir-wallet/ui';

import { PreferencePopover } from './PreferencePopover';

interface CookieConsentProps extends CookieConsentConfig {
  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * Default cookie consent state
 */
const getDefaultConsentState = (): CookieConsentState => ({
  preference: null,
  isVisible: true,
  lastUpdated: Date.now()
});

/**
 * CookieConsent component displays a privacy terms banner with cookie preference management
 */
export const CookieConsent: React.FC<CookieConsentProps> = ({
  privacyPolicyUrl = '/privacy.html',
  termsUrl = '/terms.html',
  privacyText,
  onPreferenceChange,
  initialVisible,
  className
}) => {
  // Use project's useLocalStore hook for persistent storage
  const [consentState, setConsentState] = useLocalStore<CookieConsentState>(
    COOKIE_CONSENT_STORAGE_KEY,
    getDefaultConsentState()
  );

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Show banner based on visibility state, not just preference
  const shouldShowBanner = initialVisible !== undefined ? initialVisible : consentState.isVisible;

  // Handle preference change
  const handlePreferenceChange = useCallback(
    (preference: CookiePreference) => {
      const newState: CookieConsentState = {
        ...consentState,
        preference,
        isVisible: false, // Keep visible to show selection and allow changes
        lastUpdated: Date.now()
      };

      setConsentState(newState);
      onPreferenceChange?.(preference);
    },
    [consentState, setConsentState, onPreferenceChange]
  );

  // Default privacy text (matching Figma design)
  const defaultPrivacyText = (
    <>
      This website utilizes technologies such as cookies to enable essential site functionality, as well as for
      analytics, personalization, and targeted advertising. To learn more, view{' '}
      <a
        href={termsUrl}
        className='text-primary underline hover:no-underline'
        target='_blank'
        rel='noopener noreferrer'
      >
        terms
      </a>{' '}
      and{' '}
      <a
        href={privacyPolicyUrl}
        className='text-primary underline hover:no-underline'
        target='_blank'
        rel='noopener noreferrer'
      >
        privacy
      </a>
    </>
  );

  // Don't render if banner shouldn't be shown
  if (!shouldShowBanner) {
    return null;
  }

  return (
    <div
      className={cn('sticky bottom-4 z-50', 'mx-4 mt-auto', 'bg-secondary shadow-medium rounded-[20px] p-4', className)}
    >
      <div className='flex items-start gap-4'>
        {/* Content */}
        <div className='flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='text-foreground flex-1 text-sm'>
            {privacyText || defaultPrivacyText}
            {consentState.preference && (
              <div className='text-success mt-2 text-xs'>
                Current preference: {consentState.preference === 'all' ? 'All cookies' : 'Only essential cookies'}
              </div>
            )}
          </div>

          <div className='flex-shrink-0'>
            <PreferencePopover
              selectedPreference={consentState.preference}
              onPreferenceChange={handlePreferenceChange}
              open={isPopoverOpen}
              onOpenChange={setIsPopoverOpen}
            >
              <Button variant='bordered' color='primary' radius='full'>
                {consentState.preference ? 'Change Preference' : 'Manage Preference'}
              </Button>
            </PreferencePopover>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
