import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Container,
  Card,
  CardContent,
  Button,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress
} from '@mui/material';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import firebaseService from '../../services/firebase/firebaseService';
import { useNavigate } from 'react-router-dom';
import { 
  ServiceCard, 
  ServiceRequestModal, 
  AdminServiceModal 
} from '../../components/services';
import {
  PlayCircle,
  Building2,
  Lightbulb,
  Smartphone,
  MessageSquare,
  Package
} from 'lucide-react';

const ServicesContent = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });

  // Define the 6 video production services
  const services = [
    {
      id: 'commercial',
      name: 'Video Commercials',
      price: 'Starting at $5,000',
      description: 'Professional commercials for social media, YouTube, and TV advertising',
      icon: PlayCircle
    },
    {
      id: 'brand',
      name: 'Brand Overview',
      price: 'Starting at $6,500',
      description: 'Compelling company introduction videos that tell your brand story',
      icon: Building2
    },
    {
      id: 'explainer',
      name: 'Explainer Videos',
      price: 'From $5,500',
      description: 'Clear product and service demonstrations that engage and educate',
      icon: Lightbulb
    },
    {
      id: 'social',
      name: 'Social Content',
      price: 'Starting at $3,000',
      description: 'Eye-catching content for TikTok, Reels, and Shorts (5 videos)',
      icon: Smartphone
    },
    {
      id: 'testimonial',
      name: 'Customer Testimonials',
      price: 'Starting at $4,500',
      description: 'Authentic customer story videos that build trust and credibility',
      icon: MessageSquare
    },
    {
      id: 'product',
      name: 'Product Videos',
      price: 'Starting at $3,500',
      description: 'Dynamic product highlight videos that showcase your offerings',
      icon: Package
    }
  ];

  // Fetch clients and pending requests for admin
  useEffect(() => {
    const fetchData = async () => {
      if (user?.role === 'admin') {
        setLoading(true);
        try {
          // Fetch all clients
          const clientsData = await firebaseService.getClients();
          
          const processedClients = clientsData.map(client => ({
            id: client.id,
            name: client.name || client.contactPerson || 'Unknown',
            company: client.company || 'No Company'
          }));
          setClients(processedClients);

          // Fetch pending service requests
          const projects = await firebaseService.getProjects();
          const serviceRequests = projects.filter(p => p.status === 'service_request');
          setPendingRequests(serviceRequests);
        } catch (error) {
          console.error('Error fetching admin data:', error);
          
          // More specific error handling
          if (error.message.includes('requires an index')) {
            showFeedback('Firebase index required. Check console for index creation link.', 'warning');
          } else {
            showFeedback('Error loading data. Please refresh the page.', 'error');
          }
          
          // Set empty arrays so UI doesn't break
          setClients([]);
          setPendingRequests([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  const handleServiceAction = (service) => {
    setSelectedService(service);
    setModalOpen(true);
  };

  const showFeedback = (message, severity = 'success') => {
    setFeedback({ open: true, message, severity });
  };

  const handleFeedbackClose = () => {
    setFeedback({ ...feedback, open: false });
  };

  const handleModalClose = () => {
    if (!submitting) {
      setModalOpen(false);
      setTimeout(() => setSelectedService(null), 200); // Clear after animation
    }
  };

  const getTimelineInDays = (timeline) => {
    switch (timeline) {
      case 'asap': return 7;
      case '1-2weeks': return 14;
      case '1month': return 30;
      case '2months': return 60;
      case '3months': return 90;
      case 'flexible': return 30;
      default: return 30;
    }
  };

  const getTimelineStartAndDue = (timeline) => {
    const days = getTimelineInDays(timeline);
    const startDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(startDate.getDate() + days);
    
    return {
      startDate: startDate.toISOString(),
      dueDate: dueDate.toISOString()
    };
  };

  const handleClientSubmit = async (data) => {
    setSubmitting(true);
    try {
      const { startDate, dueDate } = getTimelineStartAndDue(data.timeline);
      
      // Create project with service_request status
      const projectData = {
        name: data.projectName,
        description: data.description,
        clientId: user.uid,
        status: 'service_request',
        statusLabel: 'Pending Approval',
        priority: data.timeline === 'asap' ? 'high' : 'medium',
        progress: 0,
        videoType: data.serviceType,
        budget: 0, // To be set by admin
        estimatedHours: 0,
        actualHours: 0,
        startDate,
        dueDate,
        deliverables: [],
        assets: [],
        finalDeliverables: [],
        feedback: [],
        approvalStatus: 'pending',
        assignedStaff: [],
        projectManager: '',
        // Service request specific fields
        serviceRequested: data.serviceName,
        requestedTimeline: data.timeline,
        additionalNotes: data.additionalNotes,
        basePrice: data.basePrice
      };

      const newProject = await firebaseService.createProject(projectData);
      
      // Create notification for admin
      await firebaseService.createNotification({
        id: `service_request_${Date.now()}`,
        userId: 'admin', // This should be actual admin IDs in production
        title: 'New Service Request',
        message: `${user.name} has requested ${data.serviceName}`,
        type: 'info',
        category: 'project',
        read: false,
        actionRequired: true,
        relatedEntity: {
          type: 'project',
          id: newProject.id
        },
        action: {
          label: 'Review Request',
          url: '/services',
          type: 'navigation'
        }
      });

      showFeedback('Your service request has been submitted successfully! We will review and get back to you soon.');
      handleModalClose();
    } catch (error) {
      console.error('Error submitting service request:', error);
      showFeedback('Error submitting request. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminSubmit = async (data) => {
    console.log('🏢 Admin creating project with data:', data);
    console.log('🎯 Selected clientId:', data.clientId);
    console.log('📝 Available clients:', clients);
    
    setSubmitting(true);
    try {
      const selectedClient = clients.find(c => c.id === data.clientId);
      console.log('👤 Selected client:', selectedClient);
      
      const { startDate, dueDate } = getTimelineStartAndDue(data.timeline);
      
      // Create project directly
      const projectData = {
        name: data.projectName,
        description: data.description,
        clientId: data.clientId,
        status: data.skipApproval ? 'in-production' : 'draft',
        statusLabel: data.skipApproval ? 'In Production' : 'Draft',
        priority: data.timeline === 'asap' ? 'high' : 'medium',
        progress: 0,
        videoType: data.serviceType,
        budget: data.budget,
        estimatedHours: Math.round(data.budget / 150), // Rough estimate
        actualHours: 0,
        startDate,
        dueDate,
        deliverables: [],
        assets: [],
        finalDeliverables: [],
        feedback: [],
        approvalStatus: data.skipApproval ? 'approved' : 'pending',
        assignedStaff: [],
        projectManager: user.uid,
        // Service info
        serviceRequested: data.serviceName,
        requestedTimeline: data.timeline,
        additionalNotes: data.additionalNotes
      };

      console.log('🏗️ Creating project with data:', projectData);
      const newProject = await firebaseService.createProject(projectData);
      console.log('✅ Project created:', newProject);
      
      // Create notification for client
      await firebaseService.createNotification({
        id: `project_created_${Date.now()}`,
        userId: data.clientId,
        title: data.skipApproval ? 'New Project Started' : 'New Project Created',
        message: `Your ${data.serviceName} project "${data.projectName}" has been ${data.skipApproval ? 'started' : 'created'}`,
        type: 'success',
        category: 'project',
        read: false,
        actionRequired: false,
        relatedEntity: {
          type: 'project',
          id: newProject.id
        },
        action: {
          label: 'View Project',
          url: `/project/${newProject.id}`,
          type: 'navigation'
        }
      });

      showFeedback(`Project created successfully! ${data.skipApproval ? 'Production has started.' : 'Awaiting client approval.'}`);
      handleModalClose();
      
      // Navigate to the new project after a short delay to show feedback
      setTimeout(() => {
        navigate(`/project/${newProject.id}`);
      }, 1500);
    } catch (error) {
      console.error('Error creating project:', error);
      showFeedback('Error creating project. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading services..." />;
  }

  return (
    <Box sx={{ py: 3 }}>
      <Container maxWidth="lg">
        {/* Header Section - matching Dashboard style */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h2" 
            fontWeight={600}
            gutterBottom
          >
            Our Video Products
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
          >
            {user?.role === 'admin' 
              ? 'Create projects directly or manage client requests' 
              : 'Browse our packages to find the perfect fit for your campaign'}
          </Typography>
        </Box>

        {/* Services Grid */}
        <Grid 
          container 
          spacing={3}
          sx={{ 
            display: 'flex',
            justifyContent: 'center' // Center all cards
          }}
        >
          {services.map((service) => (
            <Grid 
              item 
              key={service.id}
              sx={{ 
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <ServiceCard 
                service={service}
                onClick={handleServiceAction}
              />
            </Grid>
          ))}
        </Grid>

        {/* Admin-specific section for pending requests */}
        {user?.role === 'admin' && (
          <Box sx={{ mt: 6 }}>
            <Typography 
              variant="h5" 
              fontWeight={600}
              gutterBottom
            >
              Pending Service Requests ({pendingRequests.length})
            </Typography>
            {pendingRequests.length === 0 ? (
              <Box 
                sx={{ 
                  p: 3, 
                  mt: 2,
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'grey.50',
                  textAlign: 'center'
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No pending service requests at this time.
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Client service requests will appear here for your review and approval.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {pendingRequests.map((request) => (
                  <Grid item xs={12} md={6} key={request.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {request.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Service: {request.serviceRequested}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Timeline: {request.requestedTimeline}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Base Price: {request.basePrice}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button 
                            variant="contained" 
                            size="small"
                            onClick={() => navigate(`/project/${request.id}`)}
                          >
                            Review & Approve
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Container>

      {/* Loading Backdrop */}
      <Backdrop 
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
        open={submitting}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Feedback Snackbar */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={6000}
        onClose={handleFeedbackClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleFeedbackClose} 
          severity={feedback.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>

      {/* Modals */}
      {user?.role === 'client' && (
        <ServiceRequestModal
          open={modalOpen}
          onClose={handleModalClose}
          service={selectedService}
          onSubmit={handleClientSubmit}
          submitting={submitting}
        />
      )}

      {user?.role === 'admin' && (
        <AdminServiceModal
          open={modalOpen}
          onClose={handleModalClose}
          service={selectedService}
          onSubmit={handleAdminSubmit}
          clients={clients}
          submitting={submitting}
        />
      )}
    </Box>
  );
};

export default ServicesContent;