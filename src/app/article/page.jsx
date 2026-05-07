"use client";
import { use, useEffect, useState } from "react";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import XLSX from 'sheetjs-style';

import { Columns, excelColumns } from "@/components/article/Columns";
import useArticalMasterApi from "@/components/article/hook/Apis";
import { useSnackbar } from "@/context/Snackbar";
import gridCss from "@/components/gridCss";
import CustomPagination from "@/components/article/CustomPagination"
import CustomToolbar from "@/components/article/CustomToolbar";
import { DeleteDialogBox } from "@/components/DialogBox";
import {
    ArticleDetailDialog, DialogBox, DiscountDialog,
    ExcelImportDialog, FilterDialogBox, HsnDialog, MrpDialog,
    PriceBreakdownDialog, CalculationDialog,
    AddCombinationDialog,
    StatusUpdate,
    PrograssBar
} from "@/components/article/DialogBox";
import CredentialManager from "@/utils/Cookies";

export default function ArticleGrid({ searchParams }) {
    const params = use(searchParams);
    const cookietoken = params?.CN;

    const [loginData, setLoginData] = useState({});
    const [headers, setHeaders] = useState({});
    const [rows, setRows] = useState([]);
    const [selectedRow, setSelectedRow] = useState({});
    const [selectedRows, setSelectedRows] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dropDownData, setDropDownData] = useState({})
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [sortModel, setSortModel] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [filterObj, setFilterObj] = useState({});
    const [totalRows, setTotalRows] = useState(0);
    const [viewData, setViewData] = useState({});
    const [combiData, setCombiData] = useState([]);
    const [isActive, setIsActive] = useState(null);
    const [isBulkDel, setIsBulkDel] = useState(true);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [excelDialogOpen, setExcelDialogOpen] = useState(false);
    const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [mrpDialogOpen, setMrpDialogOpen] = useState(false);
    const [hsnDialogOpen, setHsnDialogOpen] = useState(false);
    const [priceBreakdownDialogOpen, setPriceBreakdownDialogOpen] = useState(false);
    const [calcDialogOpen, setCalcDialogOpen] = useState(false);
    const [combinationDialogOpen, setCombinationDialogOpen] = useState(false);
    const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
    const [progressOpen, setProgressOpen] = useState(false);
    const [priceBreakdown, setPriceBreakdown] = useState({});
    const [progress, setProgress] = useState(0);
    const [isExporting, setIsExporting] = useState(false);
    const [isSoExporting, setIsSoExporting] = useState(false);
    const [inStockFilt, setInStockFilt] = useState(0);

    const [isCalculation, setIsCalculation] = useState(false);
    const [calculatedPrice, setCalculatedPrice] = useState(0);

    const [filterStatus, setFilterStatus] = useState(1);

    const buildHeaders = (cred) => ({
        "Content-Type": "application/json",
        sp: "18",
        yearcode: cred?.YearCode ? cred?.YearCode : "",
        version: cred?.cuVer ? atob(cred.cuVer) : "",
        sv: cred?.SV ? atob(cred.SV) : "0"
    });

    const {
        fetchData, masterData, Delete, bulkDelete, updateStatus, viewArticle, addMRP,
        Calculation, AddDiscount, AddHSN, ExcelExport, ShopifyExcelExport, ExcelImport,
        ExcelVerify, InsertExcel, Create, CombinationList, BulkChangeStatus
        , BulkAddCombinationData, PendingCombinationData
    } = useArticalMasterApi(headers, loginData);

    const { showSnackbar } = useSnackbar();
    const showMessage = (msg = "Operation successful!", type = "success") =>
        showSnackbar(msg, type);

    const fetchGridData = async (
        pageIndex = currentPage,
        pageSize = rowsPerPage,
        sort = sortModel,
        query = searchText,
        filter = filterObj,
        status = filterStatus,
        instock = inStockFilt
    ) => {
        setIsLoading(true);
        try {
            const body = {
                Page: pageIndex + 1,
                PageSize: pageSize,
                SortColumn: sort[0]?.field || "EntryDate",
                SortOrder: sort[0]?.sort?.toUpperCase() || "DESC",
                SearchText: query,
                Status: status,
                InStock: instock,
                ...filter
            };
            const response = await fetchData(body);
            if (response.success) {
                setRows(response.data.ArticleData);
                setTotalRows(response.data.TotalCount);
            } else {
                showMessage(response.message, "error");
                setRows([]);
                setTotalRows(0);
            }
        } catch (error) {
            console.error("Data fetch error:", error);
            showMessage("Internal Server error", "error");
            setRows([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDropDownData = async () => {
        try {
            const response = await masterData();
            setDropDownData(response?.data)
        } catch (error) {
            setDropDownData({})
        }
    };

    useEffect(() => {
        let getAuth = sessionStorage.getItem("userAuth");
        if (_.isEmpty(getAuth)) {
            const credentialManager = new CredentialManager(cookietoken);
            const userCredentials = credentialManager.getCredentials();
            sessionStorage.setItem("userAuth", JSON.stringify(userCredentials));
            // let getNewCred = JSON.parse(userCredentials)
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

    useEffect(() => {
        if (!_.isEmpty(headers)) {
            fetchGridData(currentPage, rowsPerPage, sortModel, searchText, filterObj, filterStatus, inStockFilt);
            _.isEmpty(dropDownData) && fetchDropDownData();
        }

    }, [headers, currentPage, rowsPerPage, sortModel, searchText, filterObj, filterStatus, inStockFilt]);

    const handleSearch = (query) => {
        setSearchText(query);
        setCurrentPage(0);
    };

    const handleClearFilterClick = () => {
        setSearchText("");
        setSortModel([]);
        setFilterObj({});
        setCurrentPage(0);
        setInStockFilt(0);
    };

    const handleAddNewClick = () => {
        setSelectedRow({});
        setDialogOpen(true);
    };

    const handleEditClick = (row) => {
    };

    const handleViewClick = async (row) => {
        const response = await viewArticle(row.ArticleId)
        if (response.success) {
            setViewData(response?.data);
            setViewDialogOpen(true);
        } else {
            showMessage(response.message, "error");
        }
    };

    const handelFilterClick = () => {
        setFilterDialogOpen(true);
    };

    const handleDeleteClick = (row, isBulk = true) => {
        setDeleteDialogOpen(true);
        setSelectedRow(row);
        setIsBulkDel(isBulk);
    };

    const handleBulkStatusClick = (isActive) => {
        setIsActive(isActive);
        setStatusUpdateOpen(true)
    }

    const handlePeCombi = async () => {
        try {
            setProgressOpen(true)
            setProgress(1)

            let interval = setInterval(() => {
                setProgress(prev => prev >= 95 ? prev : prev + 1);
            }, 50);

            const response = await PendingCombinationData();
            clearInterval(interval);
            if (response.success) {
                setProgress(100);
                fetchGridData(currentPage, rowsPerPage, sortModel, searchText);
            } else {
                setProgress(0);
            }
        } catch (error) {
            console.log("Pending Combination error", error);
            setProgress(0)
            clearInterval(interval);
        }
    }

    const handleCombiClick = async () => {
        const isSelected = Array.isArray(selectedRows) && selectedRows.length > 0;
        if (!isSelected) {
            alert("Select atleast 1 Recoed!!");
            return;
        }

        setCombinationDialogOpen(true)
        const resp = await CombinationList();
        if (resp.success) {
            setCombiData(resp?.data);
        }
    }

    const handleFormSubmit = async (fields) => {
        try {
            fields.AutoCode = fields.DesignNo;
            fields.DesignNo = dropDownData?.rd.find(item => item.value === fields.DesignNo)?.title || null
            fields.MetalTypeName = dropDownData?.rd1.find(item => item.value === fields.MetalTypeId)?.title || null
            const payload = fields;
            payload.MRP = payload?.MRP ? parseFloat(payload.MRP.toString().replace(/,/g, "")).toFixed(3) : null;
            const response = await Create(payload);
            if (response.success) {
                setCalculatedPrice(0);
                fetchGridData(currentPage, rowsPerPage, sortModel, searchText);
            }
            showMessage(response.message, response.success ? "success" : "error");
        } catch (error) {
            console.error("Form submission failed:", error);
            showMessage("Something went wrong during form submission.", "error");
        }
    };

    const handleFilterSubmit = async (fields) => {
        const payload = fields;
        setCurrentPage(0);
        if (!_.isEmpty(payload.DesignNo)) {
            payload.AutoCode = payload.DesignNo;
            delete payload.DesignNo;
        }

        let setfilter = { DesignNo: payload.AutoCode, ...payload };
        // delete setfilter?.AutoCode;
        setFilterObj(setfilter);
        // fetchGridData(currentPage, rowsPerPage, sortModel, searchText, payload);
    };

    const confirmDelete = async () => {
        try {
            let response = {};
            if (!_.isEmpty(selectedRows) && isBulkDel) {
                response = await bulkDelete(selectedRows);
                setSelectedRows([]);
            } else {
                response = await Delete(selectedRow);
            }
            setIsBulkDel(true);
            showMessage(response.message, response.success ? "success" : "error");
            fetchGridData(currentPage, rowsPerPage, sortModel, searchText);
            setDeleteDialogOpen(false);
        } catch (error) {
            setDeleteDialogOpen(false);
            console.error("Form submission failed:", error);
            showMessage("Something went wrong during form submission.", "error");
        }
    };

    const handleToggleClick = async (id, is_active) => {
        try {
            const response = await updateStatus(id, is_active)
            if (response?.success) {
                showMessage(response.message, "success");
                fetchGridData(currentPage, rowsPerPage, sortModel, searchText);
            } else {
                showMessage(response.message, "error");
            }
        } catch (error) {
            showMessage(error.message, "error");
            console.error("Error updating data:", error);
        }
    };

    const handleBulkStatus = async () => {
        try {
            let body = {
                Status: isActive,
                JsonData: JSON.stringify(selectedRows)
            };
            const response = await BulkChangeStatus(body)
            if (response?.success) {
                showMessage(response.message, "success");
                fetchGridData(currentPage, rowsPerPage, sortModel, searchText);
            } else {
                showMessage(response.message, "error");
            }
        } catch (error) {
            showMessage(error.message, "error");
            console.error("Error updating data:", error);
        } finally {
            setSelectedRows([]);
            setStatusUpdateOpen(false)
        }
    };

    const handelExportExcel = async () => {
        setIsExporting(true);
        try {
            const body = {
                SortColumn: sortModel[0]?.field || "EntryDate",
                SortOrder: sortModel[0]?.sort?.toUpperCase() || "DESC",
                SearchText: searchText,
                Status: filterStatus,
                Action: "ExcelExport",
                ...filterObj
            };
            const response = await ExcelExport(body);
            if (response.success) {
                const data = response.data.rd;
                const worksheet = XLSX.utils.json_to_sheet(data);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
                XLSX.writeFile(workbook, "Articles.xlsx");
                showMessage("Excel Export Successfully!", "success");
            } else {
                showMessage(response.message, "error");
            }
        } catch (error) {
            showMessage("Export failed", "error");
            setIsExporting(false);
        } finally {
            setIsExporting(false);
        }
    };

    const handelShopifyExport = async () => {
        setIsSoExporting(true);
        try {
            const response = await ShopifyExcelExport();
            if (response.success) {
                const data = response.data.rd;
                const worksheet = XLSX.utils.json_to_sheet(data);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
                XLSX.writeFile(workbook, "ShopifyArticles.xlsx");
                showMessage("Shopify Excel Export Successfully!", "success");
            } else {
                showMessage(response.message, "error");
            }
        } catch (error) {
            showMessage("Shopify Export failed", "error");
            setIsSoExporting(false);
        } finally {
            setIsSoExporting(false);
        }
    };

    const handelImportExcel = async (file) => {
        try {
            // Step 1: Read and parse Excel file
            const jsonData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const workbook = XLSX.read(event.target.result, { type: "binary" });
                        const sheet = workbook.Sheets[workbook.SheetNames[0]];
                        const data = XLSX.utils.sheet_to_json(sheet);
                        resolve(data);
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.onerror = () => reject(reader.error);
                reader.readAsBinaryString(file);
            });

            // Step 2: Send data to backend
            const response = await ExcelImport(jsonData);
            // Step 3: Show result
            showMessage(response.message, response.success ? "success" : "error");

            // Return result for further use (step 2 display, etc.)
            return {
                success: response?.success,
                message: response?.message,
                data: jsonData,
            };
        } catch (error) {
            console.error("Import Excel Error:", error);
            showMessage("Import failed", "error");
            return { success: false, data: [], message: error.message };
        }
    };

    const handelVerifyExcel = async () => {
        try {
            const response = await ExcelVerify();
            let hasErrors = _.isEmpty(response?.data?.rd);
            showMessage(`Verification ${hasErrors ? "Successfully" : "Faield!"}`, hasErrors ? "success" : "error");
            return {
                success: response?.success,
                message: `Verification ${hasErrors ? "Successfully" : "Faield!"}`,
                data: response?.data?.rd
            };
        } catch (error) {
            console.error("Excel Verify Error:", error);
            showMessage("Excel Verification failed", "error");
            return { success: false, data: [], message: error.message || "Unknown error" };
        }
    };

    const handelExcelDownload = () => {
        try {
            const worksheet = XLSX.utils.json_to_sheet([excelColumns]);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            XLSX.writeFile(workbook, "Articles.xlsx");
            showMessage("Excel Download Successfully!", "success");
        } catch (error) {
            console.error("Download Excel Error:", error);
            showMessage("Export failed", "error");
        }
    };

    const handelInsertExcel = async () => {
        try {
            const response = await InsertExcel();
            showMessage(response.message, response.success ? "success" : "error");
            response.success && fetchGridData(currentPage, rowsPerPage, sortModel, searchText);
            return {
                success: response?.success,
                message: response?.message,
                data: response?.data?.rd,
            };
        } catch (error) {
            console.error("Excel Insert Error:", error);
            showMessage("Excel Insert failed", "error");
            return { success: false, data: [], message: error.message };
        }
    };

    const handelCalculation = async () => {
        setIsCalculation(true)
        setCalcDialogOpen(true)
        try {
            let body = {
                JsonData: selectedRows.join(',')
            }
            const response = await Calculation(body);
            if (response.success) {
                fetchGridData(currentPage, rowsPerPage, sortModel, searchText);
                setSelectedRows([])
                // showMessage("Calculation Successfully!", "success");
            } else {
                showMessage(response.message, "error");
            }
        } catch (error) {
            showMessage("Calculation failed", "error");
            setIsCalculation(false);
        } finally {
            setIsCalculation(false);
        }
    };

    const handleDiscoutClick = async (data) => {
        try {
            const response = await AddDiscount(selectedRows, data.DiscountValue);
            if (response.success) {
                showMessage("Discount Added Successfully", "success");
                setSelectedRows([]);
                fetchGridData(currentPage, rowsPerPage, sortModel, searchText);
            } else {
                showMessage(response.message, "error");
            }
        } catch (error) {
            showMessage(error.message, "error");
            console.error("Error Added the discount:", error);
        }
    }

    const handleMRPClick = async (data) => {
        try {
            let selectedData = [];
            if (_.isEmpty(data.mode) && data.mode !== "singleupdate") {
                selectedData = selectedRows;
            } else {
                selectedData = [data.id];
            }
            const response = await addMRP(selectedData, data?.MRP || data.Mrp);
            if (response.success) {
                showMessage("MRP Added Successfully", "success");
                setSelectedRows([]);
                fetchGridData(currentPage, rowsPerPage, sortModel, searchText);
            } else {
                showMessage(response.message, "error");
            }
        } catch (error) {
            showMessage(error.message, "error");
            console.error("Error Added the discount:", error);
        }
    };

    const handleHSNClick = async (data) => {
        try {
            const response = await AddHSN(selectedRows, data.HsnCode);
            if (response.success) {
                showMessage("HSN Added Successfully", "success");
                setSelectedRows([]);
                fetchGridData(currentPage, rowsPerPage, sortModel, searchText);
            } else {
                showMessage(response.message, "error");
            }
        } catch (error) {
            showMessage(error.message, "error");
            console.error("Error Added the discount:", error);
        }
    }

    const handlePriceBreakdownClick = (data) => {
        const cal = {
            "metal": 200.00,
            "diamonds": 0.00,
            "Cs(Colorstone)": 0.00,
            "Misc": 0.00,
            "Making Charges": 0.00,
            "Other charges": 0.00,
            "Amount": 0.00,
            "Discount Amount": 0.00,
            "Discount Amount": 0.00,
            "Tax Amount": 0.00,
            "Final Price": 0.00,
        }
        setPriceBreakdown(cal);
        setPriceBreakdownDialogOpen(true)
    }

    const handleCombiSubmit = async (combirows) => {
        try {
            const selectedCombiData = combiData.filter(item => combirows.includes(item.id));
            let body = {
                JsonData: JSON.stringify(selectedRows),
                CombinationJson: JSON.stringify(selectedCombiData)
            }
            const response = await BulkAddCombinationData(body);
            if (response.success) {
                fetchGridData(currentPage, rowsPerPage, sortModel, searchText);
                setCombinationDialogOpen(false);
                setSelectedRows([])
            }
            showMessage(response.message, response.success ? "success" : "error");
        } catch (error) {
            setCombinationDialogOpen(false);
            console.error("Form submission failed:", error);
            showMessage("Something went wrong during form submission.", "error");
        }
    }

    return (
        <>
            <Paper
                elevation={3}
                sx={{ height: "100vh", width: "100%", p: 3, backgroundColor: "#f0f2f5" }}
            >
                <CustomToolbar
                    onSearch={handleSearch}
                    onClearFilter={handleClearFilterClick}
                    onAddNew={handleAddNewClick}
                    onAdvFilter={handelFilterClick}
                    excel={{ excelDialog: setExcelDialogOpen, onClickExport: handelExportExcel, isExporting, onClickShopifyExport: handelShopifyExport, isSoExporting }}
                    checkBoxRows={selectedRows}
                    onDiscount={() => setDiscountDialogOpen(true)}
                    onMRP={() => setMrpDialogOpen(true)}
                    onHSN={() => setHsnDialogOpen(true)}
                    calculation={{ isCalculation, onClickCal: handelCalculation }}
                    onDelete={handleDeleteClick}    
                    onCombi={handleCombiClick}
                    onStatusUpdate={handleBulkStatusClick}
                    onPeCombi={handlePeCombi}
                    onStatusFilter={{ filtValue: filterStatus, setfiltValue: setFilterStatus }}
                    inStockItem={() => setInStockFilt(1)}
                    inStockValue={inStockFilt}
                />
                <DataGrid
                    rows={rows}
                    columns={Columns({ handleEditClick, handleDeleteClick, handleViewClick, handleToggleClick, handleMRPClick })}
                    paginationMode="server"
                    sortingMode="server"
                    rowCount={totalRows}
                    loading={isLoading}
                    pageSizeOptions={[20, 50, 100]}
                    hideFooterSelectedRowCount={true}
                    paginationModel={{ page: currentPage, pageSize: rowsPerPage }}
                    onPaginationModelChange={({ page, pageSize }) => {
                        setCurrentPage(page);
                        setRowsPerPage(pageSize);
                    }}
                    sortModel={sortModel}
                    onSortModelChange={(model) => setSortModel(model)}
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
                        ...gridCss ,
                        "& .MuiDataGrid-scrollbar--horizontal": {
                            height: "8px",
                          },
                          "& .MuiDataGrid-scrollbar--horizontal .MuiDataGrid-scrollbarContent": {
                            height: "8px",
                            borderRadius: "8px",
                          },
                    }}
                    scrollbarSize={8}
                    slots={{
                        pagination: CustomPagination
                    }}
                    checkboxSelection={true}
                    disableRowSelectionOnClick
                    rowSelectionModel={selectedRows}
                    onRowSelectionModelChange={(newSelection) => {
                        // setSelectedRows(newSelection);
                        setSelectedRows((prevSelection = []) => {
                            const currentPageIds = Array.isArray(rows) ? rows.map((r) => r.id ?? r.ArticleId) : [];
                            const merged = Array.from(new Set([...prevSelection, ...newSelection]));
                            const finalSelection = merged.filter(
                                (id) => !currentPageIds.includes(id) || newSelection.includes(id)
                            );
                            const same =
                                finalSelection.length === prevSelection.length &&
                                finalSelection.every((id) => prevSelection.includes(id));

                            return same ? prevSelection : finalSelection;
                        });
                    }}
                    getRowId={(row) => row?.id ?? row?.ArticleId}
                    onProcessRowUpdateError={(err) => {
                        showMessage(err.message, "error")
                    }}
                />
            </Paper>

            <DialogBox
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false)
                    setCalculatedPrice(0)
                }}
                rowData={selectedRow}
                onSubmit={handleFormSubmit}
                buttonClick={handlePriceBreakdownClick}
                optionsData={{
                    DesignNo: dropDownData?.rd || [],
                    MetalTypeId: dropDownData?.rd1 || [],
                    MetalColorId: dropDownData?.rd2 || [],
                    DiaQualityId: dropDownData?.rd3 || [],
                    DiaColorId: dropDownData?.rd4 || [],
                    CsQualityId: dropDownData?.rd5 || [],
                    CsColorId: dropDownData?.rd6 || [],
                    FinidngTypeId: dropDownData?.rd7 || [],
                    HSNCode: dropDownData?.rd16 || []
                }}
                calculatedPrice={calculatedPrice}
            />

            <FilterDialogBox
                open={filterDialogOpen}
                onClose={() => setFilterDialogOpen(false)}
                onSubmit={handleFilterSubmit}
                rowData={filterObj}
                optionsData={{
                    DesignNo: dropDownData?.rd || [],
                    MetalTypeId: dropDownData?.rd1 || [],
                    MetalColorId: dropDownData?.rd2 || [],
                    DiaQualityId: dropDownData?.rd3 || [],
                    DiaColorId: dropDownData?.rd4 || [],
                    CsQualityId: dropDownData?.rd5 || [],
                    CsColorId: dropDownData?.rd6 || [],
                    FinidngTypeId: dropDownData?.rd7 || [],
                    Collection: dropDownData?.rd8 || [],
                    Category: dropDownData?.rd9 || [],
                    SubCategory: dropDownData?.rd10 || [],
                    ProductType: dropDownData?.rd11 || [],
                    Brand: dropDownData?.rd12 || [],
                    Occasion: dropDownData?.rd13 || [],
                    Gender: dropDownData?.rd14 || [],
                    Style: dropDownData?.rd15 || [],
                    IsMasterDesign: [{ title: "Search By Design No.", value: '1' }, { title: "Search By Article No.", value: '0' }]
                }}
            />

            {/* Dialog for Delete Confirmation */}
            <DeleteDialogBox
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                confirmDelete={confirmDelete}
            />

            <ArticleDetailDialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                data={viewData}
            />

            <ExcelImportDialog
                open={excelDialogOpen}
                onClose={() => setExcelDialogOpen(false)}
                onImport={handelImportExcel}
                onVerify={handelVerifyExcel}
                onInsert={handelInsertExcel}
                onClickDownload={handelExcelDownload}
            />

            <DiscountDialog
                open={discountDialogOpen}
                onClose={() => setDiscountDialogOpen(false)}
                onSave={handleDiscoutClick}
            />

            <MrpDialog
                open={mrpDialogOpen}
                onClose={() => setMrpDialogOpen(false)}
                onSave={handleMRPClick}
            />

            <HsnDialog
                open={hsnDialogOpen}
                onClose={() => setHsnDialogOpen(false)}
                onSave={handleHSNClick}
                hsnCodes={dropDownData?.rd16 || []}
            />

            <PriceBreakdownDialog
                open={priceBreakdownDialogOpen}
                onClose={() => setPriceBreakdownDialogOpen(false)}
                priceBreakdown={priceBreakdown}
                onCalculate={setCalculatedPrice}
            />

            <CalculationDialog
                open={calcDialogOpen}
                onClose={() => setCalcDialogOpen(false)}
                isComplete={isCalculation}
            />

            <AddCombinationDialog
                open={combinationDialogOpen}
                onClose={() => setCombinationDialogOpen(false)}
                rowData={combiData}
                onSelected={handleCombiSubmit}
            />

            <StatusUpdate
                open={statusUpdateOpen}
                onClose={() => setStatusUpdateOpen(false)}
                status={isActive}
                confirmUpdate={handleBulkStatus}
            />

            <PrograssBar
                open={progressOpen}
                onClose={() => setProgressOpen(false)}
                progress={progress}
            />
        </>
    )
}