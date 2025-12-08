// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '../lib/utils.js';

export interface TabItem {
  key: string;
  label: React.ReactNode;
}

export interface TabsProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  tabs: TabItem[];
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelectionChange?: (key: string) => void;
  variant?: 'pill' | 'underlined';
}

// Pill variant - clip-path sliding highlight effect
function PillTabs({
  tabs,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  className,
  ...props
}: TabsProps) {
  const [activeKey, setActiveKey] = useState(
    selectedKey ?? defaultSelectedKey ?? tabs[0]?.key,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Sync with controlled selectedKey
  useEffect(() => {
    if (selectedKey !== undefined) {
      queueMicrotask(() => {
        setActiveKey(selectedKey);
      });
    }
  }, [selectedKey]);

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      const container = containerRef.current;
      const activeTabElement = activeTabRef.current;

      if (container && activeTabElement) {
        const { offsetLeft, offsetWidth } = activeTabElement;

        // 10px is the padding (p-2.5 = 10px)
        const clipLeft = offsetLeft + 10;
        const clipRight = offsetLeft + offsetWidth + 10;

        container.style.clipPath = `inset(0 ${Number(
          100 - (clipRight / container.offsetWidth) * 100,
        ).toFixed()}% 0 ${Number((clipLeft / container.offsetWidth) * 100).toFixed()}% round 10px)`;
      }
    });
  }, [activeKey, tabs]);

  const handleTabClick = (key: string) => {
    if (selectedKey === undefined) {
      setActiveKey(key);
    }

    onSelectionChange?.(key);
  };

  return (
    <div
      className={cn(
        'bg-background relative flex w-fit flex-col items-center rounded-[20px] p-2.5 shadow-md',
        className,
      )}
      {...props}
    >
      <div
        ref={containerRef}
        className="absolute z-10 w-full overflow-hidden [clip-path:inset(0px_75%_0px_0%_round_10px)] [transition:clip-path_0.25s_ease]"
      >
        <div className="bg-primary relative flex w-full justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className="text-primary-foreground flex h-8 items-center rounded-[10px] px-3 text-sm font-bold"
              tabIndex={-1}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex w-full justify-center">
        {tabs.map((tab) => {
          const isActive = activeKey === tab.key;

          return (
            <button
              key={tab.key}
              ref={isActive ? activeTabRef : null}
              onClick={() => handleTabClick(tab.key)}
              className="text-primary/50 flex h-8 cursor-pointer items-center rounded-[10px] px-3 text-sm font-bold"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Underlined variant - hover highlight + bottom indicator
function UnderlinedTabs({
  tabs,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  className,
  ...props
}: TabsProps) {
  const [activeKey, setActiveKey] = useState(
    selectedKey ?? defaultSelectedKey ?? tabs[0]?.key,
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: '0px', width: '0px' });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Sync with controlled selectedKey
  useEffect(() => {
    if (selectedKey !== undefined) {
      queueMicrotask(() => {
        setActiveKey(selectedKey);
      });
    }
  }, [selectedKey]);

  // Update hover style
  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = tabRefs.current[hoveredIndex];

      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement;

        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex]);

  // Update active indicator style
  useEffect(() => {
    requestAnimationFrame(() => {
      const activeIndex = tabs.findIndex((tab) => tab.key === activeKey);
      const activeElement = tabRefs.current[activeIndex >= 0 ? activeIndex : 0];

      if (activeElement) {
        const { offsetLeft, offsetWidth } = activeElement;

        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    });
  }, [activeKey, tabs]);

  const handleTabClick = (key: string) => {
    if (selectedKey === undefined) {
      setActiveKey(key);
    }

    onSelectionChange?.(key);
  };

  return (
    <div className={cn('relative', className)} {...props}>
      <div className="relative">
        {/* Hover Highlight */}
        <div
          className="bg-primary/10 absolute top-0 h-[30px] rounded-md transition-all duration-300 ease-out"
          style={{
            ...hoverStyle,
            opacity: hoveredIndex !== null ? 1 : 0,
          }}
        />

        {/* Active Indicator - underline */}
        <div
          className="bg-primary absolute -bottom-1.5 h-0.5 transition-all duration-300 ease-out"
          style={activeStyle}
        />

        {/* Tabs */}
        <div className="relative flex items-center space-x-1.5">
          {tabs.map((tab, index) => {
            const isActive = activeKey === tab.key;

            return (
              <button
                key={tab.key}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                className={cn(
                  'h-[30px] cursor-pointer px-3 text-sm font-bold transition-colors duration-300',
                  isActive ? 'text-primary' : 'text-foreground/30',
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleTabClick(tab.key)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Tabs({ variant = 'pill', ...props }: TabsProps) {
  if (variant === 'underlined') {
    return <UnderlinedTabs {...props} />;
  }

  return <PillTabs {...props} />;
}

Tabs.displayName = 'Tabs';

export { Tabs };
