"use client";
import React from "react";
import { TextField as MUITextField } from "@mui/material";

const TextBox = ({ label, ...props }) => {
  return <MUITextField label={label}  {...props} />;
};

export default TextBox;
