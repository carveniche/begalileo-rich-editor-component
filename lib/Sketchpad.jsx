import React from 'react'
  import { ReactSketchCanvas } from "react-sketch-canvas";
export default function Sketchpad({canvasRef,eraseMode,strokeColor,cursor}) {
  return (
    <ReactSketchCanvas
          ref={canvasRef}
          strokeColor={strokeColor}
          canvasColor="transparent"
          strokeWidth={4}
          eraseMode={eraseMode}
          style={{ position:'absolute',left:'0', top:'0', width: '100%', height: '100%', cursor: cursor }}
        />
    
  )
}
