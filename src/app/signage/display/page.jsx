"use client";
import React, { useEffect, useMemo, useState, use } from "react";
import {
    Box, Paper, Table, TableCell, TableContainer,
    TableHead, TableRow, Typography, CircularProgress,
    TableSortLabel,
    TableBody,
    Tooltip,
    Collapse
} from "@mui/material";

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import { useSnackbar } from "@/context/Snackbar";

import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import { Columns } from "@/components/signage/Columns";
import { DeleteDialogBox } from "@/components/DialogBox";
import { CustomeToolbar } from "@/components/signage/CustomToolbar";
import CustomePagenation from "@/components/signage/CustomePagenation";
import DraggableFileTable from "@/components/signage/DraggableFileTable";
import useSignageApi from "@/components/signage/hooks/Apis";

import {
    Dialogbox, DialogBoxDuration,
    IsActiveMenu, IsDefaultMenu, PreviewFile
} from "@/components/signage/Common";

import _ from "lodash";
import CredentialManager from "@/utils/Cookies";

export default function SignageDisplay({ searchParams }) {
    const params = use(searchParams);
    const cookietoken = params?.CN;
    
    const [headers, setHeaders] = useState(null);
    const [initialData, setInitialData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDefaultFilter, setIsDefaultFilter] = useState('all');
    const [isActiveFilter, setIsActiveFilter] = useState('all');
    const [orientationFilter, setOrientationFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [getUkey, setGetUkey] = useState('');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [durationDialogOpen, setDurationDialogOpen] = useState(false);

    const [defaultMenuAnchorEl, setDefaultMenuAnchorEl] = useState(null);
    const isDefaultMenuOpen = Boolean(defaultMenuAnchorEl);

    const [isActiveMenuAnchorEl, setIsActiveMenuAnchorEl] = useState(null);
    const isIsActiveMenuOpen = Boolean(isActiveMenuAnchorEl);

    const columns = Columns();

    const buildHeaders = (cred) => ({
        "Content-Type": "application/json",
        sp: "20",
        yearcode: cred?.YearCode ? cred?.YearCode : "",
        version: cred?.cuVer ? atob(cred.cuVer) : "",
        sv: cred?.SV ? atob(cred.SV) : "0"
    });

    useEffect(() => {
        let getAuth = sessionStorage.getItem("userAuth");
        if (_.isEmpty(getAuth)) {
            const credentialManager = new CredentialManager(cookietoken);
            const userCredentials = credentialManager.getCredentials();
            sessionStorage.setItem("userAuth", userCredentials);
            setHeaders(buildHeaders(JSON.parse(userCredentials)));
        } else {
            let gerCred = JSON.parse(getAuth);
            setHeaders(buildHeaders(gerCred));
        }
    }, [cookietoken]);

    useEffect(() => {
        if (!_.isEmpty(headers)) {
            fetchInitialData(true);
            setUkey();
        }
    }, [headers])

    const {
        fetchData,
        fetchUkey,
        deleteDisplayData,
        deleteFileData,
        saveDisplayData,
        updateDisplayData,
        setDefaultRow,
        setActiveInActiveRow,
        setDisplayOrder,
        setFileDuration
    } = useSignageApi(headers);

    const { showSnackbar } = useSnackbar();
    const showMessage = (msg = "Operation successful!", type = "success") =>
        showSnackbar(msg, type);

    const fetchInitialData = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);

            const response = await fetchData();
            if (response.success) {
                setInitialData(response.data);
            } else {
                showMessage(response.message, "error");
            }
        } catch (error) {
            if (showLoader) setLoading(false);
            console.error("fetch data error ---", error);
            showMessage("Internal Server error", "error");
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    const setUkey = async () => {
        const response = await fetchUkey();
        if (response.success) {
            setGetUkey(response.data);
        }
    }

    const filteredData = useMemo(() => {
        let data = initialData.filter(item => {
            const matchesSearch = item.setName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDefault = isDefaultFilter === 'all' ||
                (isDefaultFilter === 'yes' && item.isDefault) ||
                (isDefaultFilter === 'no' && !item.isDefault);
            const matchesActive = isActiveFilter === 'all' ||
                (isActiveFilter === 'active' && item.isActive) ||
                (isActiveFilter === 'inactive' && !item.isActive);
            const matchesOrientation = orientationFilter === 'all' ||
                (orientationFilter === item.orientation);

            return matchesSearch && matchesDefault && matchesActive && matchesOrientation;
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
    }, [searchTerm, isDefaultFilter, orientationFilter, isActiveFilter, sortConfig, initialData]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * rowsPerPage;
        const lastPageIndex = firstPageIndex + rowsPerPage;
        return filteredData.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, filteredData, rowsPerPage]);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        setExpandedRowId(null);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(Number(event.target.value));
        setCurrentPage(1);
        setExpandedRowId(null);
    };

    const handleToggleExpand = (id) => {
        setExpandedRowId(expandedRowId === id ? null : id);
    };

    const handleDeleteClick = (row) => {
        setDeleteDialogOpen(true);
        setSelectedRow(row);
    }

    const handelEditClick = (row) => {
        setSelectedRow(row);
        setDialogOpen(true);
    }

    const handleDurationClick = (fileRow) => {
        setSelectedFile(fileRow);
        setDurationDialogOpen(true);
    }

    const handelAddClick = () => {
        setSelectedRow(null);
        setDialogOpen(true);
    }

    const handelFilePreview = (fileRow) => {
        setPreviewDialogOpen(true)
        setSelectedFile(fileRow);
    }

    const handleDefaultClick = (event, row) => {
        setDefaultMenuAnchorEl(event.currentTarget);
        setSelectedRow(row);
    };

    const handleDefaultClose = () => {
        setDefaultMenuAnchorEl(null);
        setSelectedRow(null);
    };

    const handleIsActiveClick = (event, row) => {
        setIsActiveMenuAnchorEl(event.currentTarget);
        setSelectedRow(row);
    };

    const handleIsActiveClose = () => {
        setIsActiveMenuAnchorEl(null);
        setSelectedRow(null);
    };

    const confirmDelete = async () => {
        try {
            if (selectedRow.recodeType === "setdata") {
                delete selectedRow.recodeType;
                const response = await deleteDisplayData(selectedRow, getUkey)
                if (response.success) {
                    fetchInitialData(false);
                }
                showMessage(response.message, response.success ? "success" : "error");
            } else {

                delete selectedRow.recodeType;
                const response = await deleteFileData(selectedRow, getUkey)
                if (response.success) {
                    fetchInitialData(false);
                }
                showMessage(response.message, response.success ? "success" : "error");
            }

            setDeleteDialogOpen(false);
        } catch (error) {
            console.error("Delete failed:", error);
            showMessage("Internal Server error.", "error");
        }
    }

    const saveAndUpdateData = async (data, mode) => {
        if (mode === "add") {
            try {
                const body = {
                    SetName: data.name,
                    Orientation: data.orientation,
                    FileJson: JSON.stringify(data.files)
                };
                const response = await saveDisplayData(body);
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
                const body = {
                    TvSetId: data.id,
                    SetName: data.name,
                    Orientation: data.orientation,
                    FileJson: JSON.stringify(data.files)
                }
                const response = await updateDisplayData(body);
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

    const handleDefaultChange = async (newValue) => {
        if (!selectedRow) return;
        if (+newValue === selectedRow.isDefault) return;

        const body = {
            TvSetId: selectedRow.id,
            IsDefault: +newValue,
        };

        try {
            const response = await setDefaultRow(body);
            response.success && fetchInitialData(false);
            showMessage(response.message, response.success ? "success" : "error");
        } catch (error) {
            console.error("error", error);
            showMessage("Internal Server error.", "error");
        }

        handleDefaultClose();
    };

    const handelIsActiveChange = async (newValue) => {
        if (!selectedRow) return;
        if (+newValue === selectedRow.isActive) return;

        if (!newValue && selectedRow.isDefault) {
            showMessage("The default TV content set cannot be inactive.", "error");
            return;
        }

        const body = {
            TvSetId: selectedRow.id,
            IsActive: +newValue,
        };

        try {
            const response = await setActiveInActiveRow(body);
            response.success && setInitialData(prev =>
                prev.map(item =>
                    item.id === selectedRow.id ? { ...item, isActive: newValue } : item
                )
            );
            showMessage(response.message, response.success ? "success" : "error");
        } catch (error) {
            console.error("error", error);
            showMessage("Internal Server error.", "error");
        }
        handleIsActiveClose();
    }

    const handelDisplayOrder = async (newJson) => {
        if (!newJson) return;

        try {
            const body = {
                FileJson: JSON.stringify(newJson)
            };
            const response = await setDisplayOrder(body);
            if (!response.success) {
                showMessage("Failed to drag a file", "error");
            }
        } catch (error) {
            console.error("error", error);
            showMessage("Internal Server error.", "error");
        }
    }

    const handelDuration = async (newDuration) => {
        if (!_.isEmpty(newDuration)) {
            let body = { FileId: newDuration.Id, Duration: newDuration.Duration };
            const response = await setFileDuration(body);
            if (response.success) {
                fetchInitialData(false);
            }
            showMessage(response.message, response.success ? "success" : "error");
            return
        }
        showMessage("Internal Server Error", "error");
    }

    return (
        <>
            <Paper
                elevation={3}
                sx={{
                    width: '100%',
                    maxWidth: '85%',
                    height: 'calc(92vh - 92px)',
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#fff',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
            >
                <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                    <Typography variant="h5" component="h2" sx={{ color: '#333', fontWeight: 'bold' }}>Signage Display</Typography>
                </Box>
                <Box sx={{ p: 3, flexWrap: 'wrap' }}>
                    <CustomeToolbar
                        params={{
                            searchTerm, setSearchTerm, isDefaultFilter, setIsDefaultFilter, isActiveFilter, setIsActiveFilter,
                            orientationFilter, setOrientationFilter, setCurrentPage, setExpandedRowId, handelAddClick
                        }}
                    />
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
                        <TableContainer sx={{ flexGrow: 1 }}>
                            <Table stickyHeader sx={{ minWidth: 650 }} aria-label="set management table">
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
                                                <TableCell align="center">
                                                    <IconButton
                                                        icon={
                                                            expandedRowId === item.id ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />
                                                        }
                                                        size="small"
                                                        onClick={() => handleToggleExpand(item.id)}
                                                        disabled={item.files.length === 0}
                                                        aria-label="expand row"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                                                <TableCell sx={{ maxWidth: 50, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    <Tooltip title={item.setName} placement="bottom" arrow>
                                                        <span>{item.setName}</span>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell sx={{ maxWidth: 50, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    <Tooltip title={item.orientation} placement="bottom" arrow>
                                                        {item.orientation}
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title={item.entryDate} placement="bottom" arrow>
                                                        {item.entryDate}
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            px: 1.5,
                                                            py: 0.5,
                                                            borderRadius: '9999px',
                                                            fontWeight: 'medium',
                                                            fontSize: '0.875rem',
                                                            backgroundColor:
                                                                item.isDefault ? '#dcfce7' : '#fee2e2',
                                                            color:
                                                                item.isDefault ? '#16a34a' : '#ef4444',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={(e) => handleDefaultClick(e, item)}
                                                    >
                                                        {item.isDefault ? 'Yes' : "No"}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            px: 1.5,
                                                            py: 0.5,
                                                            borderRadius: '9999px',
                                                            fontWeight: 'medium',
                                                            fontSize: '0.875rem',
                                                            backgroundColor:
                                                                item.isActive ? '#dbeafe' : '#fef2f2',
                                                            color:
                                                                item.isActive ? '#1d4ed8' : '#ef4444',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={(e) => handleIsActiveClick(e, item)}
                                                    >
                                                        {item.isActive ? "Active" : "Inactive"}
                                                    </Box>
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
                                                            onClick={() => handleDeleteClick({ ...item, SetId: item.id, recodeType: "setdata" })}
                                                        />
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={columns.length + 1}>
                                                    <Collapse in={expandedRowId === item.id} timeout="auto" unmountOnExit>
                                                        <Box sx={{ margin: 2, backgroundColor: '#fdfdfd', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                                                            <DraggableFileTable
                                                                initialFiles={item.files}
                                                                handleDeleteClick={handleDeleteClick}
                                                                handelPreview={handelFilePreview}
                                                                handelDisplayOrder={handelDisplayOrder}
                                                                handelDuration={handleDurationClick}
                                                            />
                                                        </Box>
                                                    </Collapse>
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
            <Dialogbox
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                mode={_.isEmpty(selectedRow) ? "add" : "update"}
                initialData={selectedRow}
                ukey={getUkey}
                onSave={saveAndUpdateData}
            />
            <DialogBoxDuration
                open={durationDialogOpen}
                onClose={() => setDurationDialogOpen(false)}
                initialData={selectedFile}
                onSaveDuration={handelDuration}
            />
            <PreviewFile
                open={previewDialogOpen}
                onClose={() => setPreviewDialogOpen(false)}
                fileToPreview={selectedFile}
                uKey={getUkey}
            />
            <IsDefaultMenu
                params={{
                    defaultMenuAnchorEl,
                    isDefaultMenuOpen,
                    handleDefaultClose,
                    handleDefaultChange,
                    value: selectedRow?.isDefault
                }}
            />
            <IsActiveMenu
                params={{
                    isActiveMenuAnchorEl,
                    isIsActiveMenuOpen,
                    handleIsActiveClose,
                    handelIsActiveChange,
                    value: selectedRow?.isActive
                }}
            />
        </>
    );
}