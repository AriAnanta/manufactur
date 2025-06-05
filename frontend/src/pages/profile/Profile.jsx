import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  VpnKey as VpnKeyIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  GET_CURRENT_USER,
  UPDATE_PROFILE,
  CHANGE_PASSWORD,
} from "../../graphql/userService";

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile = () => {
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Query for current user
  const {
    loading: userLoading,
    error: userError,
    data: userData,
    refetch: refetchUser,
  } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      if (data && data.currentUser) {
        setProfileData({
          fullName: data.currentUser.fullName || "",
          email: data.currentUser.email || "",
        });
      }
    },
  });

  // Mutation for updating profile
  const [updateProfile, { loading: updateProfileLoading }] = useMutation(
    UPDATE_PROFILE,
    {
      onCompleted: () => {
        toast.success("Profile updated successfully");
        setEditMode(false);
        refetchUser();
      },
      onError: (error) => {
        toast.error(`Failed to update profile: ${error.message}`);
      },
    }
  );

  // Mutation for changing password
  const [changePassword, { loading: changePasswordLoading }] = useMutation(
    CHANGE_PASSWORD,
    {
      onCompleted: () => {
        toast.success("Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      },
      onError: (error) => {
        toast.error(`Failed to change password: ${error.message}`);
      },
    }
  );

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle profile form input changes
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  // Handle password form input changes
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  // Toggle edit mode
  const handleToggleEditMode = () => {
    if (editMode) {
      // Reset form data if canceling edit
      if (userData && userData.currentUser) {
        setProfileData({
          fullName: userData.currentUser.fullName || "",
          email: userData.currentUser.email || "",
        });
      }
    }
    setEditMode(!editMode);
  };

  // Handle update profile
  const handleUpdateProfile = () => {
    updateProfile({
      variables: {
        input: {
          fullName: profileData.fullName || null,
        },
      },
    });
  };

  // Handle change password
  const handleChangePassword = () => {
    // Validate password match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    changePassword({
      variables: {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      },
    });
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData || !userData.currentUser) return "?";

    const fullName = userData.currentUser.fullName || "";
    if (!fullName) return userData.currentUser.username.charAt(0).toUpperCase();

    const nameParts = fullName.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(
        0
      )}`.toUpperCase();
    } else if (fullName) {
      return fullName.charAt(0).toUpperCase();
    }
    return "?";
  };

  // Get user full name
  const getUserFullName = () => {
    if (!userData || !userData.currentUser) return "User";

    const fullName = userData.currentUser.fullName || "";
    if (!fullName) return userData.currentUser.username;
    return fullName;
  };

  return (
    <Box>
      {/* Loading indicator */}
      {userLoading && !userData && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error message */}
      {userError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading user profile: {userError.message}
        </Alert>
      )}

      {userData && userData.currentUser && (
        <>
          {/* Profile header */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "primary.main",
                    fontSize: "2rem",
                  }}
                >
                  {getUserInitials()}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h5" component="h1">
                  {getUserFullName()}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {userData.currentUser.email}
                </Typography>
                <Chip
                  label={userData.currentUser.role.toUpperCase()}
                  color="primary"
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={editMode ? <CancelIcon /> : <EditIcon />}
                  onClick={handleToggleEditMode}
                >
                  {editMode ? "Cancel" : "Edit Profile"}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Profile tabs */}
          <Paper sx={{ p: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="profile tabs"
              sx={{ mb: 3 }}
            >
              <Tab
                label="Profile Info"
                icon={<PersonIcon />}
                iconPosition="start"
              />
              <Tab
                label="Change Password"
                icon={<VpnKeyIcon />}
                iconPosition="start"
              />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleProfileInputChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileInputChange}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Role"
                    name="role"
                    value={userData.currentUser.role.toUpperCase()}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Status"
                    name="status"
                    value={
                      userData.currentUser.status === "ACTIVE"
                        ? "Active"
                        : "Inactive"
                    }
                    disabled
                  />
                </Grid>
                {editMode && (
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleUpdateProfile}
                      disabled={updateProfileLoading}
                    >
                      {updateProfileLoading ? (
                        <CircularProgress size={24} />
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            edge="end"
                          >
                            {showCurrentPassword ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            edge="end"
                          >
                            {showConfirmPassword ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleChangePassword}
                    disabled={changePasswordLoading}
                  >
                    {changePasswordLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Profile;
