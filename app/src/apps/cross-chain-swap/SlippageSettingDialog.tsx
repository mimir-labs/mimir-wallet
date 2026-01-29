// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SlippagePreset, SlippageState } from './types';

import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
} from '@mimir-wallet/ui';
import { useState } from 'react';

import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';

const SLIPPAGE_PRESETS: SlippagePreset[] = ['0.1', '1', '5'];

interface SlippageSettingDialogProps {
  open: boolean;
  value: SlippageState;
  onChange: (slippage: SlippageState) => void;
  onClose: () => void;
}

/**
 * Slippage preset/custom item component
 * Follows exact same pattern as add-proxy DelayItem
 */
function SlippageItem({
  preset,
  isSelected,
  isCustom,
  customValue,
  onSelect,
  onCustomChange,
}: {
  preset?: SlippagePreset;
  isSelected: boolean;
  isCustom?: boolean;
  customValue?: string;
  onSelect: () => void;
  onCustomChange?: (value: string) => void;
}) {
  const isCustomSelected = isSelected && isCustom;

  return (
    <div
      data-selected={isSelected}
      data-custom={isCustomSelected}
      className="bg-secondary text-secondary-foreground data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground flex h-[43px] w-[25%] cursor-pointer items-center justify-center gap-[5px] rounded-full px-2.5 text-sm transition-all data-[custom=true]:w-[50%] data-[custom=true]:flex-[0_0_auto] data-[custom=true]:shrink-0 data-[custom=true]:grow-0"
      onClick={onSelect}
    >
      {isCustomSelected ? (
        <>
          <input
            autoFocus
            type="number"
            min={0}
            max={50}
            value={customValue}
            onChange={onCustomChange && ((e) => onCustomChange(e.target.value))}
            onClick={(e) => e.stopPropagation()}
            className="text-foreground border-divider bg-primary-foreground h-[27px] shrink grow rounded-full border px-2.5 outline-none"
            placeholder="0"
          />
          <span className="text-nowrap">%</span>
        </>
      ) : isCustom ? (
        'Customize'
      ) : (
        `${preset}%`
      )}
    </div>
  );
}

function SlippageSettingDialog({
  open,
  value,
  onChange,
  onClose,
}: SlippageSettingDialogProps) {
  // Local state - synced from props when value changes externally
  const [localValue, setLocalValue] = useState<SlippageState>(value);

  const valueKey = `${value.type}:${value.value}`;
  const localKey = `${localValue.type}:${localValue.value}`;

  if (valueKey !== localKey && !open) {
    setLocalValue(value);
  }

  // Handlers for local state
  const handlePresetSelect = (preset: SlippagePreset) => {
    setLocalValue({ type: 'preset', value: preset });
  };

  const handleCustomSelect = () => {
    // Switch to custom mode, keep current custom value or default to '1'
    setLocalValue((prev) => ({
      type: 'custom',
      value: prev.type === 'custom' ? prev.value : '1',
    }));
  };

  const handleCustomChange = (inputValue: string) => {
    // Validate numeric input
    const numValue = parseFloat(inputValue);

    if (inputValue && (isNaN(numValue) || numValue < 0 || numValue > 50)) {
      return;
    }

    setLocalValue({ type: 'custom', value: inputValue });
  };

  // Handle confirm - call onChange with local value
  const handleConfirm = () => {
    // If custom is selected but empty, default to 1%
    if (localValue.type === 'custom' && !localValue.value) {
      onChange({ type: 'preset', value: '1' });
    } else {
      onChange(localValue);
    }

    onClose();
  };

  // Derived state from local value
  const isPresetSelected = (preset: SlippagePreset) =>
    localValue.type === 'preset' && localValue.value === preset;

  const isCustomSelected = localValue.type === 'custom';

  return (
    <Modal size="sm" onClose={onClose} isOpen={open}>
      <ModalContent>
        <ModalHeader className="justify-center">Max Slippage</ModalHeader>
        <Divider />
        <ModalBody className="gap-y-4">
          {/* Slippage label with tooltip */}
          <div className="flex items-center gap-[5px]">
            <span className="text-sm font-bold">Slippage</span>
            <Tooltip content="Your transaction will revert if the price changes unfavorably by more than this percentage.">
              <IconQuestion className="size-3 cursor-help text-foreground/50" />
            </Tooltip>
          </div>

          {/* Slippage options row */}
          <div className="flex gap-2.5">
            {SLIPPAGE_PRESETS.map((preset) => (
              <SlippageItem
                key={preset}
                preset={preset}
                isSelected={isPresetSelected(preset)}
                onSelect={() => handlePresetSelect(preset)}
              />
            ))}
            <SlippageItem
              isCustom
              isSelected={isCustomSelected}
              customValue={localValue.type === 'custom' ? localValue.value : ''}
              onSelect={handleCustomSelect}
              onCustomChange={handleCustomChange}
            />
          </div>
        </ModalBody>
        <Divider />
        <ModalFooter>
          <Button color="primary" fullWidth onClick={handleConfirm}>
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default SlippageSettingDialog;
