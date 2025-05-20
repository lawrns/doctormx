// Re-export React DOM module
// This ensures ReactDOM is available for ESM imports

// Re-export everything from React DOM
export * from 'https://esm.sh/react-dom@18.2.0';

// Since ReactDOM *does* have a default export, we need to handle it differently
import * as ReactDOM from 'https://esm.sh/react-dom@18.2.0';
const defaultExport = ReactDOM.default || ReactDOM;
export default defaultExport;
