import React, { useState } from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";

/**
 * ActionMenu Component
 *
 * @param {object} params - The row data object.
 * @param {array} allowAction - An array of action keys to allow, e.g., ['edit', 'delete'].
 * @param {object} handleActions - Object containing action handler functions.
 */
const ActionMenu = ({ params, allowAction = [], handleActions = {} }) => {
    const isDisabled = params.row.IsDisabled ?? 0;

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
        if (!isDisabled) setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => setAnchorEl(null);

    const handleActionClick = (actionFn) => {
        actionFn?.(params?.row);
        handleMenuClose();
    };

    const allActions = {
        edit: {
            label: "Edit",
            icon: <EditIcon fontSize="small" color="primary" />,
            onClick: handleActions.handleEditClick,
            color: "primary.main",
        },
        delete: {
            label: "Delete",
            icon: <DeleteIcon fontSize="small" color="error" />,
            onClick: handleActions.handleDeleteClick,
            color: "error.main",
        },
        clone: {
            label: "Clone",
            icon: <ContentCopyIcon fontSize="small" color="secondary" />,
            onClick: handleActions.handleCloneClick,
            color: "secondary.main"
        },
        send: {
            label: "Send Mail",
            icon: <SendIcon fontSize="small" color="info" />,
            onClick: handleActions.handleSendMailClick,
            color: "info.main"
        },
    };

    return (
        <>
            <IconButton size="small" onClick={handleMenuOpen} disabled={isDisabled}>
                <MoreHorizIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
                {allowAction.map((key) => {
                    const action = allActions[key];
                    if (!action || !action.onClick) return null;

                    return (
                        <MenuItem key={key} onClick={() => handleActionClick(action.onClick)} sx={{ color: action.color }}>
                            <ListItemIcon>{action.icon}</ListItemIcon>
                            <ListItemText>{action.label}</ListItemText>
                        </MenuItem>
                    );
                })}
            </Menu>
        </>
    );
};

export default ActionMenu;
