import React, { useState, useEffect, useCallback } from "react";
import { Typography, Grid, Alert, Box } from "@mui/material";
import {
  Folder as FolderIcon,
  Storage as StorageIcon,
  Upload as UploadIcon,
  Category as CategoryIcon,
  VideoLibrary as VideoIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  AudioFile as AudioIcon,
  AttachFile as FileIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { StatsCard } from "../../components/DashboardComponents";
import LoadingSpinner from "../../components/LoadingSpinner";
import firebaseService from "../../services/firebase/firebaseService";
import AssetManager from "../../components/assets/AssetManager";

const AssetsContent = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAssetsData = useCallback(async () => {
    // Don't load data if user authentication is not ready
    if (!user || !user.uid || !user.role) {
      console.log('⏳ Waiting for user authentication to complete before loading assets...');
      return;
    }

    try {
      setLoading(true);
      console.log(`📁 Loading assets for authenticated user: ${user.email} (${user.role})`);

      // Get storage statistics for the user
      const stats = await firebaseService.getUserStorageStats(user.uid);

      // Calculate stats for display
      const realStats = [];

      // Format file size helper
      const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
      };

      // Total Files
      realStats.push({
        icon: FolderIcon,
        title: "Total Files",
        value: stats.totalFiles,
        subtitle: "All your assets",
        seeAll: false,
        section: "totalFiles",
        statKey: "totalFiles",
      });

      // Storage Used  
      realStats.push({
        icon: StorageIcon,
        title: "Storage Used",
        value: formatFileSize(stats.totalSize),
        subtitle: "Total space used",
        seeAll: false,
        section: "storageUsed",
        statKey: "storageUsed",
      });

      // Recent Uploads
      realStats.push({
        icon: UploadIcon,
        title: "Recent Uploads",
        value: stats.recentUploads,
        subtitle: "Last 7 days",
        seeAll: false,
        section: "recentUploads", 
        statKey: "recentUploads",
      });

      // Most Used Type
      const mostUsedType = Object.entries(stats.typeBreakdown)
        .sort(([,a], [,b]) => b.count - a.count)[0];
      
      const getTypeIcon = (type) => {
        switch (type) {
          case 'video': return VideoIcon;
          case 'document': return DocumentIcon;
          case 'image': return ImageIcon;
          case 'audio': return AudioIcon;
          default: return FileIcon;
        }
      };

      const getTypeLabel = (type) => {
        switch (type) {
          case 'video': return 'Videos';
          case 'document': return 'Documents';
          case 'image': return 'Images';
          case 'audio': return 'Audio';
          default: return 'Files';
        }
      };

      if (mostUsedType) {
        realStats.push({
          icon: getTypeIcon(mostUsedType[0]),
          title: getTypeLabel(mostUsedType[0]),
          value: mostUsedType[1].count,
          subtitle: "Most used type",
          seeAll: true,
          section: `filter-${mostUsedType[0]}`,
          statKey: "mostUsedType",
        });
      } else {
        realStats.push({
          icon: CategoryIcon,
          title: "File Types",
          value: 0,
          subtitle: "Upload files to see breakdown",
          seeAll: false,
          section: "fileTypes",
          statKey: "fileTypes",
        });
      }

      // Create final data structure
      const finalData = {
        user: {
          name: user?.name || "User",
          company: user?.company || "",
          email: user?.email || "",
          avatar: user?.avatar || "",
          role: user?.role || "client",
        },
        stats: realStats,
        storageStats: stats,
      };

      setData(finalData);
    } catch (error) {
      console.error("Error loading assets data:", error);

      // Fallback data
      const fallbackData = {
        user: {
          name: user?.name || "User",
          company: user?.company || "",
          email: user?.email || "",
          avatar: user?.avatar || "",
          role: user?.role || "client",
        },
        stats: [
          {
            icon: FolderIcon,
            title: "Total Files",
            value: 0,
            subtitle: "No files available",
            seeAll: false,
            section: "totalFiles",
            statKey: "totalFiles",
          },
        ],
        storageStats: {
          totalFiles: 0,
          totalSize: 0,
          typeBreakdown: {},
          recentUploads: 0,
          lastUpload: null
        },
      };

      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAssetsData();
  }, [user?.role, user?.uid, loadAssetsData]);

  const handleSeeAllClick = (section) => {
    console.log("See all clicked for:", section);
    // TODO: Implement filtering by clicking on stats cards
    // For now, just scroll to the files section
  };

  const handleFileAction = (action, fileOrResults) => {
    console.log("File action:", action, fileOrResults);
    // Refresh data when files are uploaded/deleted
    if (action === 'upload' || action === 'delete') {
      loadAssetsData();
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading assets..." />;
  }

  if (!data) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load assets data. Please refresh the page.
      </Alert>
    );
  }

  return (
    <>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" fontWeight={600} gutterBottom>
          {data.user.role === "admin"
            ? `Asset Management`
            : `Your Assets`}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {data.user.role === "admin"
            ? "Manage all user assets and storage across the platform"
            : "Upload, organize, and manage your files and media assets"}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {data.stats &&
          data.stats.map((stat, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={index}
            >
              <StatsCard
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
                seeAll={stat.seeAll}
                onSeeAllClick={() => handleSeeAllClick(stat.section)}
                statKey={stat.statKey}
              />
            </Grid>
          ))}
      </Grid>

      {/* Main Assets Manager */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          File Manager
        </Typography>
        <AssetManager
          userId={user.uid}
          userRole={user.role}
          onFileAction={handleFileAction}
        />
      </Box>
    </>
  );
};

export default AssetsContent;