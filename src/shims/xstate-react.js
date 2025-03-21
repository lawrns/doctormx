import { useState, useEffect, useCallback } from 'react';

// This is a simple shim for XState's useMachine that doesn't rely on require
export const useMachine = (machine, options = {}) => {
  // Start with the initial state
  const [state, setState] = useState(machine.initialState || { 
    context: {},
    value: '',
    matches: (value) => state.value === value
  });
  
  // Function to send events to the machine
  const send = useCallback((event) => {
    console.log('XState shim: send not implemented, event received:', event);
    // In a real implementation, this would transition the state machine
    // This is just a placeholder that does nothing
  }, []);
  
  return [state, send];
};
