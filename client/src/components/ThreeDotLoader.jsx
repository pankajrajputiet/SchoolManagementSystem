import React from "react";
import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import { keyframes } from "@mui/system";

const colorChange = keyframes`
  0% { background-color: #f44336; transform: scale(1); }
  50% { background-color: #4caf50; transform: scale(1.4); }
  100% { background-color: #2196f3; transform: scale(1); }
`;

const Dot = ({ delay }) => (
  <Box
    sx={{
      width: 8,
      height: 8,
      borderRadius: "50%",
      animation: `${colorChange} 1.2s infinite ease-in-out`,
      animationDelay: delay,
    }}
  />
);

const GlobalLoader = () => {


  return (
    <Box display="flex" alignItems="center" justifyContent="center" width="100%" gap={0.5}>
      <Dot delay="0s" />
      <Dot delay="0.15s" />
      <Dot delay="0.3s" />
    </Box>
  );
};

export default GlobalLoader;