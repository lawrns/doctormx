/**
 * UI Components Barrel Export
 * 
 * Centralizes all UI components for cleaner imports.
 * 
 * @example
 * ```typescript
 * import { Button, Card, Dialog, Input } from '@/components/ui'
 * ```
 */

// Form elements
export { Button, buttonVariants } from './button'
export { Input } from './input'
export { Label } from './label'
export { Textarea } from './textarea'
export { Checkbox } from './checkbox'
export { RadioGroup, RadioGroupItem } from './radio-group'
export { Switch } from './switch'
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

// Layout
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
export { Separator } from './separator'
export { ScrollArea } from './scroll-area'

// Overlay
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog'
export { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './sheet'
export { Popover, PopoverContent, PopoverTrigger } from './popover'
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

// Feedback
export { Alert, AlertDescription, AlertTitle } from './alert'
export { Badge, badgeVariants } from './badge'
export { Progress } from './progress'
export { Skeleton } from './skeleton'
export { Spinner } from './spinner'
export { Toaster } from './sonner'

// Navigation
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
export { default as Breadcrumb } from './Breadcrumb'

// Data display
export { Avatar, AvatarFallback, AvatarImage } from './avatar'
export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './table'
export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './pagination'

// Accessibility
export { SkipLink } from './skip-link'

// Types
// Note: Type exports should be imported from individual files if needed
// export type { ButtonProps } from './button'
// export type { InputProps } from './input'
