import { SnackbarProvider } from "@/context/Snackbar";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Box } from "@mui/material";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <SnackbarProvider>
          <Box
            sx={{
              width: '100vw',
              height: '100vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#f0f2f5',
            }}
          >
            {children}
          </Box>
        </SnackbarProvider>
      </body>
    </html>
  );
}
