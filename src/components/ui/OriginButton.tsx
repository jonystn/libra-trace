import type { ButtonHTMLAttributes, ReactNode } from 'react';

type LibraButtonVariant = 'primary' | 'secondary';

interface OriginButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: LibraButtonVariant;
  iconOnly?: boolean;
  pressed?: boolean;
  children: ReactNode;
}


export function OriginButton({
  variant = 'secondary',
  iconOnly = false,
  pressed = false,
  className = '',
  type = 'button',
  children,
  ...props
}: OriginButtonProps) {
  return (
    <button
      type={type}
      className={[
        'btn',
        variant === 'primary' ? 'btn-primary' : 'btn-secondary',
        iconOnly ? 'btn-icon-only' : '',
        pressed ? 'btn-pressed' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
