// This is a simplified redirect to ensure we use the proper index.tsx file
// Some build systems might be picking up the wrong entry point

import './index.tsx';

// This file simply re-exports and runs the main index.tsx file
// It ensures that even if this file is picked up as the entry point,
// the correct React app is still loaded with all its components