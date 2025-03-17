/**
 * Alternative entry point that doesn't use React directly
 */

import { createRoot } from 'react-dom/client';
import App from './src/App';
import './src/index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  
  // Avoid direct React imports that could cause conflicts
  root.render(
    <div id="app-wrapper">
      <App />
    </div>
  );
}
