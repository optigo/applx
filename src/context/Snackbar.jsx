"use client";
import React, { Component, createContext } from "react";
import { Snackbar, Alert } from "@mui/material";

// Create Snackbar Context
const SnackbarContext = createContext();

/**
 * SnackbarProvider (Class-Based)
 * Provides a global Snackbar system using React Context.
 */
class SnackbarProvider extends Component {
  constructor(props) {
    super(props);
    // Initialize state for Snackbar visibility, message, and severity
    this.state = {
      open: false,
      message: "",
      severity: "info" // success, error, warning, info
    };
  }

  /**
   * Show snackbar with a message and severity.
   * @param {string} message - The message to display.
   * @param {string} severity - The type of alert (success, error, warning, info).
   */
  showSnackbar = (message, severity = "info") => {
    this.setState({
      open: true,
      message,
      severity
    });
  };

  /**
   * Handle snackbar close event.
   * @param {object} _ - Event object (ignored).
   * @param {string} reason - Reason for close (e.g., 'timeout', 'clickaway').
   */
  handleClose = (_, reason) => {
    if (reason !== "clickaway") {
      this.setState({ open: false });
    }
  };

  render() {
    const { children } = this.props;
    const { open, message, severity } = this.state;

    return (
      <SnackbarContext.Provider value={{ showSnackbar: this.showSnackbar }}>
        {children}

        {/* Snackbar UI Component */}
        <Snackbar
          open={open}
          autoHideDuration={5000}
          onClose={this.handleClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{
            "& .MuiPaper-root": {
              borderRadius: "20px",
              padding: "10px 20px",
              boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
              minWidth: "350px",
              textAlign: "center",
            }
          }}
        >
          <Alert
            onClose={this.handleClose}
            severity={severity}
            variant="filled"
            sx={{
              backgroundColor: severity === "error" ? "#D32F2F" : undefined,
              color: "#fff",
              fontWeight: "600",
              // fontSize: "1rem",
              borderRadius: "20px",
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
              padding: "12px 25px",
            }}
          >
            {message}
          </Alert>
        </Snackbar>
      </SnackbarContext.Provider>
    );
  }
}

export { SnackbarProvider, SnackbarContext };

/**
 * Custom Hook (Must still be function-based)
 * Provides access to the SnackbarContext.
 */
export const useSnackbar = () => {
  return React.useContext(SnackbarContext);
};