"use client";
import { Box } from "@mui/material";
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { red } from '@mui/material/colors';

import Button from "@/components/Button";
import TextField from "@/components/TextField";
import Dropdown from "@/components/Dropdown";
import IconButton from "@/components/IconButton";

export function CustomeToolbar({ params }) {
    const { searchTerm, setSearchTerm, isDefaultFilter, setIsDefaultFilter, orientationFilter, setOrientationFilter,
        isActiveFilter, setIsActiveFilter, setCurrentPage, setExpandedRowId, handelAddClick } = params;

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
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Search Field */}
                <TextField
                    label="Search by Tv Set"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                        setExpandedRowId(null);
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'action.active' }} />
                            </InputAdornment>
                        )
                    }}
                    sx={{ minWidth: '200px', flexGrow: 1, maxWidth: { xs: '100%', sm: '300px' } }}
                />

                {/* Orientation Filter */}
                <Dropdown
                    label="Orientation"
                    value={orientationFilter}
                    onChange={(e) => {
                        setOrientationFilter(e.target.value);
                        setCurrentPage(1);
                        setExpandedRowId(null);
                    }}
                    options={[
                        { value: "all", label: "All" },
                        { value: "Landscape (16:9)", label: "Landscape (16:9)" },
                        { value: "Portrait (9:16)", label: "Portrait (9:16)" },
                    ]}
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 180 }}
                />

                {/* Is Default Filter */}
                <Dropdown
                    label="Is Default"
                    value={isDefaultFilter}
                    onChange={(e) => {
                        setIsDefaultFilter(e.target.value);
                        setCurrentPage(1);
                        setExpandedRowId(null);
                    }}
                    options={[
                        { value: "all", label: "All" },
                        { value: "yes", label: "Yes" },
                        { value: "no", label: "No" },
                    ]}
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 120 }}
                />

                {/* Is Active Filter */}
                <Dropdown
                    label="Is Active"
                    value={isActiveFilter}
                    onChange={(e) => {
                        setIsActiveFilter(e.target.value);
                        setCurrentPage(1);
                        setExpandedRowId(null);
                    }}
                    options={[
                        { value: "all", label: "All" },
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                    ]}
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 120 }}
                />
                <IconButton
                    icon={<FilterAltOffIcon />}
                    tooltip="Clear Filters"
                    onClick={() => {
                        setSearchTerm('');
                        setIsDefaultFilter('all');
                        setIsActiveFilter('all');
                        setOrientationFilter('all');
                        setCurrentPage(1);
                        setExpandedRowId(null);
                    }}
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

export function CustomeLocationToolbar({ params }) {
    const { searchTerm, setSearchTerm, setCurrentPage, handelAddClick } = params;

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
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Search Field */}
                <TextField
                    label="Search by Location Name"
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
                        )
                    }}
                    sx={{ minWidth: '200px', flexGrow: 1, maxWidth: { xs: '100%', sm: '300px' } }}
                />

                <IconButton
                    icon={<FilterAltOffIcon />}
                    tooltip="Clear Filters"
                    onClick={() => {
                        setSearchTerm('');
                        setCurrentPage(1);
                    }}
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