// Simple test to verify Redux setup
import { store } from './store'
import { addRemoteUser, setConnectionState } from './store/slices/videoCallSlice'

console.log('🚀 Testing Redux setup...')

// Test initial state
console.log('Initial state:', store.getState())

// Test dispatching actions
store.dispatch(setConnectionState('CONNECTING'))
store.dispatch(addRemoteUser('test-user-123'))

console.log('State after actions:', store.getState())

console.log('✅ Redux setup working!')
