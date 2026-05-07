"use client";
import React from "react";
import {
  AppBar, Toolbar, Typography, Container, Button, 
  Box, Grid, Card, CardContent, Link,
} from "@mui/material";

const HomePage = () => {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Link href="https://optigoapps.com/" target="_blank">
            <Box
              component="img"
              src="https://optigoapps.com/wp-content/uploads/2015/01/optigologo-black.png"
              alt="Optigo Logo"
              sx={{ height: 40 }}
            />
          </Link>
          <Box>
            <Button
              href="https://optigoapps.com/features/"
              target="_blank"
              sx={{ color: "text.primary", mr: 2 }}
            >
              Features
            </Button>
            <Button
              href="https://optigoapps.com/contact/"
              target="_blank"
              sx={{ color: "text.primary" }}
            >
              Contact
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        flex={1}
        textAlign="center"
        py={8}
        px={4}
        sx={{ bgcolor: "blue.50" }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Welcome to Optigo Apps
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Modernizing Business in a Cloud-First World
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Focus on what really matters, while our apps do everything you need.
        </Typography>
        <Box display="flex" justifyContent="center" gap={2} mt={3}>
          <Button
            variant="contained"
            color="primary"
            href="https://www.optigoapps.com/contact/"
            target="_blank"
          >
            REQUEST A DEMO
          </Button>
          <Button
            variant="contained"
            color="primary"
            href="https://www.optigoapps.com/customers/"
            target="_blank"
          >
            CUSTOMERS
          </Button>
        </Box>
      </Box>

      {/* Features Section */}
      <Box py={8} px={4} textAlign="center">
        <Container>
          <Grid container spacing={4}>
            <Grid size={{ xs:12, md:4}}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    The power to do more
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Watch productivity soar with the tool loved by users. Let
                    team members instantly sync and share data on any device, so
                    they can work together from anywhere.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs:12, md:4 }}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Security that inspires confidence
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    For Business, we make data access safe, reliable, and fast.
                    With powerful admin controls, IT can protect information
                    both inside and outside your organization.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs:12, md:4 }}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    A smarter investment
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Break the cycle of training for manual work done by
                    email-phone-paper process, and lost productivity. Employees
                    will pick up OptigoApps for Business in no time, freeing IT
                    and your team to get work done.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={4} textAlign="center" sx={{ bgcolor: "grey.100" }}>
        <Typography variant="body2" color="text.secondary">
          &copy; 2025 Optigo Apps. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default HomePage;
