'use client';
import React, { useState, useMemo, useEffect, use } from 'react';
import {
    Box, Typography, Button, Paper, Fab,
    FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { notFound, useParams } from 'next/navigation';
import useUploadApis from '@/components/upload/Apis';
import _ from 'lodash';
import useAuth from '@/components/upload/useAuth';
import ModernImageUpload from '@/components/upload/single/Dialog';

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
    const searchParams1 = use(searchParams);

    const slug = params?.slug;
    const cookietoken = searchParams1?.CN;

    const { headers, loginData } = useAuth(cookietoken);

    const [open, setOpen] = useState(true);

    const [selectedColor, setSelectedColor] = useState("");
    const [colorData, setColorData] = useState([]);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [serverFilesData, setServerFilesData] = useState([]);
    const [isValid, setIsValid] = useState(false);
    const [loadingCheck, setLoadingCheck] = useState(true);

    const currentConfig = useMemo(() => {
        if (!slug) return null;
        return configModule.find(c => c.type === slug?.[0]);
    }, [slug]);

    const formattedValue = useMemo(() => {
        return currentConfig?.format(slug?.[1]);
    }, [slug, currentConfig]);

    const {
        getJobs, getDesign, getJobImages, getDesignImages
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
                    resp = await getJobImages(formattedValue, selectedColor);
                    break;
                case 'design':
                    resp = await getDesignImages(formattedValue, selectedColor);
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

    return (
        <>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {showColorPicker && (
                    <Box
                        sx={{
                            position: "fixed",
                            inset: 0,
                            bgcolor: "rgba(0,0,0,0.5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 2000,
                        }}
                    >
                        <Paper sx={{ p: 4, borderRadius: 4, minWidth: 320 }}>
                            <Typography variant="h6" fontWeight={700} mb={2}>
                                Select Color
                            </Typography>
                            <FormControl
                                fullWidth
                                sx={{ mb: 2 }}
                            >
                                <InputLabel>Color</InputLabel>
                                <Select
                                    value={selectedColor}
                                    label="Color"
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                    MenuProps={{
                                        disablePortal: true,
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 250,
                                                borderRadius: 2,
                                                mt: 1
                                            }
                                        }
                                    }}
                                    sx={{
                                        borderRadius: 3,
                                        bgcolor: "#fff",
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "rgba(123,31,162,0.3)",
                                        },
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#7b1fa2",
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#7b1fa2",
                                            borderWidth: "2px",
                                        }
                                    }}
                                >
                                    <MenuItem value=""><em>Select Color</em></MenuItem>
                                    {colorData.map((item, index) => (
                                        <MenuItem
                                            key={index}
                                            value={item.ColorName}
                                        >
                                            {item.ColorName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Button
                                fullWidth
                                variant="contained"
                                disabled={!selectedColor}
                                onClick={() => {
                                    setShowColorPicker(false);
                                    setOpen(true);
                                }}
                                sx={{
                                    borderRadius: 2,
                                    py: 1.2,
                                    fontWeight: 700,
                                    background: "linear-gradient(135deg, #7b1fa2, #9c27b0)",
                                    boxShadow: "0 6px 20px rgba(123,31,162,0.4)",
                                    "&:hover": {
                                        background: "linear-gradient(135deg, #6a1b9a, #8e24aa)",
                                    },
                                    "&.Mui-disabled": {
                                        background: "#ccc",
                                        color: "#666"
                                    }
                                }}
                            >
                                Continue
                            </Button>
                        </Paper>
                    </Box>
                )}

                {!loadingCheck && <Fab
                    variant="extended"
                    onClick={() => setOpen(true)}
                    sx={{ bgcolor: 'white', color: '#7b1fa2', fontWeight: 800, px: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                >
                    <Add sx={{ mr: 1 }} />
                    Launch Asset Studio
                </Fab>
                }
                <ModernImageUpload
                    open={open}
                    onClose={() => setOpen(false)}
                    headers={headers}
                    loginData={loginData}
                    module={currentConfig}
                    urlvalue={formattedValue}
                    colorValue={selectedColor}
                    type={slug[0]}
                    isValid={isValid}
                    loadingCheck={loadingCheck}
                    serverFilesData={serverFilesData}
                    onUploadSuccess={fetchImageData}
                />
            </Box>
        </>
    );
}