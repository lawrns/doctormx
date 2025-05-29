# DoctorMX - Claude Code Configuration

## Project Overview
DoctorMX is a comprehensive medical AI platform providing virtual consultations, symptom analysis, and healthcare services for the Mexican market. The platform features advanced AI doctor capabilities, appointment scheduling, prescription management, and cultural context awareness.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Custom CSS modules
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI Services**: OpenAI GPT models, Claude integration
- **Deployment**: Netlify with serverless functions
- **PWA**: Service workers, offline functionality

## Key Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

## Development Guidelines
- Follow existing component patterns in `src/components/`
- Use TypeScript strict mode
- Maintain responsive design patterns
- Follow Mexican healthcare compliance requirements
- Ensure cultural sensitivity in AI responses

---

# Adaptive Instruction Enhancement System

**Trigger Command**: `/enhance` - Use this command before any instruction to activate intelligent enhancement based on current project state.

## How It Works:

When you use `/enhance` before an instruction, Claude will:

1. **Dynamically Analyze Current State**:
   - Scan codebase to discover active patterns, technologies, and conventions
   - Detect current design systems, component architectures, and styling approaches
   - Identify existing integrations, state management, and data flow patterns
   - Note any ongoing migrations or transitional states

2. **Generate Context-Aware Enhancement**:
   - Enhance instructions based on *discovered* patterns, not hardcoded assumptions
   - Include compatibility considerations with current setup
   - Suggest improvements or alternatives when relevant
   - Maintain flexibility for architectural evolution

3. **Provide Evolution-Ready Guidance**:
   - Consider alternative approaches and modern patterns
   - Flag components that might benefit from updates
   - Include future-proofing considerations
   - Balance current stability with potential improvements

## Usage Examples:

**Without Enhancement:**
```
"Update the navigation styling"
```

**With Enhancement:**
```
/enhance Update the navigation styling
```

**Enhanced Result:**
```
"Update navigation styling by first analyzing the current navigation implementation in src/components/. Discover the active styling approach (CSS modules, design tokens, etc.), apply consistent patterns with existing color system, ensure mobile responsiveness matches current breakpoint strategy, and maintain compatibility with current state management. Consider accessibility improvements and note any patterns that might benefit from modern alternatives like Tailwind or component libraries."
```

## Enhancement Categories:

**Design Work**: Analyzes current design systems, color schemes, responsive patterns
**Development**: Discovers component patterns, TypeScript usage, state management approaches
**Styling**: Identifies CSS methodologies, design tokens, theme implementations
**Integration**: Checks API patterns, third-party service implementations
**Performance**: Considers current optimization strategies and bundling approaches

## Key Benefits:
- **Flexible**: Works with any tech stack or architectural decision
- **Non-Intrusive**: Only activates when triggered with `/enhance`
- **Adaptive**: Learns from actual codebase rather than assumptions
- **Evolution-Friendly**: Suggests improvements while respecting current patterns
- **Context-Aware**: Considers project phase, team preferences, and business constraints

Use `/enhance` when you want comprehensive, intelligent instruction improvement that respects your current setup while remaining open to better approaches.

## Enhancement Process Steps:
1. **Show Analysis**: Display what was discovered about the current codebase
2. **Present Enhanced Instruction**: Show the improved version of your original request
3. **Confirm Before Proceeding**: Ask for approval before executing the enhanced instruction
4. **Execute**: Proceed with the enhanced version once confirmed