"use client";
import React, { useState, useMemo, useEffect, use } from 'react';
import _ from 'lodash';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TableSortLabel, CircularProgress, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { useSnackbar } from "@/context/Snackbar";

import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import { DeleteDialogBox } from '@/components/DialogBox';
import { DialogboxLocation } from '@/components/signage/Common';
import { LocationColumns } from "@/components/signage/Columns";
import CustomePagenation from '@/components/signage/CustomePagenation';
import { CustomeLocationToolbar } from "@/components/signage/CustomToolbar";
import useSignageApi from '@/components/signage/hooks/Apis';
import CredentialManager from "@/utils/Cookies";

export default function SignageLocation({ searchParams }) {
    const params = use(searchParams);
    const cookietoken = params?.CN;
    
    const [headers, setHeaders] = useState(null);
    const [initialData, setInitialData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
    const [selectedRow, setSelectedRow] = useState(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const columns = LocationColumns();

    const buildHeaders = (cred) => ({
        "Content-Type": "application/json",
        sp: "20",
        yearcode: cred?.YearCode ? cred?.YearCode : "",
        version: cred?.cuVer ? atob(cred.cuVer) : "",
        sv: cred?.SV ? atob(cred.SV) : "0"
    });

    const {
        fetchLocationData,
        saveLocationData,
        updateLocationData,
        deleteLocationData
    } = useSignageApi(headers);

    const { showSnackbar } = useSnackbar();
    const showMessage = (msg = "Operation successful!", type = "success") =>
        showSnackbar(msg, type);

    const fetchInitialData = async (showLoader = true) => {
        try {

            if (showLoader) setLoading(true);
            const response = await fetchLocationData();
            if (response.success) {
                setInitialData(response.data);
            } else {
                showMessage(response.message, "error");
            }
        } catch (error) {
            console.error("fetch data error ---", error);
            showMessage("Internal Server error", "error");
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    useEffect(() => {
        let getAuth = sessionStorage.getItem("userAuth");
        if (_.isEmpty(getAuth)) {
            const credentialManager = new CredentialManager(cookietoken);
            const userCredentials = credentialManager.getCredentials();
            sessionStorage.setItem("userAuth", JSON.stringify(userCredentials));
            setHeaders(buildHeaders(JSON.parse(userCredentials)));
        } else {
            let gerCred = JSON.parse(getAuth);
            setHeaders(buildHeaders(gerCred));
        }
    }, [cookietoken]);

    useEffect(() => {
        if (!_.isEmpty(headers)) {
            fetchInitialData(true);
        }
    }, [headers]);

    const filteredData = useMemo(() => {
        let data = initialData.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });

        if (sortConfig.key) {
            data.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (typeof aValue === 'boolean') {
                    return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                } else {
                    return sortConfig.direction === 'asc'
                        ? String(aValue).localeCompare(String(bValue))
                        : String(bValue).localeCompare(String(aValue));
                }
            });
        }

        return data;
    }, [searchTerm, sortConfig, initialData]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * rowsPerPage;
        const lastPageIndex = firstPageIndex + rowsPerPage;
        return filteredData.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, filteredData, rowsPerPage]);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };

    const handleDeleteClick = (row) => {
        setDeleteDialogOpen(true);
        setSelectedRow(row);
    }

    const handelEditClick = (row) => {
        setSelectedRow(row);
        setDialogOpen(true);
    }

    const handelAddClick = () => {
        setSelectedRow(null);
        setDialogOpen(true);
    }

    const confirmDelete = async () => {
        const response = await deleteLocationData(selectedRow);
        if (response.success) {
            fetchInitialData(false);
        }
        showMessage(response.message, response.success ? "success" : "error");
        setDeleteDialogOpen(false);
    }

    const saveAndUpdateData = async (data, mode) => {
        if (mode === "add") {
            try {
                const response = await saveLocationData(data)
                if (response.success) {
                    fetchInitialData(false);
                    showMessage(response.message, "success");
                } else {
                    showMessage(response.message, "error");
                }
            } catch (error) {
                console.error("Form submission failed: ", error);
                showMessage("Internal Server error.", "error");
            }
        } else {
            try {
                const response = await updateLocationData(selectedRow.id, data);
                if (response.success) {
                    fetchInitialData(false);
                    showMessage(response.message, "success");
                } else {
                    showMessage(response.message, "error");
                }
            } catch (error) {
                console.error("Form submission failed: ", error);
                showMessage("Internal Server error.", "error");
            }
        }

    }

    return (
        <>
            <Paper
                elevation={3}
                sx={{
                    width: '100%',
                    maxWidth: '70%',
                    height: 'calc(92vh - 92px)',
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#fff'
                }}
            >
                <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                    <Typography variant="h5" component="h2" sx={{ color: '#333', fontWeight: 'bold' }}>Signage Location</Typography>
                </Box>

                <Box sx={{ p: 3, flexWrap: 'wrap' }}>
                    <CustomeLocationToolbar
                        params={{
                            searchTerm,
                            setSearchTerm,
                            setCurrentPage,
                            handelAddClick,
                        }
                        } />
                </Box>
                {loading ? (
                    <Box
                        sx={{
                            flexGrow: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '300px'
                        }}
                    >
                        <CircularProgress size={40} thickness={4} />
                    </Box>
                ) : (
                    <>
                        <TableContainer sx={{ maxHeight: '100vh' }}>
                            <Table stickyHeader sx={{ minWidth: 650 }} aria-label="signage location table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: '40px', backgroundColor: '#f9fafb' }} />
                                        {columns.map((col) => (
                                            <TableCell key={col.id} align={col.align} sx={col.style} sortDirection={sortConfig.key === col.id ? sortConfig.direction : false}>
                                                {col.sortable ? (
                                                    <TableSortLabel
                                                        active={sortConfig.key === col.id}
                                                        direction={sortConfig.key === col.id ? sortConfig.direction : 'asc'}
                                                        onClick={() => {
                                                            let direction = 'asc';
                                                            if (sortConfig.key === col.id && sortConfig.direction === 'asc') {
                                                                direction = 'desc';
                                                            }
                                                            setSortConfig({ key: col.id, direction });
                                                        }}
                                                    >
                                                        {col.label}
                                                    </TableSortLabel>
                                                ) : col.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {currentTableData.length > 0 ? currentTableData.map((item, index) => (
                                        <React.Fragment key={item.id}>
                                            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f5f5f5' } }}>
                                                <TableCell align="center" sx={{ width: 50 }} />
                                                <TableCell align="left" sx={{ width: 100 }}>{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                                                <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    <Tooltip title={item.title} placement="bottom" arrow>
                                                        <span>{item.title}</span>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                        <IconButton
                                                            icon={<EditIcon sx={{ cursor: 'pointer' }} />}
                                                            size="small"
                                                            onClick={() => handelEditClick(item)}
                                                        />
                                                        <IconButton
                                                            icon={<DeleteIcon sx={{ color: 'error.main', cursor: 'pointer' }} />}
                                                            size="small"
                                                            onClick={() => handleDeleteClick(item)}
                                                        />
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                                <Typography variant="h6" sx={{ mb: 1 }}>No data found.</Typography>
                                                <Typography variant="body1">Adjust your filters or add new entries.</Typography>
                                                <Button
                                                    variant="contained"
                                                    sx={{
                                                        backgroundColor: '#3b82f6',
                                                        '&:hover': {
                                                            backgroundColor: '#2563eb',
                                                        },
                                                        borderRadius: '4px',
                                                        textTransform: 'none',
                                                        fontSize: '0.9rem',
                                                        mt: 3
                                                    }}
                                                    onClick={handelAddClick}
                                                >
                                                    + Add New
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {filteredData.length > 0 && (
                            <CustomePagenation
                                currentPage={currentPage}
                                rowsPerPage={rowsPerPage}
                                filteredData={filteredData}
                                totalPages={totalPages}
                                handleRowsPerPageChange={handleRowsPerPageChange}
                                handlePageChange={handlePageChange}
                            />
                        )}
                    </>
                )}
            </Paper>

            <DeleteDialogBox
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                confirmDelete={confirmDelete}
            />
            <DialogboxLocation
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                mode={_.isEmpty(selectedRow) ? "add" : "update"}
                initialData={selectedRow}
                onSave={saveAndUpdateData}
            />
        </>
    );
}
