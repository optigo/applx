"use client";
import React from "react";
import {
  FormControl, InputLabel, MenuItem, Select
} from "@mui/material";

const Dropdown = ({ label, options = [], value, onChange, MenuProps, ...props }) => {
  return (
    <FormControl {...props}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={onChange}
        MenuProps={MenuProps}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default Dropdown;
