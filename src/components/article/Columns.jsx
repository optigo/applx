import { useEffect, useState } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import TextField from "@/components/TextField";
import DeleteIcon from "@mui/icons-material/Delete";
import Brightness1Icon from '@mui/icons-material/Brightness1';

export const Columns = (handelClicks) => [
  { field: 'SrNo', headerName: 'Sr#', width: 50, sortable: false, disableColumnMenu: true },
  { field: 'EntryDate', headerName: 'Date', width: 110, disableColumnMenu: true },
  {
    field: 'DesignNo',
    headerName: 'Design No',
    width: 120,
    disableColumnMenu: true,
    renderCell: (params) => (
      <Typography
        variant="body"
        sx={{
          color: "text.secondary",
          textDecoration: "underline",
          cursor: "pointer",
          "&:hover": {
            color: "text.primary",
          }
        }}
        onClick={() => handelClicks.handleViewClick(params.row)}
      >
        {params.value}
      </Typography>
    )
  },
  { 
    field: "InStock", 
    headerName: "In Stock", 
    width: 100, 
    disableColumnMenu: true,
    align: 'center',
    renderCell: (params) => (
      (params.value) ? 
        <Tooltip title={params.row?.JobNo || ""} arrow>
          <Typography
            variant="body"
            color="primary"
            sx={{
              textDecoration: "underline",
              "&:hover": {
                color: "primary",
              }
            }}
          >
            {params.value}
          </Typography>
        </Tooltip>
        : "-"
    )
  },
  {
    field: 'ArticleMasterCode',
    headerName: 'Article Master Code',
    width: 170,
    disableColumnMenu: true,
    renderCell: (params) => (
      <Typography
        variant="body"
        color="primary"
      >
        {params.value}
      </Typography>
    )
  },
  { field: 'MetalTypeName', headerName: 'Metal Type', width: 120, disableColumnMenu: true },
  { field: 'MetalColorName', headerName: 'Metal Color', width: 120, disableColumnMenu: true },
  { field: 'DiaClarityName', headerName: 'Dia Quality', width: 100, disableColumnMenu: true },
  { field: 'DiaColorName', headerName: 'Dia Color', width: 100, disableColumnMenu: true },
  { field: 'CsQualityName', headerName: 'Cs Quality', width: 100, disableColumnMenu: true },
  { field: 'CsColorName', headerName: 'Cs Color', width: 100, disableColumnMenu: true },
  { field: 'FindingTypeName', headerName: 'Finding Type', width: 120, disableColumnMenu: true },
  { field: 'Size', headerName: 'Size', width: 100, disableColumnMenu: true },
  { field: 'HSNCodeName', headerName: 'HSN', width: 100, disableColumnMenu: true },
  { field: 'Discount', headerName: 'Disc.(%)', width: 120, align: 'right', headerAlign: 'left', disableColumnMenu: true },
  {
    field: 'MRP',
    headerName: 'MRP (₹)',
    width: 110,
    disableColumnMenu: true,
    type: 'number',
    align: 'right',
    headerAlign: 'left',
    renderCell: (params) => {
      const [value, setValue] = useState(params.value ?? "");

      useEffect(() => {
        setValue(params.value ?? "");
      }, [params.value]);

      const handleChange = (e) => {
        setValue(e.target.value);
      };

      const handleKeyDown = (e) => {
        if (e.key === "Enter") {
          handelClicks.handleMRPClick({
            mode: "singleupdate",
            id: params.id,
            MRP: value
          });
        }
      };

      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <TextField
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            size="small"
            variant="outlined"
            InputProps={{ style: { fontSize: "0.85rem", textAlign: "right" } }}
          />
        </Box>
      )
    }
  },
  { field: 'Amount', headerName: 'Amount (₹)', align: 'right', headerAlign: 'left', width: 110, disableColumnMenu: true },
  {
    field: "status",
    headerName: "Status",
    width: 70,
    disableColumnMenu: true,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => {
      const isActive = params.row.Status === 1;

      return (
        <Tooltip title={isActive ? "Deactivate" : "Activate"} arrow>
          <IconButton
            size="small"
            onClick={() =>
              handelClicks.handleToggleClick(params.row.id, isActive ? 0 : 1)
            }
            sx={{
              color: isActive ? "green" : "red",
              "&:hover": { backgroundColor: "transparent" },
              padding: "2px",
              "& svg": { fontSize: 14 },
            }}
          >
            <Brightness1Icon fontSize="small" />
          </IconButton>
        </Tooltip>
      );
    },
  },
  {
    field: "delete",
    headerName: "Delete",
    width: 70,
    sortable: false,
    disableColumnMenu: true,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => {
      const isMasterDesign = params.row.IsMasterDesign === 1;

      return (
        <Tooltip title="Delete" arrow>
          <IconButton
            size="small"
            disabled={isMasterDesign}
            onClick={() => handelClicks.handleDeleteClick(params.row, false)}
            sx={{
              color: "#d32f2f",
              "&:hover": { backgroundColor: "transparent" },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      );
    },
  }
];

export const formColumns = [
  { field: "DesignNo", headerName: "Design No", filterType: "dropdown", isRequired: true },
  { field: "MetalTypeId", headerName: "Metal Type", filterType: "dropdown", isRequired: true },
  { field: "MetalColorId", headerName: "Metal Color", filterType: "dropdown", isRequired: true },
  { field: "DiaQualityId", headerName: "Diamond Quality", filterType: "dropdown", isRequired: false },
  { field: "DiaColorId", headerName: "Diamond Color", filterType: "dropdown", isRequired: false },
  { field: "CsQualityId", headerName: "Cs Quality", filterType: "dropdown", isRequired: false },
  { field: "CsColorId", headerName: "Cs Color", filterType: "dropdown", isRequired: false },
  { field: "FinidngTypeId", headerName: "Finding Type", filterType: "dropdown", isRequired: false },
  // { field: "Size", headerName: "Size", filterType: "text", isRequired: false },
  { field: 'HSNCode', headerName: 'HSN Code', filterType: "dropdown", isRequired: false },
  { field: 'Discount', headerName: 'Discount', filterType: "number", isRequired: false },
  { field: 'MRP', headerName: 'MRP (₹)', filterType: "number", isRequired: false, disabled: false },
  { field: 'Amount', headerName: 'Amount (₹)', filterType: "number", isRequired: false },
  // { field: 'Calculation', headerName: 'Calculation', filterType: "button", isRequired: false },
];

export const filterColumns = [
  { field: "ArticleMasterCode", headerName: "Article Master Code", filterType: "text" },
  { field: "DesignNo", headerName: "Design No", filterType: "dropdown" },
  { field: "Size", headerName: "Size", filterType: "text" },
  { field: "MetalTypeId", headerName: "Metal Type", filterType: "dropdown" },
  { field: "MetalColorId", headerName: "Metal Color", filterType: "dropdown" },
  { field: "DiaQualityId", headerName: "Diamond Quality", filterType: "dropdown" },
  { field: "DiaColorId", headerName: "Diamond Color", filterType: "dropdown" },
  { field: "CsQualityId", headerName: "Cs Quality", filterType: "dropdown" },
  { field: "CsColorId", headerName: "Cs Color", filterType: "dropdown" },
  { field: "FinidngTypeId", headerName: "Finding Type", filterType: "dropdown" },
  { field: "Collection", headerName: "Collection", filterType: "dropdown" },
  { field: "Category", headerName: "Category", filterType: "dropdown" },
  { field: "SubCategory", headerName: "Sub Category", filterType: "dropdown" },
  { field: "ProductType", headerName: "Product Type", filterType: "dropdown" },
  { field: "Brand", headerName: "Brand", filterType: "dropdown" },
  { field: "Occasion", headerName: "Occasion", filterType: "dropdown" },
  { field: "Gender", headerName: "Gender", filterType: "dropdown" },
  { field: "Style", headerName: "Style", filterType: "dropdown" },
  { field: "IsMasterDesign", headerName: "Search By", filterType: "dropdown" },
];

export const excelColumns = {
  "Sr No": "",
  "Design No": "",
  "Metal Type": "",
  "Metal Color": "",
  "Diamond Quality": "",
  "Diamond Color": "",
  "Cs Quality": "",
  "Cs Color": "",
  "Finding Type": "",
  "Size": "",
  "HSN Code": "",
  "MRP": "",
  "Discount (%)": ""
}