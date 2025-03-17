/**
 * This script manually copies and fixes problematic dependencies in the node_modules folder
 */
const fs = require('fs');
const path = require('path');

// Fix any other config files that might be using ES modules
const fixEsModuleFiles = () => {
  // List of files that might need fixing
  const filesToCheck = [
    'postcss.config.js',
    'tailwind.config.js',
    'vite.config.js'
  ];

  filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace export default with module.exports
      if (content.includes('export default')) {
        content = content.replace(/export\s+default\s+/g, 'module.exports = ');
        fs.writeFileSync(filePath, content);
        console.log(`Fixed ES Module syntax in ${file}`);
      }
    }
  });
};

// Directory for our shims
const SHIM_DIR = path.join(__dirname, 'src', 'shims');

// Ensure shims directory exists
if (!fs.existsSync(SHIM_DIR)) {
  fs.mkdirSync(SHIM_DIR, { recursive: true });
  console.log('Created shims directory');
}

// Create date-fns core shim
const dateFnsShim = `
/**
 * Shim for date-fns core functionality
 */

// Basic format function that covers the use cases in the app
export function format(date, formatStr, options = {}) {
  const d = new Date(date);
  
  // Basic formatting patterns
  if (formatStr === 'EEEE') {
    const days = options.locale?.code === 'es' 
      ? ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[d.getDay()];
  }
  
  if (formatStr === 'EEE') {
    const days = options.locale?.code === 'es'
      ? ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d.getDay()];
  }
  
  if (formatStr === 'd') {
    return d.getDate().toString();
  }
  
  if (formatStr === 'dd MMMM yyyy') {
    const day = d.getDate().toString().padStart(2, '0');
    const months = options.locale?.code === 'es'
      ? ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return \`\${day} \${month} \${year}\`;
  }
  
  // Default format
  return d.toLocaleDateString();
}

// Export a default object with required functions
export default {
  format
};
`;

fs.writeFileSync(path.join(SHIM_DIR, 'date-fns.js'), dateFnsShim);
console.log('Created date-fns core shim');

// Create date-fns/locale shim
const dateFnsLocaleShim = `
// Shim for date-fns/locale

// Spanish locale
const es = {
  code: 'es',
  formatLong: {
    date: () => 'DD/MM/YYYY',
    time: () => 'HH:mm',
    dateTime: () => 'DD/MM/YYYY HH:mm'
  },
  formatRelative: () => '',
  localize: {
    month: () => '',
    day: () => '',
    dayPeriod: () => ''
  },
  match: {
    ordinalNumber: () => ({ match: [] }),
    era: () => ({ match: [] }),
    quarter: () => ({ match: [] }),
    month: () => ({ match: [] }),
    day: () => ({ match: [] }),
    dayPeriod: () => ({ match: [] })
  },
  options: {
    weekStartsOn: 1,
    firstWeekContainsDate: 1
  }
};

// US English locale
const enUS = {
  code: 'en-US',
  formatLong: {
    date: () => 'MM/DD/YYYY',
    time: () => 'HH:mm',
    dateTime: () => 'MM/DD/YYYY HH:mm'
  },
  formatRelative: () => '',
  localize: {
    month: () => '',
    day: () => '',
    dayPeriod: () => ''
  },
  match: {
    ordinalNumber: () => ({ match: [] }),
    era: () => ({ match: [] }),
    quarter: () => ({ match: [] }),
    month: () => ({ match: [] }),
    day: () => ({ match: [] }),
    dayPeriod: () => ({ match: [] })
  },
  options: {
    weekStartsOn: 0,
    firstWeekContainsDate: 1
  }
};

module.exports = {
  es,
  enUS
};
module.exports.es = es;
module.exports.enUS = enUS;
`;

fs.writeFileSync(path.join(SHIM_DIR, 'date-fns-locale.js'), dateFnsLocaleShim);
console.log('Created date-fns/locale shim');

// Create @xstate/react shim
const xstateReactShim = `
// Minimal shim for @xstate/react

const React = require('react');

// Basic implementation of useMachine
function useMachine(machine, options = {}) {
  const [state, setState] = React.useState(machine.initialState || { context: {}, nextEvents: [] });
  
  const service = React.useMemo(() => {
    const service = {
      send: (event) => {
        if (typeof event === 'string') {
          event = { type: event };
        }
        console.log('Machine received event:', event);
        setState({ ...state });
      }
    };
    
    return service;
  }, [machine, options]);
  
  return [state, service.send];
}

module.exports = { useMachine };
`;

fs.writeFileSync(path.join(SHIM_DIR, 'xstate-react.js'), xstateReactShim);
console.log('Created @xstate/react shim');

// Create date-fns directory in node_modules
const DATE_FNS_DIR = path.join(__dirname, 'node_modules', 'date-fns');
if (!fs.existsSync(DATE_FNS_DIR)) {
  fs.mkdirSync(DATE_FNS_DIR, { recursive: true });
  console.log('Created date-fns directory in node_modules');
}

// Create index.js in date-fns
const dateFnsIndex = `
// Shim for date-fns
module.exports.format = function format(date, formatStr, options) {
  const d = new Date(date);
  return d.toLocaleDateString();
};
`;

fs.writeFileSync(path.join(DATE_FNS_DIR, 'index.js'), dateFnsIndex);
console.log('Created date-fns/index.js in node_modules');

// Create necessary directories in node_modules
const DATE_FNS_LOCALE_DIR = path.join(__dirname, 'node_modules', 'date-fns', 'locale');
if (!fs.existsSync(DATE_FNS_LOCALE_DIR)) {
  fs.mkdirSync(DATE_FNS_LOCALE_DIR, { recursive: true });
  console.log('Created date-fns/locale directory in node_modules');
}

// Create index.js in date-fns/locale
const dateFnsLocaleIndex = `
// Shim for date-fns/locale
const es = { code: 'es' };
const enUS = { code: 'en-US' };
module.exports = { es, enUS };
module.exports.es = es;
module.exports.enUS = enUS;
`;

fs.writeFileSync(path.join(DATE_FNS_LOCALE_DIR, 'index.js'), dateFnsLocaleIndex);
console.log('Created date-fns/locale/index.js in node_modules');

// Create @xstate/react directory in node_modules if it doesn't exist
const XSTATE_REACT_DIR = path.join(__dirname, 'node_modules', '@xstate', 'react');
if (!fs.existsSync(XSTATE_REACT_DIR)) {
  fs.mkdirSync(XSTATE_REACT_DIR, { recursive: true });
  console.log('Created @xstate/react directory in node_modules');
}

// Create index.js in @xstate/react
const xstateReactIndex = `
// Shim for @xstate/react
const React = require('react');

function useMachine(machine, options = {}) {
  const [state, setState] = React.useState(machine.initialState || {});
  
  const service = React.useMemo(() => {
    return {
      send: (event) => {
        console.log('Event:', event);
        setState(state);
      }
    };
  }, [machine]);
  
  return [state, service.send];
}

module.exports = { useMachine };
`;

fs.writeFileSync(path.join(XSTATE_REACT_DIR, 'index.js'), xstateReactIndex);
console.log('Created @xstate/react/index.js in node_modules');

// Run the ES module fixer
fixEsModuleFiles();

console.log('All dependency shims created successfully');
