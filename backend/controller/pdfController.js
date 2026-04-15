const express = require("express");
const asyncHandler = require("express-async-handler");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const db = require("../db/models");
const { getCurrentISTDateTimeForPDF } = require("../utils/formatDateTime");

const pdfValuationGenearate = asyncHandler(async (req, res) => {
    console.log("=== PDF Generation Request ===");
    console.log("Request Body:", JSON.stringify(req.body, null, 2));

    const { papers, evaluatorId, evaluatorName, checkDate } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
        res.status(400);
        throw new Error("Request body is empty");
    }

    if (!papers || !Array.isArray(papers) || papers.length === 0) {
        res.status(400);
        throw new Error("No papers data provided");
    }

    // Create a new PDF document - portrait orientation
    const doc = new PDFDocument({
        margin: 20,
        size: 'A4',
        layout: 'portrait'
    });

   // const DateTime= getCurrentISTDateTime()
    // Set response headers
    const firstPaper = papers[0];
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=valuation_${firstPaper.subjectCode}_${Date.now()}.pdf`);

    // Pipe the PDF to the response
    doc.pipe(res);

        
    // Helper function to draw page footer (saves and restores Y position)
    const drawPageFooter = () => {
        const savedY = doc.y;
        const footerY = doc.page.height - 10; // Bottom of page with minimal margin
        doc.fontSize(8).font('Helvetica').fillColor('#000000');
        doc.text(`Date: ${getCurrentISTDateTimeForPDF()}`, 20, footerY, { lineBreak: false });
        doc.text('Examiner Signature: ____________________', 350, footerY, { lineBreak: false });
        doc.y = savedY; // Restore Y position
    };

    // Helper function to draw page header
    const drawPageHeader = (pageNum) => {
        doc.y = 20;
        // Page number at top right
        doc.fontSize(8).font('Helvetica').fillColor('#000000');
        doc.text(`Page ${pageNum}`, 20, 20, { align: 'right', width: 555, lineBreak: false });
        doc.y = 35;
        doc.fontSize(10).font('Helvetica-Bold').text('SRM Technology University', { align: 'center' });
        doc.fontSize(8).font('Helvetica').text('Valuation Report', { align: 'center' });
        doc.fontSize(7).font('Helvetica').text(`Examiner: ${evaluatorName || 'N/A'} (${evaluatorId || 'N/A'}) | Date: ${checkDate || 'N/A'}`, { align: 'center' });
        doc.moveDown(0.3);
    };

    // Constants for grid layout
    const columns = 16;
    const colWidth = 35;
    const headerHeight = 12;
    const marksHeight = 14;
    const rowGap = 3;
    const dummyHeaderHeight = 10;
    const separatorHeight = 2;
    const paperSpacing = 5;
    const footerMargin = 25; // Minimal margin for footer

    // Helper function to calculate paper height based on questions
    const calculatePaperHeight = (paper) => {
        const questions = paper.questions || [];
        const rowsNeeded = Math.ceil(questions.length / columns);
        const gridHeight = rowsNeeded * (headerHeight + marksHeight + rowGap);
        return dummyHeaderHeight + gridHeight + separatorHeight + paperSpacing;
    };

    let currentPage = 1;

    // Draw initial header
    drawPageHeader(currentPage);
    drawPageFooter();

    // Process each paper
    papers.forEach((paper, paperIndex) => {
        // Calculate actual height needed for this paper
        const paperHeight = calculatePaperHeight(paper);
        const availableSpace = doc.page.height - doc.y - footerMargin;

        // Check if we need a new page based on actual space needed
        if (availableSpace < paperHeight) {
            doc.addPage();
            currentPage++;
            drawPageHeader(currentPage);
            drawPageFooter();
        }

        // Paper Information - Compact header
        // Add spacing before dummy number (except for first paper on page)
        const isFirstOnPage = (doc.y < 100); // Check if we're near top of page
        if (!isFirstOnPage) {
            doc.y += paperSpacing;
        }
        const dummyY = doc.y;
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#000000');
        doc.text(`Dummy: ${paper.dummyNumber} | ${paper.subjectCode} - ${  paper.subjectName.toString().substring(0, 65)
        }`, 20, dummyY, { lineBreak: false });
        doc.text(`Total: ${paper.total} | Round: ${paper.tot_round}`, 430, dummyY, { width: 140, align: 'right', lineBreak: false });
        doc.y = dummyY + dummyHeaderHeight;

        // Questions Grid
        const questions = paper.questions || [];
        const rowsNeeded = Math.ceil(questions.length / columns);

        const startX = 15;
        const finalGridStartY = doc.y;

        // Draw questions row by row
        for (let row = 0; row < rowsNeeded; row++) {
            const rowStartY = finalGridStartY + (row * (headerHeight + marksHeight + rowGap));

            for (let col = 0; col < columns; col++) {
                const qIndex = row * columns + col;
                if (qIndex >= questions.length) break;

                const question = questions[qIndex];
                const xPos = startX + (col * colWidth);
                let yPos = rowStartY;

                // Question number box (top)
                doc.rect(xPos, yPos, colWidth, headerHeight).stroke();
                doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#000000');
                doc.text(`Q(${question.questionNumber})`, xPos + 1, yPos + 3, {
                    width: colWidth - 2,
                    align: 'center',
                    lineBreak: false
                });

                // Marks box (bottom)
                yPos += headerHeight;
                doc.rect(xPos, yPos, colWidth, marksHeight).stroke();

                // Different styling for valid vs extra questions
                if (question.valid_qbs === 'Y') {
                    doc.fontSize(7).font('Helvetica-Bold').fillColor('#155724');
                    doc.text(`${question.marks}`, xPos + 1, yPos + 4, {
                        width: colWidth - 2,
                        align: 'center',
                        lineBreak: false
                    });
                } else  if (question.valid_qbs === 'N' && question.marks === 'NA') {
                    doc.fontSize(6).font('Helvetica-Bold').fillColor('#e74c3c');
                    doc.text(`${question.marks}`, xPos + 1, yPos + 4, {
                        width: colWidth - 2,
                        align: 'center',
                        lineBreak: false
                    });
                }else {
                    doc.fontSize(6).font('Helvetica-Bold').fillColor('#e74c3c');
                    doc.text(`${question.marks}(EX)`, xPos + 1, yPos + 4, {
                        width: colWidth - 2,
                        align: 'center',
                        lineBreak: false
                    });
                doc.fillColor('#000000');
            }
        }


        }

        // Calculate total grid height
        const totalGridHeight = rowsNeeded * (headerHeight + marksHeight + rowGap);

        // Move cursor after grid
        doc.y = finalGridStartY + totalGridHeight;

        // Draw separator line
        doc.moveTo(15, doc.y).lineTo(570, doc.y).stroke();
        doc.y += separatorHeight;
    });

    // Finalize the PDF
    doc.end();
});


module.exports = {
    pdfValuationGenearate
};