/**
 * Icon Checker Utility
 * 
 * This utility helps ensure that all Lucide React icons used in components are properly imported.
 * It can be used in development to detect and fix missing icon imports.
 * 
 * Usage: 
 * - Import this in your development environment or tests
 * - Call checkComponentForIcons() with your component's JSX
 */

/**
 * Set of all available Lucide React icon names
 * This should be updated when new icons are added to the library
 */
const availableLucideIcons = new Set([
  'Activity', 'AirVent', 'Airplay', 'AlarmCheck', 'AlarmClock', 'AlarmClockOff', 'AlarmMinus', 
  'AlarmPlus', 'Album', 'AlertCircle', 'AlertOctagon', 'AlertTriangle', 'AlignCenter', 
  'AlignCenterHorizontal', 'AlignCenterVertical', 'AlignEndHorizontal', 'AlignEndVertical', 
  'AlignHorizontalDistributeCenter', 'AlignHorizontalDistributeEnd', 'AlignHorizontalDistributeStart', 
  'AlignHorizontalJustifyCenter', 'AlignHorizontalJustifyEnd', 'AlignHorizontalJustifyStart', 
  'AlignHorizontalSpaceAround', 'AlignHorizontalSpaceBetween', 'AlignJustify', 'AlignLeft', 
  'AlignRight', 'AlignStartHorizontal', 'AlignStartVertical', 'AlignVerticalDistributeCenter', 
  'AlignVerticalDistributeEnd', 'AlignVerticalDistributeStart', 'AlignVerticalJustifyCenter', 
  'AlignVerticalJustifyEnd', 'AlignVerticalJustifyStart', 'AlignVerticalSpaceAround', 
  'AlignVerticalSpaceBetween', 'Anchor', 'Angry', 'Annoyed', 'Aperture', 'Apple', 'Archive', 
  'ArchiveRestore', 'Armchair', 'ArrowBigDown', 'ArrowBigDownDash', 'ArrowBigLeft', 
  'ArrowBigLeftDash', 'ArrowBigRight', 'ArrowBigRightDash', 'ArrowBigUp', 'ArrowBigUpDash', 
  'ArrowDown', 'ArrowDown01', 'ArrowDown10', 'ArrowDownAZ', 'ArrowDownCircle', 'ArrowDownLeft', 
  'ArrowDownLeftFromCircle', 'ArrowDownNarrowWide', 'ArrowDownRight', 'ArrowDownRightFromCircle', 
  'ArrowDownSquare', 'ArrowDownToDot', 'ArrowDownToLine', 'ArrowDownUp', 'ArrowDownWideNarrow', 
  'ArrowDownZA', 'ArrowLeft', 'ArrowLeftCircle', 'ArrowLeftRight', 'ArrowLeftSquare', 'ArrowLeftToLine', 
  'ArrowRight', 'ArrowRightCircle', 'ArrowRightLeft', 'ArrowRightSquare', 'ArrowRightToLine', 
  'ArrowUp', 'ArrowUp01', 'ArrowUp10', 'ArrowUpAZ', 'ArrowUpCircle', 'ArrowUpDown', 'ArrowUpLeft', 
  'ArrowUpLeftFromCircle', 'ArrowUpNarrowWide', 'ArrowUpRight', 'ArrowUpRightFromCircle', 
  'ArrowUpSquare', 'ArrowUpToDot', 'ArrowUpToLine', 'ArrowUpWideNarrow', 'ArrowUpZA', 'Asterisk', 
  'AtSign', 'Atom', 'Award', 'Axe', 'Axis3D', 'Baby', 'Backpack', 'Badge', 'BadgeAlert', 'BadgeCheck', 
  'BadgeDollarSign', 'BadgeHelp', 'BadgeInfo', 'BadgeMinus', 'BadgePercent', 'BadgePlus', 'BadgeX', 
  'BaggageClaim', 'Ban', 'Banana', 'Banknote', 'BarChart', 'BarChart2', 'BarChart3', 'BarChart4', 
  'BarChartBig', 'BarChartHorizontal', 'BarChartHorizontalBig', 'Baseline', 'Bath', 'Battery', 
  'BatteryCharging', 'BatteryFull', 'BatteryLow', 'BatteryMedium', 'BatteryWarning', 'Beaker', 
  'Bean', 'BeanOff', 'Bed', 'BedDouble', 'BedSingle', 'Beef', 'Beer', 'Bell', 'BellDot', 'BellMinus', 
  'BellOff', 'BellPlus', 'BellRing', 'Bike', 'Binary', 'Biohazard', 'Bird', 'Bitcoin', 'Blinds', 
  'Bluetooth', 'BluetoothConnected', 'BluetoothOff', 'BluetoothSearching', 'Bold', 'Bomb', 'Bone', 
  'Book', 'BookCopy', 'BookDown', 'BookKey', 'BookLock', 'BookMarked', 'BookMinus', 'BookOpen', 
  'BookOpenCheck', 'BookPlus', 'BookTemplate', 'BookUp', 'BookUser', 'BookX', 'Bookmark', 'BookmarkMinus', 
  'BookmarkPlus', 'Bot', 'Box', 'BoxSelect', 'Boxes', 'Braces', 'Brackets', 'Brain', 'BrainCircuit', 
  'BrainCog', 'BriefCase', 'Brush', 'Bug', 'Building', 'Building2', 'Bus', 'Cable', 'CableCar', 'Cake', 
  'CakeSlice', 'Calculator', 'Calendar', 'CalendarCheck', 'CalendarCheck2', 'CalendarClock', 'CalendarDays', 
  'CalendarHeart', 'CalendarMinus', 'CalendarOff', 'CalendarPlus', 'CalendarRange', 'CalendarSearch', 
  'CalendarX', 'CalendarX2', 'Camera', 'CameraOff', 'Candlestick', 'Candy', 'CandyCane', 'CandyOff', 
  'Car', 'Carrot', 'CaseLower', 'CaseSensitive', 'CaseUpper', 'CassetteTape', 'Cast', 'Castle', 'Cat', 
  'Check', 'CheckCheck', 'CheckCircle', 'CheckCircle2', 'CheckSquare', 'ChefHat', 'Cherry', 'ChevronDown', 
  'ChevronDownCircle', 'ChevronDownSquare', 'ChevronFirst', 'ChevronLast', 'ChevronLeft', 'ChevronLeftCircle', 
  'ChevronLeftSquare', 'ChevronRight', 'ChevronRightCircle', 'ChevronRightSquare', 'ChevronUp', 
  'ChevronUpCircle', 'ChevronUpSquare', 'ChevronsDown', 'ChevronsDownUp', 'ChevronsLeft', 'ChevronsLeftRight', 
  'ChevronsRight', 'ChevronsRightLeft', 'ChevronsUp', 'ChevronsUpDown', 'Chrome', 'Church', 'Cigarette', 
  'CigaretteOff', 'Circle', 'CircleDashed', 'CircleDollarSign', 'CircleDot', 'CircleDotDashed', 'CircleEllipsis', 
  'CircleEqual', 'CircleOff', 'CircleSlash', 'CircleSlash2', 'CircuitBoard', 'Citrus', 'Clapperboard', 
  'Clipboard', 'ClipboardCheck', 'ClipboardCopy', 'ClipboardEdit', 'ClipboardList', 'ClipboardPaste', 
  'ClipboardSignature', 'ClipboardType', 'ClipboardX', 'Clock', 'Clock1', 'Clock10', 'Clock11', 'Clock12', 
  'Clock2', 'Clock3', 'Clock4', 'Clock5', 'Clock6', 'Clock7', 'Clock8', 'Clock9', 'Cloud', 'CloudCog', 
  'CloudDrizzle', 'CloudFog', 'CloudHail', 'CloudLightning', 'CloudMoon', 'CloudMoonRain', 'CloudOff', 
  'CloudRain', 'CloudRainWind', 'CloudSnow', 'CloudSun', 'CloudSunRain', 'Cloudy', 'Clover', 'Club', 
  'Code', 'Code2', 'CodeSquare', 'CodeXml', 'Codepen', 'Codesandbox', 'Coffee', 'Cog', 'Coins', 'Columns', 
  'Combine', 'Command', 'Compass', 'Component', 'ConciergeBell', 'Construction', 'Contact', 'Contact2', 
  'Container', 'ContrastIcon', 'Cookie', 'Copy', 'CopyCheck', 'CopyMinus', 'CopyPlus', 'CopySlash', 'CopyX', 
  'Copyleft', 'Copyright', 'CornerDownLeft', 'CornerDownRight', 'CornerLeftDown', 'CornerLeftUp', 
  'CornerRightDown', 'CornerRightUp', 'CornerUpLeft', 'CornerUpRight', 'Cpu', 'CreditCard', 'Croissant', 
  'Crop', 'Cross', 'Crosshair', 'Crown', 'CupSoda', 'Currency', 'Database', 'DatabaseBackup', 'Delete', 
  'Diamond', 'Dice1', 'Dice2', 'Dice3', 'Dice4', 'Dice5', 'Dice6', 'Dices', 'Diff', 'Disc', 'Disc2', 
  'Disc3', 'Divide', 'DivideCircle', 'DivideSquare', 'Dna', 'DnaOff', 'Dog', 'DollarSign', 'Donut', 
  'DoorClosed', 'DoorOpen', 'Dot', 'Download', 'DownloadCloud', 'Dribbble', 'Droplet', 'Droplets', 
  'Drum', 'Drumstick', 'Dumbbell', 'Ear', 'EarOff', 'Edit', 'Edit2', 'Edit3', 'Egg', 'EggFried', 'EggOff', 
  'EqualNot', 'EqualSquare', 'Eraser', 'Euro', 'Expand', 'ExternalLink', 'Eye', 'EyeOff', 'Facebook', 
  'Factory', 'Fan', 'FastForward', 'Feather', 'FerrisWheel', 'Figma', 'File', 'FileArchive', 'FileAudio', 
  'FileAudio2', 'FileAxis3D', 'FileBadge', 'FileBadge2', 'FileBarChart', 'FileBarChart2', 'FileBox', 
  'FileCheck', 'FileCheck2', 'FileClock', 'FileCode', 'FileCog', 'FileCog2', 'FileDiff', 'FileDigit', 
  'FileDown', 'FileEdit', 'FileHeart', 'FileImage', 'FileInput', 'FileJson', 'FileJson2', 'FileKey', 
  'FileKey2', 'FileLineChart', 'FileLock', 'FileLock2', 'FileMinus', 'FileMinus2', 'FileOutput', 
  'FilePieChart', 'FilePlus', 'FilePlus2', 'FileQuestion', 'FileScan', 'FileSearch', 'FileSearch2', 
  'FileSignature', 'FileSpreadsheet', 'FileStack', 'FileSymlink', 'FileTerminal', 'FileText', 'FileType', 
  'FileType2', 'FileUp', 'FileVideo', 'FileVideo2', 'FileVolume', 'FileVolume2', 'FileWarning', 'FileX', 
  'FileX2', 'Files', 'Film', 'Filter', 'FilterX', 'Fingerprint', 'Fish', 'FishOff', 'Flag', 'FlagOff', 
  'FlagTriangleLeft', 'FlagTriangleRight', 'Flame', 'Flashlight', 'FlashlightOff', 'FlaskConical', 
  'FlaskConicalOff', 'FlaskRound', 'FlipHorizontal', 'FlipHorizontal2', 'FlipVertical', 'FlipVertical2', 
  'Flower', 'Flower2', 'Focus', 'FoldHorizontal', 'FoldVertical', 'Folder', 'FolderArchive', 'FolderCheck', 
  'FolderClock', 'FolderClosed', 'FolderCog', 'FolderCog2', 'FolderDot', 'FolderDown', 'FolderGit', 
  'FolderGit2', 'FolderHeart', 'FolderInput', 'FolderKey', 'FolderLock', 'FolderMinus', 'FolderOpen', 
  'FolderOutput', 'FolderPlus', 'FolderRoot', 'FolderSearch', 'FolderSearch2', 'FolderSymlink', 'FolderSync', 
  'FolderTree', 'FolderUp', 'FolderX', 'Folders', 'Football', 'Footprints', 'Forklift', 'FormInput', 
  'Forward', 'Frame', 'Framer', 'Frown', 'Fuel', 'FunctionSquare', 'GalleryHorizontal', 'GalleryHorizontalEnd', 
  'GalleryThumbnails', 'GalleryVertical', 'GalleryVerticalEnd', 'Gamepad', 'Gamepad2', 'GanttChart', 
  'GanttChartSquare', 'Gauge', 'GaugeCircle', 'Gavel', 'Gem', 'Ghost', 'Gift', 'GitBranch', 'GitBranchPlus', 
  'GitCommit', 'GitCompare', 'GitFork', 'GitMerge', 'GitPullRequest', 'GitPullRequestClosed', 'GitPullRequestDraft', 
  'Github', 'GithubIcon', 'Gitlab', 'GlassWater', 'Glasses', 'Globe', 'Globe2', 'Goal', 'Grab', 'GraduationCap', 
  'Grape', 'Grid', 'GripHorizontal', 'GripVertical', 'Group', 'Hammer', 'Hand', 'HandMetal', 'HardDrive', 
  'HardDriveDownload', 'HardDriveUpload', 'HardHat', 'Hash', 'Haze', 'Heading', 'Heading1', 'Heading2', 
  'Heading3', 'Heading4', 'Heading5', 'Heading6', 'Headphones', 'Heart', 'HeartCrack', 'HeartHandshake', 
  'HeartOff', 'HeartPulse', 'HelpCircle', 'HelpingHand', 'Hexagon', 'Highlighter', 'History', 'Home', 
  'Hop', 'HopOff', 'HorizontalSliders', 'Hourglass', 'IceCream', 'IceCream2', 'Image', 'ImageMinus', 
  'ImageOff', 'ImagePlus', 'Import', 'Inbox', 'Indent', 'IndianRupee', 'Infinity', 'Info', 'Inspect', 
  'Instagram', 'Italic', 'IterationCcw', 'IterationCw', 'JapaneseYen', 'Joystick', 'Key', 'KeyRound', 
  'KeySquare', 'Keyboard', 'Landmark', 'Languages', 'Laptop', 'Laptop2', 'Lasso', 'LassoSelect', 'Laugh', 
  'Layers', 'Layout', 'LayoutDashboard', 'LayoutGrid', 'LayoutList', 'LayoutPanelLeft', 'LayoutPanelTop', 
  'LayoutTemplate', 'Leaf', 'LeafyGreen', 'Library', 'LifeBuoy', 'Ligature', 'Lightbulb', 'LightbulbOff', 
  'LineChart', 'Link', 'Link2', 'Link2Off', 'Linkedin', 'List', 'ListChecks', 'ListEnd', 'ListFilter', 
  'ListMinus', 'ListMusic', 'ListOrdered', 'ListPlus', 'ListRestart', 'ListStart', 'ListTodo', 'ListTree', 
  'ListVideo', 'ListX', 'Loader', 'Loader2', 'Locate', 'LocateFixed', 'LocateOff', 'Lock', 'LockKeyhole', 
  'LogIn', 'LogOut', 'Lollipop', 'Luggage', 'MSquare', 'Magnet', 'Mail', 'MailCheck', 'MailMinus', 'MailOpen', 
  'MailPlus', 'MailQuestion', 'MailSearch', 'MailWarning', 'MailX', 'Mailbox', 'Mails', 'Map', 'MapPin', 
  'MapPinOff', 'Martini', 'Maximize', 'Maximize2', 'Medal', 'MegaphoneOff', 'Meh', 'MemoryStick', 'Menu', 
  'MenuSquare', 'Merge', 'MessageCircle', 'MessageSquare', 'MessageSquareDashed', 'MessageSquareDot', 
  'MessageSquareMore', 'MessageSquarePlus', 'MessageSquareQuote', 'MessageSquareShare', 'MessageSquareText', 
  'MessageSquareX', 'MessagesSquare', 'Mic', 'Mic2', 'MicOff', 'Microscope', 'Microwave', 'Milestone', 
  'Milk', 'MilkOff', 'Minimize', 'Minimize2', 'Minus', 'MinusCircle', 'MinusSquare', 'Monitor', 'MonitorDown', 
  'MonitorOff', 'MonitorSmartphone', 'MonitorSpeaker', 'MonitorStop', 'MonitorUp', 'MonitorX', 'Moon', 
  'MoonStar', 'MoreHorizontal', 'MoreVertical', 'Mountain', 'MountainSnow', 'Mouse', 'MousePointer', 
  'MousePointer2', 'MousePointerClick', 'MousePointerSquare', 'MousePointerSquareDashed', 'Move', 
  'MoveDiagonal', 'MoveDiagonal2', 'MoveDown', 'MoveDownLeft', 'MoveDownRight', 'MoveHorizontal', 
  'MoveLeft', 'MoveRight', 'MoveUp', 'MoveUpLeft', 'MoveUpRight', 'MoveVertical', 'Music', 'Music2', 
  'Music3', 'Music4', 'Navigation', 'Navigation2', 'Navigation2Off', 'NavigationOff', 'Network', 'Newspaper', 
  'Nfc', 'NotEqual', 'Nut', 'NutOff', 'Octagon', 'Option', 'Orbit', 'Outdent', 'Package', 'Package2', 
  'PackageCheck', 'PackageMinus', 'PackageOpen', 'PackagePlus', 'PackageSearch', 'PackageX', 'PaintBucket', 
  'Paintbrush', 'Paintbrush2', 'Palette', 'Palmtree', 'PanelBottom', 'PanelBottomClose', 'PanelBottomInactive', 
  'PanelBottomOpen', 'PanelLeft', 'PanelLeftClose', 'PanelLeftInactive', 'PanelLeftOpen', 'PanelRight', 
  'PanelRightClose', 'PanelRightInactive', 'PanelRightOpen', 'PanelTop', 'PanelTopClose', 'PanelTopInactive', 
  'PanelTopOpen', 'Paperclip', 'Parentheses', 'ParkingCircle', 'ParkingCircleOff', 'ParkingMeter', 
  'ParkingSquare', 'ParkingSquareOff', 'PartyPopper', 'Pause', 'PauseCircle', 'PauseOctagon', 'PawPrint', 
  'Pen', 'PenLine', 'PenSquare', 'PenTool', 'Pencil', 'PencilLine', 'PencilRuler', 'Pentagon', 'Percent', 
  'PercentCircle', 'PercentDiamond', 'PercentSquare', 'PersonStanding', 'Phone', 'PhoneCall', 'PhoneForwarded', 
  'PhoneIncoming', 'PhoneMissed', 'PhoneOff', 'PhoneOutgoing', 'Pi', 'PiSquare', 'Piano', 'PictureInPicture', 
  'PictureInPicture2', 'PieChart', 'PiggyBank', 'Pilcrow', 'PilcrowSquare', 'Pill', 'Pin', 'PinOff', 
  'Pipette', 'Pizza', 'Plane', 'PlaneLanding', 'PlaneTakeoff', 'Play', 'PlayCircle', 'PlaySquare', 'Plug', 
  'Plug2', 'PlugZap', 'Plus', 'PlusCircle', 'PlusSquare', 'Pocket', 'PocketKnife', 'Podcast', 'Pointer', 
  'Popcorn', 'Popsicle', 'PoundSterling', 'Power', 'PowerOff', 'Presentation', 'Printer', 'Projector', 
  'Puzzle', 'PuzzlePiece', 'QrCode', 'Quote', 'Rabbit', 'Radar', 'Radiation', 'Radio', 'RadioReceiver', 
  'RadioTower', 'Radius', 'RailSymbol', 'Rainbow', 'Rat', 'Ratio', 'Receipt', 'ReceiptText', 'Rectangle', 
  'RectangleHorizontal', 'RectangleVertical', 'Recycle', 'Redo', 'Redo2', 'RedoDot', 'RefreshCcw', 'RefreshCw', 
  'Refrigerator', 'Regex', 'RemoveFormatting', 'Repeat', 'Repeat1', 'Repeat2', 'Replace', 'ReplaceAll', 
  'Reply', 'ReplyAll', 'Rewind', 'Ribbon', 'RockingChair', 'RollerCoaster', 'Rotate3D', 'RotateCcw', 
  'RotateCw', 'Route', 'RouteOff', 'Router', 'Rows', 'Rss', 'Ruler', 'RussianRuble', 'Sailboat', 'Salad', 
  'Sandwich', 'Satellite', 'SatelliteDish', 'Save', 'SaveAll', 'Scale', 'Scale3D', 'Scaling', 'Scan', 
  'ScanBarcode', 'ScanEye', 'ScanFace', 'ScanLine', 'ScanSearch', 'ScanText', 'School', 'School2', 'Scissors', 
  'ScissorsLineDashed', 'ScissorsSquare', 'ScissorsSquareDashedBottom', 'ScreenShare', 'ScreenShareOff', 
  'ScrollText', 'Search', 'SearchCheck', 'SearchCode', 'SearchSlash', 'SearchX', 'Send', 'SeparatorHorizontal', 
  'SeparatorVertical', 'Server', 'ServerCog', 'ServerCrash', 'ServerOff', 'Settings', 'Settings2', 'Shapes', 
  'Share', 'Share2', 'Sheet', 'Shell', 'Shield', 'ShieldAlert', 'ShieldBan', 'ShieldCheck', 'ShieldClose', 
  'ShieldEllipsis', 'ShieldHalf', 'ShieldMinus', 'ShieldOff', 'ShieldPlus', 'ShieldQuestion', 'ShieldX', 
  'Ship', 'ShipWheel', 'Shirt', 'ShoppingBag', 'ShoppingBasket', 'ShoppingCart', 'Shovel', 'ShowerHead', 
  'Shrink', 'Shrub', 'Shuffle', 'Sidebar', 'SidebarClose', 'SidebarOpen', 'Sigma', 'SigmaSquare', 'Signal', 
  'SignalHigh', 'SignalLow', 'SignalMedium', 'SignalZero', 'Siren', 'SkipBack', 'SkipForward', 'Skull', 
  'Slack', 'Slice', 'Sliders', 'SlidersHorizontal', 'Smartphone', 'SmartphoneCharging', 'SmartphoneNfc', 
  'Smile', 'SmilePlus', 'Snowflake', 'Sofa', 'SortAsc', 'SortDesc', 'Soup', 'Space', 'Spade', 'Sparkle', 
  'Sparkles', 'Speaker', 'Speech', 'SpellCheck', 'SpellCheck2', 'Spline', 'Split', 'SplitSquareHorizontal', 
  'SplitSquareVertical', 'SprayCan', 'Sprout', 'Square', 'SquareAsterisk', 'SquareCode', 'SquareDashedBottom', 
  'SquareDashedBottomCode', 'SquareDot', 'SquareEqual', 'SquareGantt', 'SquareKanban', 'SquareKanbanDashed', 
  'SquareStack', 'SquareUser', 'SquareUserRound', 'Squirrel', 'Stamp', 'Star', 'StarHalf', 'StarOff', 
  'StepBack', 'StepForward', 'Stethoscope', 'Sticker', 'StickyNote', 'StopCircle', 'Store', 'StretchHorizontal', 
  'StretchVertical', 'Strikethrough', 'Subscript', 'Subtitles', 'Sun', 'SunDim', 'SunMedium', 'SunMoon', 
  'SunSnow', 'Sunrise', 'Sunset', 'Superscript', 'SwissFranc', 'SwitchCamera', 'Sword', 'Swords', 'Syringe', 
  'Table', 'Table2', 'Tablet', 'TabletSmartphone', 'Tablets', 'Tag', 'Tags', 'Target', 'Tent', 'Terminal', 
  'TerminalSquare', 'TestTube', 'TestTube2', 'TestTubes', 'Text', 'TextCursor', 'TextCursorInput', 'TextQuote', 
  'TextSelect', 'TextSelection', 'Thermometer', 'ThermometerSnowflake', 'ThermometerSun', 'ThumbsDown', 
  'ThumbsUp', 'Ticket', 'Timer', 'TimerOff', 'TimerReset', 'ToggleLeft', 'ToggleRight', 'Tornado', 'Torus', 
  'Touchpad', 'TouchpadOff', 'TowerControl', 'ToyBrick', 'Train', 'Trash', 'Trash2', 'TreeDeciduous', 
  'TreePine', 'Trees', 'Trello', 'TrendingDown', 'TrendingUp', 'Triangle', 'TriangleAlert', 'TriangleRight', 
  'Trophy', 'Truck', 'Tv', 'Tv2', 'Twitch', 'Twitter', 'Type', 'Umbrella', 'UmbrellaOff', 'Underline', 
  'Undo', 'Undo2', 'UndoDot', 'UnfoldHorizontal', 'UnfoldVertical', 'Ungroup', 'Unlink', 'Unlink2', 
  'Unlock', 'UnlockKeyhole', 'Unplug', 'Upload', 'UploadCloud', 'Usb', 'User', 'User2', 'UserCheck', 
  'UserCheck2', 'UserCircle', 'UserCircle2', 'UserCog', 'UserCog2', 'UserMinus', 'UserMinus2', 'UserPlus', 
  'UserPlus2', 'UserRound', 'UserRoundCheck', 'UserRoundCog', 'UserRoundMinus', 'UserRoundPlus', 'UserRoundSearch', 
  'UserRoundX', 'UserSearch', 'UserSquare', 'UserSquare2', 'UserX', 'UserX2', 'Users', 'Users2', 'UsersRound', 
  'Utensils', 'UtensilsCrossed', 'UtilityPole', 'Variable', 'Vegan', 'VenetianMask', 'Verified', 'Vibrate', 
  'VibrateOff', 'Video', 'VideoOff', 'VideoRecorder', 'View', 'Voicemail', 'Volume', 'Volume1', 'Volume2', 
  'VolumeX', 'Vote', 'Wallet', 'Wallet2', 'WalletCards', 'WallpaperIcon', 'Wand', 'Wand2', 'WarehouseIcon', 
  'Watch', 'Waves', 'Webcam', 'Webhook', 'Weight', 'Wheat', 'WheatOff', 'WholeWord', 'Wifi', 'WifiOff', 
  'Wind', 'Wine', 'WineOff', 'Workflow', 'WrapText', 'Wrench', 'X', 'XCircle', 'XOctagon', 'XSquare', 
  'Youtube', 'Zap', 'ZapOff', 'ZoomIn', 'ZoomOut'
]);

/**
 * Extracts icon names from a component string
 * Looks for patterns like <IconName or <IconName size=
 */
export function extractIconsFromComponent(componentCode: string): string[] {
  const iconRegex = /<([A-Z][a-zA-Z0-9]*)(?:\s|\/>|>)/g;
  const matches = componentCode.match(iconRegex) || [];
  
  return matches.map(match => match.slice(1).trim().replace(/\s.*$/, ''))
    .filter(iconName => availableLucideIcons.has(iconName));
}

/**
 * Checks if all icons used in the component are imported
 * @param componentCode The component code as a string
 * @param imports The import statements as a string
 * @returns An array of missing icon names
 */
export function findMissingIconImports(componentCode: string, imports: string): string[] {
  const usedIcons = extractIconsFromComponent(componentCode);
  
  // Extract imported icons
  const importedIconsRegex = /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/g;
  const importMatches = [...imports.matchAll(importedIconsRegex)];
  
  const importedIcons = new Set<string>();
  importMatches.forEach(match => {
    const iconsList = match[1];
    const icons = iconsList.split(',').map(icon => 
      icon.trim().replace(/\s+as\s+.+$/, '')  // Handle renamed imports
    );
    icons.forEach(icon => importedIcons.add(icon));
  });
  
  // Find missing icons
  return usedIcons.filter(icon => !importedIcons.has(icon));
}

/**
 * Checks a component file for missing icon imports and suggests an updated import statement
 * @param fileContent The full content of the component file
 * @returns An object with the missing icons and a suggested import statement
 */
export function checkComponentForIcons(fileContent: string): {
  missingIcons: string[];
  suggestedImport: string;
} {
  // Extract imports and component code
  const importSection = fileContent.match(/^(import[^;]+;[\s\n]*)+/m)?.[0] || '';
  const componentCode = fileContent.substring(importSection.length);
  
  // Find missing icons
  const missingIcons = findMissingIconImports(componentCode, importSection);
  
  // Check if there's an existing lucide-react import
  const lucideImportRegex = /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/;
  const lucideImport = importSection.match(lucideImportRegex);
  
  let suggestedImport = '';
  
  if (missingIcons.length > 0) {
    if (lucideImport) {
      // Add to existing import
      const currentIcons = lucideImport[1].split(',').map(i => i.trim());
      const updatedIcons = [...new Set([...currentIcons, ...missingIcons])].sort();
      
      suggestedImport = importSection.replace(
        lucideImportRegex,
        `import { ${updatedIcons.join(', ')} } from 'lucide-react'`
      );
    } else {
      // Create new import
      suggestedImport = `import { ${missingIcons.join(', ')} } from 'lucide-react';\n${importSection}`;
    }
  }
  
  return {
    missingIcons,
    suggestedImport: missingIcons.length > 0 ? suggestedImport : importSection
  };
}

/**
 * Helper function to check if a file is a React component
 */
export function isReactComponent(filePath: string): boolean {
  const ext = filePath.split('.').pop()?.toLowerCase();
  return ext === 'tsx' || ext === 'jsx';
}

/**
 * Format an import statement for better readability
 * @param importStatement The import statement to format
 * @returns Formatted import statement with one icon per line if there are many
 */
export function formatImportStatement(importStatement: string): string {
  if (importStatement.length > 80) {
    // If the import is long, format it with one icon per line
    return importStatement.replace(
      /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/,
      (match, iconsList) => {
        const icons = iconsList.split(',').map(i => i.trim());
        if (icons.length > 5) {
          return `import {\n  ${icons.join(',\n  ')}\n} from 'lucide-react'`;
        }
        return match;
      }
    );
  }
  return importStatement;
}
