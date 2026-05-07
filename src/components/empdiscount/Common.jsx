"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
    Autocomplete, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControlLabel, InputAdornment, Paper, TextField, Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@/components/IconButton";
import Button from "@/components/Button";
import { FixedSizeList } from "react-window";

export const Dialogbox = ({ open, onClose, onSave, allDesignations = [], allEmployeeData = [] }) => {
    const initialFormValues = {
        designation: null,
        discount: '',
        employeeSearchTerm: '',
        employeeSearchMode: 'email',
        selectedEmployees: []
    };

    const [formValues, setFormValues] = useState(initialFormValues);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            setFormValues(initialFormValues);
            setErrors({});
        }
    }, [open]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({
            ...prev,
            [name]: name === 'discount' ? Number(value) : value
        }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const toggleSearchMode = (mode) => {
        setFormValues(prev => ({
            ...prev,
            employeeSearchMode: mode,
            employeeSearchTerm: ''
        }));
    };
    
    const filteredEmployees = useMemo(() => {
        const { employeeSearchTerm, employeeSearchMode, designation } = formValues;
        let filtered = [];

        if (designation) {
            filtered = allEmployeeData.filter(emp => emp.designation === designation.designation);
        }

        if (employeeSearchTerm.trim()) {
            const lower = employeeSearchTerm.toLowerCase();
            filtered = filtered.filter(emp => {
                if (employeeSearchMode === 'email') {
                    return emp.id?.toLowerCase().includes(lower);
                } else if (employeeSearchMode === 'code') {
                    return emp.customerCode?.toLowerCase().includes(lower);
                }
                return false;
            });
        }

        return filtered;
    }, [formValues, allEmployeeData]);

    const handleSelectAll = () => {
        const allIds = filteredEmployees.map(emp => emp.id);
        setFormValues(prev => ({
            ...prev,
            selectedEmployees:
                prev.selectedEmployees.length === allIds.length ? [] : allIds
        }));
        setErrors(prev => ({ ...prev, selectedEmployees: undefined }));
    };

    const handleToggleEmployee = (id) => {
        setFormValues(prev => {
            const selected = prev.selectedEmployees.includes(id)
                ? prev.selectedEmployees.filter(eid => eid !== id)
                : [...prev.selectedEmployees, id];
            return { ...prev, selectedEmployees: selected };
        });
        setErrors(prev => ({ ...prev, selectedEmployees: undefined }));
    };

    const handleSubmit = () => {
        const newErrors = {};
        if (!formValues.designation) newErrors.designation = 'Designation is required';
        if (formValues.discount <= 0) newErrors.discount = 'Discount must be greater than 0';
        if (formValues.selectedEmployees.length === 0)
            newErrors.selectedEmployees = `At least one ${formValues.employeeSearchMode} must be selected`;

        setErrors(newErrors);

        if (!Object.keys(newErrors).length) {
            const { designation, discount, selectedEmployees } = formValues;
            onSave(selectedEmployees.map(id => ({ UserId: id, Discount: discount, DesignationId: designation.id })));
            onClose();
        }
    };

    const Row = ({ index, style, data }) => {
        const emp = data[index];
        return (
            <div style={style} key={emp.id}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={formValues.selectedEmployees.includes(emp.id)}
                            onChange={() => handleToggleEmployee(emp.id)}
                        />
                    }
                    label={formValues.employeeSearchMode === 'email' ? emp.id : emp.customerCode}
                />
            </div>
        );
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 'bold', color: '#333' }}>
                Add Maximum Discount
                <IconButton
                    icon={<CloseIcon />}
                    size="small"
                    onClick={onClose}
                />
            </DialogTitle>

            <DialogContent dividers>
                {/* Designation Autocomplete */}
                <Autocomplete
                    disableListWrap
                    options={allDesignations}
                    getOptionLabel={(option) => option?.designation || ''}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    value={formValues.designation}
                    onChange={(_, newValue) => {
                        setFormValues(prev => ({
                            ...prev,
                            designation: newValue
                        }));
                        setErrors(prev => ({ ...prev, designation: undefined }));
                    }}
                    renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                            {option.designation}
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Designation"
                            margin="dense"
                            error={!!errors.designation}
                            helperText={errors.designation}
                        />
                    )}
                />

                {/* Search Box */}
                <TextField
                    margin="dense"
                    name="employeeSearchTerm"
                    label={`Search by ${formValues.employeeSearchMode === 'code' ? 'code' : 'email'}`}
                    fullWidth
                    value={formValues.employeeSearchTerm}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <Button
                                    size="small"
                                    variant={formValues.employeeSearchMode === 'code' ? 'contained' : 'outlined'}
                                    onClick={() => toggleSearchMode('code')}
                                    sx={{ mr: 0.5 }}
                                >
                                    👤 Code
                                </Button>
                                <Button
                                    size="small"
                                    variant={formValues.employeeSearchMode === 'email' ? 'contained' : 'outlined'}
                                    onClick={() => toggleSearchMode('email')}
                                >
                                    @ Email
                                </Button>
                            </InputAdornment>
                        ),
                        sx: { borderRadius: '8px' }
                    }}
                    error={!!errors.selectedEmployees}
                    helperText={errors.selectedEmployees}
                    sx={{ mb: 2 }}
                />

                {/* Employee List */}
                <Paper variant="outlined" sx={{ height: 200, overflow: 'hidden', p: 1, mb: 2, borderRadius: '8px' }}>
                    {filteredEmployees.length > 0 ? (
                        <>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formValues.selectedEmployees.length === filteredEmployees.length}
                                        indeterminate={
                                            formValues.selectedEmployees.length > 0 &&
                                            formValues.selectedEmployees.length < filteredEmployees.length
                                        }
                                        onChange={handleSelectAll}
                                    />
                                }
                                label="Select All / Deselect All"
                            />
                            <FixedSizeList
                                height={160}
                                itemCount={filteredEmployees.length}
                                itemSize={42}
                                itemData={filteredEmployees}
                                width="100%"
                            >
                                {Row}
                            </FixedSizeList>
                        </>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No matching records found.
                        </Typography>
                    )}
                </Paper>

                {/* Discount Field */}
                <TextField
                    margin="dense"
                    name="discount"
                    label="Maximum Discount (%)"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={formValues.discount}
                    onChange={handleInputChange}
                    inputProps={{ min: 0, max: 100 }}
                    error={!!errors.discount}
                    helperText={errors.discount}
                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button variant="outlined" onClick={onClose} sx={{ borderRadius: '4px', textTransform: 'none' }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    sx={{
                        backgroundColor: '#3b82f6',
                        '&:hover': { backgroundColor: '#2563eb' },
                        borderRadius: '4px',
                        textTransform: 'none'
                    }}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export const EditDiscountDialog = ({ open, onClose, initialData = {}, onSave }) => {
    const [discount, setDiscount] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData?.Discount != null) {
            setDiscount(initialData.Discount);
            setError('');
        } else {
            setDiscount('');
        }
    }, [initialData, open]);

    const handleSave = () => {
        if (discount === '' || discount === null || isNaN(discount)) {
            setError('Discount is required');
            return;
        }
        if (discount <= 0 || discount > 100) {
            setError('Discount must be between 0 and 100');
            return;
        }

        onSave({ ...initialData, Discount: Number(discount), Type: "update" });
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: 'bold',
                    color: '#333'
                }}
            >
                Edit Maximum Discount
                <IconButton
                    icon={<CloseIcon />}
                    size="small"
                    onClick={onClose}
                />
            </DialogTitle>

            <DialogContent dividers>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#555' }}>
                    User ID (Code)
                </Typography>
                <Typography variant="subtitle2" sx={{ mb: 4, color: '#555' }}>
                    {initialData?.UserId || initialData?.CustomerCode
                        ? `${initialData?.UserId ?? ''} (${initialData?.CustomerCode ?? ''})`
                        : ''}
                </Typography>

                <TextField
                    fullWidth
                    label="Maximum Discount (%)"
                    type="number"
                    value={discount}
                    onChange={(e) => {
                        const value = e.target.value;
                        setDiscount(value === '' ? '' : Number(value));
                        setError('');
                    }}
                    inputProps={{ min: 0, max: 100 }}
                    error={!!error}
                    helperText={error}
                />
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined">
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    sx={{
                        backgroundColor: '#3b82f6',
                        '&:hover': { backgroundColor: '#2563eb' }
                    }}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};