// Debug utility to test project assignment
import projectManagementService from '../services/projectManagementService';

// Function to test project assignment manually
export const testProjectAssignment = async (userEmail) => {
  try {
    console.log('🔍 DEBUG: Testing project assignment for:', userEmail);
    
    // 1. Get all users to find the user by email
    const allUsers = await projectManagementService.getAllUsers();
    console.log('🔍 DEBUG: All users found:', allUsers.length);
    
    // 2. Find user by email
    const targetUser = allUsers.find(u => u.email === userEmail);
    if (!targetUser) {
      console.error('❌ User not found with email:', userEmail);
      return;
    }
    
    console.log('🔍 DEBUG: Target user found:', {
      uid: targetUser.uid,
      email: targetUser.email,
      name: targetUser.name,
      role: targetUser.role
    });
    
    // 3. Get projects for this user
    const userProjects = await projectManagementService.getProjectsByUser(targetUser.uid);
    console.log('🔍 DEBUG: Projects for user:', userProjects);
    
    // 4. Get all projects to see if assignment exists
    const allProjects = await projectManagementService.getAllProjects();
    const assignedProjects = allProjects.filter(p => p.assignedTo === targetUser.uid);
    console.log('🔍 DEBUG: All projects assigned to user:', assignedProjects);
    
    // 5. Check for projects assigned to email instead of uid (common bug)
    const emailAssignedProjects = allProjects.filter(p => p.assignedTo === userEmail);
    if (emailAssignedProjects.length > 0) {
      console.warn('⚠️ Found projects assigned to email instead of uid:', emailAssignedProjects);
    }
    
    return {
      user: targetUser,
      projectsByQuery: userProjects,
      projectsByFilter: assignedProjects,
      emailAssignedProjects: emailAssignedProjects
    };
    
  } catch (error) {
    console.error('❌ Error testing project assignment:', error);
    throw error;
  }
};

// Function to fix misassigned projects (assigned to email instead of uid)
export const fixMisassignedProjects = async (userEmail) => {
  try {
    console.log('🔧 Fixing misassigned projects for:', userEmail);
    
    // Find user
    const allUsers = await projectManagementService.getAllUsers();
    const targetUser = allUsers.find(u => u.email === userEmail);
    if (!targetUser) {
      console.error('❌ User not found');
      return;
    }
    
    // Find projects assigned to email instead of uid
    const allProjects = await projectManagementService.getAllProjects();
    const emailAssignedProjects = allProjects.filter(p => p.assignedTo === userEmail);
    
    console.log('🔧 Found projects to fix:', emailAssignedProjects.length);
    
    // Fix each project by reassigning to correct uid
    for (const project of emailAssignedProjects) {
      console.log('🔧 Fixing project:', project.name);
      // Note: This would require admin access - for now just log
      console.log('🔧 Would reassign project', project.id, 'from', userEmail, 'to', targetUser.uid);
    }
    
    return emailAssignedProjects;
    
  } catch (error) {
    console.error('❌ Error fixing misassigned projects:', error);
    throw error;
  }
};

// Add to window for manual testing in browser console
if (typeof window !== 'undefined') {
  window.testProjectAssignment = testProjectAssignment;
  window.fixMisassignedProjects = fixMisassignedProjects;
}

export default { testProjectAssignment, fixMisassignedProjects };