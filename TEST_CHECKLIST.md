# Services Page Test Checklist

## Navigation Testing

### Client Role Testing
- [ ] Navigate to http://localhost:3000/services-test
- [ ] Click "Login as client"
- [ ] Verify "Services" appears in the navigation menu
- [ ] Click "Services" in the navigation
- [ ] Verify Services page loads with 6 service cards
- [ ] Verify header shows "Choose a service to start your next video project"
- [ ] Click "Request Project" button in dashboard - should navigate to Services

### Admin Role Testing
- [ ] Navigate to http://localhost:3000/services-test
- [ ] Click "Login as admin"
- [ ] Verify "Services" appears in the navigation menu
- [ ] Click "Services" in the navigation
- [ ] Verify Services page loads with 6 service cards
- [ ] Verify header shows "Create projects directly or manage client requests"
- [ ] Verify "Pending Service Requests" section appears at bottom

### Staff Role Testing
- [ ] Navigate to http://localhost:3000/services-test
- [ ] Click "Login as staff"
- [ ] Verify "Services" does NOT appear in the navigation menu
- [ ] Try to navigate directly to http://localhost:3000/services
- [ ] Verify redirect to /unauthorized page

## Service Cards Testing
- [ ] Verify all 6 service cards display correctly
- [ ] Check hover effects on cards (border color change, slight elevation)
- [ ] Verify icons display with blue background
- [ ] Verify price chips show correctly
- [ ] Verify descriptions are readable

## Modal Testing

### Client Modal Testing
- [ ] As client, click on any service card
- [ ] Verify ServiceRequestModal opens
- [ ] Check form fields: Project Name, Description, Timeline, Additional Notes
- [ ] Try submitting empty form - verify validation errors
- [ ] Fill all required fields and submit
- [ ] Verify success alert appears

### Admin Modal Testing
- [ ] As admin, click on any service card
- [ ] Verify AdminServiceModal opens
- [ ] Check form fields: Client dropdown, Project Name, Description, Timeline, Budget, Notes, Skip Approval checkbox
- [ ] Verify budget is pre-filled with service base price
- [ ] Try submitting empty form - verify validation errors
- [ ] Fill all required fields and submit
- [ ] Verify success alert appears

## Page Refresh Testing
- [ ] Navigate to Services page
- [ ] Refresh the page (F5 or Cmd+R)
- [ ] Verify page loads correctly without errors
- [ ] Verify user remains logged in
- [ ] Verify navigation highlighting is correct

## Quick Actions Testing
- [ ] As client, test "Request New Project" quick action
- [ ] As admin, test "Create Project" quick action
- [ ] Verify both navigate to Services page

## To Test Manually:
1. Go to http://localhost:3000/services-test
2. Test each role systematically
3. Document any issues found