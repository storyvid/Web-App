import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Fab,
  Skeleton,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import { 
  useSortable 
} from '@dnd-kit/sortable';
import { 
  CSS 
} from '@dnd-kit/utilities';
import MilestoneCard from './MilestoneCard';
import MilestoneDialog from './MilestoneDialog';
import { useAuth } from '../../contexts/AuthContext';
import firebaseService from '../../services/firebase/firebaseService';
import milestoneService from '../../services/milestoneService';

const SortableMilestoneCard = ({ milestone, onEdit, onDelete, onStatusChange, canReorder }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: milestone.id, disabled: !canReorder });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <MilestoneCard
        milestone={milestone}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        onReorder={canReorder}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

const MilestoneList = ({ projectId, onMilestoneUpdate }) => {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load milestones
  useEffect(() => {
    loadMilestones();
  }, [projectId]);

  const loadMilestones = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await milestoneService.getProjectMilestones(projectId);
      setMilestones(data || []);
    } catch (err) {
      console.error('Error loading milestones:', err);
      setError('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMilestone = () => {
    setEditingMilestone(null);
    setDialogOpen(true);
  };

  const handleEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
    setDialogOpen(true);
  };

  const handleSaveMilestone = async (milestoneData) => {
    try {
      let result;
      
      if (editingMilestone) {
        // Update existing milestone - for now, reload all milestones since we don't have an update method
        showSnackbar('Milestone update feature coming soon', 'info');
        setDialogOpen(false);
        setEditingMilestone(null);
        return;
      } else {
        // Create new milestone
        result = await milestoneService.createMilestone(projectId, milestoneData);
        showSnackbar('Milestone created successfully', 'success');
      }

      setDialogOpen(false);
      setEditingMilestone(null);
      
      // Reload milestones to get fresh data
      await loadMilestones();
      
      // Notify parent component
      if (onMilestoneUpdate) {
        onMilestoneUpdate();
      }
    } catch (err) {
      console.error('Error saving milestone:', err);
      showSnackbar('Failed to save milestone: ' + err.message, 'error');
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (!window.confirm('Are you sure you want to delete this milestone?')) {
      return;
    }

    try {
      await milestoneService.deleteMilestone(milestoneId);
      showSnackbar('Milestone deleted successfully', 'success');
      
      // Reload milestones to get fresh data
      await loadMilestones();
      
      if (onMilestoneUpdate) {
        onMilestoneUpdate();
      }
    } catch (err) {
      console.error('Error deleting milestone:', err);
      showSnackbar('Failed to delete milestone: ' + err.message, 'error');
    }
  };

  const handleStatusChange = async (milestoneId, newStatus, feedback = null) => {
    try {
      // Use milestoneService for status updates
      const result = await milestoneService.updateMilestoneStatus(milestoneId, newStatus, feedback);

      const statusMessages = {
        completed: 'Milestone marked as completed',
        'in-progress': 'Milestone started',
        pending: 'Milestone status updated'
      };

      showSnackbar(statusMessages[newStatus] || 'Milestone updated', 'success');
      
      // Reload milestones to get fresh data
      await loadMilestones();
      
      if (onMilestoneUpdate) {
        onMilestoneUpdate();
      }
    } catch (err) {
      console.error('Error updating milestone status:', err);
      showSnackbar('Failed to update milestone: ' + err.message, 'error');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = milestones.findIndex(item => item.id === active.id);
    const newIndex = milestones.findIndex(item => item.id === over.id);

    const items = arrayMove(milestones, oldIndex, newIndex);

    // Update local state immediately for better UX
    setMilestones(items);

    try {
      // Update order numbers
      const updates = items.map((item, index) => ({
        id: item.id,
        order: index
      }));

      // Send batch update to Firebase
      await firebaseService.reorderMilestones(projectId, updates);
      showSnackbar('Milestones reordered successfully', 'success');
    } catch (err) {
      console.error('Error reordering milestones:', err);
      // Revert on error
      loadMilestones();
      showSnackbar('Failed to reorder milestones', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Check if user can create milestones
  const canCreateMilestones = user?.role === 'admin' || user?.role === 'staff';

  if (loading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Milestones
        </Typography>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={loadMilestones} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" component="h2">
          Milestones ({milestones.length})
        </Typography>
        
        {canCreateMilestones && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateMilestone}
            size="small"
          >
            Add Milestone
          </Button>
        )}
      </Box>

      {/* Empty State */}
      {milestones.length === 0 ? (
        <Box 
          textAlign="center" 
          py={4}
          sx={{ 
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'grey.50'
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No milestones yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {canCreateMilestones 
              ? 'Create your first milestone to track project progress'
              : 'Milestones will appear here once created by the team'
            }
          </Typography>
          {canCreateMilestones && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleCreateMilestone}
            >
              Create First Milestone
            </Button>
          )}
        </Box>
      ) : (
        /* Milestone List with Drag & Drop */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={milestones.map(m => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <Box>
              {milestones.map((milestone) => (
                <SortableMilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  onEdit={handleEditMilestone}
                  onDelete={handleDeleteMilestone}
                  onStatusChange={handleStatusChange}
                  canReorder={canCreateMilestones}
                />
              ))}
            </Box>
          </SortableContext>
        </DndContext>
      )}

      {/* Floating Action Button for Mobile */}
      {canCreateMilestones && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            display: { xs: 'flex', sm: 'none' }
          }}
          onClick={handleCreateMilestone}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Milestone Dialog */}
      <MilestoneDialog
        open={dialogOpen}
        milestone={editingMilestone}
        onClose={() => {
          setDialogOpen(false);
          setEditingMilestone(null);
        }}
        onSave={handleSaveMilestone}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MilestoneList;