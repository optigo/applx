"use client";

import React, { Component } from "react";
import { Box, Button, FormControl, Menu, MenuItem, Select, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import CircularProgress from "@mui/material/CircularProgress";
import DiscountIcon from "@mui/icons-material/Discount";
import CalculateIcon from '@mui/icons-material/Calculate';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import DeleteIcon from '@mui/icons-material/Delete';
import DatasetIcon from '@mui/icons-material/Dataset';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Brightness1Icon from '@mui/icons-material/Brightness1';
import PlaylistAddCircleSharp from '@mui/icons-material/PlaylistAddCircleSharp';

const ExcelIcon = () => (
    <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 256 256"
        height="1em"
        width="1em"
        style={{ fontSize: 20 }}
    >
        <path d="M200,24H72A16,16,0,0,0,56,40V64H40A16,16,0,0,0,24,80v96a16,16,0,0,0,16,16H56v24a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V40A16,16,0,0,0,200,24ZM72,160a8,8,0,0,1-6.15-13.12L81.59,128,65.85,109.12a8,8,0,0,1,12.3-10.24L92,115.5l13.85-16.62a8,8,0,1,1,12.3,10.24L102.41,128l15.74,18.88a8,8,0,0,1-12.3,10.24L92,140.5,78.15,157.12A8,8,0,0,1,72,160Zm56,56H72V192h56Zm0-152H72V40h56Zm72,152H144V192a16,16,0,0,0,16-16v-8h40Zm0-64H160V104h40Zm0-64H160V80a16,16,0,0,0-16-16V40h56Z"></path>
    </svg>
);

const ExcelExportMenu = ({ anchorEl, onClose, onExport, onShopifyExport, excel }) => (
    <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        MenuListProps={{
            onMouseLeave: onClose,
        }}
    >
        <MenuItem onClick={onExport} disabled={excel?.isExporting}>
            {excel?.isExporting && (
                <CircularProgress size={18} color="inherit" sx={{ marginRight: 1 }} />
            )}
            Excel Export
        </MenuItem>
        <MenuItem onClick={onShopifyExport} disabled={excel?.isSoExporting}>
            {excel?.isSoExporting && (
                <CircularProgress size={18} color="inherit" sx={{ marginRight: 1 }} />
            )}
            Shopify Export
        </MenuItem>
    </Menu>
);

const ActionMenu = ({ anchorEl, onClose, isSelected, onDiscount, onMRP, onHSN, onDelete, onStatusUpdate, onPeCombi }) => {
    const handleAction = (action, value) => {
        if (!isSelected && value !== "pecombi") {
            alert("Select atleast 1 Recoed!!");
            onClose();
            return;
        }
       
        if (value !== undefined) {
            action(value);
        } else {
            action();
        }

        onClose();
    };

    return (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={onClose}
            MenuListProps={{
                onMouseLeave: onClose,
            }}
        >
            <MenuItem onClick={() => handleAction(onDiscount)}>
                <Box display="flex" alignItems="center" gap={1}>
                    <DiscountIcon fontSize="small" color="warning" /> Discount
                </Box>
            </MenuItem>
            <MenuItem onClick={() => handleAction(onMRP)}>
                <Box display="flex" alignItems="center" gap={1}>
                    <CurrencyRupeeIcon fontSize="small" color="primary" /> MRP
                </Box>
            </MenuItem>
            <MenuItem onClick={() => handleAction(onHSN)}>
                <Box display="flex" alignItems="center" gap={1}>
                    <DatasetIcon fontSize="small" color="secondary" /> HSN
                </Box>
            </MenuItem>
            <MenuItem onClick={() => handleAction(onDelete)}>
                <Box display="flex" alignItems="center" gap={1}>
                    <DeleteIcon fontSize="small" color="error" /> Delete
                </Box>
            </MenuItem>
            <MenuItem onClick={() => handleAction(onPeCombi, 'pecombi')}>
                <Box display="flex" alignItems="center" gap={1}>
                    <PlaylistAddCircleSharp fontSize="small" color="primary" /> Pending 
                    <br/> Combination
                </Box>
            </MenuItem>
            <MenuItem onClick={() => handleAction(onStatusUpdate, 1)}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Brightness1Icon 
                        fontSize="small" 
                        color="success"
                        sx={{
                            padding: "2px", 
                            '& svg': { fontSize: 14 }
                        }}
                    /> Active
                </Box>
            </MenuItem>
            <MenuItem onClick={() => handleAction(onStatusUpdate, 0)}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Brightness1Icon 
                        fontSize="small" 
                        color="error" 
                        sx={{
                            padding: "2px", 
                            '& svg': { fontSize: 14 }
                        }}
                    /> Deactive
                </Box>
            </MenuItem>
        </Menu>
    )
};
class CustomToolbar extends Component {
    constructor(props) {
        super(props);
        this.fileInputRef = React.createRef();
        this.state = {
            searchQuery: "",
            exportMenuAnchorEl: null,
            actionsMenuAnchorEl: null,
        };
    }

    handleSearchSubmit = () => {
        const { onSearch } = this.props;
        onSearch(this.state.searchQuery);
    };

    handleClear = () => {
        const { onClearFilter } = this.props;
        this.setState({ searchQuery: "" }, () => {
            onClearFilter();
        });
    };

    handleInputChange = (event) => {
        this.setState({ searchQuery: event.target.value });
    };

    handleKeyDown = (event) => {
        if (event.key === "Enter") {
            this.handleSearchSubmit();
        }
    };

    handleOpenExportMenu = (event) => {
        this.setState({ exportMenuAnchorEl: event.currentTarget });
    };

    handleCloseExportMenu = () => {
        this.setState({ exportMenuAnchorEl: null });
    };

    handleExport = () => {
        const { excel } = this.props;
        excel.onClickExport();
    };

    handleShopifyExport = () => {
        const { excel } = this.props;
        excel.onClickShopifyExport();
    }

    handleOpenActionsMenu = (event) => {
        this.setState({ actionsMenuAnchorEl: event.currentTarget });
    };

    handleCloseActionsMenu = () => {
        this.setState({ actionsMenuAnchorEl: null });
    };

    handleCalculation = () => {
        const { calculation } = this.props;
        calculation.onClickCal();
    };

    handleImport = () => {
        const { excel } = this.props;
        excel.excelDialog(true);
    };

    render() {
        const { onAddNew, onAdvFilter, checkBoxRows, onDiscount, onMRP, onHSN, onDelete, onCombi, onStatusUpdate, onPeCombi, onStatusFilter, inStockItem, inStockValue } = this.props;
        const { searchQuery, exportMenuAnchorEl, actionsMenuAnchorEl } = this.state;
        const isSelected = Array.isArray(checkBoxRows) && checkBoxRows.length > 0;

        return (
            <Box bgcolor="#fff" display="flex" justifyContent="space-between" alignItems="center" minWidth={"100%"} mb={1} p={'10px'} borderRadius={3}>
                <Box display="flex" gap={1} alignItems="center">
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={onAddNew}
                        sx={{ textTransform: "none", fontWeight: 500, fontSize: 14, borderRadius: 1 }}
                    >
                        Add
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<FilterAltIcon />}
                        onClick={onAdvFilter}
                        sx={{ textTransform: "none", fontWeight: 500, fontSize: 14, borderRadius: 1 }}
                    >
                        Adv.Filter
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<ExcelIcon />}
                        onClick={(e) => this.handleOpenExportMenu(e)}
                        sx={{ textTransform: "none", fontWeight: 500, fontSize: 14, borderRadius: 1 }}
                    >
                        Export
                    </Button>

                    <ExcelExportMenu
                        anchorEl={exportMenuAnchorEl}
                        onClose={this.handleCloseExportMenu}
                        onExport={this.handleExport}
                        onShopifyExport={this.handleShopifyExport}
                        excel={this.props.excel}
                    />

                    <Button
                        variant="contained"
                        color="info"
                        startIcon={<ExcelIcon />}
                        onClick={this.handleImport}
                        sx={{ textTransform: "none", fontWeight: 500, fontSize: 14, borderRadius: 1 }}
                    >
                        Import
                    </Button>

                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<MoreVertIcon />}
                        onClick={(e) => this.handleOpenActionsMenu(e)}
                        // disabled={!isSelected}
                        sx={{ textTransform: "none", fontWeight: 500, fontSize: 14, borderRadius: 1 }}
                    >
                        Actions
                    </Button>

                    <ActionMenu
                        anchorEl={actionsMenuAnchorEl}
                        onClose={this.handleCloseActionsMenu}
                        isSelected={isSelected}
                        onDiscount={onDiscount}
                        onMRP={onMRP}
                        onHSN={onHSN}
                        onDelete={onDelete}
                        onStatusUpdate={onStatusUpdate}
                        onPeCombi={onPeCombi}
                    />

                    <Button
                        variant="text"
                        onClick={inStockItem}
                        disabled={inStockValue}
                        sx={{
                            textTransform: "none",
                            fontWeight: 500,
                            fontSize: 14,
                            color: "#1976d2",
                            textDecoration: "underline",
                            minWidth: "auto",
                            padding: "4px 6px",
                            "&:hover": {
                                backgroundColor: "transparent",
                                textDecoration: "underline"
                            }
                        }}
                    >
                        Stock Items
                    </Button>
                </Box>

                <Box display="flex" gap={1} alignItems="center">
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<PlaylistAddCircleSharp />}
                        onClick={onCombi}
                        sx={{ textTransform: "none", fontWeight: 500, fontSize: 14, borderRadius: 1 }}
                    >
                        Add Combination
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={
                            this.props.calculation.isCalculation ? (
                                <CircularProgress size={18} color="inherit" />
                            ) : (
                                <CalculateIcon />
                            )
                        }
                        onClick={this.handleCalculation}
                        disabled={this.props.calculation.isCalculation}
                        sx={{ textTransform: "none", fontWeight: 500, fontSize: 14, borderRadius: 1 }}
                    >
                        Calculate
                    </Button>
                    <FormControl sx={{ m: 1, width: 130, maxWidth: 130 }}>
                        <Select
                            size="small"
                            value={onStatusFilter.filtValue}
                            onChange={(e) => onStatusFilter.setfiltValue(e.target.value)}
                            sx={{
                                height: 36,
                                "& .MuiSelect-select": {
                                  display: "flex",
                                  alignItems: "left",
                                },
                              }}
                        >
                        <MenuItem value={1}>
                            <Brightness1Icon 
                                fontSize="small" 
                                color="success"
                                sx={{
                                    padding: "2px", 
                                    '& svg': { fontSize: 10 }
                                }}
                            />
                            Active
                        </MenuItem>
                        <MenuItem value={0}>
                            <Brightness1Icon 
                                fontSize="small" 
                                color="error"
                                sx={{
                                    padding: "2px", 
                                    '& svg': { fontSize: 10 }
                                }}
                            />
                            Deactive
                        </MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        variant="outlined"
                        size="small"
                        value={searchQuery}
                        onChange={this.handleInputChange}
                        onKeyDown={this.handleKeyDown}
                        label={
                            <Box display="flex" alignItems="center">
                                <SearchIcon 
                                    sx={{ padding: "2px", '& svg': { fontSize: 10 }}}
                                />
                                Search...
                            </Box>
                        }
                    />
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<FilterAltOffIcon />}
                        onClick={this.handleClear}
                        sx={{ textTransform: "none", fontWeight: 500, fontSize: 14, borderRadius: 1 }}
                    >
                        Clear
                    </Button>
                </Box>
            </Box>
        );
    }
}

export default CustomToolbar;