import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  CircularProgress,
  Alert,
  Autocomplete,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  CalendarMonth as CalendarIcon,
  Inventory as InventoryIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  GET_MATERIALS,
  GET_MATERIAL_TRANSACTIONS,
  GET_BATCH_TRANSACTIONS,
  CREATE_MATERIAL_TRANSACTION,
  UPDATE_MATERIAL_TRANSACTION,
  DELETE_MATERIAL_TRANSACTION,
} from "../../graphql/materialInventory";

// Transaction type chip component
const TransactionTypeChip = ({ type }) => {
  let color = "default";
  let icon = null;

  switch (type) {
    case "INCOMING":
      color = "success";
      icon = <ArrowDownwardIcon fontSize="small" />;
      break;
    case "OUTGOING":
      color = "error";
      icon = <ArrowUpwardIcon fontSize="small" />;
      break;
    default:
      color = "default";
  }

  return <Chip label={type} color={color} size="small" icon={icon} />;
};

const MaterialTransactions = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    materialId: "",
    type: "INCOMING",
    quantity: "",
    unit: "",
    date: new Date(),
    batchNumber: "",
    referenceNumber: "",
    notes: "",
    handledBy: "",
  });

  // Query for materials
  const {
    loading: materialsLoading,
    error: materialsError,
    data: materialsData,
  } = useQuery(GET_MATERIALS, {
    fetchPolicy: "cache-and-network",
  });

  // Query for transactions
  const {
    loading: transactionsLoading,
    error: transactionsError,
    data: transactionsData,
    refetch: refetchTransactions,
  } = useQuery(GET_MATERIAL_TRANSACTIONS, {
    fetchPolicy: "cache-and-network",
  });

  // Mutation for creating a transaction
  const [createTransaction, { loading: createLoading }] = useMutation(
    CREATE_MATERIAL_TRANSACTION,
    {
      onCompleted: () => {
        toast.success("Transaction created successfully");
        setOpenCreateDialog(false);
        resetForm();
        refetchTransactions();
      },
      onError: (error) => {
        toast.error(`Failed to create transaction: ${error.message}`);
      },
    }
  );

  // Mutation for updating a transaction
  const [updateTransaction, { loading: updateLoading }] = useMutation(
    UPDATE_MATERIAL_TRANSACTION,
    {
      onCompleted: () => {
        toast.success("Transaction updated successfully");
        setOpenEditDialog(false);
        resetForm();
        refetchTransactions();
      },
      onError: (error) => {
        toast.error(`Failed to update transaction: ${error.message}`);
      },
    }
  );

  // Mutation for deleting a transaction
  const [deleteTransaction, { loading: deleteLoading }] = useMutation(
    DELETE_MATERIAL_TRANSACTION,
    {
      onCompleted: () => {
        toast.success("Transaction deleted successfully");
        setOpenDeleteDialog(false);
        setSelectedTransaction(null);
        refetchTransactions();
      },
      onError: (error) => {
        toast.error(`Failed to delete transaction: ${error.message}`);
      },
    }
  );

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search term change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Handle filter type change
  const handleFilterTypeChange = (event) => {
    setFilterType(event.target.value);
    setPage(0);
  };

  // Handle date range filter change
  const handleDateRangeChange = (field, value) => {
    setFilterDateRange({
      ...filterDateRange,
      [field]: value,
    });
    setPage(0);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setFilterType("ALL");
    setFilterDateRange({
      startDate: null,
      endDate: null,
    });
    setPage(0);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      materialId: "",
      type: "INCOMING",
      quantity: "",
      unit: "",
      date: new Date(),
      batchNumber: "",
      referenceNumber: "",
      notes: "",
      handledBy: "",
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle material change
  const handleMaterialChange = (event, newValue) => {
    setFormData({
      ...formData,
      materialId: newValue ? newValue.id : "",
      unit: newValue ? newValue.unit : "",
    });
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setFormData({
      ...formData,
      date: newDate,
    });
  };

  // Open create dialog
  const handleOpenCreateDialog = () => {
    resetForm();
    setOpenCreateDialog(true);
  };

  // Close create dialog
  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    resetForm();
  };

  // Open edit dialog
  const handleOpenEditDialog = (transaction) => {
    setSelectedTransaction(transaction);
    const material = materialsData?.materials.find(
      (m) => m.id === transaction.material.id
    );

    setFormData({
      materialId: transaction.material.id,
      type: transaction.type,
      quantity: transaction.quantity.toString(),
      unit: transaction.unit,
      date: new Date(transaction.date),
      batchNumber: transaction.batchNumber || "",
      referenceNumber: transaction.referenceNumber || "",
      notes: transaction.notes || "",
      handledBy: transaction.handledBy || "",
    });
    setOpenEditDialog(true);
  };

  // Close edit dialog
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedTransaction(null);
    resetForm();
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedTransaction(null);
  };

  // Open view dialog
  const handleOpenViewDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenViewDialog(true);
  };

  // Close view dialog
  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedTransaction(null);
  };

  // Handle create transaction
  const handleCreateTransaction = () => {
    createTransaction({
      variables: {
        input: {
          materialId: formData.materialId,
          type: formData.type,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          date: formData.date.toISOString(),
          batchNumber: formData.batchNumber || null,
          referenceNumber: formData.referenceNumber || null,
          notes: formData.notes || null,
          handledBy: formData.handledBy || null,
        },
      },
    });
  };

  // Handle update transaction
  const handleUpdateTransaction = () => {
    updateTransaction({
      variables: {
        id: selectedTransaction.id,
        input: {
          materialId: formData.materialId,
          type: formData.type,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          date: formData.date.toISOString(),
          batchNumber: formData.batchNumber || null,
          referenceNumber: formData.referenceNumber || null,
          notes: formData.notes || null,
          handledBy: formData.handledBy || null,
        },
      },
    });
  };

  // Handle delete transaction
  const handleDeleteTransaction = () => {
    deleteTransaction({
      variables: {
        id: selectedTransaction.id,
      },
    });
  };

  // Filter and paginate transactions
  const filteredTransactions = transactionsData
    ? transactionsData.materialTransactions.filter((transaction) => {
        // Filter by search term
        const searchMatch =
          transaction.material.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (transaction.batchNumber &&
            transaction.batchNumber
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (transaction.referenceNumber &&
            transaction.referenceNumber
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (transaction.handledBy &&
            transaction.handledBy
              .toLowerCase()
              .includes(searchTerm.toLowerCase()));

        // Filter by transaction type
        const typeMatch =
          filterType === "ALL" || transaction.type === filterType;

        // Filter by date range
        const transactionDate = new Date(transaction.date);
        const startDateMatch =
          !filterDateRange.startDate ||
          transactionDate >= filterDateRange.startDate;
        const endDateMatch =
          !filterDateRange.endDate ||
          transactionDate <= filterDateRange.endDate;

        return searchMatch && typeMatch && startDateMatch && endDateMatch;
      })
    : [];

  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  const paginatedTransactions = sortedTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Find material by ID
  const findMaterialById = (id) => {
    return materialsData?.materials.find((material) => material.id === id);
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5">Material Transactions</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Add Transaction
          </Button>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Transactions"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              placeholder="Search by material, batch, reference, or handler"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Transaction Type</InputLabel>
              <Select
                value={filterType}
                label="Transaction Type"
                onChange={handleFilterTypeChange}
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="INCOMING">Incoming</MenuItem>
                <MenuItem value="OUTGOING">Outgoing</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="From Date"
                value={filterDateRange.startDate}
                onChange={(newValue) =>
                  handleDateRangeChange("startDate", newValue)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon />
                        </InputAdornment>
                      ),
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="To Date"
                value={filterDateRange.endDate}
                onChange={(newValue) =>
                  handleDateRangeChange("endDate", newValue)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon />
                        </InputAdornment>
                      ),
                    },
                  },
                }}
              />
            </Grid>
          </LocalizationProvider>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={resetFilters}
              sx={{ height: "100%" }}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>

        {/* Error message */}
        {transactionsError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error loading transactions: {transactionsError.message}
          </Alert>
        )}

        {/* Loading indicator */}
        {transactionsLoading && !transactionsData && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Table */}
        {!transactionsLoading && filteredTransactions.length === 0 ? (
          <Alert severity="info">
            No transactions found.{" "}
            {searchTerm ||
            filterType !== "ALL" ||
            filterDateRange.startDate ||
            filterDateRange.endDate
              ? "Try different filter settings."
              : "Add a transaction to get started."}
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Material</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Batch Number</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Handled By</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(
                          new Date(transaction.date),
                          "dd MMM yyyy, HH:mm"
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "medium" }}
                        >
                          {transaction.material.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {transaction.material.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <TransactionTypeChip type={transaction.type} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {transaction.quantity} {transaction.unit}
                        </Typography>
                      </TableCell>
                      <TableCell>{transaction.batchNumber || "-"}</TableCell>
                      <TableCell>
                        {transaction.referenceNumber || "-"}
                      </TableCell>
                      <TableCell>{transaction.handledBy || "-"}</TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenViewDialog(transaction)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditDialog(transaction)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(transaction)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredTransactions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Create Transaction Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Material Transaction</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={materialsData?.materials || []}
                getOptionLabel={(option) => `${option.name} (${option.code})`}
                value={
                  formData.materialId
                    ? findMaterialById(formData.materialId)
                    : null
                }
                onChange={handleMaterialChange}
                loading={materialsLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Material"
                    required
                    error={!formData.materialId}
                    helperText={
                      !formData.materialId ? "Material is required" : ""
                    }
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <InventoryIcon />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  label="Transaction Type"
                  onChange={handleInputChange}
                >
                  <MenuItem value="INCOMING">Incoming</MenuItem>
                  <MenuItem value="OUTGOING">Outgoing</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {formData.unit}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Transaction Date"
                  value={formData.date}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon />
                          </InputAdornment>
                        ),
                      },
                    },
                  }}
                />
              </Grid>
            </LocalizationProvider>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Batch Number"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Reference Number"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Handled By"
                name="handledBy"
                value={formData.handledBy}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button
            onClick={handleCreateTransaction}
            color="primary"
            disabled={
              createLoading || !formData.materialId || !formData.quantity
            }
            startIcon={createLoading && <CircularProgress size={20} />}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Material Transaction</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={materialsData?.materials || []}
                getOptionLabel={(option) => `${option.name} (${option.code})`}
                value={
                  formData.materialId
                    ? findMaterialById(formData.materialId)
                    : null
                }
                onChange={handleMaterialChange}
                loading={materialsLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Material"
                    required
                    error={!formData.materialId}
                    helperText={
                      !formData.materialId ? "Material is required" : ""
                    }
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <InventoryIcon />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  label="Transaction Type"
                  onChange={handleInputChange}
                >
                  <MenuItem value="INCOMING">Incoming</MenuItem>
                  <MenuItem value="OUTGOING">Outgoing</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {formData.unit}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Transaction Date"
                  value={formData.date}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon />
                          </InputAdornment>
                        ),
                      },
                    },
                  }}
                />
              </Grid>
            </LocalizationProvider>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Batch Number"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Reference Number"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Handled By"
                name="handledBy"
                value={formData.handledBy}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            onClick={handleUpdateTransaction}
            color="primary"
            disabled={
              updateLoading || !formData.materialId || !formData.quantity
            }
            startIcon={updateLoading && <CircularProgress size={20} />}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Transaction Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this transaction? This action cannot
            be undone and may affect inventory levels.
          </DialogContentText>
          {selectedTransaction && (
            <Box
              sx={{ mt: 2, p: 2, bgcolor: "background.paper", borderRadius: 1 }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Transaction Details:
              </Typography>
              <Typography variant="body2">
                <strong>Material:</strong> {selectedTransaction.material.name}
              </Typography>
              <Typography variant="body2">
                <strong>Type:</strong> {selectedTransaction.type}
              </Typography>
              <Typography variant="body2">
                <strong>Quantity:</strong> {selectedTransaction.quantity}{" "}
                {selectedTransaction.unit}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong>{" "}
                {format(
                  new Date(selectedTransaction.date),
                  "dd MMM yyyy, HH:mm"
                )}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteTransaction}
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading && <CircularProgress size={20} />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Transaction Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">Transaction Details</Typography>
            {selectedTransaction && (
              <TransactionTypeChip type={selectedTransaction.type} />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Material Information
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Material Name
                    </Typography>
                    <Typography variant="body1">
                      {selectedTransaction.material.name}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Material Code
                    </Typography>
                    <Typography variant="body1">
                      {selectedTransaction.material.code}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Quantity
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      {selectedTransaction.quantity} {selectedTransaction.unit}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Transaction Information
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Date & Time
                    </Typography>
                    <Typography variant="body1">
                      {format(
                        new Date(selectedTransaction.date),
                        "dd MMMM yyyy, HH:mm:ss"
                      )}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Batch Number
                    </Typography>
                    <Typography variant="body1">
                      {selectedTransaction.batchNumber || "Not specified"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Reference Number
                    </Typography>
                    <Typography variant="body1">
                      {selectedTransaction.referenceNumber || "Not specified"}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Handled By
                    </Typography>
                    <Typography variant="body1">
                      {selectedTransaction.handledBy || "Not specified"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body1">
                      {selectedTransaction.notes || "No notes available"}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          <Button
            onClick={() => {
              handleCloseViewDialog();
              handleOpenEditDialog(selectedTransaction);
            }}
            color="primary"
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaterialTransactions;
