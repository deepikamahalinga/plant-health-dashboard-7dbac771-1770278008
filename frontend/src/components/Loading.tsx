import React from 'react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  variant?: 'spinner' | 'skeleton';
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  text,
  variant = 'spinner',
  className = '',
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  if (variant === 'skeleton') {
    return (
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        <div
          className={`${sizeClasses[size]} rounded-full bg-gray-200 animate-pulse`}
        />
        {text && (
          <div
            className={`h-4 bg-gray-200 animate-pulse rounded ${
              textSizeClasses[size]
            }`}
            style={{ width: text.length * 8 }}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-4 border-primary-100 border-t-primary-500 
        rounded-full animate-spin`}
        role="status"
      />
      {text && (
        <p
          className={`${textSizeClasses[size]} text-gray-600 font-medium`}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;