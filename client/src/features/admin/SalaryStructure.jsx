import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, MenuItem, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  useGetSalaryStructuresQuery,
  useCreateSalaryStructureMutation,
  useUpdateSalaryStructureMutation,
  useDeleteSalaryStructureMutation,
} from './salaryApiSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const STAFF_TYPES = {
  teacher: 'Teacher',
  staff: 'Staff',
};

const DESIGNATIONS = {
  teacher: [
    'Primary Teacher',
    'Trained Graduate Teacher',
    'Post Graduate Teacher',
    'Special Educator',
    'Librarian',
    'Lab Assistant',
  ],
  staff: [
    'Principal',
    'Vice Principal',
    'Clerk',
    'Receptionist',
    'Peon',
    'Security Guard',
    'Sweeper',
    'Lab Assistant',
    'Librarian',
  ],
};

const SalaryStructure = () => {
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [formData, setFormData] = useState({
    staffType: 'teacher',
    designation: '',
    basicSalary: '',
    allowances: {
      hra: '',
      da: '',
      ta: '',
      medical: '',
      special: '',
    },
    deductions: {
      pf: '',
      tax: '',
      esi: '',
      other: '',
    },
  });

  const { data: structuresData, isLoading } = useGetSalaryStructuresQuery();
  const [createStructure] = useCreateSalaryStructureMutation();
  const [updateStructure] = useUpdateSalaryStructureMutation();
  const [deleteStructure] = useDeleteSalaryStructureMutation();

  const structures = structuresData?.data || [];

  const handleOpenForm = (structure = null) => {
    if (structure) {
      setEditingStructure(structure);
      setFormData({
        staffType: structure.staffType,
        designation: structure.designation,
        basicSalary: structure.basicSalary,
        allowances: {
          hra: structure.allowances?.hra || '',
          da: structure.allowances?.da || '',
          ta: structure.allowances?.ta || '',
          medical: structure.allowances?.medical || '',
          special: structure.allowances?.special || '',
        },
        deductions: {
          pf: structure.deductions?.pf || '',
          tax: structure.deductions?.tax || '',
          esi: structure.deductions?.esi || '',
          other: structure.deductions?.other || '',
        },
      });
    } else {
      setEditingStructure(null);
      setFormData({
        staffType: 'teacher',
        designation: '',
        basicSalary: '',
        allowances: {
          hra: '',
          da: '',
          ta: '',
          medical: '',
          special: '',
        },
        deductions: {
          pf: '',
          tax: '',
          esi: '',
          other: '',
        },
      });
    }
    setFormDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        basicSalary: parseFloat(formData.basicSalary),
        allowances: {
          hra: parseFloat(formData.allowances.hra) || 0,
          da: parseFloat(formData.allowances.da) || 0,
          ta: parseFloat(formData.allowances.ta) || 0,
          medical: parseFloat(formData.allowances.medical) || 0,
          special: parseFloat(formData.allowances.special) || 0,
        },
        deductions: {
          pf: parseFloat(formData.deductions.pf) || 0,
          tax: parseFloat(formData.deductions.tax) || 0,
          esi: parseFloat(formData.deductions.esi) || 0,
          other: parseFloat(formData.deductions.other) || 0,
        },
      };

      if (editingStructure) {
        await updateStructure({ id: editingStructure._id, ...data }).unwrap();
      } else {
        await createStructure(data).unwrap();
      }

      setFormDialogOpen(false);
      setEditingStructure(null);
    } catch (err) {
      alert(err?.data?.message || 'Failed to save salary structure');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this salary structure?')) {
      return;
    }

    try {
      await deleteStructure(id).unwrap();
    } catch (err) {
      alert(err?.data?.message || 'Failed to delete salary structure');
    }
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleAllowanceChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      allowances: {
        ...prev.allowances,
        [field]: e.target.value,
      },
    }));
  };

  const handleDeductionChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        [field]: e.target.value,
      },
    }));
  };

  const calculateNetSalary = () => {
    const basic = parseFloat(formData.basicSalary) || 0;
    const totalAllowances =
      (parseFloat(formData.allowances.hra) || 0) +
      (parseFloat(formData.allowances.da) || 0) +
      (parseFloat(formData.allowances.ta) || 0) +
      (parseFloat(formData.allowances.medical) || 0) +
      (parseFloat(formData.allowances.special) || 0);
    const totalDeductions =
      (parseFloat(formData.deductions.pf) || 0) +
      (parseFloat(formData.deductions.tax) || 0) +
      (parseFloat(formData.deductions.esi) || 0) +
      (parseFloat(formData.deductions.other) || 0);
    return basic + totalAllowances - totalDeductions;
  };

  return (
    <Box>
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h5">
          Salary Structure
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Add Structure
        </Button>
      </Box>

      {/* Structures Table */}
      <Card>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Staff Type</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Basic Salary</TableCell>
                    <TableCell>Allowances</TableCell>
                    <TableCell>Deductions</TableCell>
                    <TableCell>Gross Salary</TableCell>
                    <TableCell>Net Salary</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {structures.map((structure) => (
                    <TableRow key={structure._id} hover>
                      <TableCell>{STAFF_TYPES[structure.staffType] || structure.staffType}</TableCell>
                      <TableCell>{structure.designation}</TableCell>
                      <TableCell>${structure.basicSalary}</TableCell>
                      <TableCell>
                        <Typography variant="caption" className="block">
                          HRA: ${structure.allowances?.hra || 0}
                        </Typography>
                        <Typography variant="caption" className="block">
                          DA: ${structure.allowances?.da || 0}
                        </Typography>
                        <Typography variant="caption" className="block">
                          Other: ${((structure.allowances?.ta || 0) + (structure.allowances?.medical || 0) + (structure.allowances?.special || 0))}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" className="block">
                          PF: ${structure.deductions?.pf || 0}
                        </Typography>
                        <Typography variant="caption" className="block">
                          Tax: ${structure.deductions?.tax || 0}
                        </Typography>
                        <Typography variant="caption" className="block">
                          Other: ${((structure.deductions?.esi || 0) + (structure.deductions?.other || 0))}
                        </Typography>
                      </TableCell>
                      <TableCell>${structure.grossSalary}</TableCell>
                      <TableCell><strong>${structure.netSalary}</strong></TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenForm(structure)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(structure._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={formDialogOpen} onClose={() => setFormDialogOpen(false)}>
        <DialogTitle>
          {editingStructure ? 'Edit Salary Structure' : 'Add Salary Structure'}
        </DialogTitle>
        <DialogContent className="space-y-3" style={{ minWidth: 500 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Staff Type"
                value={formData.staffType}
                onChange={handleChange('staffType')}
              >
                {Object.entries(STAFF_TYPES).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Designation"
                value={formData.designation}
                onChange={handleChange('designation')}
              >
                {(DESIGNATIONS[formData.staffType] || []).map((desig) => (
                  <MenuItem key={desig} value={desig}>
                    {desig}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" className="mb-2">
                Basic Salary
              </Typography>
              <TextField
                fullWidth
                type="number"
                label="Basic Salary"
                value={formData.basicSalary}
                onChange={handleChange('basicSalary')}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" className="mb-2">
                Allowances
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="HRA"
                    value={formData.allowances.hra}
                    onChange={handleAllowanceChange('hra')}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="DA"
                    value={formData.allowances.da}
                    onChange={handleAllowanceChange('da')}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="TA"
                    value={formData.allowances.ta}
                    onChange={handleAllowanceChange('ta')}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Medical"
                    value={formData.allowances.medical}
                    onChange={handleAllowanceChange('medical')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Special Allowance"
                    value={formData.allowances.special}
                    onChange={handleAllowanceChange('special')}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" className="mb-2">
                Deductions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="PF"
                    value={formData.deductions.pf}
                    onChange={handleDeductionChange('pf')}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Tax"
                    value={formData.deductions.tax}
                    onChange={handleDeductionChange('tax')}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="ESI"
                    value={formData.deductions.esi}
                    onChange={handleDeductionChange('esi')}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Other"
                    value={formData.deductions.other}
                    onChange={handleDeductionChange('other')}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" className="text-right">
                Net Salary: ${calculateNetSalary()}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingStructure ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalaryStructure;
