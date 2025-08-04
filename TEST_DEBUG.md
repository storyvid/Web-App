# Firebase Services Debug Instructions

## Steps to Debug Client Dropdown Issue

1. **Open Browser Console**
   - Go to http://localhost:3000/firebase-debug
   - Open Developer Tools (F12)
   - Go to Console tab

2. **Test Firebase Service**
   - Click "Test getClients()" button
   - Watch console logs for:
     - `🔍 getClients called, useMockData: true`
     - `Mock: Getting clients`
     - Should see mock data returned

3. **Test Services Page**
   - Navigate to http://localhost:3000/services-test
   - Click "Login as admin" 
   - Click "Go to Services Page"
   - Try to create a project (click any service card)
   - Check if client dropdown is populated

4. **Check Console Logs**
   Look for these log messages:
   - `🔍 ServicesContent useEffect triggered`
   - `👑 User is admin, fetching data...`  
   - `📞 Calling firebaseService.getClients()...`
   - `✅ Received clients data:`
   - `✅ Processed clients:`

## Expected Behavior
- With mock data enabled, should see 3 test clients in dropdown
- Console should show successful data fetching
- No Firebase errors since we're using mock data

## If Issues Persist
1. Check if user role is properly set to 'admin'
2. Verify useEffect is triggered when user changes
3. Check clients state in React DevTools
4. Verify modal is receiving clients prop correctly