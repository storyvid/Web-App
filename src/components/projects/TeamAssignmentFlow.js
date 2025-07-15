import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Badge,
  LinearProgress,
  Tooltip,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Checkbox,
  FormControlLabel,
  Divider,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  StarRate as StarIcon,
  Schedule as ScheduleIcon,
  WorkOutline as WorkIcon,
  Info as InfoIcon,
  CheckCircle as AssignedIcon,
  RadioButtonUnchecked as UnassignedIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';

import { selectUser } from '../../store/slices/authSlice';
import PermissionGate from '../common/PermissionGate';

const TeamAssignmentFlow = ({ 
  open, 
  onClose, 
  project, 
  onAssignStaff, 
  onRemoveStaff,
  loading = false 
}) => {
  const user = useSelector(selectUser);
  const [tabValue, setTabValue] = useState(0);
  const [availableStaff, setAvailableStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [currentAssignments, setCurrentAssignments] = useState([]);

  useEffect(() => {
    if (open && project) {
      loadAvailableStaff();
      setCurrentAssignments(project.assignedStaff || []);
      setSelectedStaff([]);
    }
  }, [open, project]);

  const loadAvailableStaff = async () => {
    try {
      // TODO: Load from API
      // For now, using mock data
      const mockStaff = [
        {
          uid: 'staff-1',
          name: 'John Doe',
          email: 'john@storyvid.com',
          avatar: 'https://i.pravatar.cc/150?img=1',
          staffProfile: {
            position: 'Senior Video Editor',
            skills: ['Adobe Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Motion Graphics'],
            experience: 'Senior (6-10 years)',
            availability: {
              type: 'fulltime',
              hoursPerWeek: 40
            },
            hourlyRate: '85',
            performance: {
              rating: 4.8,
              projectsCompleted: 45,
              onTimeDelivery: 95,
              clientSatisfaction: 4.9
            }
          },
          currentWorkload: {
            activeProjects: 2,
            utilizationPercentage: 75,
            availableHours: 10
          }
        },
        {
          uid: 'staff-2',
          name: 'Sarah Miller',
          email: 'sarah@storyvid.com',
          avatar: 'https://i.pravatar.cc/150?img=2',
          staffProfile: {
            position: 'Motion Graphics Designer',
            skills: ['After Effects', 'Cinema 4D', 'Blender', 'Illustration'],
            experience: 'Mid-Level (3-5 years)',
            availability: {
              type: 'fulltime',
              hoursPerWeek: 40
            },
            hourlyRate: '75',
            performance: {
              rating: 4.6,
              projectsCompleted: 28,
              onTimeDelivery: 92,
              clientSatisfaction: 4.7
            }
          },
          currentWorkload: {
            activeProjects: 1,
            utilizationPercentage: 50,
            availableHours: 20
          }
        },
        {
          uid: 'staff-3',
          name: 'Mike Johnson',
          email: 'mike@storyvid.com',
          avatar: 'https://i.pravatar.cc/150?img=3',
          staffProfile: {
            position: 'Producer',
            skills: ['Project Management', 'Client Relations', 'Scriptwriting', 'Pre-Production'],
            experience: 'Senior (6-10 years)',
            availability: {
              type: 'fulltime',
              hoursPerWeek: 40
            },
            hourlyRate: '95',
            performance: {
              rating: 4.9,
              projectsCompleted: 52,
              onTimeDelivery: 98,
              clientSatisfaction: 4.8
            }
          },
          currentWorkload: {
            activeProjects: 3,
            utilizationPercentage: 90,
            availableHours: 4
          }
        },
        {
          uid: 'staff-4',
          name: 'Lisa Chen',
          email: 'lisa@storyvid.com',
          avatar: 'https://i.pravatar.cc/150?img=4',
          staffProfile: {
            position: 'Sound Engineer',
            skills: ['Pro Tools', 'Logic Pro', 'Sound Design', 'Audio Mixing'],
            experience: 'Mid-Level (3-5 years)',
            availability: {
              type: 'parttime',
              hoursPerWeek: 25
            },
            hourlyRate: '70',
            performance: {
              rating: 4.5,
              projectsCompleted: 35,
              onTimeDelivery: 89,
              clientSatisfaction: 4.6
            }
          },
          currentWorkload: {
            activeProjects: 2,
            utilizationPercentage: 80,
            availableHours: 5
          }
        }
      ];

      setAvailableStaff(mockStaff);
    } catch (error) {
      console.error('Failed to load staff:', error);
    }
  };

  const getAvailabilityColor = (utilization) => {
    if (utilization >= 90) return 'error';
    if (utilization >= 70) return 'warning';
    return 'success';
  };

  const getAvailabilityText = (utilization) => {
    if (utilization >= 90) return 'Fully Booked';
    if (utilization >= 70) return 'Busy';
    return 'Available';
  };

  const isStaffAssigned = (staffId) => {
    return currentAssignments.includes(staffId);
  };

  const isStaffSelected = (staffId) => {
    return selectedStaff.includes(staffId);
  };

  const handleStaffToggle = (staffId) => {
    setSelectedStaff(prev => {
      if (prev.includes(staffId)) {
        return prev.filter(id => id !== staffId);
      } else {
        return [...prev, staffId];
      }
    });
  };

  const handleAssignSelected = async () => {
    if (selectedStaff.length === 0) return;
    
    try {
      await onAssignStaff(project.id, selectedStaff);
      setCurrentAssignments(prev => [...prev, ...selectedStaff]);
      setSelectedStaff([]);
      setTabValue(1); // Switch to assigned tab
    } catch (error) {
      console.error('Failed to assign staff:', error);
    }
  };

  const handleRemoveStaff = async (staffId) => {
    try {
      await onRemoveStaff(project.id, [staffId]);
      setCurrentAssignments(prev => prev.filter(id => id !== staffId));
    } catch (error) {
      console.error('Failed to remove staff:', error);
    }
  };

  const renderStaffCard = (staff, isAssigned = false, showActions = true) => {
    const selected = isStaffSelected(staff.uid);
    
    return (
      <Card 
        key={staff.uid}
        sx={{ 
          mb: 2,
          border: selected ? 2 : 1,
          borderColor: selected ? 'primary.main' : 'divider',
          backgroundColor: isAssigned ? 'action.hover' : 'background.paper'
        }}
      >
        <CardActionArea 
          onClick={() => !isAssigned && showActions && handleStaffToggle(staff.uid)}
          disabled={isAssigned}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Badge
                badgeContent={isAssigned ? <AssignedIcon color="success" /> : null}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <Avatar src={staff.avatar} sx={{ width: 56, height: 56 }}>
                  {staff.name.charAt(0)}
                </Avatar>
              </Badge>
              
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6">
                    {staff.name}
                  </Typography>
                  {selected && !isAssigned && (
                    <Chip label="Selected" color="primary" size="small" />
                  )}
                  {isAssigned && (
                    <Chip label="Assigned" color="success" size="small" />
                  )}
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {staff.staffProfile.position} • {staff.staffProfile.experience}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {staff.staffProfile.skills.slice(0, 3).map((skill) => (
                    <Chip key={skill} label={skill} size="small" variant="outlined" />
                  ))}
                  {staff.staffProfile.skills.length > 3 && (
                    <Chip 
                      label={`+${staff.staffProfile.skills.length - 3} more`} 
                      size="small" 
                      variant="outlined" 
                    />
                  )}
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StarIcon color="warning" sx={{ fontSize: 16 }} />
                      <Typography variant="body2">
                        {staff.staffProfile.performance.rating}/5.0
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WorkIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2">
                        {staff.staffProfile.performance.projectsCompleted} projects
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ScheduleIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2">
                        Availability: {getAvailabilityText(staff.currentWorkload.utilizationPercentage)}
                      </Typography>
                      <Chip
                        label={`${staff.currentWorkload.utilizationPercentage}%`}
                        size="small"
                        color={getAvailabilityColor(staff.currentWorkload.utilizationPercentage)}
                      />
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={staff.currentWorkload.utilizationPercentage}
                      color={getAvailabilityColor(staff.currentWorkload.utilizationPercentage)}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {staff.currentWorkload.availableHours} hours available this week
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              {isAssigned && showActions && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Tooltip title="Remove from project">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveStaff(staff.uid);
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };

  const renderAvailableStaff = () => {
    const unassignedStaff = availableStaff.filter(staff => !isStaffAssigned(staff.uid));
    
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 3 }}>
          Select team members to assign to this project. Consider their availability and skill match.
        </Alert>
        
        {unassignedStaff.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            All available staff members are already assigned to this project.
          </Typography>
        ) : (
          <>
            {unassignedStaff.map(staff => renderStaffCard(staff, false, true))}
            
            {selectedStaff.length > 0 && (
              <Box sx={{ position: 'sticky', bottom: 0, bgcolor: 'background.paper', p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleAssignSelected}
                  disabled={loading}
                  size="large"
                >
                  Assign {selectedStaff.length} Selected Member{selectedStaff.length !== 1 ? 's' : ''}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    );
  };

  const renderAssignedStaff = () => {
    const assignedStaffData = availableStaff.filter(staff => isStaffAssigned(staff.uid));
    
    return (
      <Box>
        <Alert severity="success" sx={{ mb: 3 }}>
          These team members are currently assigned to this project.
        </Alert>
        
        {assignedStaffData.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No team members are currently assigned to this project.
          </Typography>
        ) : (
          assignedStaffData.map(staff => renderStaffCard(staff, true, true))
        )}
      </Box>
    );
  };

  const renderProjectOverview = () => {
    if (!project) return null;
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Project Overview
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Project Name</Typography>
            <Typography variant="body1" gutterBottom>{project.name}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Project Type</Typography>
            <Typography variant="body1" gutterBottom>{project.projectType}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Timeline</Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(project.timeline?.startDate).toLocaleDateString()} - {new Date(project.timeline?.endDate).toLocaleDateString()}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Estimated Hours</Typography>
            <Typography variant="body1" gutterBottom>{project.timeline?.estimatedHours} hours</Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">Description</Typography>
            <Typography variant="body1">{project.description}</Typography>
          </Grid>
        </Grid>
      </Box>
    );
  };

  if (!project) return null;

  return (
    <PermissionGate allowedRoles={['admin']}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Team Assignment - {project.name}
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Project Details" />
            <Tab label={`Available Staff (${availableStaff.filter(s => !isStaffAssigned(s.uid)).length})`} />
            <Tab label={`Assigned Team (${currentAssignments.length})`} />
          </Tabs>
          
          <Box sx={{ p: 3, maxHeight: 600, overflow: 'auto' }}>
            {tabValue === 0 && renderProjectOverview()}
            {tabValue === 1 && renderAvailableStaff()}
            {tabValue === 2 && renderAssignedStaff()}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </PermissionGate>
  );
};

export default TeamAssignmentFlow;