import {
  Briefcase, Code, Palette, Monitor, Smartphone, Globe, Database, Server, Shield, Zap,
  BarChart3, PieChart, TrendingUp, Target, Award, Star, Heart, ThumbsUp, Rocket, Lightbulb,
  BookOpen, GraduationCap, Headphones, Music, Camera, Video, Image, FileText, Folder, Archive,
  Mail, MessageSquare, Phone, Send, Share2, Link, Wifi, Cloud, Sun, Moon,
  MapPin, Navigation, Compass, Map, Home, Building, Store, ShoppingCart, CreditCard, DollarSign,
  Truck, Package, Gift, Coffee, Utensils, Scissors, Wrench, Settings, Tool, Cpu,
  Users, UserPlus, UserCheck, User, Key, Lock, Unlock, Eye, Search, Filter,
  Clock, Calendar, Timer, Bell, AlertCircle, CheckCircle, XCircle, Info, HelpCircle, Flag,
  Layers, Grid, Layout, Maximize, Minimize, Move, RotateCw, RefreshCw, Download, Upload,
  Play, Pause, SkipForward, Volume2, Mic, Radio, Tv, Printer, Terminal, Hash,
  Pen, Edit, Trash2, Plus, Minus, X, Check, ChevronRight, ArrowRight, ExternalLink,
} from 'lucide-react';

export const ICON_OPTIONS = [
  { name: 'Briefcase', icon: Briefcase }, { name: 'Code', icon: Code }, { name: 'Palette', icon: Palette },
  { name: 'Monitor', icon: Monitor }, { name: 'Smartphone', icon: Smartphone }, { name: 'Globe', icon: Globe },
  { name: 'Database', icon: Database }, { name: 'Server', icon: Server }, { name: 'Shield', icon: Shield },
  { name: 'Zap', icon: Zap }, { name: 'BarChart3', icon: BarChart3 }, { name: 'PieChart', icon: PieChart },
  { name: 'TrendingUp', icon: TrendingUp }, { name: 'Target', icon: Target }, { name: 'Award', icon: Award },
  { name: 'Star', icon: Star }, { name: 'Heart', icon: Heart }, { name: 'ThumbsUp', icon: ThumbsUp },
  { name: 'Rocket', icon: Rocket }, { name: 'Lightbulb', icon: Lightbulb }, { name: 'BookOpen', icon: BookOpen },
  { name: 'GraduationCap', icon: GraduationCap }, { name: 'Headphones', icon: Headphones }, { name: 'Music', icon: Music },
  { name: 'Camera', icon: Camera }, { name: 'Video', icon: Video }, { name: 'Image', icon: Image },
  { name: 'FileText', icon: FileText }, { name: 'Folder', icon: Folder }, { name: 'Archive', icon: Archive },
  { name: 'Mail', icon: Mail }, { name: 'MessageSquare', icon: MessageSquare }, { name: 'Phone', icon: Phone },
  { name: 'Send', icon: Send }, { name: 'Share2', icon: Share2 }, { name: 'Link', icon: Link },
  { name: 'Wifi', icon: Wifi }, { name: 'Cloud', icon: Cloud }, { name: 'Sun', icon: Sun },
  { name: 'Moon', icon: Moon }, { name: 'MapPin', icon: MapPin }, { name: 'Navigation', icon: Navigation },
  { name: 'Compass', icon: Compass }, { name: 'Map', icon: Map }, { name: 'Home', icon: Home },
  { name: 'Building', icon: Building }, { name: 'Store', icon: Store }, { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'CreditCard', icon: CreditCard }, { name: 'DollarSign', icon: DollarSign }, { name: 'Truck', icon: Truck },
  { name: 'Package', icon: Package }, { name: 'Gift', icon: Gift }, { name: 'Coffee', icon: Coffee },
  { name: 'Utensils', icon: Utensils }, { name: 'Scissors', icon: Scissors }, { name: 'Wrench', icon: Wrench },
  { name: 'Settings', icon: Settings }, { name: 'Tool', icon: Tool }, { name: 'Cpu', icon: Cpu },
  { name: 'Users', icon: Users }, { name: 'UserPlus', icon: UserPlus }, { name: 'UserCheck', icon: UserCheck },
  { name: 'User', icon: User }, { name: 'Key', icon: Key }, { name: 'Lock', icon: Lock },
  { name: 'Unlock', icon: Unlock }, { name: 'Eye', icon: Eye }, { name: 'Search', icon: Search },
  { name: 'Filter', icon: Filter }, { name: 'Clock', icon: Clock }, { name: 'Calendar', icon: Calendar },
  { name: 'Timer', icon: Timer }, { name: 'Bell', icon: Bell }, { name: 'AlertCircle', icon: AlertCircle },
  { name: 'CheckCircle', icon: CheckCircle }, { name: 'XCircle', icon: XCircle }, { name: 'Info', icon: Info },
  { name: 'HelpCircle', icon: HelpCircle }, { name: 'Flag', icon: Flag }, { name: 'Layers', icon: Layers },
  { name: 'Grid', icon: Grid }, { name: 'Layout', icon: Layout }, { name: 'Maximize', icon: Maximize },
  { name: 'Minimize', icon: Minimize }, { name: 'Move', icon: Move }, { name: 'RotateCw', icon: RotateCw },
  { name: 'RefreshCw', icon: RefreshCw }, { name: 'Download', icon: Download }, { name: 'Upload', icon: Upload },
  { name: 'Play', icon: Play }, { name: 'Pause', icon: Pause }, { name: 'SkipForward', icon: SkipForward },
  { name: 'Volume2', icon: Volume2 }, { name: 'Mic', icon: Mic }, { name: 'Radio', icon: Radio },
  { name: 'Tv', icon: Tv }, { name: 'Printer', icon: Printer }, { name: 'Terminal', icon: Terminal },
  { name: 'Hash', icon: Hash }, { name: 'Pen', icon: Pen }, { name: 'Edit', icon: Edit },
];

export function getIconComponent(name: string) {
  const found = ICON_OPTIONS.find(i => i.name === name);
  return found?.icon || Briefcase;
}

interface IconPickerProps {
  selected: string;
  onSelect: (name: string) => void;
}

export default function IconPicker({ selected, onSelect }: IconPickerProps) {
  return (
    <div className="grid grid-cols-10 gap-1 max-h-48 overflow-y-auto p-2 bg-secondary rounded-lg scrollbar-thin">
      {ICON_OPTIONS.map(({ name, icon: Icon }) => (
        <button
          key={name}
          type="button"
          onClick={() => onSelect(name)}
          className={`p-2 rounded-md transition-colors ${
            selected === name
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
          title={name}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
