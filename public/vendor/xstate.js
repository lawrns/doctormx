// Re-export xstate module
// This file is loaded directly to ensure xstate is available

// Re-export everything from xstate
export * from 'https://esm.sh/xstate@4.38.2';

// Since there's no default export, we'll re-export the most commonly used parts
export { createMachine, interpret, assign } from 'https://esm.sh/xstate@4.38.2';
