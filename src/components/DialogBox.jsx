"use client";
import { Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@/components/Button";

export function DeleteDialogBox({ open, onClose, confirmDelete }) {
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
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <DeleteIcon color="error" />
                    Confirm Deletion
                </Box>
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ fontSize: 15, color: "text.secondary" }}>
                    Are you sure you want to permanently delete this record?
                    <br />
                    <strong>This action cannot be undone.</strong>
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="outlined" color="primary">
                    Cancel
                </Button>
                <Button onClick={confirmDelete} variant="contained" color="error">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}