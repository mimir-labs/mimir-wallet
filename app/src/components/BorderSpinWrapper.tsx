// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

interface BorderSpinWrapperProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

/**
 * A wrapper component that displays a spinning border animation.
 * Used to indicate loading/connecting state.
 *
 * Note: Requires @property --border-angle and @keyframes border-spin
 * to be defined in global CSS (style.css)
 */
export function BorderSpinWrapper({ children, loading = true, className = '', ...props }: BorderSpinWrapperProps) {
  return (
    <div
      {...props}
      className={`relative shrink-0 rounded-[10px] p-0.5 ${className}`}
      style={{
        background: loading
          ? `conic-gradient(
              from var(--border-angle, 0deg),
              hsl(var(--heroui-primary)) 0%,
              hsl(var(--heroui-primary) / 0.3) 25%,
              transparent 50%,
              hsl(var(--heroui-primary) / 0.3) 75%,
              hsl(var(--heroui-primary)) 100%
            )`
          : 'transparent',
        animation: loading ? 'border-spin 1.5s linear infinite' : 'none'
      }}
    >
      <div className='bg-background rounded-lg'>{children}</div>
    </div>
  );
}
