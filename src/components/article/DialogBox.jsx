"use client";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import {
    Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Fade, FormControl,
    FormHelperText, Grid, InputAdornment, LinearProgress, MenuItem, Select, Step, StepLabel, Stepper, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import _ from "lodash";

import IconButton from "@/components/IconButton";
import Button from "@/components/Button";
import AutocompleteDropDown from "@/components/Autocomplete";
import { filterColumns, formColumns } from "@/components/article/Columns";
import { DataGrid } from "@mui/x-data-grid";

 export function DialogBox({ open, onClose, rowData = {}, onSubmit, buttonClick, optionsData = {}, calculatedPrice }) {
    const [isDropdown, setIsDropdown] = useState(0)
    const [sizeDropdown, setSizeDropdown] = useState(null)
    const [formValues, setFormValues] = useState(rowData);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (calculatedPrice) {
            const newRowData = {
                ...rowData,
                "MRP": calculatedPrice
            }
            if (!formValues?.Amount) {
                newRowData.Amount = calculatedPrice
            }

            setFormValues(newRowData)
        } else {
            setFormValues(rowData);
        }

        setErrors({});
        setIsDropdown(optionsData?.DesignNo?.[0]?.IsCategoryWiseSize)
    // }, [rowData, calculatedPrice, isDropdown]);
    }, [calculatedPrice, isDropdown]);

    const handleChange = (field, value) => {
        if (isDropdown === 1 && field === "DesignNo") {
            let getDropDownData = optionsData?.DesignNo.find(item => item.value === value);
            let dropdown = getDropDownData?.Size ? getDropDownData.Size.split("#~#") || null : null;
            setSizeDropdown(dropdown)
        }
        setIsDropdown(1)
        setFormValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = () => {
        const newErrors = {};
        formColumns.forEach((col) => {
            if (col.isRequired && !formValues[col.field]) {
                newErrors[col.field] = `${col.headerName} is required`;
            }
        });
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onSubmit(formValues);
            setFormValues({})
            onClose(false);
        }
    };

    const handelCal = () => {
        buttonClick()
    }

    return (
        <Dialog
            open={open}
            onClose={() => { 
                setFormValues({});
                onClose();
            }}
            maxWidth={false}
            fullWidth
            sx={{
                "& .MuiDialog-paper": {
                    width: "100%",
                    maxWidth: "35%",
                    borderRadius: 3,
                    overflow: "hidden",
                    position: 'absolute',
                    top: '35%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                },
            }}
        >
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
                {_.isEmpty(rowData) ? "Add New" : "Edit Record"}
                <IconButton
                    icon={<CloseIcon />}
                    size="small"
                    onClick={() => {
                        setFormValues({});
                        onClose();
                    }}
                />
            </DialogTitle>

            <DialogContent dividers sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {formColumns.map((col) => {
                    const value = !_.isEmpty(formValues) ? formValues[col?.field] : "";
                    if (col.filterType === "dropdown") {
                        return (
                            <AutocompleteDropDown
                                key={col.field}
                                label={col.headerName}
                                options={optionsData[col.field]}
                                value={value}
                                onChange={(newVal) => handleChange(col.field, newVal)}
                                sx={{
                                    mb: 1,
                                    // fullWidth: false,
                                    width: "100%",
                                    maxWidth: 300,
                                    "& .MuiInputBase-root": {
                                        height: 50,
                                        minHeight: 50,
                                    },
                                    "& .MuiInputBase-input": {
                                        padding: "0 10px !important",
                                    }
                                }}
                                error={!!errors[col.field]}
                                helperText={errors[col.field]}
                            />
                        );
                    } else if (col.filterType === "text" || col.filterType === "number") {
                        return (
                            <TextField
                                key={col.field}
                                label={col.headerName}
                                type={col.filterType === "number" ? "number" : "text"}
                                value={value}
                                onChange={(e) => handleChange(col.field, e.target.value)}
                                required={col.isRequired}
                                error={!!errors[col.field]}
                                helperText={errors[col.field]}
                                // margin="dense"
                                disabled={col?.disabled || false}
                                fullWidth
                                sx={{
                                    mb: 1,
                                    // fullWidth: false,
                                    width: "100%",
                                    maxWidth: 300,
                                    "& .MuiInputBase-root": {
                                        height: 50,
                                        minHeight: 50,
                                    },
                                    "& .MuiInputBase-input": {
                                        padding: "0 10px !important",
                                    }
                                }}
                            />
                        );
                    } else if (col.filterType === "button") {
                        return (
                            <Button
                                key={col.field}
                                onClick={handelCal}
                                variant="contained"
                                sx={{ mt: 1, mb: 1 }}
                                fullWidth={false}
                            >
                                {col.headerName}
                            </Button>
                        );
                    }
                    return null;
                })}
                {isDropdown === 1 ? (
                    <AutocompleteDropDown
                        label="Size"
                        options={
                            sizeDropdown?.map((size) => ({
                                title: size,
                                value: size,
                            }))
                        }
                        value={formValues?.Size || ""}
                        onChange={(e) => handleChange("Size", e.target.value)}
                        sx={{
                            // mb: 1,
                            // fullWidth: false,
                            width: "100%",
                            maxWidth: 300,
                            "& .MuiInputBase-root": {
                                height: 50,
                                minHeight: 50,
                            },
                            "& .MuiInputBase-input": {
                                padding: "0 10px !important",
                            }
                        }}
                    />
                ) : (
                    <TextField
                        key={"Size"}
                        label={"Size"}
                        type={"text"}
                        value={formValues?.Size || ""}
                        onChange={(e) => handleChange("Size", e.target.value)}
                        required={false}
                        margin="dense"
                        fullWidth
                        sx={{
                            // mb: 1,
                            // fullWidth: false,
                            width: "100%",
                            maxWidth: 300,
                            "& .MuiInputBase-root": {
                                height: 50,
                                minHeight: 50,
                            },
                            "& .MuiInputBase-input": {
                                padding: "0 10px !important",
                            }
                        }}
                    />
                )}
            </DialogContent>
            <DialogActions>
                <Button 
                    onClick={() => {
                        setFormValues({});
                        onClose()
                    }} 
                    variant="outlined"
                    color="info"
                >
                    Cancel
                </Button>
                <Button variant="contained" color="info" onClick={handleSubmit} >
                    {_.isEmpty(rowData) ? "Add" : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export function FilterDialogBox({ open, onClose, rowData = {}, onSubmit, optionsData = {} }) {
    const [formValues, setFormValues] = useState(rowData);

    useEffect(() => {
        if (open) {
            setFormValues(rowData);
        }
    }, [open]);

    const handleChange = (field, value) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        const missingRequired = filterColumns.some(
            (col) => col.isRequired && !formValues[col.field]
        );
        if (missingRequired) {
            return;
        }
        onSubmit(formValues);
        onClose(false);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            fullWidth
            sx={{
                "& .MuiDialog-paper": {
                    width: "100%",
                    maxWidth: "35%",
                    borderRadius: 3,
                    overflow: "hidden",
                    position: 'absolute',
                    top: '42%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                },
            }}
        >
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
                {"Filter Record"}
                <IconButton icon={<CloseIcon />} size="small" onClick={onClose} />
            </DialogTitle>

            <DialogContent dividers sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {filterColumns.map((col) => {
                    const value = formValues[col.field] || "";

                    if (col.filterType === "dropdown") {
                        return (
                            <AutocompleteDropDown
                                key={col.field}
                                label={col.headerName}
                                options={optionsData[col.field] || []}
                                value={value}
                                onChange={(newVal) => handleChange(col.field, newVal)}
                                required={col?.isRequired || false}
                                sx={{
                                    mb: 1,
                                    // fullWidth: false,
                                    width: "100%",
                                    maxWidth: 300,
                                    "& .MuiInputBase-root": {
                                        height: 50,
                                        minHeight: 50,
                                    },
                                    "& .MuiInputBase-input": {
                                        padding: "0 10px !important",
                                    }
                                }}
                            />
                        );
                    } else if (col.filterType === "text" || col.filterType === "number") {
                        return (
                            <TextField
                                key={col.field}
                                label={col.headerName}
                                type={col.filterType === "number" ? "number" : "text"}
                                value={value}
                                onChange={(e) => handleChange(col.field, e.target.value)}
                                fullWidth
                                required={col.isRequired}
                                sx={{
                                    mb: 1,
                                    // fullWidth: false,
                                    width: "100%",
                                    maxWidth: 300,
                                    "& .MuiInputBase-root": {
                                        height: 50,
                                        minHeight: 50,
                                    },
                                    "& .MuiInputBase-input": {
                                        padding: "0 10px !important",
                                    }
                                }}
                            />
                        );
                    }
                    return null;
                })}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined" color="info">
                    Cancel
                </Button>
                <Button variant="contained" color="info" onClick={handleSubmit}>
                    {"Apply"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export function ArticleDetailDialog({ open, onClose, data }) {
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const thumbnailContainerRef = useRef(null);

    const images = data.images || [];
    const mainImage = images[mainImageIndex] || "";

    useEffect(() => {
        if (images.length) {
            setMainImageIndex(0);
        }
    }, [data]);

    const handleMainImageClick = () => {
        const nextIndex = (mainImageIndex + 1) % images.length;
        setMainImageIndex(nextIndex);
        scrollThumbnailIntoView(nextIndex);
    };

    const handleThumbnailClick = (index) => {
        setMainImageIndex(index);
        scrollThumbnailIntoView(index);
    };

    const scrollThumbnailIntoView = (index) => {
        const container = thumbnailContainerRef.current;
        const thumbnail = container?.children[index];

        if (container && thumbnail) {
            const containerRect = container.getBoundingClientRect();
            const thumbnailRect = thumbnail.getBoundingClientRect();

            if (thumbnailRect.left < containerRect.left) {
                container.scrollLeft -= (containerRect.left - thumbnailRect.left + 8);
            } else if (thumbnailRect.right > containerRect.right) {
                container.scrollLeft += (thumbnailRect.right - containerRect.right + 8);
            }
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth={false}
            PaperProps={{
                sx: {
                    maxWidth: '1200px',
                    width: '100%',
                    maxHeight: '85vh',
                },
            }}
        >
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
                Article Details
                <IconButton
                    icon={<CloseIcon />}
                    size="small"
                    onClick={onClose}
                />
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={3}>
                    <Grid item xs={5}>
                        <Typography variant="h6" fontWeight="bold">{data.details?.DesignNo}</Typography>
                        <Typography variant="body2">with {data.details?.MetalType} ({data.details?.MetalColor})</Typography>
                        <Typography variant="body2" color="green" fontWeight="bold">{data.details?.Status}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <Typography variant="body2"><strong>Category:</strong> {data.details?.Category}</Typography>
                        <Typography variant="body2"><strong>Subcategory:</strong> {data.details?.SubCategory}</Typography>
                        <Typography variant="body2"><strong>Occasion:</strong> {data.details?.Occasion}</Typography>
                        <Typography variant="body2"><strong>Metal Weight:</strong> {(data.details?.MetalWeight || 0).toFixed(3)}</Typography>
                        <Typography variant="body2"><strong>Dia Weight:</strong> {(data.details?.DiaWeight || 0).toFixed(3)}</Typography>
                        <Typography variant="body2"><strong>Size:</strong> {data.details?.Size || "-"}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="body2"><strong>Brand:</strong> {data.details?.Brand}</Typography>
                        <Typography variant="body2"><strong>Collection:</strong> {data.details?.Collection}</Typography>
                        <Typography variant="body2"><strong>Style:</strong> {data.details?.Style}</Typography>
                        <Typography variant="body2"><strong>Gross Weight:</strong> {(data.details?.GrossWeight || 0).toFixed(3)}</Typography>
                        <Typography variant="body2"><strong>Dia Pcs:</strong> {data.details?.DiaPcs}</Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2} sx={{ mt: 2 }}>
                    {/* Image Preview Section */}
                    <Grid item xs={12} sm={4}>
                        <Box
                            sx={{
                                borderRadius: 4,
                                width: "100%",
                                maxWidth: 400,
                                minHeight: 200,
                                height: "auto",
                                aspectRatio: "4 / 3",
                                p: 1,
                                bgcolor: "#f9f9f9",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <Box
                                component="img"
                                src={mainImage || "http://nzen/lib/jo/28/images/default.jpg"}
                                alt="Main"
                                sx={{
                                    width: "100%",
                                    maxHeight: 250,
                                    objectFit: "contain",
                                    borderRadius: 1,
                                    cursor: "pointer",
                                }}
                                onClick={handleMainImageClick}
                            />
                        </Box>

                        {/* Thumbnail Strip */}

                        {images.length > 1 && (
                            <Box
                                ref={thumbnailContainerRef}
                                onWheel={(e) => {
                                    e.currentTarget.scrollLeft += e.deltaY;
                                }}
                                sx={{
                                    mt: 1,
                                    borderRadius: 4,
                                    bgcolor: "#f9f9f9",
                                    p: 1,
                                    height: 100,
                                    overflowX: "hidden",
                                    overflowY: "hidden",
                                    display: "flex",
                                    gap: 1,
                                    "&:hover": {
                                        overflowX: "auto",
                                    },
                                    scrollbarWidth: "none",
                                    msOverflowStyle: "none",
                                    "&::-webkit-scrollbar": {
                                        height: "6px",
                                    },
                                    "&::-webkit-scrollbar-thumb": {
                                        backgroundColor: "#ccc",
                                        borderRadius: "10px",
                                    },
                                }}
                            >
                                {images.map((imgSrc, index) => (
                                    <Box
                                        key={index}
                                        component="img"
                                        src={imgSrc}
                                        alt={`Thumb ${index}`}
                                        onClick={() => handleThumbnailClick(index)}
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            objectFit: "cover",
                                            borderRadius: 1,
                                            border: index === mainImageIndex ? "2px solid #1976d2" : "1px solid #ccc",
                                            cursor: "pointer",
                                            flexShrink: 0,
                                        }}
                                    />
                                ))}
                            </Box>
                        )}
                    </Grid>

                    {/* Data Tables Section */}
                    <Grid item xs={12} sm={8}>
                        {data?.tables?.length > 0 &&
                            data.tables.map((table, i) => {
                                const showSettingPcs = _.includes(
                                    ["FINDING", "DIAMOND", "Lab Grown", "COLOR STONE", "Misc."].map(s => s.toLowerCase()),
                                    (table.StoneTypeName || '').toLowerCase()
                                );
                                const showWeight = _.includes(
                                    ["DIAMOND", "Lab Grown", "COLOR STONE"].map(s => s.toLowerCase()),
                                    (table.StoneTypeName || '').toLowerCase()
                                );

                                const showPointer = _.includes(
                                    ["DIAMOND", "Lab Grown"].map(s => s.toLowerCase()),
                                    (table.StoneTypeName || '').toLowerCase()
                                );

                                return (
                                    <div key={i}>
                                        <Typography variant="h6" gutterBottom>
                                            {table.StoneTypeName}
                                        </Typography>

                                        {table?.items?.length > 0 && (
                                            <TableContainer sx={{ maxWidth: 800, width: "100%", overflowX: "auto", mb: 2, border: "solid 1px #ccc", borderRadius: 2 }}>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow sx={{ backgroundColor: "#f4f4f4" }}>
                                                            <TableCell>SR#</TableCell>
                                                            <TableCell>Part</TableCell>
                                                            <TableCell sx={{ width: 250 }}>Material Info</TableCell>
                                                            <TableCell sx={{ width: 100 }}>{showSettingPcs ? "Setting" : ''}</TableCell>
                                                            <TableCell align="right">{showSettingPcs ? "PCS" : ''}</TableCell>
                                                            <TableCell align="right">{showPointer ? "POINTER" : ''}</TableCell>
                                                            <TableCell align="right">{showWeight ? "CTW" : "GM"}</TableCell>
                                                        </TableRow>
                                                    </TableHead>

                                                    <TableBody>
                                                        {table.items.map((item, j) => (
                                                            <TableRow key={j}>
                                                                <TableCell>{j + 1}</TableCell>
                                                                <TableCell>{item?.Part}</TableCell>
                                                                <TableCell sx={{ width: 250 }}>{item?.MaterialInfo}</TableCell>
                                                                <TableCell sx={{ width: 100 }}>{showSettingPcs ? item?.Setting : ''}</TableCell>
                                                                <TableCell align="right">{showSettingPcs ? item?.Pcs : ''}</TableCell>
                                                                <TableCell align="right">{showPointer ? (item?.Pointer).toFixed(2) : ''}</TableCell>
                                                                <TableCell align="right">{(item?.Weight || 0).toFixed(3)}</TableCell>
                                                            </TableRow>
                                                        ))}

                                                        <TableRow>
                                                            <TableCell><strong>Total</strong></TableCell>
                                                            <TableCell></TableCell>
                                                            <TableCell sx={{ width: 250 }}></TableCell>
                                                            <TableCell></TableCell>
                                                            <TableCell align="right">
                                                                {showSettingPcs ?
                                                                    <strong>
                                                                        {table.items
                                                                            .reduce((sum, item) => sum + parseInt(item?.Pcs || 0), 0)
                                                                        }
                                                                    </strong>
                                                                    : ''}
                                                            </TableCell>
                                                            <TableCell></TableCell>
                                                            <TableCell align="right">
                                                                <strong>
                                                                    {table.items
                                                                        .reduce((sum, item) => sum + parseFloat(item?.Weight || 0), 0)
                                                                        .toFixed(3)}
                                                                </strong>
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                    </div>
                                );
                            })}
                    </Grid>
                    <Grid item xs={12} sm={8}>
                        <Box
                            sx={{ fontSize: 12 }}
                            dangerouslySetInnerHTML={{
                                __html: (data.details?.productinfo || '').replace(/\\'/g, "'"),
                            }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export function ExcelImportDialog({ open, onClose, onImport, onVerify, onInsert, onClickDownload }) {
    const steps = ['Upload File', 'Verify Data', 'Success'];
    const [activeStep, setActiveStep] = useState(0);
    const [file, setFile] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
    const [isValid, setIsValid] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleImport = async () => {
        if (!file) return;
        try {
            const result = await onImport(file);
            if (result.success) setActiveStep(1);
            setValidationErrors([]);
            setIsValid(false);
        } catch (error) {
            console.error('Import failed:', error);
        }
    };

    const handleVerify = async () => {
        try {
            const result = await onVerify();
            if (result.success && _.isEmpty(result.data)) {
                setIsValid(true);
                setValidationErrors([]);
            } else {
                setValidationErrors(result.data || []);
            }
        } catch (error) {
            console.error('Varification failed:', error);
        }
    };

    const handleClose = () => {
        setFile(null);
        setValidationErrors([]);
        setIsValid(false);
        setActiveStep(0);
        onClose();
    };

    const handleNext = async () => {
        await onInsert();
        if (activeStep === 1 && isValid) {
            setActiveStep(2);
            setTimeout(() => {
                setFile(null);
                setValidationErrors([]);
                setIsValid(false);
                setActiveStep(0);
                onClose();
            }, 2000);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            sx={{
                "& .MuiDialog-paper": {
                    borderRadius: 3,
                    overflow: "hidden",
                    position: 'absolute',
                    top: '19%',
                    left: '45%',
                    transform: 'translate(-50%, -50%)'
                },
            }}
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography color="info.main">Import Excel File</Typography>
                    <Box>
                        {activeStep === 0 && (
                            <Button
                                variant="contained"
                                size="small"
                                color="success"
                                onClick={onClickDownload}
                            >
                                Download Sample Excel
                            </Button>
                        )}
                        <IconButton
                            icon={<CloseIcon />}
                            size="small"
                            onClick={handleClose}
                        />
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
                    {steps.map((label) => (
                        <Step key={label}><StepLabel>{label}</StepLabel></Step>
                    ))}
                </Stepper>

                {activeStep === 0 && (
                    <Box
                        p={3}
                        sx={{
                            border: '2px dashed',
                            borderColor: 'info.main',
                            borderRadius: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                        }}
                        onClick={() => document.getElementById('upload-excel').click()}
                    >
                        <input
                            accept=".xlsx, .xls"
                            id="upload-excel"
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <Tooltip title="Click to choose Excel file">
                            <UploadFileIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        </Tooltip>
                        <Typography variant="body2" mt={1}>
                            Supported formats: <strong>.xlsx, .xls</strong>
                        </Typography>
                        {file && (
                            <Box mt={2} display="flex" justifyContent="center" alignItems="center" gap={1}>
                                <InsertDriveFileIcon color="action" />
                                <Typography variant="body2">{file.name}</Typography>
                            </Box>
                        )}
                    </Box>
                )}

                {activeStep === 1 && (
                    <Box>
                        {(!isValid && _.isEmpty(validationErrors)) && (
                            <Box sx={{ maxHeight: 200, p: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <Button onClick={handleVerify} variant="contained" color="success">Verify Data</Button>
                            </Box>
                        )}

                        {(isValid && _.isEmpty(validationErrors)) && (
                            <Box textAlign="center" py={4}>
                                <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main' }} />
                                <Typography variant="h6" mt={2}>Verification Successfully!</Typography>
                            </Box>
                        )}

                        {(!isValid && !_.isEmpty(validationErrors)) && (
                            <Box mt={2} sx={{ border: '1px solid #ddd', borderRadius: 2, overflow: 'auto', maxHeight: 300 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableCell><strong>Sr No</strong></TableCell>
                                            <TableCell><strong>Design No</strong></TableCell>
                                            <TableCell><strong>Error Message</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {validationErrors.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{row.SrNo}</TableCell>
                                                <TableCell>{row.DesignNo}</TableCell>
                                                <TableCell sx={{ color: 'error.main' }}>{row.Message}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        )}
                    </Box>
                )}

                {activeStep === 2 && (
                    <Box textAlign="center" py={4}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main' }} />
                        <Typography variant="h6" mt={2}>Import Successfully!</Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                {activeStep === 0 && (
                    <>
                        <Button onClick={handleClose} variant="outlined" color="info">Cancel</Button>
                        <Button onClick={handleImport} variant="contained" color="info" disabled={!file}>Upload File</Button>
                    </>
                )}

                {activeStep === 1 && (
                    <>
                        <Button onClick={() => setActiveStep(0)} variant="outlined" color="info">Back</Button>
                        <Button onClick={handleNext} variant="contained" color="info" disabled={!isValid}>Import Excel</Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export function DiscountDialog({ open, onClose, onSave }) {
    const [discountValue, setDiscountValue] = useState("");
    const [error, setError] = useState("");

    const handleValueChange = (event) => {
        let value = Number(event.target.value);

        if (value < 0) value = '';

        if (value > 100) {
            setError("Percentage cannot exceed 100%");
            value = 100;
        } else {
            setError("");
        }

        setDiscountValue(value);
    };

    const handleSave = () => {
        if (discountValue > 100) {
            setError("Percentage cannot exceed 100%");
            return;
        }

        onSave({
            DiscountValue: discountValue
        })
        setDiscountValue("")
        setError("")
        onClose();
    };


    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={"sm"}
            fullWidth
            sx={{
                "& .MuiDialog-paper": {
                    borderRadius: 3,
                    overflow: "hidden",
                    position: 'absolute',
                    top: '12%',
                    left: '45%',
                    transform: 'translate(-50%, -50%)'
                },
            }}
        >
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
                Add Discount
                <IconButton
                    icon={<CloseIcon />}
                    size="small"
                    onClick={onClose}
                />
            </DialogTitle>
            <DialogContent dividers>
                <Box>
                    <TextField
                        fullWidth
                        type="number"
                        label="Value"
                        value={discountValue}
                        onChange={handleValueChange}
                        variant="outlined"
                        error={!!error}
                        helperText={error}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Typography color="text.secondary">
                                        {'%'}
                                    </Typography>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined" color="info">Cancel</Button>
                <Button variant="contained" color="info" onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    )
};

export function MrpDialog({ open, onClose, onSave }) {
    const [mrpValue, setMrpValue] = useState("");
    const [error, setError] = useState("");

    const handleValueChange = (event) => {
        let value = event.target.value;

        // Prevent negative values
        if (Number(value) < 0) {
            value = "";
        }

        setMrpValue(value);
        setError("");
    };

    const handleSave = () => {
        if (mrpValue === "" || Number(mrpValue) <= 0) {
            setError("MRP is required and must be greater than 0");
            return;
        }

        onSave({
            Mrp: Number(mrpValue)
        });

        setMrpValue("");
        setError("");
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={"sm"}
            fullWidth
            sx={{
                "& .MuiDialog-paper": {
                    borderRadius: 3,
                    overflow: "hidden",
                    position: 'absolute',
                    top: '12%',
                    left: '45%',
                    transform: 'translate(-50%, -50%)'
                },
            }}
        >
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
                Add MRP
                <IconButton
                    icon={<CloseIcon />}
                    size="small"
                    onClick={onClose}
                />
            </DialogTitle>
            <DialogContent dividers>
                <Box>
                    <TextField
                        fullWidth
                        type="number"
                        label="MRP"
                        value={mrpValue}
                        onChange={handleValueChange}
                        variant="outlined"
                        error={!!error}
                        helperText={error}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Typography color="text.secondary">
                                        {'₹'}
                                    </Typography>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined" color="info">
                    Cancel
                </Button>
                <Button variant="contained" color="info" onClick={handleSave}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export function HsnDialog({ open, onClose, onSave, hsnCodes = [] }) {
    const [hsnCode, setHsnCode] = useState("");
    const [error, setError] = useState("");

    const handleValueChange = (event) => {
        setHsnCode(event.target.value);
        setError("");
    };

    const handleSave = () => {
        if (hsnCode === "") {
            setError("HSN Code is required");
            return;
        }

        onSave({
            HsnCode: hsnCode, // will return the `value`
        });

        setHsnCode("");
        setError("");
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={"sm"}
            fullWidth
            sx={{
                "& .MuiDialog-paper": {
                    borderRadius: 3,
                    overflow: "hidden",
                    position: 'absolute',
                    top: '12%',
                    left: '45%',
                    transform: 'translate(-50%, -50%)'
                },
            }}
        >
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
                Add HSN Code
                <IconButton
                    icon={<CloseIcon />}
                    size="small"
                    onClick={onClose}
                />
            </DialogTitle>
            <DialogContent dividers>
                <Box>
                    <FormControl fullWidth error={!!error}>
                        <Select
                            value={hsnCode}
                            onChange={handleValueChange}
                            displayEmpty
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 200,
                                    },
                                },
                                anchorOrigin: {
                                    vertical: "bottom",
                                    horizontal: "left",
                                },
                                transformOrigin: {
                                    vertical: "top",
                                    horizontal: "left",
                                },
                                getContentAnchorEl: null,
                            }}
                        >
                            <MenuItem value="">
                                <em>Select HSN Code</em>
                            </MenuItem>
                            {hsnCodes.map((item) => (
                                <MenuItem key={item.value} value={item.value}>
                                    {item.title}
                                </MenuItem>
                            ))}
                        </Select>
                        {error && <FormHelperText>{error}</FormHelperText>}
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined" color="info">
                    Cancel
                </Button>
                <Button variant="contained" color="info" onClick={handleSave}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export function PriceBreakdownDialog({ open, onClose, onCalculate, priceBreakdown }) {

    const totalAmount = Object.values(priceBreakdown).reduce((acc, val) => acc + val, 0);

    const handelOnClick = () => {
        onCalculate(totalAmount)
        onClose()
    }
    return (
        <Dialog open={open} onClose={onClose} maxWidth={false}
            PaperProps={{
                sx: {
                    maxWidth: 'sm',
                    width: '100%',
                    maxHeight: '85vh',
                },
            }}
        >
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
                Price Breakdown
                <IconButton
                    icon={<CloseIcon />}
                    size="small"
                    onClick={onClose}
                />
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ pb: 2 }}>
                    {Object.keys(priceBreakdown).map((key, index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                {key.replace(/([A-Z])/g, ' $1').trim()} -
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {priceBreakdown[key].toFixed(2)}
                            </Typography>
                        </Box>
                    ))}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Total Amount -
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        ${totalAmount.toFixed(2)}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handelOnClick} variant="contained" color="info">OK</Button>
            </DialogActions>
        </Dialog>
    )
};

export function CalculationDialog({ open, onClose, isComplete }) {
    return (
        <Dialog
            open={open}
            maxWidth="xs"
            fullWidth
            sx={{
                textAlign: "center",
                "& .MuiDialog-paper": {
                    borderRadius: 3,
                    overflow: "hidden",
                    position: 'absolute',
                    top: '40%',
                    left: '45%',
                    transform: 'translate(-50%, -50%)'
                },
            }}
        >
            <DialogContent>
                {!isComplete ? (
                    <>
                        <Fade in={onClose}>
                            <Box>
                                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60 }} />
                                <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                                    Calculation Completed!
                                </Typography>
                            </Box>
                        </Fade>
                        <Button onClick={onClose} variant="contained" color="success" sx={{ mt: 2 }}>
                            Ok
                        </Button>
                    </>
                ) : (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Calculation In Process...
                        </Typography>
                        <CircularProgress size={60} />
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export function AddCombinationDialog({ open, onClose, rowData, onSelected }) {
    const [selectedRows, setSelectedRows] = useState([]);
    const [filters, setFilters] = useState({
        Name: "",
        Metal: "",
        MetalColor: "",
        Diamond: "",
        ColorStone: "",
        Category: "",
        Gender: ""
    });

    const rows = useMemo(() => rowData || [], [rowData]);

    const columns = useMemo(() => [
        { field: "SrNo", headerName: "Sr#", width: 70, sortable: true, disableColumnMenu: true },
        { field: "Name", headerName: "Name", width: 120, flex: 1, sortable: true, disableColumnMenu: true },
        { field: "Metal", headerName: "Metal", width: 120, flex: 1, sortable: true, disableColumnMenu: true },
        { field: "MetalColor", headerName: "Metal Color", width: 120, flex: 1, sortable: true, disableColumnMenu: true },
        { field: "Diamond", headerName: "Diamond", width: 120, flex: 1, sortable: true, disableColumnMenu: true },
        { field: "ColorStone", headerName: "Color Stone", width: 120, flex: 1, sortable: true, disableColumnMenu: true },
        { field: "Category", headerName: "Category", width: 120, flex: 1, sortable: true, disableColumnMenu: true },
        { field: "Gender", headerName: "Gender", width: 120, flex: 1, sortable: true, disableColumnMenu: true },
    ], []);

    const normalize = (value) => (value ?? "").toString().toLowerCase();

    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            return (
                normalize(row.Name).includes(normalize(filters.Name)) &&
                normalize(row.Metal).includes(normalize(filters.Metal)) &&
                normalize(row.MetalColor).includes(normalize(filters.MetalColor)) &&
                normalize(row.Diamond).includes(normalize(filters.Diamond)) &&
                normalize(row.ColorStone).includes(normalize(filters.ColorStone)) &&
                normalize(row.Category).includes(normalize(filters.Category)) &&
                normalize(row.Gender).includes(normalize(filters.Gender))
            );
        });
    }, [rows, filters]);

    const handleApply = () => {
        onSelected(selectedRows);
        setSelectedRows([])
    };

    const clickOnClose = () => {
        setSelectedRows([]);
        onClose();
    }

    return (
        <>
            <Dialog
                open={open}
                onClose={clickOnClose}
                maxWidth="lg"
                fullWidth
                keepMounted
                sx={{
                    "& .MuiDialog-paper": {
                        borderRadius: 3,
                        overflow: "hidden",
                        // position: 'absolute',
                        // top: '34%',
                        // left: '50%',
                        // transform: 'translate(-50%, -50%)'
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid #ddd",
                    }}
                >
                    <Box fontWeight="bold" > Select Combination Type</Box>
                    <Box>
                        <IconButton
                            icon={<CloseIcon />}
                            size="small"
                            onClick={clickOnClose}
                        />
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ height: 500 }}>
                    <Box sx={{ p: 1, display: "flex", alignItems: "left", justifyContent: "left", gap: 1 }}>
                        <TextField
                            label="Name"
                            size="small"
                            sx={{ width: 156 }}
                            value={filters.Name}
                            onChange={(e) => setFilters({ ...filters, Name: e.target.value })}
                        />
                        <TextField
                            label="Metal"
                            size="small"
                            sx={{ width: 156 }}
                            value={filters.Metal}
                            onChange={(e) => setFilters({ ...filters, Metal: e.target.value })}
                        />
                        <TextField
                            label="Metal Color"
                            size="small"
                            sx={{ width: 156 }}
                            value={filters.MetalColor}
                            onChange={(e) => setFilters({ ...filters, MetalColor: e.target.value })}
                        />
                        <TextField
                            label="Diamond"
                            size="small"
                            sx={{ width: 156 }}
                            value={filters.Diamond}
                            onChange={(e) => setFilters({ ...filters, Diamond: e.target.value })}
                        />
                        <TextField
                            label="Color Stone"
                            size="small"
                            sx={{ width: 156 }}
                            value={filters.ColorStone}
                            onChange={(e) => setFilters({ ...filters, ColorStone: e.target.value })}
                        />
                        <TextField
                            label="Category"
                            size="small"
                            sx={{ width: 156 }}
                            value={filters.Category}
                            onChange={(e) => setFilters({ ...filters, Category: e.target.value })}
                        />
                        <TextField
                            label="Gender"
                            size="small"
                            sx={{ width: 156 }}
                            value={filters.Gender}
                            onChange={(e) => setFilters({ ...filters, Gender: e.target.value })}
                        />
                    </Box>
                    <Box sx={{ height: 423 }}>
                        <DataGrid
                            rows={filteredRows}
                            columns={columns}
                            checkboxSelection
                            disableRowSelectionOnClick
                            onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection)}
                            rowSelectionModel={selectedRows}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 20, page: 0 } },
                            }}
                            pageSizeOptions={[20, 50, 100]}
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
                                }
                            }}
                        />
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 1 }}>
                    <Button variant="outlined" color="info" onClick={clickOnClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="info" onClick={handleApply}>
                        Apply
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export function StatusUpdate({ open, onClose, status, confirmUpdate }) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            sx={{
                "& .MuiDialog-paper": {
                    borderRadius: 3,
                    overflow: "hidden",
                    position: 'absolute',
                    top: '12%',
                    left: '45%',
                    transform: 'translate(-50%, -50%)'
                },
            }}
        >
            <DialogContent>
                <DialogContentText sx={{ fontSize: 15, color: "text.secondary" }}>
                    {status
                        ? "Are you sure you want to activate this record?"
                        : "Are you sure you want to deactivate this record?"}
                    <br />
                    <strong>This action can be reverted later if needed.</strong>
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="outlined" color={status ? "success" : "error"}>
                    Cancel
                </Button>
                <Button
                    onClick={confirmUpdate}
                    variant="contained"
                    color={status ? "success" : "error"}
                >
                    {status ? "Activate" : "Deactivate"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export function PrograssBar({ open, onClose, progress = 0 }) {
    const isCompleted = progress >= 100;

    return (
        <Dialog
            open={open}
            maxWidth="xs"
            fullWidth
            sx={{
                textAlign: "center",
                "& .MuiDialog-paper": {
                    borderRadius: 3,
                    overflow: "hidden",
                    position: 'absolute',
                    top: '40%',
                    left: '45%',
                    transform: 'translate(-50%, -50%)'
                },
            }}
        >
            <DialogTitle>
                {isCompleted ? "" : "In Progress..."}
            </DialogTitle>
            <DialogContent>
                <Box display="flex" alignItems="center" gap={2} mt={1}>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ flexGrow: 1 }}
                    />
                    <Typography>{progress}%</Typography>
                </Box>
                {isCompleted && (
                    <Box textAlign="center" mt={3}>
                        <Typography variant="h6" color={progress === 100 ? "success" : "error"}>
                            {progress === 100 ? "All Combination Added SuccessFully" : "Failed! Please try again!"}
                        </Typography>

                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={onClose}
                        >
                            {progress === 100 ? "Ok" : "Close"}
                        </Button>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};