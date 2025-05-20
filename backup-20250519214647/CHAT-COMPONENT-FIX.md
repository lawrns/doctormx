# Chat Component Fix for React Error

## Issue Description

The application is experiencing a React error when navigating to pages that use the AI doctor chat functionality. The error occurs in the component tree, specifically in the Lazy component and in the ChatProvider/ChatContext.

Error details from browser console:
```
The above error occurred in one of your React components:
    at Lazy
    at RenderedRoute
    at Outlet
    at main
    at div
    at AILayout
    ...
```

## Root Cause

After investigating the codebase, I identified two conflicting implementations of the chat context:

1. `/src/components/ChatContext.tsx` - This implementation has an `addMessage` function that takes an object parameter with the message details.
2. `/src/core/hooks/useChat.tsx` - This implementation has an `addMessage` function that takes separate parameters (`text`, `sender`, `imageUrl`).

The AI doctor components try to use both these incompatible context implementations simultaneously, causing React errors when the app tries to render components with mismatched interfaces.

## Solution

The solution involves updating the `ChatAssistant` and `ExpandedChatAssistant` components to use only the central chat context from `/src/core/hooks/useChat.tsx` and adapt their method calls to match the expected function signatures.

Fixed files are provided:
1. `ChatAssistant.fixed.tsx` - Updated component using the core chat context
2. `ExpandedChatAssistant.fixed.tsx` - Companion component also using the core chat context

### Implementation Steps

1. Import the correct chat hook from core:
   ```typescript
   import { useChat } from '../core/hooks/useChat';
   ```

2. Update `addMessage` calls to use the appropriate method signature:
   ```typescript
   // Previous incompatible call:
   addMessage({
     text: input,
     sender: 'user'
   });
   
   // Fixed compatible call:
   addMessage(input, 'user');
   ```

3. Replace the components with the fixed versions.

## Deployment

1. Replace `/src/components/ChatAssistant.tsx` with `ChatAssistant.fixed.tsx`.
2. Replace `/src/components/ExpandedChatAssistant.tsx` with `ExpandedChatAssistant.fixed.tsx`.

After implementing these changes, the chat functionality should work correctly in the deployed application without React errors.

## Additional Recommendation

To prevent similar issues in the future, consider consolidating to a single chat context implementation across the application. Having multiple chat contexts with different signatures can lead to confusion and errors.