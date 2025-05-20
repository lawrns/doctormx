// This is a shim to help resolve @xstate/react in browsers
// It imports from CDN and re-exports the main functionality

import * as XStateReact from 'https://esm.sh/@xstate/react@3.2.2';

export const {
  useActor,
  useMachine,
  useSelector,
  useInterpret,
  useSpawn,
  asEffect,
  asLayoutEffect,
  createActorContext
} = XStateReact;

// Default export for compatibility
export default XStateReact;
