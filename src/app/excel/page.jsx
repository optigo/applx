"use client";
import React, { useState, useEffect, useRef, use } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { format } from "date-fns";
import { IconButton, Tooltip, Button, CircularProgress, Switch, Box } from "@mui/material";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { useSnackbar } from "@/context/Snackbar";
import CredentialManager from "@/utils/Cookies";
import gridCss from '@/components/gridCss';
import { DeleteDialogBox } from '@/components/DialogBox';
import useExcelApi from '@/components/excel/Apis';

export default function PowerApiGrid({ searchParams }) {
    const params = use(searchParams);
    const cookietoken = params?.CN;

    const [loginData, setLoginData] = useState({});
    const [headers, setHeaders] = useState({});
    const [excelData, setExcelData] = useState([]);
    const [actionInputs, setActionInputs] = useState({});
    const [copiedToken, setCopiedToken] = useState(null);
    const [editingRow, setEditingRow] = useState(null);
    const [backupData, setBackupData] = useState({});
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [hasUnsavedRow, setHasUnsavedRow] = useState(false);
    const [cron, setCron] = useState(false);
    const [isVisiable, setIsVisiable] = useState({});
    const [isFlag, setIsFlag] = useState(false);
    const [checkboxIds, setCheckboxIds] = useState("");
    const [isLiveStatus, setIsLiveStatus] = useState({});

    const { showSnackbar } = useSnackbar();

    const showMessage = (message = "Operation successful!", type = "success") => {
        showSnackbar(message, type);
    };

    const buildHeaders = (cred) => ({
        "Content-Type": "application/json",
        sp: "7",
        yearcode: cred?.YearCode ? cred?.YearCode : "",
        version: cred?.cuVer ? atob(cred.cuVer) : "",
        sv: cred?.SV ? atob(cred.SV) : "0"
    });

    useEffect(() => {
        let getAuth = sessionStorage.getItem("userAuth");
        if (_.isEmpty(getAuth)) {
            const credentialManager = new CredentialManager(cookietoken);
            const userCredentials = credentialManager.getCredentials();
            sessionStorage.setItem("userAuth", JSON.stringify(userCredentials));
            let getNewCred = userCredentials
            setHeaders(buildHeaders(getNewCred));
            setLoginData({
                UserId: getNewCred?.LUId ? atob(getNewCred?.LUId) : "",
                IpAddress: process.env.NEXT_PUBLIC_IP,
                Domain: window.location.origin || ""
            })
        } else {
            let gerCred = JSON.parse(getAuth);
            // gerCred = JSON.parse(gerCred);
            setHeaders(buildHeaders(gerCred));
            setLoginData({
                UserId: gerCred?.LUId ? atob(gerCred?.LUId) : "",
                IpAddress: process.env.NEXT_PUBLIC_IP,
                Domain: window.location.origin || ""
            })
        }
    }, [cookietoken]);

    const columns = [
        { field: 'index', headerName: '#Sr', width: 40 },
        {
            field: 'EntryDate',
            headerName: 'Date',
            width: 140,
            editable: true,
            renderEditCell: (params) => (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        value={params.value ? new Date(params.value) : null}
                        onChange={(newValue) => {
                            params.api.setEditCellValue({
                                id: params.id,
                                field: 'EntryDate',
                                value: newValue ? format(new Date(newValue), "dd MMM yyyy") : ""
                            });
                        }}
                        slotProps={{ textField: { variant: "outlined", fullWidth: true } }}
                    />
                </LocalizationProvider>
            )
        },
        { field: 'title', headerName: 'Title', width: 180, editable: true },
        { field: 'description', headerName: 'Description', width: 190, editable: true },
        { field: 'spname', headerName: 'Sp Name', width: 180, editable: true },
        { field: 'buttonname', headerName: 'Button Name', width: 130, editable: true },
        { field: 'tooltip', headerName: 'Tooltip', width: 170, editable: true },
        {
            field: "isvisible",
            headerName: "Active",
            width: 70,
            renderCell: (params) => {
                const is_visiable = isVisiable[params.row.id] ?? params.row.isvisible;
                return (
                    <Switch
                        checked={is_visiable === 1}
                        sx={{
                            "& .MuiSwitch-thumb": {
                                backgroundColor: is_visiable === 1 ? "green" : "white",
                            },
                            "& .css-161ms7l-MuiButtonBase-root-MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track": {
                                backgroundColor: is_visiable === 1 ? "green" : "gray",
                            },
                        }}
                        onChange={(event) => handleToggle(event, params.row.id, is_visiable === 1 ? 0 : 1)}
                    />
                );
            }
        },
        { field: 'displayorder', headerName: 'Display Order', width: 100, type: "number", editable: true },
        { field: 'lastUpdateDate', headerName: 'Last Date', width: 170, type: "number", editable: false },
        { field: 'scheduleid', headerName: 'Schedule Id', width: 100, type: "number", editable: true },
        {
            field: "islive",
            headerName: "Live Api",
            width: 70,
            renderCell: (params) => {
                const is_live = isLiveStatus[params.row.id] ?? params.row.islive;
                return (
                    <Switch
                        checked={is_live === 1}
                        sx={{
                            "& .MuiSwitch-thumb": {
                                backgroundColor: is_live === 1 ? "green" : "white",
                            },
                            "& .css-161ms7l-MuiButtonBase-root-MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track": {
                                backgroundColor: is_live === 1 ? "green" : "gray",
                            },
                        }}
                        onChange={
                            (event) => {
                                event.stopPropagation(); // Prevents row selection
                                handleToggleChange(params.row.id, is_live === 1 ? 0 : 1)
                            }
                        }
                    />
                )
            }
        },
        {
            field: "token",
            headerName: "Token",
            width: 190,
            sortable: false,
            renderCell: (params) => {
                const token = actionInputs[params.row.id] || params.row.token;
                const showCopyIcon = !!token;

                return (
                    <div style={{ display: "flex", alignItems: "center", width: "50" }}>
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {token || "Generate Token"}
                        </span>
                        {showCopyIcon && (
                            <IconButton size="small" onClick={(event) => copyToClipboard(event, token, params.row.id)}>
                                {copiedToken === params.row.id ? (
                                    <CheckCircleOutlinedIcon sx={{ color: "green", fontSize: 18 }} />
                                ) : (
                                    <FileCopyOutlinedIcon sx={{ color: "gray", fontSize: 18 }} />
                                )}
                            </IconButton>
                        )}
                    </div>
                )
            },
        },
        {
            field: "link",
            headerName: "Url",
            width: 80,
            renderCell: (params) => {
                let tokenExists = params.row.token; // Check if token exists
                if (tokenExists) {
                    return (
                        <a
                            href={`${process.env.NEXT_PUBLIC_API_URL}/api/cron/data/v1/daily/${tokenExists}/${headers?.sv}`} // The actual link URL
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#1976d2", textDecoration: "none", fontWeight: "bold" }}
                        >
                            {"Link"}
                        </a>
                    )
                }
            }
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 120,
            sortable: false,
            disableColumnMenu: true,
            renderCell: (params) => {
                const isDisabled = hasUnsavedRow && editingRow !== params.row.id;
                return (
                    <>
                        {/* Generate Token Button */}
                        <Tooltip title="Generate Token" arrow>
                            <IconButton
                                size="small"
                                onClick={(event) => {
                                    event.stopPropagation(); // Prevents row selection
                                    generateToken(params.row.id);
                                }}
                                disabled={isDisabled}
                            >
                                <VpnKeyIcon sx={{ color: "gray", fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>

                        {isFlag && (
                            editingRow === params.row.id ? (
                                <>
                                    {/* Save Button */}
                                    <Tooltip title="Save" arrow>
                                        <IconButton size="small" onClick={() => saveRow(params.row.id, params.row)}>
                                            <SaveIcon sx={{ color: "gray", fontSize: 20 }} />
                                        </IconButton>
                                    </Tooltip>

                                    {/* Cancel Button */}
                                    <Tooltip title="Cancel" arrow>
                                        <IconButton size="small" onClick={() => cancelEdit(params.row.id)}>
                                            <CancelIcon sx={{ color: "gray", fontSize: 20 }} />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            ) : (
                                <>
                                    {/* Edit Button */}
                                    <Tooltip title="Edit" arrow>
                                        <IconButton size="small" onClick={() => startEditing(params.row)} disabled={isDisabled}>
                                            <EditIcon sx={{ color: "gray", fontSize: 20 }} />
                                        </IconButton>
                                    </Tooltip>

                                    {/* Delete Button with Confirmation */}
                                    <Tooltip title="Delete" arrow>
                                        <IconButton size="small" onClick={() => handleDeleteClick(params.row.id)} disabled={isDisabled}>
                                            <DeleteIcon sx={{ color: "gray", fontSize: 20 }} />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )
                        )
                        }
                    </>
                );
            }
        },
    ];

    const {
        fetchData, addData, updateData, deleteData,
        changeStatus, changeLiveStatus, generateUniqueToken, generatejsonFiles
    } = useExcelApi(headers, loginData);

    const fetchPowerBiData = async () => {
        const getData = await fetchData();
        if (getData.success) {
            const formattedData = getData?.data?.rd.map((row, index) => ({
                ...row,
                index: index + 1,
                EntryDate: row.EntryDate ? format(new Date(row.EntryDate), "dd MMM yyyy") : "",
                lastUpdateDate: row.lastUpdateDate ? format(new Date(row.lastUpdateDate), "dd MMM yyyy HH:mm:ss") : "",
                token: actionInputs[row.id] || row.token,
                isvisible: isVisiable[row.id] || row.isvisible,
            }));
            setIsFlag(getData?.data?.rd1[0]?.isshow_powerapi === "0" ? false : true)
            setExcelData(formattedData);
        } else {
            setExcelData([])
            showMessage(getData.message, "error");
        }
    }

    useEffect(() => {
        if (!_.isEmpty(headers)) {
            fetchPowerBiData();
        }

    }, [headers, actionInputs, isVisiable, isLiveStatus] || []);

    const generateToken = async (id) => {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const token = [...Array(32)]
            .map(() => characters.charAt(Math.floor(Math.random() * characters.length)))
            .join("");

        try {
            const generateToken = await generateUniqueToken({ powerbi_id: id, powerbi_token: token });
            if (generateToken.success) {
                let req = [];
                // req['headers'] = setHeaders(slugArray)
                // await postJsonData(req, token, id, null);

                setActionInputs((prev) => ({ ...prev, [id]: token }));
                showMessage(generateToken.message, "success");
            } else {
                showMessage(generateToken.message, "error");
                console.error("Fetch error:", generateToken);
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            showMessage(error.message, "error");
        }
    };

    const copyToClipboard = (event, text, rowId) => {
        event.stopPropagation();
        text = `${process.env.NEXT_PUBLIC_API_URL}/api/cron/data/v1/daily/${text}/${headers?.sv}`;
        // Fallback method for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);

        setCopiedToken(rowId);
        setTimeout(() => setCopiedToken(null), 2000);
    };

    const startEditing = (row) => {
        setBackupData((prev) => ({ ...prev, [row.id]: { ...row } }));
        setEditingRow(row.id);
        setHasUnsavedRow(true);
    };

    const saveRow = async (id, newData) => {

        // Define required fields
        const requiredFields = ["spname", "title"];
        let errors = "";

        // Validate fields
        requiredFields.forEach((field) => {
            if (!newData[field] || newData[field].trim() === "") {
                errors = `${field} is required!`;
            }
        });

        if (errors) {
            showMessage(errors, "error");
            return;
        }

        const updatedRow = excelData.find((row) => row.id === id);
        if (!updatedRow) return;

        const isNewRow = !backupData[id];
        if (isNewRow) {
            let addnewData = {
                powerbi_id: newData.id,
                powerbi_spname: newData.spname,
                powerbi_token: newData.token,
                powerbi_displayorder: newData.displayorder,
                ...newData
            }
            const addNew = await addData(addnewData);
            if (addNew.success) {
                setExcelData((prev) => {
                    return prev.map((row) => (row.id === id ? { ...row, ...newData } : row))
                });
                setEditingRow(null); // Exit edit mode
                setHasUnsavedRow(false); // Allow adding a new record
                showMessage(addNew.message, "success");
            } else {
                showMessage(addNew.message, "error");
            }
        } else {
            let updateOldData = {
                powerbi_id: newData.id,
                powerbi_spname: newData.spname,
                powerbi_token: newData.token,
                powerbi_displayorder: newData.displayorder,
                ...newData
            }
            const addUpdate = await updateData(updateOldData);
            if (addUpdate.success) {
                setExcelData((prev) => {
                    return prev.map((row) => (row.id === id ? { ...row, ...newData } : row))
                });
                setEditingRow(null); // Exit edit mode
                setHasUnsavedRow(false);
                showMessage(addUpdate.message, "success");
            } else {
                showMessage(addUpdate.message, "error");
            }
        }
    };

    const cancelEdit = (id) => {
        setExcelData((prev) => {
            if (!backupData[id]) {
                return prev.filter((row) => row.id !== id); // Remove newly added row
            }
            return prev.map((row) => (row.id === id ? { ...backupData[id] } : row))
        });
        setEditingRow(null);
        setHasUnsavedRow(false);
    };

    const handleDeleteClick = (id) => {
        setSelectedRowId(id);
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!selectedRowId) return;
        const addDelete = await deleteData({ powerbi_id: selectedRowId });
        if (addDelete.success) {
            setExcelData((prev) => prev.filter((row) => row.id !== selectedRowId));
            setOpenDeleteDialog(false);
            setSelectedRowId(null);
            showMessage(addDelete.message, "success");
        } else {
            showMessage(addDelete.message, "error");
        }
    };

    const addNewRow = () => {
        if (hasUnsavedRow) return; // Prevent multiple unsaved rows

        const lastId = excelData.length > 0 ? Math.max(...excelData.map(row => row.id)) : 0;
        const newRow = {
            id: lastId + 1,
            EntryDate: "",
            title: "",
            description: "",
            butoncss: "excel",
            spname: "",
            buttonname: "",
            tooltip: "",
            isvisible: 1,
            displayorder: "",
            token: "",
            lastUpdateDate: format(new Date(), "dd MMM yyyy HH:mm:ss")
        };
        setExcelData((prev) => [newRow, ...prev]);
        setEditingRow(newRow.id);
        setHasUnsavedRow(true); // Mark that a row needs saving
    };


    const handleCron = async () => {
        setCron(true);
        if (!checkboxIds) {
            showMessage("Please Select the rows!", "error");
            setCron(false);
            return
        }

        const response = await generatejsonFiles({ powerbi_ids: checkboxIds });
        if (response.success) {
            showMessage(`File Generated Successfully`, "success");
            setCheckboxIds("");
            await fetchPowerBiData();
        } else {
            showMessage(response.message, "error");
        }
        setCron(false);
    };

    const handleToggle = async (event, id, isvisible) => {
        event.stopPropagation();
        const isActivate = await changeStatus({ powerbi_id: id, isvisible })
        if (isActivate.success) {
            setIsVisiable((prev) => ({ ...prev, [id]: isvisible }));
            showMessage(isActivate.message, "success");
        } else {
            showMessage(isActivate.message, "error");
            console.error("Fetch error:", isActivate);
        }
    };
    const handleToggleChange = async (id, islive) => {
        const isLive = await changeLiveStatus({ powerbi_id: id, islive })
        if (isLive.success) {
            setIsLiveStatus((prev) => ({ ...prev, [id]: islive }))
            showMessage(isLive.message, "success");
        } else {
            showMessage(isLive.message, "error");
            console.error("Fetch error:", isLive);
        }
    };

    const handleSelectionChange = (selection) => {
        const idString = selection.join(", ");
        setCheckboxIds(idString);
    };

    function CustomToolbar() {
        return isFlag ? (
            <Box bgcolor="#fff" display="flex" justifyContent="flex-start" mb={1} p={'10px'} gap={1} borderRadius={3}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={addNewRow}
                    disabled={hasUnsavedRow}
                    startIcon={<AddIcon />}
                    sx={{
                        textTransform: "none",
                        fontWeight: 500,
                        fontSize: 14,
                        borderRadius: 1,
                    }}
                >
                    Add Record
                </Button>
                <Button
                    variant="contained"
                    color={cron ? "secondary" : "success"}
                    onClick={handleCron}
                    disabled={cron}
                    startIcon={
                        cron ? (
                            <CircularProgress size={20} sx={{ color: "#fff" }} />
                        ) : (
                            <PlayCircleIcon />
                        )
                    }
                    sx={{
                        textTransform: "none",
                        fontWeight: 500,
                        fontSize: 14,
                        borderRadius: 1,
                    }}
                >
                    {cron ? "Processing..." : "Cron Start"}
                </Button>
            </Box>
        ) : null;
    }

    function isVisiableColumns(isVisible) {
        return {
            spname: isVisible,
            isvisible: isVisible,
            displayorder: isVisible,
            lastUpdateDate: isVisible,
            islive: isVisible
        }
    }

    return (
        <>
            <Paper
                elevation={3}
                sx={{ height: "100vh", width: "100%", p: 3, backgroundColor: "#f0f2f5" }}
            >
                <CustomToolbar />
                <DataGrid
                    rows={excelData}
                    columns={columns}
                    checkboxSelection={isFlag}
                    pageSizeOptions={[100, 200, 300]}
                    initialState={{ pagination: { paginationModel: { page: 0, pageSize: 100 } } }}
                    sx={{
                        "& .MuiDataGrid-cell:focus": {
                            outline: "none !important",
                        },
                        "& .MuiDataGrid-cell:focus-within": {
                            outline: "none !important",
                        },
                        "& .MuiDataGrid-columnHeader:focus": {
                            outline: "none !important",
                        },
                        "& .MuiDataGrid-columnHeader:focus-within": {
                            outline: "none !important",
                        },
                        ...gridCss,
                        "& .MuiDataGrid-scrollbar--horizontal": {
                            height: "8px",
                        },
                        "& .MuiDataGrid-scrollbar--horizontal .MuiDataGrid-scrollbarContent": {
                            height: "8px",
                            borderRadius: "8px",
                        },
                    }}
                    editMode="row"
                    isCellEditable={(params) => params.row.id === editingRow} // Enable editing only for selected row
                    onRowSelectionModelChange={handleSelectionChange}
                    columnVisibilityModel={isVisiableColumns(isFlag)}
                />
            </Paper>

            <DeleteDialogBox 
                open={openDeleteDialog} 
                onClose={() => setOpenDeleteDialog(false)} 
                confirmDelete={confirmDelete} 
            />
        </>
    );
}
