/**
 * Shim for @xstate/react
 * This is a proper ES module that exports useMachine and createMachine
 */

import React from 'react';

/**
 * Basic implementation of useMachine
 * @param {object} machine - The state machine
 * @param {object} options - Options for the machine 
 * @returns {array} - [state, send]
 */
function useMachine(machine, options = {}) {
  const [state, setState] = React.useState(machine.initialState || {
    context: {},
    value: machine.initial || '',
    nextEvents: machine.states ? Object.keys(machine.states) : []
  });
  
  const send = React.useCallback((event) => {
    if (typeof event === 'string') {
      event = { type: event };
    }
    
    // Basic handling of events
    if (machine.states && machine.states[state.value] && 
        machine.states[state.value].on && 
        machine.states[state.value].on[event.type]) {
      
      const target = machine.states[state.value].on[event.type];
      const nextState = typeof target === 'string' ? target : target.target;
      
      if (nextState && machine.states[nextState]) {
        setState({
          value: nextState,
          context: { ...state.context },
          nextEvents: Object.keys(machine.states[nextState].on || {})
        });
        return;
      }
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
    
    // If no transition or service handled it, just update the state
    setState({ ...state });
  }, [machine, options, state]);
  
  return [state, send];
}

/**
 * createMachine shim
 * @param {object} config - Machine configuration
 * @returns {object} - State machine object
 */
function createMachine(config) {
  return {
    ...config,
    initialState: {
      value: config.initial,
      context: config.context || {},
      nextEvents: config.states && config.states[config.initial] ? 
                Object.keys(config.states[config.initial].on || {}) : []
    }
  };
}

// Explicitly export as default and named exports to cover all import styles
export { useMachine, createMachine };
export default { useMachine, createMachine };
