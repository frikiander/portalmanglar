/**
 * src/lib/lucide-compat.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Phosphor Icons re-exported under their Lucide-React equivalent names.
 * Aliased via vite.config.ts so every `import { X } from 'lucide-react'`
 * transparently gets a Phosphor icon — zero component changes required.
 *
 * Phosphor icon browser: https://phosphoricons.com
 */

// ─── Navigation & Layout ──────────────────────────────────────────────────────
export { X }                                     from '@phosphor-icons/react';
export { List }                                  from '@phosphor-icons/react';
export { List           as Menu }                from '@phosphor-icons/react';

export { CaretLeft      as ChevronLeft }         from '@phosphor-icons/react';
export { CaretRight     as ChevronRight }        from '@phosphor-icons/react';
export { CaretDown      as ChevronDown }         from '@phosphor-icons/react';
export { ArrowRight }                            from '@phosphor-icons/react';
export { ArrowLeft }                             from '@phosphor-icons/react';
export { ArrowsLeftRight as ArrowRightLeft }     from '@phosphor-icons/react';
export { ArrowRight      as MoveRight }          from '@phosphor-icons/react';
export { DotsThreeVertical as MoreVertical }     from '@phosphor-icons/react';
export { DotsThree         as MoreHorizontal }   from '@phosphor-icons/react';

// ─── Actions ──────────────────────────────────────────────────────────────────
export { Plus }                                  from '@phosphor-icons/react';
export { Check }                                 from '@phosphor-icons/react';
export { Copy }                                  from '@phosphor-icons/react';
export { PencilSimple    as Edit2 }              from '@phosphor-icons/react';
export { PencilSimple    as Edit3 }              from '@phosphor-icons/react';
export { NotePencil      as FileEdit }           from '@phosphor-icons/react';
export { Trash           as Trash2 }             from '@phosphor-icons/react';
export { DownloadSimple  as Download }           from '@phosphor-icons/react';
export { UploadSimple    as Upload }             from '@phosphor-icons/react';
export { Printer }                               from '@phosphor-icons/react';
export { FloppyDisk      as Save }               from '@phosphor-icons/react';
export { PaperPlaneTilt  as Send }               from '@phosphor-icons/react';
export { ArrowCounterClockwise as RotateCcw }    from '@phosphor-icons/react';
export { ArrowCounterClockwise as RefreshCw }    from '@phosphor-icons/react';
export { ArrowCounterClockwise as Undo2 }        from '@phosphor-icons/react';
export { Sparkle         as Sparkles }           from '@phosphor-icons/react';
export { Funnel          as Filter }             from '@phosphor-icons/react';
export { Sliders         as SlidersHorizontal }  from '@phosphor-icons/react';

// ─── Feedback & Status ────────────────────────────────────────────────────────
export { CheckCircle }                           from '@phosphor-icons/react';
export { CheckCircle     as CheckCircle2 }       from '@phosphor-icons/react';
export { CalendarCheck }                         from '@phosphor-icons/react';
export { Warning         as AlertTriangle }      from '@phosphor-icons/react';
export { Warning         as AlertCircle }        from '@phosphor-icons/react';
export { Info }                                  from '@phosphor-icons/react';
export { Eye }                                   from '@phosphor-icons/react';
export { EyeSlash        as EyeOff }             from '@phosphor-icons/react';
export { Power }                                 from '@phosphor-icons/react';

// ─── Layout & Grid ────────────────────────────────────────────────────────────
export { SquaresFour     as LayoutGrid }         from '@phosphor-icons/react';
export { DotsSixVertical as GripVertical }       from '@phosphor-icons/react';
export { Tray            as Inbox }              from '@phosphor-icons/react';

// ─── Data & Files ─────────────────────────────────────────────────────────────
export { Database }                              from '@phosphor-icons/react';
export { FileText }                              from '@phosphor-icons/react';
export { Table }                                 from '@phosphor-icons/react';
export { Table           as FileSpreadsheet }    from '@phosphor-icons/react';
export { Table           as TableIcon }          from '@phosphor-icons/react';

export { Stack           as Layers }             from '@phosphor-icons/react';
export { Tag }                                   from '@phosphor-icons/react';
export { ListPlus }                              from '@phosphor-icons/react';

// ─── Communication ────────────────────────────────────────────────────────────
export { Envelope        as Mail }               from '@phosphor-icons/react';
export { Phone }                                 from '@phosphor-icons/react';
export { ChatCircle      as MessageSquare }      from '@phosphor-icons/react';
export { ChatCircle      as MessageCircle }      from '@phosphor-icons/react';
export { Megaphone }                             from '@phosphor-icons/react';
export { YoutubeLogo     as Youtube }            from '@phosphor-icons/react';
export { Link            as Link2 }              from '@phosphor-icons/react';
export { Link }                                  from '@phosphor-icons/react';
export { ArrowSquareOut  as ExternalLink }       from '@phosphor-icons/react';
export { Camera }                                from '@phosphor-icons/react';

// ─── People & Auth ────────────────────────────────────────────────────────────
export { User }                                  from '@phosphor-icons/react';
export { Users }                                 from '@phosphor-icons/react';
export { UserPlus }                              from '@phosphor-icons/react';
export { UserCheck }                             from '@phosphor-icons/react';
export { Heart }                                 from '@phosphor-icons/react';
export { HandHeart       as HeartHandshake }     from '@phosphor-icons/react';
export { Shield }                                from '@phosphor-icons/react';
export { ShieldCheck }                           from '@phosphor-icons/react';
export { ShieldWarning   as ShieldAlert }        from '@phosphor-icons/react';
export { SignOut         as LogOut }             from '@phosphor-icons/react';
export { SignIn          as LogIn }              from '@phosphor-icons/react';
export { Key }                                   from '@phosphor-icons/react';
export { Password        as KeyRound }           from '@phosphor-icons/react';

// ─── Module / Feature icons ───────────────────────────────────────────────────
export { BookOpen }                              from '@phosphor-icons/react';
export { CalendarBlank   as Calendar }           from '@phosphor-icons/react';
export { CalendarBlank   as CalendarIcon }       from '@phosphor-icons/react';
export { CalendarDots    as CalendarDays }        from '@phosphor-icons/react';
export { CalendarDots    as CalendarRange }       from '@phosphor-icons/react';
export { Clock }                                 from '@phosphor-icons/react';
export { Compass }                               from '@phosphor-icons/react';
export { Bus }                                   from '@phosphor-icons/react';
export { MapPin }                                from '@phosphor-icons/react';
export { Buildings       as Building2 }          from '@phosphor-icons/react';
export { Medal           as Award }              from '@phosphor-icons/react';
export { MagnifyingGlass as Search }             from '@phosphor-icons/react';
export { Bell }                                  from '@phosphor-icons/react';
export { GraduationCap }                         from '@phosphor-icons/react';
export { GearSix         as Settings }           from '@phosphor-icons/react';
export { Question        as HelpCircle }         from '@phosphor-icons/react';
export { UserGear        as UserCog }            from '@phosphor-icons/react';
export { Barbell         as Dumbbell }           from '@phosphor-icons/react';
export { PaintBrush      as Palette }            from '@phosphor-icons/react';
export { SmileyBlank     as Smile }              from '@phosphor-icons/react';
export { House           as School }             from '@phosphor-icons/react';
export { CheckSquare }                           from '@phosphor-icons/react';
export { Square }                                from '@phosphor-icons/react';
export { ArrowsDownUp    as ArrowUpDown }        from '@phosphor-icons/react';
export { Lightbulb }                             from '@phosphor-icons/react';
export { Trophy }                                from '@phosphor-icons/react';
export { Globe }                                 from '@phosphor-icons/react';
export { Cpu }                                   from '@phosphor-icons/react';
export { Robot           as Bot }                from '@phosphor-icons/react';
export { MusicNotes     as Music }              from '@phosphor-icons/react';
export { MathOperations  as Calculator }         from '@phosphor-icons/react';
export { Star }                                  from '@phosphor-icons/react';


