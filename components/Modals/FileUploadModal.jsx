import React, { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../Store/AppContext.jsx'
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import style from './WriteOrUploadModal.module.css'
import ArrowBack from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import Zoom from '@mui/material/Zoom';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UploadSvg from './UploadSvg';
export default function FileUploadModal() {
    const { isUploadFile, setIsUploadFile } = useAppStore();

    const fileInputRef = useRef(null);
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false); // for highlighting drop zone
    const [previewUrl, setPreviewUrl] = useState(null);

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    const handleUpload = () => {
        fileInputRef.current?.click();
    }
    const validateAndUpload = (file) => {
        setError('');
        if (!file) return;

        const isPdfMime = file.type === 'application/pdf';
        const isPdfExt = file.name?.toLowerCase().endsWith('.pdf');

        if (!isPdfMime && !isPdfExt) {
            setError('Only PDF files are allowed.');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError(`File is too large. Max ${MAX_FILE_SIZE / (1024 * 1024)} MB allowed.`);
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setSelectedFile(file);
            setLoading(false);
        }, 800); // simulate upload
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        validateAndUpload(file);
        e.target.value = '';
    }

    // Drag & Drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    }

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    }

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        validateAndUpload(file);
    }
    const [showPreview, setShowPreview] = useState(false);
    function previewFile(file) {
        setShowPreview(true);

    }
    function handleClose() {
        setIsUploadFile(false);
        setShowPreview(false);
        setError('');
    }

    useEffect(() => {
        if (selectedFile) {
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [selectedFile]);


    return (
        <>
            <Dialog open={isUploadFile}
                onClose={handleClose}
                // when previewing, disable MUI’s built-in maxWidth limit and make it full width
                {...(showPreview ? { maxWidth: false, fullWidth: true } : {})}
            >
                <Box>
                    <Zoom in={showPreview && selectedFile} mountOnEnter unmountOnExit>
                        <div className={style.preview_container}>
                            <div className={style.preview_header}>
                                <IconButton onClick={() => setShowPreview(false)}>
                                    <ArrowBack />
                                </IconButton>
                                <h3 className="header_title_m">File Preview</h3>
                                {selectedFile && <p className={style.preview_filename}>{selectedFile.name}</p>}
                            </div>

                            <iframe
                                src={previewUrl}
                                title="File Preview"
                                width="100%"
                                height="600px"
                                style={{ border: 'none', borderRadius: '8px' }}
                            />
                        </div>
                    </Zoom>
                </Box>

                <Box>
                    <Zoom in={!showPreview} mountOnEnter unmountOnExit>
                        <div className={style.container}>
                            <div
                                className={`${style.dropzone} ${(dragOver || selectedFile) ? style.dragOver : ''}`}
                                onClick={handleUpload}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >

                                    <UploadSvg/>


                                {loading ? (
                                    <p>Uploading... ⏳</p> // <-- loader message
                                ) : selectedFile ? (
                                    <p className='white'>{selectedFile.name}</p>
                                ) : (
                                    <p>Drag & drop Pdf</p>
                                )}

                            </div>

                            <input
                                id="file"
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="application/pdf,.pdf"
                                style={{ display: 'none' }}
                            />

                            <div className={style.file_upload_container}>

                                {selectedFile && (
                                    <div className={style.file_info}>
                                        <button onClick={() => previewFile(selectedFile)} className={style.previewBtn}>
                                            <VisibilityIcon style={{ fill: '#fff' }} />
                                            Preview</button>
                                        <button onClick={() => setSelectedFile(null)} className={style.removeBtn}>
                                            <DeleteIcon style={{ fill: '#fff' }} />
                                            Remove</button>
                                    </div>
                                )}

                                {error && <p style={{ color: 'red' }}>{error}</p>}
                            </div>
                        </div>
                    </Zoom>

                </Box>
            </Dialog>
        </>
    )
}

