"use client";
import React from "react";
import { IconButton as MUIIconButton, Tooltip } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material"; // import only what you need

const IconButton = ({ icon, tooltip, ...props }) => {
  const icons = {
    delete: <Delete fontSize="small" />,
    edit: <Edit fontSize="small" />,
  };

  const selectedIcon = icons[icon] || icon; // you can pass custom JSX too

  return (
    <Tooltip title={tooltip || ""} arrow>
      <MUIIconButton {...props}>
        {selectedIcon}
      </MUIIconButton>
    </Tooltip>
  );
};

export default IconButton;
