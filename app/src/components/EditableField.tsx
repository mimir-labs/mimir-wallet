// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconEdit from '@/assets/svg/icon-edit.svg?react';
import React, { useEffect, useRef, useState } from 'react';

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onEditStart?: () => void;
  onEditEnd?: () => void;
  multiline?: boolean;
  maxLength?: number;
  pattern?: string;
  validator?: (value: string) => boolean;
}

function EditableField({
  value,
  onChange,
  placeholder,
  className = '',
  inputClassName = '',
  iconClassName = '',
  icon,
  disabled = false,
  onEditStart,
  onEditEnd,
  multiline = false,
  maxLength,
  pattern,
  validator
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    onEditStart?.();
  };

  const validateValue = (val: string): boolean => {
    if (validator) {
      return validator(val);
    }

    if (pattern) {
      const regex = new RegExp(pattern);

      return regex.test(val);
    }

    return true;
  };

  const handleSave = () => {
    if (validateValue(localValue)) {
      onChange(localValue);
      setIsEditing(false);
      setError(false);
      onEditEnd?.();
    } else {
      setError(true);
    }
  };

  const handleCancel = () => {
    setLocalValue(value);
    setIsEditing(false);
    setError(false);
    onEditEnd?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    if (!maxLength || newValue.length <= maxLength) {
      setLocalValue(newValue);
      setError(!validateValue(newValue));
    }
  };

  const defaultIcon = (
    <IconEdit
      className={`text-primary/50 hover:text-primary h-4 w-4 shrink-0 cursor-pointer transition-colors ${
        disabled ? 'cursor-not-allowed opacity-30' : ''
      } ${iconClassName}`}
      onClick={handleStartEdit}
    />
  );

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';

    return (
      <InputComponent
        ref={inputRef as any}
        type='text'
        value={localValue}
        onChange={handleChange}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        pattern={pattern}
        className={`h-[20px] bg-transparent outline-none ${error ? 'text-danger' : ''} ${inputClassName}`}
        disabled={disabled}
      />
    );
  }

  return (
    <div className={`flex items-center gap-[5px] leading-[20px] ${className}`}>
      <span className={`${disabled ? 'opacity-50' : ''} ${error ? 'text-danger' : ''}`}>{value || placeholder}</span>
      {!disabled && (icon ? <span onClick={handleStartEdit}>{icon}</span> : defaultIcon)}
    </div>
  );
}

export default React.memo(EditableField);
