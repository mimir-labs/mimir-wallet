// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';

import { Button, Card, CardContent, CardHeader, cn, Input } from '@mimir-wallet/ui';

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

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function Select({ value, onChange, options }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
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
import { AI_MODELS, AiConfig, AiProvider } from '../../types.js';

interface AiSettingsProps {
  className?: string;
}

const providerOptions = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'claude', label: 'Claude (Anthropic)' },
  { value: 'kimi', label: 'Kimi (Moonshot)' }
];

const defaultSystemPrompt = `You are a helpful AI assistant for Mimir Wallet. Help users with wallet operations, multi-signature management, and Polkadot ecosystem questions.`;

export default function AiSettings({ className }: AiSettingsProps) {
  const { config, setConfig } = useAiStore();
  const [localConfig, setLocalConfig] = useState<AiConfig>(config);

  const handleSave = () => {
    setConfig(localConfig);
  };

  const handleProviderChange = (provider: string) => {
    const firstModel = AI_MODELS[provider as AiProvider]?.[0]?.id || '';

    setLocalConfig({
      ...localConfig,
      provider: provider as AiProvider,
      model: firstModel
    });
  };

  const updateConfig = (field: keyof AiConfig, value: any) => {
    setLocalConfig((prev) => ({ ...prev, [field]: value }));
  };

  const modelOptions =
    AI_MODELS[localConfig.provider]?.map((model) => ({
      value: model.id,
      label: model.name
    })) || [];

  return (
    <div className={cn('max-w-2xl space-y-6', className)}>
      {/* 1. Model Provider Selection */}
      <Card>
        <CardHeader>
          <h3 className='text-base font-semibold'>AI Provider</h3>
        </CardHeader>
        <CardContent>
          <Label>Choose Provider</Label>
          <Select value={localConfig.provider} onChange={handleProviderChange} options={providerOptions} />
        </CardContent>
      </Card>

      {/* 2. API Key */}
      <Card>
        <CardHeader>
          <h3 className='text-base font-semibold'>API Key</h3>
        </CardHeader>
        <CardContent>
          <Label>API Key</Label>
          <Input
            type='password'
            value={localConfig.apiKey}
            onChange={(e) => updateConfig('apiKey', e.target.value)}
            placeholder='Enter your API key'
          />
        </CardContent>
      </Card>

      {/* 3. API Base URL */}
      <Card>
        <CardHeader>
          <h3 className='text-base font-semibold'>API Base URL</h3>
        </CardHeader>
        <CardContent>
          <Label>Base URL (optional)</Label>
          <Input
            type='url'
            value={localConfig.baseURL || ''}
            onChange={(e) => updateConfig('baseURL', e.target.value)}
            placeholder='https://api.openai.com/v1 (leave empty for default)'
          />
        </CardContent>
      </Card>

      {/* 4. Model Selection */}
      <Card>
        <CardHeader>
          <h3 className='text-base font-semibold'>Model Selection</h3>
        </CardHeader>
        <CardContent>
          <Label>Choose Model</Label>
          <Select value={localConfig.model} onChange={(value) => updateConfig('model', value)} options={modelOptions} />
        </CardContent>
      </Card>

      {/* 5. Parameters */}
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
          {localConfig.topK && (
            <Slider
              label='Top K'
              value={localConfig.topK}
              onChange={(value) => updateConfig('topK', value)}
              min={1}
              max={100}
              step={1}
            />
          )}
        </CardContent>
      </Card>

      {/* 6. System Prompt */}
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
