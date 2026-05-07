import { Box, InputAdornment } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { red } from "@mui/material/colors";
import DeleteIcon from '@mui/icons-material/Delete';

import Button from "@/components/Button";
import TextField from "@/components/TextField";
import Dropdown from "@/components/Dropdown";
import IconButton from "@/components/IconButton";

export function CustomeToolbar({ params }) {
    const { searchTerm, setSearchTerm, filterDesignation, setFilterDesignation, setCurrentPage,
        handelAddClick, designations, discountFilter, setDiscountFilter, handleBulkDeleteClick, selectedRows } = params;

    const handleClearFilters = () => {
        setSearchTerm('');
        setDiscountFilter(null);
        setFilterDesignation('all');
        setCurrentPage(1);
    };

    const options = [
        { value: "all", label: "All" },
        ...designations.map((designation) => ({
            value: designation,
            label: designation,
        })),
    ];

    return (
        <Box
            sx={{
                gap: 2,
                mb: 2,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: '#3b82f6',
                        '&:hover': {
                            backgroundColor: '#2563eb',
                        },
                        borderRadius: '4px',
                        textTransform: 'none',
                        fontSize: '0.9rem'
                    }}

                    onClick={handelAddClick}
                >
                    + Add New
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleBulkDeleteClick}
                    disabled={selectedRows.length === 0}
                    sx={{
                        textTransform: 'none',
                        borderRadius: '4px',
                        textTransform: 'none',
                        fontSize: '0.9rem'
                    }}
                    startIcon={<DeleteIcon />}
                >
                    Delete
                </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    label="Search by Name/Code/User Id"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'action.active' }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ minWidth: '220px', maxWidth: { xs: '100%', sm: '350px' } }}
                />

                <TextField
                    label="Discount"
                    variant="outlined"
                    size="small"
                    type="number"
                    value={discountFilter}
                    onChange={(e) => {
                        setDiscountFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    sx={{ minWidth: '220px', maxWidth: { xs: '100%', sm: '350px' } }}
                />

                <Dropdown
                    label="Designation"
                    value={filterDesignation}
                    onChange={(e) => {
                        setFilterDesignation(e.target.value);
                        setCurrentPage(1);
                    }}
                    options={options}
                    variant="outlined"
                    size="small"
                    sx={{
                        minWidth: 210,
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis'
                    }}
                    MenuProps={{
                        PaperProps: {
                            style: {
                                maxHeight: 250
                            },
                        },
                    }}
                />

                <IconButton
                    icon={<FilterAltOffIcon />}
                    tooltip="Clear Filters"
                    onClick={handleClearFilters}
                    sx={{
                        backgroundColor: red[50],
                        color: '#ef4444',
                        '&:hover': {
                            backgroundColor: red[100],
                        },
                        ml: 'auto',
                    }}
                />
            </Box>
        </Box>
    );
}