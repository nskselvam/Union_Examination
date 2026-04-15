import React, { useState, useEffect, useMemo, useCallback } from 'react'
import axios from 'axios'
import axiosInstance from '../../utils/axiosInstance'
import * as PDFJS from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import './AnswerKeyShow.css'
import '../../style/design/val_left.css'

import { useSelector } from 'react-redux'
import { BASE_URL } from '../../constraint/constraint'
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { LuZoomIn, LuZoomOut } from "react-icons/lu";
import { GrPowerReset } from "react-icons/gr";



const AnswerKeyShow = ({ pdfType = 'answer-key', subcode }) => {

  const userInfo = useSelector((state) => state?.auth.userInfo)
const monthyearInfo = useSelector((state) => state.auth.monthyearInfo);

  console.log(userInfo)

  const [pdfUrl, setPdfUrl] = useState(null)
  const [pdfDoc, setPdfDoc] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [workerReady, setWorkerReady] = useState(false)

  const activeRecords = useMemo(() => 
    Array.isArray(monthyearInfo) ? monthyearInfo.filter((m) => m.Month_Year_Status === 'Y') : [],
    [monthyearInfo]
  );
  const ExamMonth = useMemo(() => 
    [...new Set(activeRecords.map((m) => m.Eva_Month))].map((m) => ({ id: m, name: m })),
    [activeRecords]
  );
  const ExamYear = useMemo(() => 
    [...new Set(activeRecords.map((m) => m.Eva_Year))].map((y) => ({ id: y, name: y })),
    [activeRecords]
  );


  // Setup PDF worker once on mount
  useEffect(() => {
    // Set worker source using Vite's URL import
    // This ensures the worker is bundled correctly with proper MIME type
    PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker
    setWorkerReady(true)
  }, [])

  // Fetch PDF from backend (only after worker is ready)
  useEffect(() => {
    const fetchPdf = async () => {
      if (!workerReady) return

      try {
        setLoading(true)

        // Extract the first values from comma-separated strings
        const department = userInfo?.selected_course?.split(',')[0] || '01'
        const subcodeValue = subcode || userInfo?.subcode?.split(',')[0]
        const eva_month_year = `${ExamMonth[0]?.name}_${ExamYear[0]?.name}` || 'Nov_2025'

        if (!subcodeValue) {
          throw new Error('Subcode is required')
        }

        console.log('Fetching PDF with params:', { eva_month_year, department, subcode: subcodeValue, pdfType })
        
        const response = await axiosInstance.get(`/api/common/pdf/${pdfType}`, {
          params: {
            eva_month_year,
            department,
            subcode: subcodeValue
          },
          responseType: 'blob'
        })
        
        console.log('PDF Response:', response.data.size, 'bytes', response.data.type)
        
        if (response.data.size === 0) {
          throw new Error('PDF file is empty')
        }
        
        if (response.data.type !== 'application/pdf') {
          console.warn('Response type:', response.data.type, '- Expected: application/pdf')
        }
        
        const url = URL.createObjectURL(response.data)
        setPdfUrl(url)
        
        console.log('PDF URL created:', url)

        // Load PDF with pdfjs
        const pdf = await PDFJS.getDocument(url).promise
        setPdfDoc(pdf)
        setTotalPages(pdf.numPages)
        setCurrentPage(1)
        
        console.log('PDF loaded successfully:', pdf.numPages, 'pages')
      } catch (err) {
        console.error('PDF Loading Error:', err)
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        })
        setError('Failed to load PDF: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPdf()

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [pdfType, workerReady, subcode, userInfo, ExamMonth, ExamYear])

  const renderPage = async (pageNum) => {
    if (!pdfDoc) return

    const page = await pdfDoc.getPage(pageNum)
    const canvas = document.getElementById('pdf-canvas')
    
    if (!canvas) {
      console.warn('Canvas element not found')
      return
    }
    
    const context = canvas.getContext('2d')

    const scale = zoom / 100
    const viewport = page.getViewport({ scale })
    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({
      canvasContext: context,
      viewport
    }).promise
  }

  // Re-render when page or zoom changes
  // Note: Commented out because we're using <object> tag instead of canvas
  // useEffect(() => {
  //   if (pdfDoc && currentPage) {
  //     renderPage(currentPage)
  //   }
  // }, [pdfDoc, currentPage, zoom])

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 25, 300))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 25, 50))
  }

  const handleZoomReset = () => {
    setZoom(100)
  }

  const [height] = useState(window.innerHeight);

  return (
    <div className="pdf-viewer-container">
      <div className="pdf-display-area">
        {loading && (
          <div className="pdf-loading">
            <p>Loading PDF...</p>
          </div>
        )}

        {error && (
          <div className="pdf-error">
            <p>❌ {error}</p>
          </div>
        )}

        {!loading && !error && pdfUrl && (
          <object 
            className="pdf"
            data={pdfUrl}
            width="100%"
            style={{ height: `${height - 223}px`, display: 'block', border: 'none' }}
            type="application/pdf"
          >
            <p>Unable to display PDF. <a href={pdfUrl} target="_blank" rel="noopener noreferrer">Click here to download</a></p>
          </object>
        )}
      </div>
    </div>
  )
}

export default AnswerKeyShow
