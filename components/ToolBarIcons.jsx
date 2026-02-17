
import React, { useState, useRef, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { RxTextNone } from "react-icons/rx";
import { TbReplaceFilled } from "react-icons/tb";
// import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import {
  FaBold,
  FaFillDrip,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaImage,
} from 'react-icons/fa';
import { FaFilePdf } from "react-icons/fa6";
import { MdFormatColorText } from 'react-icons/md';
import { useAppStore } from './Store/AppContext';


export default function ToolBarIcons({
  content,
  applyFormat,
  showColorPicker,
  activeIcon,
  handleColorChange,
  isPdfUploaded

}) {
  const {userType} = useAppStore();
  const toolbarButtons = [
    { icon: FaBold, format: 'bold', label: 'Bold' },
    { icon: FaItalic, format: 'italic', label: 'Italic' },
    { icon: FaUnderline, format: 'underline', label: 'Underline' },
    { icon: FaListUl, format: 'list', value: 'bullet', label: 'Bullet List' },
    { icon: FaListOl, format: 'list', value: 'ordered', label: 'Ordered List' },
    { icon: RxTextNone, format: 'removeFormat', label: 'Clear Formatting' },
    { icon: FaFillDrip, format: 'background', label: 'Background Color' },
    { icon: MdFormatColorText, format: 'color', label: 'Text Color' },
    { icon: FaImage, format: 'image', label: 'Insert Image' },
    ...(content && userType == "student"  
      ? [{ icon: FaFilePdf, format: "pdf", label: "Insert PDF" }]
      : []
    )
  ];


const pdfButtons = [
  ...(userType !== "teacher_review"
    ? [
        { icon: TbReplaceFilled, format: "replace_pdf", label: "replace PDF" },
        { icon: DeleteIcon, format: "delete_pdf", label: "delete PDF" }
      ]
    : []
  )
];



  const colorInputRef = useRef(null);

  useEffect(() => {
    if (showColorPicker.visible && colorInputRef.current) {
      colorInputRef.current.click();
    }
  }, [showColorPicker]);

  return (
    <div className="editor__toolbar">
      <div className="toolbar_icons_container">
        {!isPdfUploaded ?
          <>
            {toolbarButtons.map(({ icon: Icon, value, format, label }, i) => (
              <div key={i} className="toolbar_icon_wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  className={`toolbar_icon ${activeIcon === label ? '_active' : ''}`}
                  id={format}
                  onClick={() => applyFormat(format, value, label)}
                  type="button"
                  aria-label={label}
                >
                  <Icon
                    color={showColorPicker.format === format &&
                      showColorPicker.color
                      ? showColorPicker.color
                      : 'initial'
                    }
                  />

                </button>

                {/* Show color picker inline near the icon when active */}
                {showColorPicker.visible && showColorPicker.format === format && (
                  <input
                    ref={colorInputRef}
                    type="color"
                    className="color_picker"
                    onChange={handleColorChange}
                    onBlur={() => handleColorChange("clear")}
                    autoFocus

                  />
                )}
              </div>
            ))}
          </>
          :
          <>
            {pdfButtons.map(({ icon: Icon, format, label }, i) => (
              <button
                key={i}
                onClick={() => applyFormat(format)}
                className={` ${format === "delete_pdf" ? 'toolbar_icon_delete_pdf' : 'toolbar_icon'}`}
                type="button"
                title={label}
              >
                <Icon style={{ fill: format === "delete_pdf" ? "#fff" : "initial" }} />
              </button>
            ))}


          </>
        }
      </div>
    </div>
  );
}