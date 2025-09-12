// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';

import { Button, Card, CardContent, CardHeader, cn } from '@mimir-wallet/ui';

interface LabelProps {
  children: React.ReactNode;
}

function Label({ children }: LabelProps) {
  return <label className='mb-2 block text-sm font-medium'>{children}</label>;
}

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

function Textarea({ value, onChange, placeholder, rows = 4 }: TextareaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
    />
  );
}

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
}

function Slider({ value, onChange, min, max, step, label }: SliderProps) {
  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium'>{label}</span>
        <span className='text-sm text-gray-500'>{value}</span>
      </div>
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className='w-full'
      />
    </div>
  );
}

import { useAiStore } from '../../store/aiStore.js';
import { AiConfig } from '../../types.js';

interface AiSettingsProps {
  className?: string;
}

const defaultSystemPrompt = `You are a helpful AI assistant for Mimir Wallet. Help users with wallet operations, multi-signature management, and Polkadot ecosystem questions.`;

export default function AiSettings({ className }: AiSettingsProps) {
  const { config, setConfig } = useAiStore();
  const [localConfig, setLocalConfig] = useState<AiConfig>(config);

  const handleSave = () => {
    setConfig(localConfig);
  };

  const updateConfig = (field: keyof AiConfig, value: any) => {
    setLocalConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={cn('max-w-2xl space-y-6', className)}>
      <Card>
        <CardHeader>
          <h3 className='text-base font-semibold'>Model Parameters</h3>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Slider
            label='Temperature'
            value={localConfig.temperature}
            onChange={(value) => updateConfig('temperature', value)}
            min={0}
            max={1}
            step={0.1}
          />
          <Slider
            label='Top P'
            value={localConfig.topP}
            onChange={(value) => updateConfig('topP', value)}
            min={0.1}
            max={1}
            step={0.1}
          />
          <Slider
            label='Top K'
            value={localConfig.topK}
            onChange={(value) => updateConfig('topK', value)}
            min={1}
            max={100}
            step={1}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className='text-base font-semibold'>System Prompt</h3>
        </CardHeader>
        <CardContent>
          <Label>System Instructions</Label>
          <Textarea
            value={localConfig.systemPrompt}
            onChange={(value) => updateConfig('systemPrompt', value)}
            placeholder={defaultSystemPrompt}
            rows={4}
          />
          <Button
            variant='ghost'
            size='sm'
            onClick={() => updateConfig('systemPrompt', defaultSystemPrompt)}
            className='mt-2'
          >
            Reset Default
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className='pt-4'>
        <Button onClick={handleSave} className='w-full'>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
