/**
 * Offline Layout
 * 
 * Minimal layout for offline page
 * 
 * @module app/offline/layout
 */

import React from 'react';

export const metadata = {
  title: 'Sin Conexión',
};

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
