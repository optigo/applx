"use client";
import React, { useEffect, useMemo, useState, use } from "react";
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    TableCell,
    TableRow,
    TableHead,
    Table,
    TableContainer,
    Checkbox,
    TableSortLabel,
    TableBody,
    Tooltip,
    IconButton,
    Button
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
9
import { useSnackbar } from "@/context/Snackbar";

import { Columns } from '@/components/empdiscount/Columns';
import CustomePagenation from "@/components/empdiscount/CustomePagenation";
import useEmpDiscountApi from "@/components/empdiscount/hooks/Apis";
import { CustomeToolbar } from "@/components/empdiscount/CustomToolbar";
import { Dialogbox, EditDiscountDialog } from "@/components/empdiscount/Common";
import { DeleteDialogBox } from "@/components/DialogBox";
import CredentialManager from "@/utils/Cookies";
import _ from "lodash";

export default function EmployeeDiscount({ searchParams }) {
    const params = use(searchParams);
    const cookietoken = params?.CN;

    const [headers, setHeaders] = useState(null);
    const [initialData, setInitialData] = useState([]);
    const [designationData, setDesignationData] = useState([]);
    const [employeeData, setEmployeeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [discountFilter, setDiscountFilter] = useState('')
    const [filterDesignation, setFilterDesignation] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'EntryDate', direction: 'desc' });
    const [selectedRow, setSelectedRow] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogOpenEdit, setDialogOpenEdit] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);

    const columns = Columns();

    const buildHeaders = (cred) => ({
        "Content-Type": "application/json",
        sp: "25",
        yearcode: cred?.YearCode ? cred?.YearCode : "",
        version: cred?.cuVer ? atob(cred.cuVer) : "",
        sv: cred?.SV ? atob(cred.SV) : "0"
    });

    const {
        fetchData,
        fetchEmpData,
        Delete,
        bulkDelete,
        Add,
        Update
    } = useEmpDiscountApi(headers);

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

    const fetchInitialEmpData = async () => {
        try {
            const response = await fetchEmpData();
            if (response.success) {
                setEmployeeData(response.data.empdata)
                setDesignationData(response.data.desidata);
            } else {
                showMessage(response.message, "error");
            }
        } catch (error) {
            console.error("fetch data error ---", error);
            showMessage("Internal Server error", "error");
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
            fetchInitialEmpData();
        }
    }, [headers]);

    const filteredData = useMemo(() => {
        let data = initialData.filter(item => {
            const matchesSearch = searchTerm === '' ||
                item.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.CustomerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.UserId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.Designation.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDesignation = filterDesignation === 'all' || item.Designation === filterDesignation;
            const matchesDiscount = discountFilter === '' || discountFilter === null || item.Discount === Number(discountFilter);
            return matchesSearch && matchesDesignation && matchesDiscount;
        });

        if (sortConfig.key) {
            data.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                // Custom sorting for numeric fields like discount, id
                if (sortConfig.key === 'discount') {
                    return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                }
                // Custom sorting for dates
                if (sortConfig.key === 'EntryDate') {
                    const dateA = new Date(aValue);
                    const dateB = new Date(bValue);
                    return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
                }

                // Default string comparison
                return sortConfig.direction === 'asc'
                    ? String(aValue).localeCompare(String(bValue))
                    : String(bValue).localeCompare(String(aValue));
            });
        }

        return data;
    }, [searchTerm, filterDesignation, discountFilter, initialData, sortConfig]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * rowsPerPage;
        const lastPageIndex = firstPageIndex + rowsPerPage;
        return filteredData.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, filteredData, rowsPerPage]);

    const isAllSelected = currentTableData.length > 0 && selectedRows.length === currentTableData.length;

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const allVisibleIds = currentTableData.map(row => row.DiscountId);
            setSelectedRows(allVisibleIds);
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedRows(prev => prev.includes(id)
            ? prev.filter(rowId => rowId !== id)
            : [...prev, id]
        );
    };

    const handlePageChange = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };

    const handleRequestSort = (propertyId) => {
        const isAsc = sortConfig.key === propertyId && sortConfig.direction === 'asc';
        setSortConfig({ key: propertyId, direction: isAsc ? 'desc' : 'asc' });
    };

    const handleDeleteClick = (row) => {
        setDeleteDialogOpen(true);
        setSelectedRow(row);
    };

    const handleBulkDeleteClick = () => {
        setDeleteDialogOpen(true);
        setSelectedRow(null);
    };

    const handelEditClick = (row) => {
        setSelectedRow(row);
        setDialogOpenEdit(true);
    };

    const handelAddClick = () => {
        setSelectedRow(null);
        setDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            if (!_.isEmpty(selectedRows)) {
                let joinedSelectedRows = selectedRows.join(",");
                const response = await bulkDelete(joinedSelectedRows);
                response.success && fetchInitialData(false);
                showMessage("Deleted successfully!", "success");
                setDeleteDialogOpen(false);
                setSelectedRows([])
            } else {
                if (!_.isEmpty(selectedRow)) {
                    const response = await Delete(selectedRow.DiscountId);
                    response.success && fetchInitialData(false);
                    showMessage("Deleted successfully!", "success");
                    setDeleteDialogOpen(false);
                }
            }
        } catch (error) {
            console.error("Delete error:", error);
            showMessage("Internal Server Error!", "error");
        }
    };

    const saveAndUpdateData = async (data) => {
        try {
            if (!_.isEmpty(data.Type) && data.Type === "update") {
                delete data.Type;
                const response = await Update(data);
                response.success && fetchInitialData(false);
                showMessage("Employee updated successfully!", "success");
            } else {
                const response = await Add(data);
                if (response.success) {
                    fetchInitialData(false);
                    fetchInitialEmpData();
                }

                showMessage("Employee inserted successfully!", "success");
            }
        } catch (error) {
            console.error("Save/Update error:", error);
            showMessage("Internal Server Error!", "error");
        }
    };

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
                    <Typography variant="h5" component="h2" sx={{ color: '#333', fontWeight: 'bold' }}>Discount Limit</Typography>
                </Box>
                <Box sx={{ p: 3, flexWrap: 'wrap' }}>
                    <CustomeToolbar
                        params={{
                            searchTerm,
                            setSearchTerm,
                            filterDesignation,
                            setFilterDesignation,
                            setCurrentPage,
                            handelAddClick,
                            designations: Array.from(new Set(designationData.map(item => item.designation))),
                            discountFilter,
                            setDiscountFilter,
                            handleBulkDeleteClick,
                            selectedRows
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
                        <CircularProgress size={40} thickness={4} color="primary" />
                    </Box>
                ) : (
                    <>
                        <TableContainer sx={{ flexGrow: 1 }}>
                            <Table stickyHeader sx={{ minWidth: 650 }} aria-label="discount options table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell
                                            padding="checkbox"
                                            sx={{
                                                width: '5%',
                                                fontWeight: 'bold',
                                                color: '#424242',
                                                backgroundColor: '#f9fafb'
                                            }}
                                        >
                                            <Checkbox checked={isAllSelected} onChange={handleSelectAll} />
                                        </TableCell>
                                        {columns.map((col) => (
                                            <TableCell
                                                key={col.id}
                                                align={col.align}
                                                sx={col.style}
                                                sortDirection={sortConfig.key === col.id ? sortConfig.direction : false}
                                            >
                                                {col.sortable ? (
                                                    <TableSortLabel
                                                        active={sortConfig.key === col.id}
                                                        direction={sortConfig.key === col.id ? sortConfig.direction : 'asc'}
                                                        onClick={() => handleRequestSort(col.id)}
                                                        sx={{ '& .MuiTableSortLabel-icon': { color: 'rgba(0,0,0,0.54) !important' } }}
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
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={selectedRows.includes(item.DiscountId)}
                                                        onChange={() => handleSelectOne(item.DiscountId)}
                                                    />
                                                </TableCell>
                                                <TableCell align="center" sx={{ maxWidth: "5%" }}>
                                                    {(currentPage - 1) * rowsPerPage + index + 1}
                                                </TableCell>
                                                <TableCell sx={{ maxWidth: "25%", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    <Typography variant="body2" sx={{ color: '#555' }}>
                                                        <Tooltip title={item.UserId} placement="bottom" arrow>
                                                            {item.UserId}{" (" + item.CustomerCode + ")"}
                                                        </Tooltip>
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ maxWidth: "25%", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#333' }}>
                                                        <Tooltip title={item.Name} placement="bottom" arrow>
                                                            {item.Name}
                                                        </Tooltip>
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ maxWidth: "20%", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#333' }}>
                                                        <Tooltip title={item.Designation} placement="bottom" arrow>
                                                            {item.Designation}
                                                        </Tooltip>
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="left" sx={{ maxWidth: "15%" }}>
                                                    <Typography variant="body2" sx={{ color: '#555' }}>{item.Discount}%</Typography>
                                                </TableCell>
                                                <TableCell align="center" sx={{ maxWidth: "10%" }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                        <Tooltip title="Edit">
                                                            <IconButton size="small" onClick={() => handelEditClick(item)}>
                                                                <EditIcon sx={{ cursor: 'pointer' }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton size="small" onClick={() => handleDeleteClick(item)} disabled={selectedRows.length === 1}>
                                                                <DeleteIcon sx={{ color: 'error.main', cursor: 'pointer' }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 6, color: 'text.secondary', boxShadow: 'none', borderRadius: '0px' }}>
                                                <Typography variant="h6" sx={{ mb: 1 }}>No data found.</Typography>
                                                <Typography variant="body1">Adjust your filters or add new entries.</Typography>
                                                <Button
                                                    variant="contained"
                                                    sx={{
                                                        mt: 3,
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
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {/* Custom Pagination Component */}
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

            {/* Dialog for Delete Confirmation */}
            <DeleteDialogBox
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                confirmDelete={confirmDelete}
            />
            {/* Dialog for Add/Edit */}
            <Dialogbox
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSave={saveAndUpdateData}
                allDesignations={designationData} // Pass unique designations to the dialog
                allEmployeeData={employeeData}
            />
            <EditDiscountDialog
                open={dialogOpenEdit}
                onClose={() => setDialogOpenEdit(false)}
                initialData={selectedRow}
                onSave={saveAndUpdateData}
            />
        </>
    );
}