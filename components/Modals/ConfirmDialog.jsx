import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message = "Are you sure?",
  onClose,
  onConfirm,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "12px",
          padding: "4px",
          minWidth: "340px",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ fontSize: "15px", color: "#555" }}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ padding: "10px 20px 20px" }}>
        <Button onClick={onClose} variant="outlined" color="primary">
          No
        </Button>

        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{ ml: 1 }}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}