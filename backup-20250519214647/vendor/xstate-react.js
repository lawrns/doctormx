// Re-export @xstate/react module 
// This file is loaded directly in the HTML to ensure it's available

// Re-export everything from @xstate/react
export * from 'https://esm.sh/@xstate/react@3.2.2';

// Explicitly re-export the hooks we need
export { useMachine, useActor, useSelector, useInterpret } from 'https://esm.sh/@xstate/react@3.2.2';
