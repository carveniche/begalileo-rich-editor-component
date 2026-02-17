
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useState, useRef, useEffect } from 'react';
import ToolBarIcons from './ToolBarIcons';
import ImageResize from 'quill-image-resize-module-react';
import BlotFormatter from 'quill-blot-formatter';
import ImageUploader from "quill-image-uploader";
import WriteOrUploadModal from './Modals/WriteOrUploadModal';
import './Style/common.css'
import ConfirmDialog from './Modals/ConfirmDialog';
import PdfViewer from '../lib/PdfViewer';
import { useAppStore } from './Store/AppContext';
import { Alert } from '@mui/material';
import ErrorPopup from './Modals/ErrorPopup';
Quill.register('modules/imageResize', ImageResize);
Quill.register('modules/blotFormatter', BlotFormatter);
Quill.register("modules/imageUploader", ImageUploader);

export default function EditorWithMathQuill() {
  const [content, setContent] = useState('');
  const [activeIcon, setActiveIcon] = useState(null);
  const [worldCount, setWordCount] = useState(Infinity);
  const [disabllePaste, setDisablePaste] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState({ visible: false, format: null, color: "#000" });
  const quillRef = useRef(null);
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const [isPdfUploaded, setIsPdfUploaded] = useState(false);
  const [isShowMsg, setIsShowMsg] = useState(false);
  const [pdfFile, setPdfFile] = useState('');
  const { userType } = useAppStore();
  const handleChange = (value) => {
    const editor = quillRef.current.getEditor();
    const text = editor.getText().trim(); // plain text without HTML
    // Count words by splitting on whitespace and filtering empty words
    const tempWordCount = text.split(/\s+/).filter((word) => word.length > 0).length;
    const html = editor.root.innerHTML;

    // Detect non-text content: <img>, <div class="ql-pdf-embed">
    const hasEmbed =
      html.includes("ql-pdf-embed") ||
      html.includes("<img");

    if (worldCount !== Infinity) {
      if (!quillRef.current) return;
      if (tempWordCount >= worldCount) {
        editor.setText(text + " ");
        return;
      }
    }
    if (tempWordCount == 0 && !hasEmbed) {
      setContent('');
      return;
    }
    setContent(value);
  };


  const applyFormat = (format, value = true, label) => {
    try {

      if (format === "pdf" || format === "replace_pdf") {
        if (format === "pdf" && content) {
          setIsShowMsg(true);
          return
        }
        pdfInputRef.current?.click();
        return;
      } else if (format === "delete_pdf") {

        deletePdf();
        return;
      }

      if (!quillRef.current) return;
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();
      setActiveIcon(label);
      if (!range) editor?.focus();

      if (format === 'removeFormat') {
        if (!range) return;
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
      } else if (format === 'image') {
        fileInputRef?.current?.click();
        return;

      }
      else {
        if (!range) return;
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
        if (!quillRef.current) {
          console.warn("Editor not ready");
          return null
        }

        const editor = quillRef.current.getEditor();
        return editor.getContents(); // Returns Quill Delta JSON
      } catch (err) {
        console.warn("Error getting editor JSON:", err);
        return null;
      }
    };

    // ✅ Set JSON content in the editor
    window.setRichEditorJson = (json, type = "") => {
      try {
        if (type === "pdf") {
          loadPdfFromUrl(json);
          return;
        }

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
        if (!quillRef.current) return 0;

        const editor = quillRef.current.getEditor();
        const text = editor.getText().trim(); // plain text without HTML
        // Count words by splitting on whitespace and filtering empty words
        const tempWordCount = text.split(/\s+/).filter((word) => word.length > 0).length;
        return tempWordCount; // Returns word count
      } catch (err) {
        console.error("Error setting editor JSON:", err);
      }
    };

    // Insert plain text at the current cursor position
    window.insertRichEditorText = (text) => {
      try {
        if (!quillRef.current) throw new Error('Editor not ready');
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection(true) || { index: editor.getLength(), length: 0 };
        editor.insertText(range.index, text);
        editor.setSelection(range.index + text.length, 0);
        editor.focus();
      } catch (err) { console.error('insertRichEditorText error', err); }
    };


    window.setRichEditorDisablePaste = (istrue) => { setDisablePaste(istrue) }
    return () => {
      delete window.getRichEditorJson;
      delete window.setRichEditorJson;
      delete window.getRichEditorWordCount;
      delete window.setRichEditorDisablePaste;
      delete window.insertRichEditorText;
      delete window.insertRichEditorPdf;
    };
  }, []);


  //   async function loadPdfFromUrl(url) {
  //   const response = await fetch(url);
  //   const buffer = await response.arrayBuffer();
  //   const uint8 = new Uint8Array(buffer);

  //   setPdfFile({ data: uint8 });
  //   setIsPdfUploaded(true);
  //   setContent(null);
  // }
  async function loadPdfFromUrl(url) {
    try {
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();

      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      setPdfFile(base64); // PdfViewer must support base64
      setIsPdfUploaded(true);
      setContent(null);

    } catch (err) {
      console.error("loadPdfFromUrl error:", err);
    }
  }



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

  // 1️⃣ Upload file and get server URL
  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file || !quillRef.current) return;

    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true) || { index: 0 };

    const fileName = file.name
      .replace(/\s+/g, "-")
      .replace(/\.[^/.]+$/, "")
      .toLowerCase();
    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", fileName);
    try {

      if (typeof window.imageUpload !== "function") throw new Error("imageUpload API not found");
      const data = await window.imageUpload(formData); // Your custom API
      if (data.status) {
        insertImageIntoEditor(data.url, range.index);
      } else {
        console.error("Upload failed:", data);
      }
    } catch (err) {
      console.error("Error uploading image:", err);
    }
  }



  function insertImageIntoEditor(url, index) {
    if (!url || !quillRef.current) return;

    const editor = quillRef.current.getEditor();
    // Get all image blots
    const imageBlots = editor.scroll.descendants(blot => blot.statics.blotName === 'image');

    if (imageBlots.length > 0) {
      const firstImage = imageBlots[0];

      if (firstImage?.domNode) {
        firstImage.domNode.setAttribute("src", url);

        // Safely get index
        const blotIndex = editor.getIndex(firstImage);
        if (blotIndex != null) {
          editor.setSelection(blotIndex + 1, 0);
        } else {
          editor.setSelection(editor.getLength(), 0); // fallback to end
        }
      }
    } else {
      // Insert new image at the cursor
      const cursorIndex = index != null ? index : editor.getSelection()?.index ?? editor.getLength();
      editor.insertEmbed(cursorIndex, "image", url);
      editor.insertText(cursorIndex + 1, "\n");
      editor.setSelection(cursorIndex + 2, 0);
    }
  }
  const [pdfViewerKey, setPdfViewerKey] = useState(0); // To force re-render PdfViewer
  const [isErrorMsg, setIsErrorMsg] = useState({type:false,msg:''})
  

  function handlePdfUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB in bytes

    // Validate type
    if (file.type !== "application/pdf") {
      setIsErrorMsg({type:true,msg:'Only PDF files are allowed.'});
      event.target.value = ""; // reset input
      return;
    }

    // Validate size
    if (file.size > maxSize) {
     setIsErrorMsg({type:true,msg:'PDF files size should be below 5MB.'});
      event.target.value = ""; // reset input
      return;
    }
    const reader = new FileReader();

    reader.onload = (e) => {
      const base64Pdf = e.target.result;

      setContent(null);
      setPdfFile(base64Pdf);
      setIsPdfUploaded(true);
      setPdfViewerKey(prev => prev + 1);

      // ✅ allow re-selecting same file
      event.target.value = "";
    };

    reader.readAsDataURL(file);
  }


  // function handlePdfUpload(event) {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   const reader = new FileReader();

  //   reader.onload = (e) => {
  //     const base64 = e.target.result;

  //     // Convert to Uint8Array for react-pdf
  //     const raw = atob(base64.split(",")[1]);
  //     const uint8 = new Uint8Array(raw.length);
  //     for (let i = 0; i < raw.length; i++) uint8[i] = raw.charCodeAt(i);

  //     setPdfFile({ data: uint8 });   // <-- THIS FIXES PRODUCTION ERROR
  //     setIsPdfUploaded(true);
  //     setContent(null);
  //   };

  //   reader.readAsDataURL(file);
  // }








  useEffect(() => {
    if (!quillRef.current) return;

    const editor = quillRef.current.getEditor();
    const delta = editor.getContents();

    const pdfExists = delta.ops.some(op =>
      op.insert &&
      typeof op.insert === "object" &&
      op.insert.pdf
    );

    setIsPdfUploaded(pdfExists);

  }, [content]);


  function deletePdf() {

    setIsPdfUploaded(false);
    setPdfFile(null);
  }


  function RemoveText() {
    pdfInputRef.current?.click();
    setIsShowMsg(false);
  }

  function handleKeyDown(e) {
    if (isPdfUploaded) {
      e.preventDefault();
      return false;
    }
  }
  return (
    <div className="custom__editor__container">
      <div className={`editor__container ${isPdfUploaded ? "pdf__actived" : ""}`}>

        <ErrorPopup open={isErrorMsg?.type} onClose={setIsErrorMsg} message={isErrorMsg?.msg} />
        

        <ConfirmDialog
          open={isShowMsg}
          title="Replace Your Text?"
          message="Oh! Uploading a PDF will remove your current text. Continue?."
          onClose={() => setIsShowMsg(false)}
          onConfirm={RemoveText}
        />

        {!content && !pdfFile && userType == "student" &&
          <>
            <WriteOrUploadModal handlePdfUpload={applyFormat} />
          </>
        }
        
        <input type='file' ref={fileInputRef} accept='image/*' style={{ display: 'none', opacity: 0 }} onChange={(e) => handleFileUpload(e)} />
        <input
          type="file"
          accept="application/pdf"
          ref={pdfInputRef}
          style={{ display: "none" }}
          onChange={handlePdfUpload}
        />
        <ToolBarIcons
          content={content}
          isPdfUploaded={isPdfUploaded}
          applyFormat={applyFormat}
          showColorPicker={showColorPicker}
          handleColorChange={handleColorChange}
          activeIcon={activeIcon} />


        {
          pdfFile ?
            <PdfViewer pdf={pdfFile} key={pdfViewerKey} />
            :
            <ReactQuill
              id='custom_editor'
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              modules={{
                blotFormatter: {},
                imageResize: {
                  parchment: Quill.import('parchment'),
                  modules: ['Resize', 'DisplaySize'],
                  minWidth: 150,
                  minHeight: 150
                },
                toolbar: false,
              }}
              // className={`${isPdfUploaded ? "pdf__locked" : ""}`}
              placeholder="Start typing here..."
              style={{ height: '100%', width: '100%' }}
            />
        }
      </div>
    </div>
  );
}



