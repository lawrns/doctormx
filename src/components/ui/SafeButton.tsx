import React, { ButtonHTMLAttributes, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface SafeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onSafeClick?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void> | void;
  verifySession?: boolean;
}

/**
 * Button component that prevents unexpected auth state changes
 * by verifying session before executing click handlers
 */
const SafeButton: React.FC<SafeButtonProps> = ({
  children,
  onClick,
  onSafeClick,
  verifySession = true,
  disabled,
  ...props
}) => {
  const { verifySession: checkSession } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Stop if already processing to prevent double-clicks
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Verify auth session if needed
      if (verifySession) {
        const isValid = await checkSession();
        if (!isValid) {
          console.warn('[SafeButton] Session invalid, canceling action');
          return;
        }
      }
      
      // Call the original onClick if provided
      if (onClick) {
        onClick(e);
      }
      
      // Call the safe click handler if provided
      if (onSafeClick) {
        await onSafeClick(e);
      }
    } catch (error) {
      console.error('[SafeButton] Error in click handler:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={disabled || isProcessing}
    >
      {isProcessing ? 'Processing...' : children}
    </button>
  );
};

export default SafeButton;