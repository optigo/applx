"use client";
import React from 'react';
import { Box, Typography, Pagination } from '@mui/material';
import Dropdown from '@/components/Dropdown';

export default function CustomePagenation({
    currentPage,
    rowsPerPage,
    filteredData,
    totalPages,
    handleRowsPerPageChange,
    handlePageChange,
}) {
    return (
        <Box
            sx={{
                p: 2,
                borderTop: '1px solid #e0e0e0',
                backgroundColor: '#f9fafb',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
            }}
        >
            <Box>
                <Typography variant="body2" color="text.secondary">
                    Showing {Math.min((currentPage - 1) * rowsPerPage + 1, filteredData.length)} -{' '}
                    {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} entries
                </Typography>
            </Box>
            <Box>
                <Dropdown
                    label="Rows per page"
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    options={[
                        { value: 10, label: 10 },
                        { value: 20, label: 20 },
                        { value: 50, label: 50 },
                    ]}
                    variant="outlined"
                    size="small"
                    sx={{
                        width: {
                            xs: '100%',
                            sm: '160px',
                        },
                        minWidth: '120px',
                        flexShrink: 0,
                    }}
                    menuprops={{
                        anchorOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                        },
                        transformOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                        }
                    }}
                />
            </Box>
            <Box sx={{ minWidth: 160 }}>
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                    sx={{
                        '& .MuiPaginationItem-root': {
                            color: '#555',
                            '&.Mui-selected': {
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#2563eb',
                                },
                            },
                        },
                    }}
                />
            </Box>
        </Box>
    );
}
