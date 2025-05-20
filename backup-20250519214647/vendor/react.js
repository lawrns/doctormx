// Re-export React module
// This ensures React is available for ESM imports

// Re-export everything from React
export * from 'https://esm.sh/react@18.2.0';

// Since React *does* have a default export, we need to handle it differently
import * as React from 'https://esm.sh/react@18.2.0';
const defaultExport = React.default || React;
export default defaultExport;
