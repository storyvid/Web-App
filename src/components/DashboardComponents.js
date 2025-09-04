import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Image,
  Palette,
  Users2,
  FileText,
  LogOut,
  Bell,
  ChevronRight,
  Shield,
  Settings,
  KeyRound,
  Building2,
  Briefcase,
  Filter as FilterIcon,
  ExternalLink as OpenInNewIcon
} from "lucide-react";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger
} from "../components/ui/sidebar";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useAuth } from '../contexts/AuthContext';

const clientNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Projects",
    url: "/projects",
    icon: FolderOpen
  }
];

const clientResourceItems = [
  {
    title: "Asset Library",
    url: "/assets",
    icon: Image
  },
  {
    title: "Brand Assets",
    url: "/brand-assets",
    icon: Palette
  }
];

const clientAccountItems = [
  {
    title: "Team",
    url: "/team",
    icon: Users2
  },
  {
    title: "Billing & Documents",
    url: "/billing",
    icon: FileText
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings
  }
];

const adminItems = [
  {
    title: "Admin Dashboard",
    url: "/dashboard",
    icon: Shield,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: FolderOpen,
  },
  {
    title: "Project Management",
    url: "/admin/projects",
    icon: FolderOpen,
  },
  {
    title: "User Management",
    url: "/admin/users",
    icon: Users2,
  },
  {
    title: "Assets",
    url: "/assets",
    icon: Image,
  },
  {
    title: "Services", 
    url: "/services",
    icon: Briefcase,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings
  }
];

const staffItems = [
  {
    title: "Staff Dashboard",
    url: "/staff-dashboard",
    icon: LayoutDashboard
  }
];

const NavMenu = ({ items }) => {
  const location = useLocation();
  
  return (
    <SidebarMenu>
      {items.map((item) =>
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            className={`w-full justify-start hover:bg-[#EFEBE6]/80 transition-all duration-200 rounded-lg mb-1 ${
              location.pathname === item.url ? 'bg-[#EFEBE6]' : ''
            }`}
          >
            <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-stone-700">
              <item.icon className="w-5 h-5 text-stone-600" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
};

// Sidebar Content Component - Now using shadcn design
const SidebarInner = ({ userRole, user, onLogout }) => {
  return (
    <>
      {/* DO NOT CHANGE: py-5 and gap-2 are required for proper logo positioning and divider alignment */}
      <SidebarHeader className="px-4 py-5 flex flex-col gap-2 border-b border-[#C2BEBA]/30">
        <div className="flex items-center pl-3">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688f5b86519e678c31bc82a2/906c4d4cf_Asset23x-8.png"
            alt="StoryVid"
            className="h-8 w-auto"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="my-3 pt-1 pb-4 px-4 min-h-0 gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden flex flex-col justify-between flex-1">
        {userRole === 'admin' ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-[#7D7A73]/60 uppercase tracking-wider px-3 py-4">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavMenu items={adminItems} />
            </SidebarGroupContent>
          </SidebarGroup>
        ) : userRole === 'staff' ? (
           <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-[#7D7A73]/60 uppercase tracking-wider px-3 py-4">
              Staff
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavMenu items={staffItems} />
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <div>
            <SidebarGroup>
              <SidebarGroupContent>
                <NavMenu items={clientNavItems} />
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-[#7D7A73]/60 uppercase tracking-wider px-3 py-4">
                Resources
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <NavMenu items={clientResourceItems} />
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-[#7D7A73]/60 uppercase tracking-wider px-3 py-4">
                Account
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <NavMenu items={clientAccountItems} />
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onLogout}
              className="w-full justify-start hover:bg-[#EFEBE6]/80 transition-all duration-200 rounded-lg mb-1 text-sm font-medium text-[#7D7A73]/80">
              <div className="flex items-center gap-3 px-3 py-2.5">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </>
  );
};

// Sidebar Component using shadcn design
export const Sidebar = ({ userRole, user }) => {
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ShadcnSidebar className="bg-white fixed inset-y-0 z-10 h-svh transition-[left,right,width] duration-200 ease-linear md:flex left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l hidden lg:flex lg:flex-col w-[268px] border-[#C2BEBA]/30">
      <SidebarInner 
        userRole={userRole}
        user={user}
        onLogout={handleLogout}
      />
    </ShadcnSidebar>
  );
};

// Header Component (using new design)
export const Header = ({ user, currentPageName }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const getUserDisplayText = (user) => {
    if (!user) return { primary: 'User', secondary: '' };

    const displayName = user.display_name || user.full_name || user.email?.split('@')[0];
    const userRole = user.user_type || user.role;

    if (userRole === 'client') {
      return {
        primary: user.company || 'Company',
        secondary: displayName || 'User'
      };
    } else if (userRole === 'staff') {
      const roleDisplay = user.sub_role
        ? user.sub_role.replace('staff_', '').replace('_', ' ')
        : 'Staff Member';
      return {
        primary: roleDisplay.charAt(0).toUpperCase() + roleDisplay.slice(1),
        secondary: displayName || 'User'
      };
    } else if (userRole === 'admin') {
      return {
        primary: 'Administrator',
        secondary: displayName || 'Administrator'
      };
    }

    return {
      primary: displayName || 'User',
      secondary: ''
    };
  };

  const userDisplayText = getUserDisplayText(user);

  return (
    <header className="bg-[#F8F5F0] border-b border-[#C2BEBA]/30 px-4 sm:px-8 h-[73px] flex items-center justify-between">{/* DO NOT CHANGE: h-[73px] is required for perfect divider alignment with sidebar */}
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <SidebarTrigger className="lg:hidden -ml-2 mr-2 p-1.5 rounded-md hover:bg-stone-200/50" />
        <ChevronRight className="w-4 h-4 hidden sm:block" />
        <span className="font-medium text-stone-800 capitalize hidden sm:block">{currentPageName || 'Dashboard'}</span>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-stone-600 hover:bg-stone-200/50">
              <Bell className="w-5 h-5" />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#F8F5F0]"></div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-white">
            <div className="p-4">
              <h3 className="font-semibold text-sm text-stone-800 mb-3">Notifications</h3>
              <p className="text-sm text-stone-500">No new notifications</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        {user &&
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-stone-200/50 transition-colors focus:outline-none focus:bg-stone-200/50 data-[state=open]:bg-stone-200/50">
                <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                  <AvatarImage src={user.profile_picture} />
                  <AvatarFallback className="bg-amber-500 text-white font-semibold">
                    {(user.display_name || user.full_name)?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm text-left">
                  <p className="font-semibold text-stone-800">{userDisplayText.primary}</p>
                  <p className="text-xs text-stone-500">{userDisplayText.secondary}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 rotate-90 transition-transform data-[state=open]:rotate-90" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mr-2 bg-white">
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer hover:bg-[#F8F5F0] focus:bg-[#F8F5F0]">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-[#F8F5F0] focus:bg-[#F8F5F0]">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      </div>
    </header>
  );
};

// Stats Card Component (converted to Tailwind)
export const StatsCard = ({ icon: Icon, title, value, subtitle, seeAll, onSeeAllClick, statKey }) => {
  const getStatStyle = (statKey, value) => {
    const styles = {
      pendingApprovals: {
        iconColor: value > 0 ? 'text-yellow-600' : 'text-gray-500',
        valueColor: value > 0 ? 'text-yellow-600' : 'text-gray-900',
        showBadge: value > 0,
        badgeColor: 'yellow'
      },
      inProgress: {
        iconColor: 'text-yellow-600',
        valueColor: 'text-yellow-600',
        showBadge: false,
        badgeColor: 'yellow'
      },
      completed: {
        iconColor: 'text-green-600',
        valueColor: 'text-green-600',
        showBadge: false,
        badgeColor: 'green'
      },
      myProjects: {
        iconColor: 'text-blue-600',
        valueColor: 'text-blue-600',
        showBadge: false,
        badgeColor: 'blue'
      },
      totalClients: {
        iconColor: 'text-blue-500',
        valueColor: 'text-blue-500',
        showBadge: false,
        badgeColor: 'blue'
      },
      upcomingDeadlines: {
        iconColor: value > 5 ? 'text-red-600' : value > 0 ? 'text-yellow-600' : 'text-gray-500',
        valueColor: value > 5 ? 'text-red-600' : value > 0 ? 'text-yellow-600' : 'text-gray-900',
        showBadge: value > 5,
        badgeColor: value > 5 ? 'red' : 'yellow'
      },
      activeProjects: {
        iconColor: 'text-blue-600',
        valueColor: 'text-blue-600',
        showBadge: false,
        badgeColor: 'blue'
      },
      weeklyHours: {
        iconColor: 'text-yellow-600',
        valueColor: 'text-yellow-600',
        showBadge: false,
        badgeColor: 'yellow'
      },
      avgProgress: {
        iconColor: 'text-green-600',
        valueColor: 'text-green-600',
        showBadge: false,
        badgeColor: 'green'
      },
      weeklyCapacity: {
        iconColor: 'text-blue-500',
        valueColor: 'text-blue-500',
        showBadge: false,
        badgeColor: 'blue'
      },
      newMessages: {
        iconColor: 'text-blue-500',
        valueColor: 'text-blue-500',
        showBadge: false,
        badgeColor: 'blue'
      },
      default: {
        iconColor: 'text-gray-500',
        valueColor: 'text-gray-900',
        showBadge: false,
        badgeColor: 'default'
      }
    };
    
    return styles[statKey] || styles.default;
  };

  const statStyle = getStatStyle(statKey, value);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statStyle.showBadge ? 'bg-gray-100' : 'bg-gray-50'}`}>
            <Icon className={`w-5 h-5 ${statStyle.iconColor}`} />
          </div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        {seeAll && (
          <button onClick={onSeeAllClick} className="text-gray-500 hover:text-gray-700">
            <OpenInNewIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-semibold ${statStyle.valueColor}`}>
          {value}
        </span>
        {subtitle && (
          <span className="text-sm text-gray-500">/{subtitle}</span>
        )}
        {statStyle.showBadge && (
          <span className={`ml-2 text-xs font-semibold ${
            statStyle.badgeColor === 'red' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {statKey === 'upcomingDeadlines' && value > 5 ? 'Urgent!' : 
             statKey === 'pendingApprovals' && value > 0 ? 'Action needed' : ''}
          </span>
        )}
      </div>
    </div>
  );
};

// Project Card Component (converted to Tailwind)
export const ProjectCard = ({ project, onClick }) => {
  const statusColors = {
    'todo': {
      bg: 'bg-gray-100',
      color: 'text-gray-700',
      label: 'To Do'
    },
    'in-progress': {
      bg: 'bg-blue-50',
      color: 'text-blue-800',
      label: 'In Progress'
    },
    'awaiting-feedback': {
      bg: 'bg-yellow-50',
      color: 'text-yellow-800',
      label: 'Awaiting Feedback'
    },
    'completed': {
      bg: 'bg-green-50',
      color: 'text-green-800',
      label: 'Completed'
    }
  };
  
  const status = statusColors[project.status] || statusColors['todo'];
  
  const getProgressColor = (progress) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-green-400';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm transition-all duration-200 ease-in-out ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : 'cursor-default'
      }`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClick) onClick(project);
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {project.name}
          </h3>
          <p className="text-sm text-gray-500">
            for {project.client}
          </p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
          {status.label}
        </span>
      </div>
      
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-900">
            {project.progress}%
          </span>
          <span className="text-xs text-gray-500">
            {project.nextMilestone}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Milestone Card Component (converted to Tailwind)
export const MilestoneCard = ({ milestone }) => {
  const typeColors = {
    draft: 'bg-gray-100',
    review: 'bg-yellow-100',
    final: 'bg-green-100'
  };
  
  return (
    <div className={`rounded-lg border p-4 ${typeColors[milestone.type] || 'bg-gray-100'}`}>
      <p className="text-sm font-medium text-gray-900 mb-1">
        {milestone.title}
      </p>
      <p className="text-xs text-gray-500 mb-2">
        on {milestone.project} project
      </p>
      <p className="text-xs font-medium text-gray-900">
        {milestone.time}
      </p>
    </div>
  );
};

// Team Section Component (converted to Tailwind)
export const TeamSection = ({ title, items, type }) => {
  const [filterOpen, setFilterOpen] = useState(false);

  const handleFilter = () => {
    setFilterOpen(!filterOpen);
    console.log('Filter clicked for:', type);
  };

  const handleItemClick = (item) => {
    console.log('Item clicked:', item);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          {title}
        </h3>
        {type === 'projects' && (
          <Button 
            variant="outline"
            size="sm"
            onClick={handleFilter}
            className="flex items-center gap-2"
          >
            <FilterIcon className="w-4 h-4" />
            Filter
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        {type === 'projects' ? (
          items.map(project => (
            <div 
              key={project.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleItemClick(project)}
            >
              <span className="text-2xl">{project.logo}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {project.name}
                </p>
                <p className="text-xs text-gray-500">
                  {project.members} team members
                </p>
              </div>
            </div>
          ))
        ) : (
          items.map(crewMember => (
            <div 
              key={crewMember.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleItemClick(crewMember)}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={crewMember.avatar} />
                <AvatarFallback>{crewMember.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {crewMember.name}
                </p>
                <p className="text-xs text-gray-500">
                  {crewMember.role}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Activity Item Component (converted to Tailwind)
export const ActivityItem = ({ activity }) => {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <Avatar className="w-8 h-8">
        <AvatarImage src={activity.user.avatar} />
        <AvatarFallback>{activity.user.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-sm text-gray-700">
          {activity.action}{' '}
          <span className="font-semibold">
            {activity.target}
          </span>
        </p>
        <p className="text-xs text-gray-500">
          {activity.time}
        </p>
      </div>
    </div>
  );
};