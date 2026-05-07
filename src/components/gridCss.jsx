const gridCss = {
    height: "calc(92vh - 92px)",
    borderRadius: 3,
    border: "none",
    backgroundColor: "#fff",
    "& .MuiDataGrid-columnHeaders": {
        borderBottom: "1px solid #e0e0e0",
        boxShadow: '0 0 2px rgba(0, 0, 0, 0.15)',
    },
    "& .MuiDataGrid-columnHeaderTitle": {
        fontWeight: "bold",
    },
    "& .MuiDataGrid-cell": {
        borderBottom: "1px solid #f0f0f0",
    },
    "& .MuiDataGrid-row:hover": {
        backgroundColor: "#f5f5f5",
    }
}

export default gridCss;