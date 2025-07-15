import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks for projects operations
export const fetchUserProjects = createAsyncThunk(
  'projects/fetchUserProjects',
  async (uid, { rejectWithValue }) => {
    try {
      const { default: api } = await import('../../api');
      const projects = await api.projects.getUserProjects(uid);
      return projects;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProject = createAsyncThunk(
  'projects/fetchProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const { default: api } = await import('../../api');
      const project = await api.projects.getProject(projectId);
      return project;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const { default: api } = await import('../../api');
      const newProject = await api.projects.createProject(projectData);
      return newProject;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ projectId, updates }, { rejectWithValue }) => {
    try {
      const { default: api } = await import('../../api');
      const updatedProject = await api.projects.updateProject(projectId, updates);
      return updatedProject;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  userProjects: [],
  currentProject: null,
  projectTeam: [],
  loading: false,
  error: null,
  lastUpdated: null
};

// Projects slice
const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
      state.projectTeam = [];
    },
    updateProjectInList: (state, action) => {
      const { projectId, updates } = action.payload;
      const index = state.userProjects.findIndex(p => p.id === projectId);
      if (index !== -1) {
        state.userProjects[index] = { ...state.userProjects[index], ...updates };
      }
    },
    addProject: (state, action) => {
      state.userProjects.unshift(action.payload);
    },
    removeProject: (state, action) => {
      state.userProjects = state.userProjects.filter(p => p.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Projects
      .addCase(fetchUserProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.userProjects = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchUserProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Single Project
      .addCase(fetchProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.userProjects.unshift(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProject = action.payload;
        
        // Update in projects list
        const index = state.userProjects.findIndex(p => p.id === updatedProject.id);
        if (index !== -1) {
          state.userProjects[index] = updatedProject;
        }
        
        // Update current project if it's the same
        if (state.currentProject?.id === updatedProject.id) {
          state.currentProject = updatedProject;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const {
  clearError,
  setCurrentProject,
  clearCurrentProject,
  updateProjectInList,
  addProject,
  removeProject
} = projectsSlice.actions;

// Selectors
export const selectProjects = (state) => state.projects;
export const selectUserProjects = (state) => state.projects.userProjects;
export const selectCurrentProject = (state) => state.projects.currentProject;
export const selectProjectsLoading = (state) => state.projects.loading;
export const selectProjectsError = (state) => state.projects.error;
export const selectProjectById = (projectId) => (state) => 
  state.projects.userProjects.find(p => p.id === projectId);

export default projectsSlice.reducer;