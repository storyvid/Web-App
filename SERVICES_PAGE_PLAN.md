# Services Page Implementation Plan

## Project Overview
Creating a Services page for the StoryVid client portal that allows clients to request new video projects and gives admins/staff appropriate access levels. The page integrates with the existing project management system.

## User Role Access Levels

### **Client Users** (Primary Use Case)
- **Access**: Full interactive access to request new projects
- **Flow**: Service cards → Request form → Submit → Creates "Pending Approval" project
- **Experience**: Simple, guided project request process

### **Staff Users** (Read-Only Reference)  
- **Access**: View-only service catalog for client consultation
- **Flow**: Service cards show information but no interaction
- **Experience**: Reference tool with message "Contact admin to create new projects"

### **Admin Users** (Enhanced Capabilities)
- **Access**: Full access like clients PLUS admin-only features
- **Flow**: Service cards → Enhanced creation form → Direct project creation
- **Experience**: Can create projects for any client with additional controls

## Service Offerings Structure

### 6 Main Services to Display:
1. **Video Commercials** - Starting at $5,000 - Social, YouTube & TV ads
2. **Brand Overview** - Starting at $6,500 - Company introduction videos  
3. **Explainer Videos** - From $5,500 - Product/service demonstrations
4. **Social Content** - Starting at $3,000 - TikTok, Reels, Shorts (5 videos)
5. **Customer Testimonials** - Starting at $4,500 - Customer story videos
6. **Product Videos** - Starting at $3,500 - Product highlight videos

## Page Structure

### 1. Header Section (Role-Specific)
- **Client**: "Choose the type of video project you need"
- **Staff**: "Service catalog and pricing reference"  
- **Admin**: "Create new projects or manage service offerings"

### 2. Service Cards Grid (2x3 Layout)
- All users see same service cards
- Card behavior differs by role:
  - **Client**: Clickable → Opens request form
  - **Staff**: Shows detailed info, not clickable
  - **Admin**: Clickable → Opens enhanced creation form

### 3. Forms (Role-Specific)

#### Client Form (Simple)
```
Project Request Form
- Service Type: [Pre-selected]
- Project Title: [Text field]
- Brief Description: [Text area]
- Where will this run?: [Radio buttons: Local/Regional/National/Paid Ads]
- Expected Timeline: [Text field]
- Additional Notes: [Text area]
- Actions: [Request Quote] [Save as Draft]
```

#### Admin Form (Enhanced)
```
Create Project
- Service Type: [Pre-selected]
- Client: [Dropdown select or Create New]
- Project Title: [Text field]
- Brief Description: [Text area]
- Scope & Pricing section
- Project Settings: Skip approval, Auto-assign, Priority
- Actions: [Create Project] [Save as Draft] [Send to Client for Approval]
```

#### Staff View (Read-Only)
- Service cards with expanded details on hover/click
- No forms, just informational overlays
- Clear messaging about contacting admin

## Technical Implementation Strategy

### Role-Based Components
- `ServicesPage` component with role-based rendering
- `ServiceCard` component with role-specific behavior
- `ServiceForms` components for Client vs Admin experiences

### Data Flow
- **Client**: Select Service → Fill Form → Submit → Creates "Pending" Project → Admin Reviews
- **Staff**: View Services → Reference Only → No Project Creation
- **Admin**: Select Service → Enhanced Form → Create Project → Project Active Immediately

### Integration Points
- Uses existing `firebaseService.createProject()`
- Follows existing project schema
- Triggers existing notification system
- Updates dashboard immediately
- Integrates with existing role-based navigation

## Design Consistency

### Visual Design
- Matches existing dashboard design system
- Uses same color palette: `#2563EB` primary, `#6B7280` secondary
- Consistent with `dashboardStyles.js` theme
- Same typography and spacing as other dashboard pages

### UI Components
- Reuses existing `StatsCard` component for service cards
- Follows same `ProjectCard` layout principles
- Consistent with existing form styling
- Role-based button styles and interactions

## Admin-Specific Enhancements

### Current Plan
- Client selection/creation
- Budget estimation controls
- Timeline management
- Approval process bypass options
- Team assignment capabilities

### Future Enhancements (Not in MVP)
- Edit service catalog functionality
- Service analytics and reporting
- Project template management
- Bulk project creation

## Key Benefits

✅ **Streamlined Workflow**: Requests flow directly into existing project system  
✅ **Role-Based Access**: Each user type gets appropriate functionality  
✅ **Design Consistency**: Matches existing dashboard perfectly  
✅ **Simple UX**: Clean, straightforward interface focused on clarity  
✅ **Admin Control**: Full oversight of project creation process  
✅ **Staff Reference**: Team can reference services for client consultation  

## Implementation Notes

### Phase 1 (MVP)
- Basic service cards display
- Client request form functionality
- Admin enhanced creation form
- Staff read-only view
- Integration with existing project system

### Phase 2 (Future)
- Service catalog management
- Advanced admin controls
- Analytics and reporting
- Bulk operations

## Questions for Owner Confirmation

1. Do these 6 service types cover typical client offerings?
2. Are the displayed starting prices appropriate?
3. Should staff have project creation ability or keep admin-only?
4. Any additional features needed for managing client requests?

## Next Steps
- Await owner approval of plan
- Begin implementation starting with service cards layout
- Create role-based form components
- Integrate with existing project management system
- Test with all user role types

---

**Last Updated**: 2025-07-29  
**Status**: Plan complete, awaiting owner approval  
**Implementation**: Ready to begin once approved