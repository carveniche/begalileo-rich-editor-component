import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import BrushIcon from "@mui/icons-material/Brush";
import LayersClearIcon from "@mui/icons-material/LayersClear";
import ReplayCircleFilledIcon from "@mui/icons-material/ReplayCircleFilled";
import CloseIcon from "@mui/icons-material/Close";
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
export default function ScratchPadIcons({
  isEraser,
  setIsEraser,
  strokeColor,
  setStrokeColor,
  selectedColor,
  setSelectedColor,
  canvasColor,
  canvasAllRef,
  activePage
}) {
  // Pencil mode
  const handlePencilClick = () => {
    setIsEraser(false);
    setStrokeColor(selectedColor);
  };

  // Eraser mode
  const handleEraserClick = () => {
    setIsEraser(true);
    setStrokeColor(canvasColor);
  };

  // Clear Canvas
  const handleClearClick = () => {
    canvasAllRef.current.forEach((canvasRef) => {
      canvasRef?.current?.clearCanvas();
    }
    );
  };

  // // Close button (same as clear)
  // const handleCloseClick = () => {
  //   canvasAllRef.current.forEach((canvasRef) => {
  //     canvasRef?.current?.clearCanvas();
  //   }); 
  // };

  // Color picker change
  const handleStrokeColorChange = (e) => {
    const newColor = e.target.value;
    setSelectedColor(newColor);

    if (!isEraser) setStrokeColor(newColor);
  };

  function handleUndoRedoClick(type) {  
    const canvasRef = canvasAllRef.current[activePage];
      if (type === 'undo') canvasRef?.current?.undo();
      else  
      canvasRef?.current?.redo();
  }


  return (
    <div className="canva_sratchpad_feature_icons">

      {/* Close */}
      {/* <Tooltip title="Close / Clear">
        <IconButton onClick={handleCloseClick} sx={closebtn}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip> */}

      {/* Color Picker */}
      <Tooltip title="Pick Color">
        <input
          type="color"
          value={selectedColor}
          onChange={handleStrokeColorChange}
          style={{
            width: 30,
            height: 30,
            border: "none",
            cursor: "pointer",
            background: "transparent",
            padding: 0
          }}
          disabled={isEraser}
        />
      </Tooltip>

      {/* Pencil */}
      <Tooltip title="Draw">
        <IconButton
          color={!isEraser ? "primary" : "default"}
          onClick={handlePencilClick}
        >
          <BrushIcon />
        </IconButton>
      </Tooltip>

      {/* Eraser */}
      {/* <Tooltip title="Eraser">
        <IconButton
          color={isEraser ? "primary" : "default"}
          onClick={handleEraserClick}
        >
          <LayersClearIcon />
        </IconButton>
      </Tooltip> */}

      {/* Clear */}
      <Tooltip title="Clear Canvas">
        <IconButton onClick={handleClearClick}>
          <ReplayCircleFilledIcon />
        </IconButton>
      </Tooltip>

        {/* Clear */}
      <Tooltip title=" Undo Canvas">
        <IconButton onClick={()=>handleUndoRedoClick('undo')}>
          <UndoIcon />
        </IconButton>
      </Tooltip>

        <Tooltip title="Redo Canvas">
        <IconButton onClick={()=>handleUndoRedoClick('redo')}>
          <RedoIcon />
        </IconButton>
      </Tooltip>


    </div>
  );
}

export const closebtn = {
  border: "1.4px solid #FF8652",
  color: "#FF8652",
  width: "35px",
  height: "35px",
  "&:hover": {
    backgroundColor: "#FF8652",
    borderColor: "#FFB296",
    color: "#fff"
  }
};
