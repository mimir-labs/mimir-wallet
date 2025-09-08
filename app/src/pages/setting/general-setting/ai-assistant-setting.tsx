// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { AiSettings } from '@mimir-wallet/ai-assistant';

function AiAssistantSetting() {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='mb-2 text-lg font-semibold'>AI Assistant</h2>
        <p className='text-muted-foreground mb-6 text-sm'>
          Configure AI assistant behavior including model parameters (temperature, top-p, top-k) and system prompts for
          personalized assistance.
        </p>
      </div>

      <AiSettings />
    </div>
  );
}

export default AiAssistantSetting;
