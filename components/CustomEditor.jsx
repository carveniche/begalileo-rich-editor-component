
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';


import React, { useState, useRef, useEffect } from 'react';

import { RxTextNone } from "react-icons/rx";
// import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import {
  FaBold,
  FaFillDrip,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaEraser,
  FaListOl,
  FaImage,
} from 'react-icons/fa';
import { MdFormatColorText } from 'react-icons/md';

function CustomEditor() {
  const [content, setContent] = useState('');
  const [activeIcon, setActiveIcon] = useState(null);
  const [worldCount, setWordCount] = useState(Infinity);
  const [disabllePaste, setDisablePaste] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState({ visible: false, format: null, color: "#000" });
  const quillRef = useRef(null);

 const handleChange = (value) => {
  if (worldCount !== Infinity) {
    if (!quillRef.current) return;

    const editor = quillRef.current.getEditor();
    const text = editor.getText().trim(); // plain text without HTML
    // Count words by splitting on whitespace and filtering empty words
    const tempWordCount = text.split(/\s+/).filter((word) => word.length > 0).length;

 if (tempWordCount >= worldCount) {
      editor.setText(text + " ");
      return;
    } 
  }

  setContent(value);
};

  const applyFormat = (format, value = true, label) => {
    try {
      if (!quillRef.current) return;
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();
      setActiveIcon(label);
      if (!range) return;
      if (format === 'removeFormat') {
        editor.removeFormat(range.index, range.length);
        setShowColorPicker({ visible: false, format: null, color: "#000" });
      } else if (format === 'list') {
        const currentFormat = editor.getFormat(range);
        if (currentFormat.list === value) {
          editor.format('list', false);
        } else {
          editor.format('list', value);
        }
      } else if (format === 'color' || format === 'background') {

        setShowColorPicker({ visible: true, format });
        return;
      } else {
        const currentFormat = editor.getFormat(range);
        editor.format(format, !currentFormat[format]);
      }

      editor.focus();
    } catch (err) {
      console.error("Error applying format:", err);
    }
  };

  const handleColorChange = (e) => {
    try {
      if (e == "clear") {
        setShowColorPicker({ visible: false, format: null, color: "#000" });
        return
      }

      const color = e.target.value;
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();
      if (range) {
        editor.format(showColorPicker.format, color);
      }
      setShowColorPicker({ visible: true, format: showColorPicker.format, color: color });
      editor.focus();
    } catch (err) {
      console.error("Error applying color:", err);
    }
  };

 useEffect(() => {
  // ✅ Get current editor content as Delta JSON
  window.getRichEditorJson = () => {
    try {
      if (!quillRef.current) throw new Error("Editor not ready");

      const editor = quillRef.current.getEditor();
      return editor.getContents(); // Returns Quill Delta JSON
    } catch (err) {
      console.error("Error getting editor JSON:", err);
      return null;
    }
  };

  // ✅ Set JSON content in the editor
  window.setRichEditorJson = (json) => {
    try {
      if (!quillRef.current) throw new Error("Editor not ready");

      const editor = quillRef.current.getEditor();

      // Ensure valid Delta JSON format
      if (!json || typeof json !== "object" || !json.ops) {
        throw new Error("Invalid Quill JSON (must be a Delta object with ops array)");
      }

      editor.setContents(json); // Replace editor content
      editor.focus();
    } catch (err) {
      console.error("Error setting editor JSON:", err);
    }
  };

   window.getRichEditorWordCount = (json) => {
     try {
       if (!quillRef.current) throw new Error("Editor not ready");

       const editor = quillRef.current.getEditor();
       const text = editor.getText().trim(); // plain text without HTML
       // Count words by splitting on whitespace and filtering empty words
       const tempWordCount = text.split(/\s+/).filter((word) => word.length > 0).length;
       return tempWordCount; // Returns word count
     } catch (err) {
       console.error("Error setting editor JSON:", err);
     }
   };

 window.setRichEditorDisablePaste = (istrue) => {setDisablePaste(istrue)}
  return () => {
    delete window.getRichEditorJson;
    delete window.setRichEditorJson;
    delete  window.getRichEditorWordCount;
    delete window.setRichEditorDisablePaste
  };
}, []);


useEffect(() => {
  if (!quillRef.current) return;
  const editor = quillRef.current.getEditor();

  const handleKeydown = (e) => {
    if (disabllePaste && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
      e.preventDefault();
      console.log("Keyboard paste blocked!");
    }
  };

  const handlePaste = (e) => {
    if (disabllePaste) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Paste blocked!");
    }
  };

  const handleDrop = (e) => {
    if (disabllePaste) {
      e.preventDefault();
      console.log("Drop blocked!");
    }
  };

  const handleContextMenu = (e) => {
    if (disabllePaste) {
      // Optional: prevent right-click only for paste
      e.preventDefault();
      console.log("Right-click disabled!");
    }
  };

  editor.root.addEventListener('keydown', handleKeydown);
  editor.root.addEventListener('paste', handlePaste);
  editor.root.addEventListener('drop', handleDrop);
  editor.root.addEventListener('contextmenu', handleContextMenu);

  return () => {
    editor.root.removeEventListener('keydown', handleKeydown);
    editor.root.removeEventListener('paste', handlePaste);
    editor.root.removeEventListener('drop', handleDrop);
    editor.root.removeEventListener('contextmenu', handleContextMenu);
  };
}, [disabllePaste]);





  return (
    <div className="custom__editor__container">
      <div className="editor__container">
        <div className="editor__toolbar">
          <ToolbarIcons
            applyFormat={applyFormat}
            showColorPicker={showColorPicker}
            handleColorChange={handleColorChange}
            activeIcon={activeIcon} />

        </div>
        <ReactQuill
          id='custom_editor'
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={handleChange}
          modules={{ toolbar: false }}
          placeholder="Start typing here..."
          style={{ height: '100%', width: '100%' }}
        />

        {/* <div dangerouslySetInnerHTML={{ __html: testHtml }} /> */}
      </div>
    </div>
  );
}
  
export default CustomEditor;
function ToolbarIcons({
  applyFormat,
  showColorPicker,
  activeIcon,
  handleColorChange,
 
}) {

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
  ];
  console.log(toolbarButtons);
  const colorInputRef = useRef(null);

  useEffect(() => {
    if (showColorPicker.visible && colorInputRef.current) {
      colorInputRef.current.click();
    }
  }, [showColorPicker]);

  return (
    <div className="toolbar_icons_container">
      {toolbarButtons.map(({ icon: Icon, value, format, label }, i) => (
        <div key={i} className="toolbar_icon_wrapper" style={{ position: 'relative', display: 'inline-block' }}>
          <button
            className={`toolbar_icon ${activeIcon === label ? '_active' : ''}`}
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
    </div>
  );
}
