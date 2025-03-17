/**
 * Minimal shim for @xstate/react
 */

import React from 'react';

// Basic implementation of useMachine
export function useMachine(machine, options = {}) {
  const [state, setState] = React.useState(machine.initialState);
  
  const service = React.useMemo(() => {
    const service = {
      send: (event) => {
        if (typeof event === 'string') {
          event = { type: event };
        }
        // Handle services
        if (options.services && state.nextEvents.includes(event.type)) {
          const serviceKey = `${event.type}`;
          if (options.services[serviceKey]) {
            try {
              const result = options.services[serviceKey](state.context);
              if (result && typeof result.then === 'function') {
                result.then((data) => {
                  setState({ 
                    ...state, 
                    context: { ...state.context, [serviceKey + 'Data']: data } 
                  });
                });
              }
            } catch (error) {
              console.error('Service error:', error);
            }
          }
        }
        setState({ ...state });
      }
    };
    
    return service;
  }, [machine, options]);
  
  return [state, service.send];
}
