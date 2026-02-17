import React, { useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

export default function ErrorPopup({ open, onClose, message }) {

  useEffect(() => {
    if (open && typeof window.showalert === "function") {
      window.showalert(message);
      onClose?.({ type: false, msg: "" });
    }
  }, [open, message, onClose]);

  const handleOnClose = () => {
    onClose?.({ type: false, msg: "" });
  };

  // 👉 if global alert exists → don't render dialog
  if (typeof window.showalert === "function") return null;

  return (
    <Dialog
      open={open}
      onClose={handleOnClose}
      disablePortal
      container={() => document.getElementById("root")}
    >
      <DialogTitle>Error</DialogTitle>

      <DialogContent>
        {message}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleOnClose} variant="contained">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
