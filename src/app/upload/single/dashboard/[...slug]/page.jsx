'use client';
import React, { useState, useMemo, useEffect, use, useRef } from 'react';
import { Box, Typography, Paper, Tooltip, IconButton, Container } from '@mui/material';
import { Delete, ChevronLeft, ChevronRight, ImageNotSupported } from '@mui/icons-material';
import { notFound, useParams } from 'next/navigation';
import useUploadApis from '@/components/upload/Apis';
import _ from 'lodash';
import useAuth from '@/components/upload/useAuth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LaunchIcon from '@mui/icons-material/Launch';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const configModule = [
    {
        type: "design",
        title: "Design No",
        uKey: "orail25TNBVD0LO2UFPRZ4YH_Image",
        validateKey: "DesignNo",
        format: (val) => val,
        filePrefix: (val) => val,
        sessionvar: "designdata",
        imagePath: "Design_Image",
        thumbImagePath: "Design_Image/Thumb_Image",
    },
    {
        type: "job",
        title: "Job No",
        uKey: "orail25TNBVD0LO2UFPRZ4YH_Image",
        validateKey: "JobNo",
        format: (val) => val.replace("-", "/"),
        filePrefix: (val) => val.replace("/", "-"),
        sessionvar: "jobdata",
        imagePath: "Job_Imag",
        thumbImagePath: "Job_Imag/Job_Thumb",
    }
]

export default function App({ searchParams }) {
    const params = useParams();
    const scrollRef = useRef(null);
    const searchParams1 = use(searchParams);

    const slug = params?.slug;
    const cookietoken = searchParams1?.CN;

    const { headers, loginData } = useAuth(cookietoken);

    const [open, setOpen] = useState(false);

    const [selectedColor, setSelectedColor] = useState("");
    const [renameImages, setRenameImages] = useState([]);
    const [colorData, setColorData] = useState([]);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [serverFilesData, setServerFilesData] = useState([]);
    const [isValid, setIsValid] = useState(false);
    const [loadingCheck, setLoadingCheck] = useState(true);

    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    const currentConfig = useMemo(() => {
        if (!slug) return null;
        return configModule.find(c => c.type === slug?.[0]);
    }, [slug]);

    const formattedValue = useMemo(() => {
        return currentConfig?.format(slug?.[1]);
    }, [slug, currentConfig]);

    const colorValue = useMemo(() => {
        return slug?.[2];
    }, [slug, currentConfig]);

    const {
        getJobs, getDesign, getJobImages, getDesignImages, renameFiles,
        deleteDesignImages, deleteJobImages, unlinkFiles
    } = useUploadApis(headers, loginData);

    useEffect(() => {
        if (!slug) return;

        if (slug?.[2]) {
            setShowColorPicker(true);
        }
    }, [slug]);

    if (!slug) return null;
    if (!currentConfig) return notFound();

    const validateValue = (value, data, key) => {
        if (!Array.isArray(data)) return false;
        return data.some(item => item[key] === value);
    };

    const getMasterData = async () => {
        try {
            let storedata = JSON.parse(sessionStorage.getItem(currentConfig.sessionvar) || "null");

            if (!storedata) {
                let resp = null;
                switch (currentConfig.type) {
                    case 'job':
                        resp = await getJobs();
                        break;
                    case 'design':
                        resp = await getDesign();
                        break;
                    default:
                        console.error("Unknown type:", currentConfig.type);
                        break;
                }

                if (resp?.success && Array.isArray(resp.data.rd)) {
                    sessionStorage.setItem(currentConfig.sessionvar, JSON.stringify(resp.data));
                    return resp.data
                } else {
                    return {}
                }
            } else {
                return storedata;
            }

        } catch (err) {
            console.error("Master fetch error:", err);
            return {};
        }
    };

    const fetchImageData = async () => {
        try {

            let resp = null;
            switch (currentConfig.type) {
                case 'job':
                    resp = await getJobImages(formattedValue, colorValue);
                    break;
                case 'design':
                    resp = await getDesignImages(formattedValue, colorValue);
                    break;
                default:
                    console.error("Unknown type:", currentConfig.type);
                    break;
            }

            if (resp?.success && Array.isArray(resp.data.rd)) {
                const imagePayload = resp.data.rd.map((itm, index) => {
                    return {
                        id: index + 1,
                        name: itm.ImageName,
                        extension: itm.Extension,
                        isDefault: itm.IsDefault,
                        preview: process.env.NEXT_PUBLIC_HTTP_URL + `/${currentConfig.uKey}/${currentConfig.imagePath}/` + itm.ImageName + `?` + itm.ImgVer,
                        ImgVer: itm.ImgVer,
                        file: {},
                        [currentConfig.validateKey]: currentConfig?.filePrefix(currentConfig.type === "job" ? itm.JobNo : itm.DesignNo),
                        imgstatus: itm.Status,
                        serverImg: true
                    };
                })
                setServerFilesData(imagePayload);
            }
        } catch (error) {
            console.error("Failed to ImageData", error);
            setServerFilesData([])
        }
    };

    useEffect(() => {
        if (!formattedValue || !headers || !loginData) return;

        const init = async () => {
            setLoadingCheck(true);

            try {
                const master = await getMasterData();
                let valid = validateValue(formattedValue, master?.rd, currentConfig.validateKey);
                setIsValid(valid);

                if (valid) {
                    setColorData(master?.rd1 || []);
                    await fetchImageData(formattedValue);
                }

            } catch (error) {
                console.error("validation failed:", error);
                setIsValid(false);
                setLoadingCheck(false);
            } finally {
                setLoadingCheck(false);
            }
        }

        init();

    }, [formattedValue, selectedColor, headers, loginData]);

    useEffect(() => {
        if (!_.isEmpty(renameImages)) {
            let data = {
                uKey: currentConfig.uKey,
                filePath: currentConfig.imagePath,
                renameArray: renameImages,
            }
            renameFiles(data);
            setRenameImages([]);
        }

    }, [renameImages])

    const handlePreview = (file, moduledata) => {
        let newimg = process.env.NEXT_PUBLIC_HTTP_URL + `/${moduledata.uKey}/${moduledata.imagePath}/` + file.name + `?` + file.ImgVer
        window.open(newimg, '_blank');
    };

    const onDragEnd = () => {
        if (
            dragItem.current === null ||
            dragOverItem.current === null
        ) return;

        const list = [...serverFilesData];

        const fromIndex = dragItem.current;
        const toIndex = dragOverItem.current;

        const temp = list[fromIndex];
        list[fromIndex] = list[toIndex];
        list[toIndex] = temp;

        const renameArray = [];

        const updated = list.map((item, index) => {
            const newFileName =
                selectedColor
                    ? `${currentConfig?.filePrefix(formattedValue)}~${index + 1}~${selectedColor}.webp`
                    : `${currentConfig?.filePrefix(formattedValue)}~${index + 1}.webp`;

            if (item.name !== newFileName) {
                renameArray.push({
                    oldImageName: item.name,
                    newImageName: newFileName
                });
            }

            return {
                ...item,
                name: newFileName,
                isDefault: index === 0 ? 1 : 0,
                file: item.file
                    ? new File([item.file], newFileName, { type: "image/webp" })
                    : item.file
            };
        });

        setServerFilesData(updated);
        setRenameImages(renameArray);

        dragItem.current = null;
        dragOverItem.current = null;
    };


    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - 300 : scrollLeft + 300;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const handleWheel = (e) => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollLeft += e.deltaY;
    };

    const handleSetDefault = (id) => {
        const index = serverFilesData.findIndex(f => f.id === id);
        if (index === -1 || index === 0) return;

        dragItem.current = index;
        dragOverItem.current = 0;

        onDragEnd();
    };

    const handleDelete = async (id) => {

        const fileToDelete = serverFilesData.find(file => file.id === id);
        if (!fileToDelete) return;

        let resp = null;
        switch (currentConfig.type) {
            case 'job':
                resp = await deleteJobImages({ [currentConfig.validateKey]: formattedValue, ColorName: selectedColor });
                break;
            case 'design':
                resp = await deleteDesignImages({ [currentConfig.validateKey]: formattedValue, ColorName: selectedColor });
                break;
            default:
                console.error("Unknown type:", currentConfig.type);
                break;
        }

        if (!resp?.success) return;

        await unlinkFiles([fileToDelete.preview]);

        const updatedList = serverFilesData.filter((file) => file.id !== id);
        const renameArray = [];
        const reSequenced = updatedList.map((item, index) => {
            const oldName = item.name;
            const newName =
                selectedColor
                    ? `${formattedValue}~${index + 1}~${selectedColor}.webp`
                    : `${formattedValue}~${index + 1}.webp`;

            if (oldName !== newName && item.imgstatus === 1) {
                renameArray.push({
                    oldImageName: oldName,
                    newImageName: newName
                });
            }

            return {
                ...item,
                name: newName,
                file: item.file
                    ? new File([item.file], newName, { type: "image/webp" })
                    : item.file
            };
        });
        setRenameImages(renameArray);
        setServerFilesData(reSequenced);
    };

    return (
        <>
            <Box sx={{ height: "100vh", width: "100%", bgcolor: '#f9fafb', p: 3 }}>
                <Container maxWidth={false}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                                {currentConfig.title}: {formattedValue}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            {serverFilesData.length > 0 && (
                                <IconButton
                                    onClick={() => scroll('left')}
                                    sx={{
                                        position: 'absolute',
                                        left: -20,
                                        zIndex: 8,
                                        bgcolor: 'white',
                                        boxShadow: 1,
                                        border: '1px solid #eee',
                                        '&:hover': { bgcolor: '#f9fafb' }
                                    }}
                                >
                                    <ChevronLeft />
                                </IconButton>
                            )}

                            <Box
                                ref={scrollRef}
                                onWheel={handleWheel}
                                sx={{
                                    display: 'flex',
                                    gap: 2.5,
                                    overflowX: 'auto',
                                    pb: 2,
                                    px: 1,
                                    scrollBehavior: 'smooth',
                                    '&::-webkit-scrollbar': { display: 'none' },
                                    msOverflowStyle: 'none',
                                    scrollbarWidth: 'none',
                                }}
                            >
                                {serverFilesData.length === 0 ? (
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: 160,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: '#f9fafb',
                                            borderRadius: '8px',
                                            border: '1px dashed #e5e7eb',
                                            flexDirection: 'column',
                                            gap: 1
                                        }}
                                    >
                                        <ImageNotSupported sx={{ color: '#9ca3af', fontSize: 40 }} />
                                        <Typography sx={{ color: '#6b7280', fontWeight: 500, fontSize: '12px', padding: 0.5 }}>
                                            No images available for this {currentConfig.type}
                                        </Typography>
                                    </Box>
                                ) : (
                                    serverFilesData.map((file, index) => {
                                        return (
                                            <Box key={index} sx={{ flexShrink: 0, width: 160 }}>
                                                <Paper

                                                    sx={{
                                                        borderRadius: '12px',
                                                        overflow: 'hidden',
                                                        position: 'relative',
                                                        bgcolor: '#F8F8F5',
                                                        border: '1px solid #EAEAEA',
                                                        cursor: 'grab',
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        '&:hover': {
                                                            boxShadow: '0 12px 24px rgba(0,0,0,0.06)',
                                                            transform: 'translateY(-4px)',
                                                            '& .drag-handle': { opacity: 1 }
                                                        },
                                                        '&:active': { cursor: 'grabbing' }
                                                    }}
                                                >

                                                    {/* <Box sx={{ position: 'absolute', top: 8, left: 8, color: 'white', opacity: 0.7, textShadow: '0 0 5px rgba(0,0,0,0.5)' }}>
                                                        <DragIndicator fontSize="small" />
                                                    </Box> */}
                                                    <Box
                                                        sx={{
                                                            width: '100%',
                                                            height: 180,
                                                            bgcolor: '#fff',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        <img
                                                            src={file.preview}
                                                            loading="lazy"
                                                            alt=""
                                                            style={{
                                                                width: '100%',
                                                                height: '80%',
                                                                objectFit: 'cover',
                                                            }}
                                                        />
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <Tooltip title={file.name || ""} arrow>
                                                                <Typography
                                                                    variant="subtitle2"
                                                                    noWrap
                                                                    sx={{
                                                                        maxWidth: '50%',
                                                                        overflow: 'hidden',
                                                                        overflow: 'hidden',
                                                                        whiteSpace: 'nowrap',
                                                                        margin: "4px 0 0 2px",
                                                                        color: '#4A5568',
                                                                        fontWeight: 500,
                                                                        fontSize: '0.80rem',
                                                                        letterSpacing: '0.01em',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    {file.name.replace(".webp", "") || 'Untitled'}
                                                                </Typography>
                                                            </Tooltip>
                                                            <Box>
                                                                <Tooltip title={file.isDefault ? "Default Image" : "Set as Default"}>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleSetDefault && handleSetDefault(file.id)}
                                                                        sx={{
                                                                            color: file.isDefault ? '#10B981' : '#CBD5E0',
                                                                            '&:hover': { color: '#4A5568' }
                                                                        }}
                                                                    >
                                                                        {file.isDefault ? <CheckCircleIcon fontSize="small" /> : <CheckCircleOutlineIcon fontSize="small" />}
                                                                    </IconButton>
                                                                </Tooltip>

                                                                <Tooltip title="Preview">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handlePreview(file, currentConfig)}
                                                                        sx={{ color: '#CBD5E0', '&:hover': { color: '#4A5568' } }}
                                                                    >
                                                                        <LaunchIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>

                                                                <Tooltip title="Delete Image">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleDelete && handleDelete(file.id)}
                                                                        sx={{ color: '#CBD5E0', '&:hover': { color: '#E53E3E' } }}
                                                                    >
                                                                        <Delete fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Paper>
                                            </Box>
                                        )
                                    })
                                )}
                            </Box>

                            {serverFilesData.length > 0 && (
                                <IconButton
                                    onClick={() => scroll('right')}
                                    sx={{ position: 'absolute', right: -20, zIndex: 10, bgcolor: 'white', boxShadow: 1, border: '1px solid #eee', '&:hover': { bgcolor: '#f9fafb' } }}
                                >
                                    <ChevronRight />
                                </IconButton>
                            )}
                        </Box>
                    </Paper>
                </Container>
            </Box>
        </>
    );
}