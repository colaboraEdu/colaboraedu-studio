import React from 'react';

export interface UserProfile {
  id: string;
  name: string;
  description: string;
  // Fix: Changed type from JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error in a .ts file.
  icon: React.ReactElement;
  colorClasses: {
    bg: string;
    text: string;
    ring: string;
    button: string;
    buttonHover: string;
    focusBorder: string;
  };
}
