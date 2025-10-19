import React from 'react';
import Button from './Button';

const AccessibleButton = ({
  children,
  ariaLabel,
  ariaDescribedBy,
  ariaExpanded,
  ariaControls,
  ariaPressed,
  role,
  tabIndex,
  onKeyDown,
  className = '',
  ...props
}) => {
  const handleKeyDown = (e) => {
    // Handle Enter and Space key presses for accessibility
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      props.onClick?.(e);
    }
    onKeyDown?.(e);
  };

  return (
    <Button
      className={className}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-pressed={ariaPressed}
      role={role}
      tabIndex={tabIndex}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </Button>
  );
};

export default AccessibleButton;

