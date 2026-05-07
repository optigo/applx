"use client";
import { use, useState, useMemo, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import {
    Box, Button, TextField, Divider, IconButton, Paper,
    TablePagination, ToggleButton, ToggleButtonGroup,
    Typography,
    Stack,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import { DeleteConfirm, ImageCardView, ImageTableView } from "@/components/upload/Common";
import useUploadApis from "@/components/upload/Apis";
import { useSnackbar } from "@/context/Snackbar";
import ViewListIcon from '@mui/icons-material/FormatListBulleted';
import ViewModuleIcon from '@mui/icons-material/GridView';
import BulkImageUpload from "@/components/upload/Dialog";
import CredentialManager from "@/utils/Cookies";
import _ from "lodash";
import UnAuthorized from "@/components/upload/UnAuthorized";

const config = [
    {
        type: "finding",
        title: "Finding Type Image Upload",
        lable: "Finding Type Image Process",
        uKey: "orail25TNBVD0LO2UFPRZ4YH",
        pendingImgPath: "Temp_Images/Finding_Img",
        pendingThumbImgPath: "Temp_Images/Finding_Img/Thumb_Img",
        imagePath: "Material_Images/Finding_Image",
        thumbImagePath: "Material_Images/Finding_Image/Thumb_Image",
        productImagePath: "",
        thumbProductImagePath: ""
    },
    {
        type: "diamond",
        title: "Diamond Image Upload",
        lable: "Diamond Image Process",
        uKey: "orail25TNBVD0LO2UFPRZ4YH",
        pendingImgPath: "Temp_Images/Diamond_Img",
        pendingThumbImgPath: "Temp_Images/Diamond_Img/Thumb_Img",
        imagePath: "Material_Images/Diamond_Image",
        thumbImagePath: "Material_Images/Diamond_Image/Thumb_Image",
        productImagePath: "",
        thumbProductImagePath: ""
    },
    {
        type: "colorstone",
        title: "Colorstone Image Upload",
        lable: "Colorstone Image Process",
        uKey: "orail25TNBVD0LO2UFPRZ4YH",
        pendingImgPath: "Temp_Images/Colorstone_Img",
        pendingThumbImgPath: "Temp_Images/Colorstone_Img/Thumb_Img",
        imagePath: "Material_Images/Colorstone_Image",
        thumbImagePath: "Material_Images/Colorstone_Image/Thumb_Image",
        productImagePath: "",
        thumbProductImagePath: ""
    },
    {
        type: "misc",
        title: "Misc Image Upload",
        lable: "Misc Image Process",
        uKey: "orail25TNBVD0LO2UFPRZ4YH",
        pendingImgPath: "Temp_Images/Misc_Img",
        pendingThumbImgPath: "Temp_Images/Misc_Img/Thumb_Img",
        imagePath: "Material_Images/Misc_Image",
        thumbImagePath: "Material_Images/Misc_Image/Thumb_Image",
        productImagePath: "",
        thumbProductImagePath: ""
    },
    {
        type: "design",
        title: "Design Image Upload",
        lable: "Design Image Process",
        uKey: "orail25TNBVD0LO2UFPRZ4YH",
        pendingImgPath: "Temp_Images/Design_Img",
        pendingThumbImgPath: "Temp_Images/Design_Img/Thumb_Img",
        imagePath: "Design_Image",
        thumbImagePath: "Design_Image/Thumb_Image",
        productImagePath: "ProductMaking_Image",
        thumbProductImagePath: "ProductMaking_Image/Thumb_Image"
    },
    // {
    //     type: "design_video",
    //     title: "Design Video Upload",
    //     lable: "Design Video Process",
    //     uKey: "orail25TNBVD0LO2UFPRZ4YH",
    //     pendingImgPath: "Temp_Images/Design_Img/Video",
    //     pendingThumbImgPath: "Temp_Images/Design_Img/Thumb_Img/Video",
    //     imagePath: "Design_Image/Video",
    //     thumbImagePath: "Design_Image/Thumb_Image/Video",
    //     productImagePath: "ProductMaking_Image/Video",
    //     thumbProductImagePath: "ProductMaking_Image/Thumb_Image/Video"
    // },
    {
        type: "job",
        title: "Job Image Upload",
        lable: "Job Image Process",
        uKey: "orail25TNBVD0LO2UFPRZ4YH",
        pendingImgPath: "Temp_Images/Job_Img",
        pendingThumbImgPath: "Temp_Images/Job_Img/Thumb_Img",
        imagePath: "Job_Image",
        thumbImagePath: "Job_Image/Thumb_Image",
        productImagePath: "",
        thumbProductImagePath: ""
    }
]

export default function ImageUpload({ searchParams }) {
    const params = useParams();
    const searchParams1 = use(searchParams);

    const type = params?.type;
    const cookietoken = searchParams1?.CN;
    const pid = searchParams1?.pid;

    const [loginData, setLoginData] = useState({});
    const [headers, setHeaders] = useState({});
    const [tokenData, setTokenData] = useState({});
    const [openNewDialog, setNewDialog] = useState(false);
    const [search, setSearch] = useState("");

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [serverImages, setServerImages] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [applyLoading, setApplyLoading] = useState(false);
    const [viewMode, setViewMode] = useState("card");
    const [tableLoading, setTableLoading] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    const buildHeaders = (cred) => ({
        "Content-Type": "application/json",
        sp: "114",
        yearcode: cred?.YearCode ? cred?.YearCode : "",
        version: cred?.cuVer ? atob(cred.cuVer) : "",
        sv: cred?.SV ? atob(cred.SV) : "0"
    });

    const currentConfig = useMemo(() => {
        if (!type) return null;
        return config.find(c => c.type === type[0]);
    }, [type]);

    if (!type) return null;

    if (!currentConfig) {
        notFound();
    }

    const { showSnackbar } = useSnackbar();
    const showMessage = (msg = "Operation successful!", type = "success") =>
        showSnackbar(msg, type);

    useEffect(() => {
        let getAuth = sessionStorage.getItem("userAuth");
        if (_.isEmpty(getAuth)) {
            const credentialManager = new CredentialManager(cookietoken);
            const userCredentials = credentialManager.getCredentials();
            sessionStorage.setItem("userAuth", JSON.stringify(userCredentials));
            let getNewCred = userCredentials;
            setHeaders(buildHeaders(getNewCred));
            setLoginData({
                UserId: getNewCred?.LUId ? atob(getNewCred?.LUId) : "",
                IpAddress: process.env.NEXT_PUBLIC_IP,
                Domain: window.location.origin || ""
            })
        } else {
            let gerCred = JSON.parse(getAuth);
            setHeaders(buildHeaders(gerCred));
            setLoginData({
                UserId: gerCred?.LUId ? atob(gerCred?.LUId) : "",
                IpAddress: process.env.NEXT_PUBLIC_IP,
                Domain: window.location.origin || ""
            })
        }
    }, [cookietoken]);

    useEffect(() => {
        if (!_.isEmpty(headers)) {

            const init = async () => {
                try {
                    const check = await checkauth();

                    if (check) {
                        setIsAuthorized(true);
                        await fetchImages(true);
                    } else {
                        setIsAuthorized(false);
                    }
                } catch (err) {
                    console.error("Auth check failed", err);
                    setIsAuthorized(false);
                } finally {
                    setAuthLoading(false);
                }
            };

            init();
        }
    }, [headers]);

    const handleSelectRow = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    const allImages = useMemo(() => {
        const combined = serverImages;
        if (!search.trim()) return combined;
        const keyword = search.toLowerCase();

        return combined.filter((img) =>
            img.originalName?.toLowerCase().includes(keyword)
        );

    }, [serverImages, search]);

    const paginatedProcessed = useMemo(() => {
        const start = page * rowsPerPage;
        const end = start + rowsPerPage;
        return allImages.slice(start, end);
    }, [allImages, page, rowsPerPage]);

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(paginatedProcessed.map(img => img.id));
        } else {
            setSelectedIds([]);
        }
    };

    const allImagesVerified = useMemo(() => {
        if (!allImages.length) return false;
        return allImages.every(img => Number(img.verifyStatus) === 1);
    }, [allImages]);


    const {
        getToken, getImages, deleteImages, applyImage, applyFindingImage,
        applyDiamondImage, applyColorstoneImage, applyMiscImage,
        applyDesignImage, unlinkFiles, moveFiles, checkAuthorization
    } = useUploadApis(headers, loginData);

    const checkauth = async () => {
        try {
            const resp = await checkAuthorization(pid);

            if (resp?.success && !_.isEmpty(resp.data.rd?.[0])) {
                const checkpage = resp.data.rd?.[0]?.isaddright;
                return checkpage === 1;
            }

            return false;
        } catch (err) {
            console.error("checkauth error", err);
            return false;
        }
    };

    const fetchImages = async (lod = false) => {
        try {

            if (!tokenData) showMessage("Ukey are required!", "error");
            if (lod) setTableLoading(true);

            let ukeydata = {};
            const tokenresp = await getToken(currentConfig.type);
            if (tokenresp?.success && Array.isArray(tokenresp.data.rd)) {
                ukeydata = tokenresp?.data?.rd?.[0];
                setTokenData(tokenresp?.data?.rd?.[0]);
            }

            if (!_.isEmpty(ukeydata)) {
                const resp = await getImages(currentConfig.type);
                if (resp?.success && Array.isArray(resp.data.rd)) {
                    let formatted = resp.data?.rd.map((img, index) => ({
                        id: img?.Id,
                        originalName: img.ImageName,
                        uploadedUrl: process.env.NEXT_PUBLIC_HTTP_URL + `/${ukeydata.ukey}/${currentConfig.pendingImgPath}/` + img.ImageName,
                        thumbUrl: process.env.NEXT_PUBLIC_HTTP_URL + `/${ukeydata.ukey}/${currentConfig.pendingThumbImgPath}/` + img.ImageName,
                        verifyStatus: img.Status || 0,
                    }));

                    setServerImages(formatted);
                }
            } else {
                showMessage("Ukey id required!", "error");
            }
        } catch (err) {
            console.error("Failed to load images", err);
            setServerImages([]);
            if (lod) setTableLoading(false);
            showMessage("Internal server error!", "error");
        } finally {
            if (lod) setTableLoading(false);
        }
    };

    const handleDeleteImage = async (file) => {
        try {
            const body = { ImageId: file };
            const resp = await deleteImages(body);
            if (resp?.success && resp?.data?.rd?.[0]?.stat) {
                setServerImages(prev =>
                    prev.filter(img => img.id !== file)
                );
            }
        } catch (error) {
            console.error("Server delete failed", error);
        }
        return;
    };

    const confirmDelete = async () => {
        try {
            if (!deleteTarget?.length) return;

            const serverIds = [];
            const fileserverurl = [];

            deleteTarget.forEach((id) => {
                const img = serverImages.find(s => s.id === id);

                if (!img) return;
                serverIds.push(id);

                if (img.uploadedUrl) {
                    fileserverurl.push(img.uploadedUrl);
                }

                if (img.thumbUrl) {
                    fileserverurl.push(img.thumbUrl);
                }
            });

            if (serverIds.length) {
                await handleDeleteImage(serverIds.join(","));
            };

            if (fileserverurl.length) {
                await unlinkFiles(fileserverurl);
            };

            await fetchImages();
        } finally {
            setSelectedIds([]);
            setDeleteTarget(null);
            setOpenDeleteDialog(false);
        }
    };

    const handleApplyImages = async () => {
        try {
            setApplyLoading(true);

            let resp = null;
            switch (currentConfig.type) {
                case 'job':
                    resp = await applyImage();
                    break;
                case 'finding':
                    resp = await applyFindingImage();
                    break;
                case 'diamond':
                    resp = await applyDiamondImage();
                    break;
                case 'colorstone':
                    resp = await applyColorstoneImage();
                    break;
                case 'misc':
                    resp = await applyMiscImage();
                    break;
                case 'design':
                    resp = await applyDesignImage();
                    break;
                default:
                    console.error("Unknown type:", currentConfig.type);
                    break;
            }
            if (resp?.success && Array.isArray(resp.data?.rd)) {

                if (!_.isEmpty(resp.data?.rd)) {
                    let imageArray = resp.data?.rd.filter(item => item.Status === 1).map(item => item.ImageName);
                    if (!_.isEmpty(imageArray)) {

                        let filtProductImg = [];
                        if (currentConfig.type === 'design') {
                            filtProductImg = imageArray.filter(item => item.includes("~~"));
                            imageArray = imageArray.filter(item => !item.includes("~~"));
                        }

                        if (!_.isEmpty(imageArray)) {
                            let data = {
                                uKey: tokenData.ukey,
                                oldPath: currentConfig.pendingImgPath,
                                newPath: currentConfig.imagePath,
                                images: imageArray
                            }
                            await moveFiles(data);

                            data.oldPath = currentConfig.pendingThumbImgPath;
                            data.newPath = currentConfig.thumbImagePath;
                            await moveFiles(data);
                        }

                        if (currentConfig.type === 'design' && !_.isEmpty(filtProductImg)) {
                            let dataforprod = {
                                uKey: tokenData.ukey,
                                oldPath: currentConfig.pendingImgPath,
                                newPath: currentConfig.productImagePath,
                                images: filtProductImg
                            }
                            await moveFiles(dataforprod);

                            dataforprod.oldPath = currentConfig.pendingThumbImgPath;
                            dataforprod.newPath = currentConfig.thumbProductImagePath;
                            await moveFiles(dataforprod);
                        }
                    }

                    let formatted = resp.data?.rd.map((img, index) => ({
                        id: img?.Id,
                        originalName: img.ImageName,
                        uploadedUrl:
                            process.env.NEXT_PUBLIC_HTTP_URL + `/${tokenData.ukey}/${img.Status === 1 && currentConfig.type === "design" && img.ImageName.includes("~~")
                                ? currentConfig.productImagePath
                                : img.Status === 1
                                    ? currentConfig.imagePath
                                    : currentConfig.pendingImgPath}/` + img.ImageName,
                        thumbUrl: process.env.NEXT_PUBLIC_HTTP_URL + `/${tokenData.ukey}/${img.Status === 1 && currentConfig.type === "design" && img.ImageName.includes("~~")
                                ? currentConfig.thumbProductImagePath
                                : img.Status === 1
                                    ? currentConfig.thumbImagePath
                                    : currentConfig.pendingThumbImgPath}/` + img.ImageName,
                        verifyStatus: img.Status || 0,
                    }));

                    console.log("formatted", formatted);

                    setServerImages(formatted);
                } else {
                    await fetchImages();
                }
            } else {
                await fetchImages();
            }
        } catch (err) {
            setApplyLoading(false);
            console.error("Apply image failed", err);
        } finally {
            setApplyLoading(false);
        }
    };

    if (authLoading) {
        return (
            <Box
                sx={{
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <CircularProgress />
            </Box>
        );
    } else {
        return (
            !isAuthorized 
            ?
                <UnAuthorized />
            :
                <Paper
                    elevation={3}
                    sx={{
                        height: "100vh",
                        width: "100%",
                        p: 3,
                        bgcolor: "#fbfcfd"
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                            }}>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                                    {currentConfig.lable}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Manage and analyze your inventory image assets
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={1.5}>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    sx={{
                                        bgcolor: '#7b1fa2',
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
                                    }}
                                    onClick={() => {
                                        setNewDialog(true)
                                    }}
                                >
                                    Add Files...
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={
                                        applyLoading ? (
                                            <CircularProgress size={18} color="inherit" />
                                        ) : (
                                            <CheckCircleIcon />
                                        )
                                    }
                                    sx={{
                                        bgcolor: '#10b981',
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        '&:hover': { bgcolor: '#059669' }
                                    }}
                                    disabled={
                                        applyLoading ||
                                        allImages.length === 0 ||
                                        allImagesVerified
                                    }
                                    onClick={handleApplyImages}
                                >
                                    {applyLoading ? "Applying..." : "Apply Images"}
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<DeleteIcon />}
                                    sx={{ bgcolor: '#ef4444', borderRadius: '10px', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#dc2626' } }}
                                    disabled={
                                        allImages.length === 0 ||
                                        allImagesVerified
                                    }
                                    onClick={async () => {
                                        if (selectedIds.length === 0) {
                                            showMessage("Please select the image.", "error");
                                            return;
                                        }
                                        setDeleteTarget([...selectedIds]);
                                        setOpenDeleteDialog(true);
                                    }}
                                >
                                    Delete
                                </Button>
                            </Stack>
                        </Box>
                        {/* Table */}
                        <Paper
                            elevation={0}
                            sx={{
                                border: '1px solid #e2e8f0',
                                borderRadius: 4,
                                overflow: 'hidden'
                            }}>
                            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff' }}>
                                <TextField
                                    size="small"
                                    placeholder="Search files by name..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(0);
                                    }}
                                    sx={{ width: 320, '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: '#f8fafc' } }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action" fontSize="small" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: search && (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setSearch("")}
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Stack direction="row" spacing={2} alignItems="center">
                                    {viewMode === "card" && (
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    checked={
                                                        paginatedProcessed.length > 0 &&
                                                        selectedIds.length === paginatedProcessed.length
                                                    }
                                                    indeterminate={
                                                        selectedIds.length > 0 &&
                                                        selectedIds.length < paginatedProcessed.length
                                                    }
                                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                                    sx={{
                                                        color: '#cbd5e1',
                                                        '&.Mui-checked': { color: '#7b1fa2' },
                                                        '&.MuiCheckbox-indeterminate': { color: '#7b1fa2' }
                                                    }}
                                                />
                                            }
                                            label={
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                                                    Select All
                                                </Typography>
                                            }
                                            sx={{ margin: 0, marginRight: 1 }}
                                        />
                                    )}

                                    <ToggleButtonGroup
                                        size="small"
                                        value={viewMode}
                                        exclusive
                                        onChange={(event, newView) => {
                                            if (newView !== null) {
                                                setViewMode(newView);
                                            }
                                        }}
                                        sx={{ bgcolor: '#f3f4f6', p: 0.5, borderRadius: 2 }}
                                    >
                                        <ToggleButton value="card" sx={{ border: 'none', px: 1.5, borderRadius: '6px !important' }}><ViewModuleIcon fontSize="small" /></ToggleButton>
                                        <ToggleButton value="table" sx={{ border: 'none', px: 1.5, borderRadius: '6px !important' }}><ViewListIcon fontSize="small" /></ToggleButton>
                                    </ToggleButtonGroup>
                                </Stack>
                            </Box>
                            {viewMode === "table" && (
                                <Box>
                                    <ImageTableView
                                        rows={paginatedProcessed}
                                        selectedIds={selectedIds}
                                        onSelect={handleSelectRow}
                                        onSelectAll={handleSelectAll}
                                        onDelete={(id) => {
                                            setDeleteTarget([id]);
                                            setOpenDeleteDialog(true);
                                        }}
                                        loding={tableLoading}
                                    />
                                    <Box
                                        sx={{ borderTop: "1px solid #ddd" }}
                                    >
                                        <TablePagination
                                            component="div"
                                            count={allImages.length}
                                            page={page}
                                            onPageChange={(_, p) => setPage(p)}
                                            rowsPerPage={rowsPerPage}
                                            onRowsPerPageChange={(e) => {
                                                setRowsPerPage(parseInt(e.target.value, 10));
                                                setPage(0);
                                            }}
                                            rowsPerPageOptions={[20, 30, 50]}
                                        />
                                    </Box>
                                </Box>
                            )}
                            {viewMode === "card" && (
                                <Paper
                                    elevation={0}
                                >
                                    <Box
                                        sx={{
                                            overflow: "auto",
                                            p: 2,
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                                            gap: 2,
                                            maxHeight: "calc(100vh - 300px)",
                                            borderTop: "1px solid #ddd"
                                        }}
                                    >

                                        <ImageCardView
                                            rows={paginatedProcessed}
                                            selectedIds={selectedIds}
                                            onSelect={handleSelectRow}
                                            onDelete={(id) => {
                                                setDeleteTarget([id]);
                                                setOpenDeleteDialog(true);
                                            }}
                                        />
                                    </Box>
                                    <Divider />
                                    <TablePagination
                                        component="div"
                                        count={allImages.length}
                                        page={page}
                                        onPageChange={(_, p) => setPage(p)}
                                        rowsPerPage={rowsPerPage}
                                        onRowsPerPageChange={(e) => {
                                            setRowsPerPage(parseInt(e.target.value, 10));
                                            setPage(0);
                                        }}
                                        rowsPerPageOptions={[20, 30, 50]}
                                    />
                                </Paper>
                            )}
                        </Paper>
                    </Box>

                    <DeleteConfirm
                        openDeleteDialog={openDeleteDialog}
                        setOpenDeleteDialog={setOpenDeleteDialog}
                        deleteTarget={deleteTarget}
                        confirmDelete={confirmDelete}
                    />
                    <BulkImageUpload
                        open={openNewDialog}
                        onClose={(isUploaded) => {
                            setNewDialog(false);
                            if (isUploaded) fetchImages();
                        }}
                        config={currentConfig}
                        ukeyData={tokenData}
                        headers={headers}
                        loginData={loginData}
                    />
                </Paper>
        );
    }

}