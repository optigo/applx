import React, { Component } from 'react';
import { Box, Pagination, TextField, Typography, Select, MenuItem } from '@mui/material';
import { gridPageCountSelector, gridPaginationModelSelector, useGridApiContext, useGridSelector, gridRowCountSelector } from '@mui/x-data-grid';

// Wrapper to inject API context and selectors into a class component
function withGridApi(ComponentClass) {
    return function Wrapper(props) {
        const apiRef = useGridApiContext();
        const pageCount = useGridSelector(apiRef, gridPageCountSelector);
        const paginationModel = useGridSelector(apiRef, gridPaginationModelSelector);
        const rowCount = useGridSelector(apiRef, gridRowCountSelector);

        return (
            <ComponentClass
                {...props}
                apiRef={apiRef}
                pageCount={pageCount}
                paginationModel={paginationModel}
                rowCount={rowCount}
            />
        );
    };
}

const ROWS_PER_PAGE_OPTIONS = [20, 50, 100];

class CustomPagination extends Component {
    constructor(props) {
        super(props);

        this.state = {
            inputPage: props.paginationModel.page + 1,
            pageSize: props.paginationModel.pageSize
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.paginationModel.page !== this.props.paginationModel.page) {
            this.setState({ inputPage: this.props.paginationModel.page + 1 });
        }
        if (prevProps.paginationModel.pageSize !== this.props.paginationModel.pageSize) {
            this.setState({ pageSize: this.props.paginationModel.pageSize });
        }
    }

    handleInputChange = (e) => {
        this.setState({ inputPage: e.target.value });
    };

    goToPage = (pageNumber) => {
        const { apiRef, pageCount, paginationModel } = this.props;
        const newPage = Number(pageNumber) - 1;

        if (!isNaN(newPage) && newPage >= 0 && newPage < pageCount) {
            apiRef.current.setPage(newPage);
            this.setState({ inputPage: newPage + 1 });
        } else {
            this.setState({ inputPage: paginationModel.page + 1 }); // Reset if invalid
        }
    };

    handleInputBlur = () => {
        this.goToPage(this.state.inputPage);
    };

    handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            this.goToPage(this.state.inputPage);
        }
    };

    handlePaginationChange = (event, value) => {
        const { apiRef } = this.props;
        apiRef.current.setPage(value - 1);
        this.setState({ inputPage: value });
    };

    handlePageSizeChange = (event) => {
        const { apiRef } = this.props;
        const newSize = event.target.value;

        apiRef.current.setPaginationModel({
            page: 0,
            pageSize: newSize
        });

        this.setState({ pageSize: newSize, inputPage: 1 });
    };

    render() {
        const { pageCount, paginationModel, rowCount } = this.props;
        const { inputPage, pageSize } = this.state;

        const from = Math.min((paginationModel.page * paginationModel.pageSize) + 1, rowCount);
        const to = Math.min((paginationModel.page + 1) * paginationModel.pageSize, rowCount)

        return (
            <Box display="flex" alignItems="center" justifyContent="space-between" minWidth={"100%"} p={1}>
                <Box gap={1}>
                    <Typography variant="body2" color="textSecondary">
                        <strong> Displaying {from} to {to} of {rowCount} items </strong>
                    </Typography>
                </Box>
                <Box display="flex" gap={1} >
                    <Box display="flex" alignItems="center">
                        <Pagination
                            color="primary"
                            count={pageCount}
                            page={paginationModel.page + 1}
                            onChange={this.handlePaginationChange}
                            shape="rounded"
                        />
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" color="textSecondary"><strong>Page</strong></Typography>
                        <TextField
                            size="small"
                            value={inputPage}
                            onChange={this.handleInputChange}
                            onBlur={this.handleInputBlur}
                            onKeyDown={this.handleInputKeyDown}
                            type="number"
                            sx={{ width: 70 }}
                            inputProps={{ min: 1, max: pageCount }}
                        />
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" color="textSecondary"><strong>Display limit</strong></Typography>
                        <Select
                            size="small"
                            value={pageSize}
                            onChange={this.handlePageSizeChange}
                            MenuProps={{
                                anchorOrigin: {
                                    vertical: 'top',
                                    horizontal: 'left',
                                },
                                transformOrigin: {
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }
                            }}
                        >
                            {ROWS_PER_PAGE_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </Select>
                    </Box>
                </Box>
            </Box>
        );
    }
}

export default withGridApi(CustomPagination);
