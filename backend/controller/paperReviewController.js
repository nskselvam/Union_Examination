const asyncHandler = require("express-async-handler");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const db = require("../db/models");
const { Sequelize, Op } = require("sequelize");
const { getClientIP } = require("../utils/formatDateTime");

const paperReview = asyncHandler(async (req, res) => {
  const { Dep_Name} = req.query;

  const paperReviewData = await db.student_result_data.findAll({
    where: {
      Dep_Name: Dep_Name,
    },
    attributes: ['RegisterNo', 'Dummy_NO', 'SubjectCode','Evaluator_Id','Dep_Name','Eva_Mon_Year','Valuation_Type','Import_Date','FACULTY_NAME'],
  });


  if (paperReviewData) {
    const importDates = [...new Set(paperReviewData.map(item => item.Import_Date))];
    res.status(200).json({ paperReviewData ,
        importDates });
  } else {
    res.status(404).json({ message: "No data found for the specified department" });
  }
});

const paperReviewDownload = asyncHandler(async (req, res) => {
    const { Dummy_NO, SubjectCode, Valuation_Type, Eva_Mon_Year, Dep_Name,FACULTY_NAME,username } = req.body;

    const clientIP = getClientIP(req);

    if (!Dummy_NO || !SubjectCode || !Valuation_Type || !Eva_Mon_Year) {
        return res.status(400).json({ message: "Missing required fields: Dummy_NO, SubjectCode, Valuation_Type, Eva_Mon_Year" });
    }

    const valNum = parseInt(Valuation_Type);
    if (isNaN(valNum) || valNum < 1 || valNum > 20) {
        return res.status(400).json({ message: "Invalid Valuation_Type" });
    }

    const importModelName = `import${valNum}`;
    //const valDataModelName = `val_data_${String(valNum).padStart(2, '0')}`;
    const valDataModelName = `val_data_${Dep_Name}`;

    if (!db[importModelName] || !db[valDataModelName]) {
        return res.status(400).json({ message: `Model not found for Valuation_Type: ${valNum}` });
    }

    // 1. Main evaluation row from import table
    const importRows = await db[importModelName].findAll({ where: { barcode: Dummy_NO } });
    if (!importRows || importRows.length === 0) {
        return res.status(404).json({ message: "No evaluation data found for the given Dummy_NO" });
    }
    const mainRow = importRows[0];

    // 2. Evaluator name
    // const evaluatorRec = await db.faculty_reg.findOne({ where: { Eva_Id: mainRow.Evaluator_Id } });
    // const evaluatorName = evaluatorRec?.FACULTY_NAME || '';
        
    // 3. Subject name
    const subjectRec = await db.sub_master.findOne({ where: { Subcode: SubjectCode } });
    const subjectName = subjectRec?.SUBNAME || '';

    // 4. Student register number
    const studentRec = await db.student_result_data.findOne({ where: { Dummy_NO } });
    const registerNo = studentRec?.RegisterNo || '';

    // 5. Per-question marks ordered by qbno, section, sub_section, add_sub_section
    const valDataRows = await db[valDataModelName].findAll({
        where: { barcode: Dummy_NO, Eva_Mon_Year },
        order: [['qbno', 'ASC'], ['section', 'ASC'], ['sub_section', 'ASC'], ['add_sub_section', 'ASC']],
    });

    // Build question display data
    const questions = valDataRows.map((row) => {
        let questionLabel = `${row.qbno}-${row.section}`;
        if (row.sub_section) questionLabel += `-${row.sub_section}`;
        if (row.add_sub_section) questionLabel += `(${row.add_sub_section})`;

        let marksLabel;
        if (row.valid_qbs === 'Y') {
            marksLabel = String(row.Marks_Get);
        } else if (row.valid_qbs === 'N' && !isNaN(Number(row.Marks_Get))) {
            marksLabel = Number(row.Marks_Get) !== 0 ? `${row.Marks_Get}(Ex)` : String(row.Marks_Get);
        } else {
            marksLabel = String(row.Marks_Get);
        }

        return { questionLabel, marksLabel, valid_qbs: row.valid_qbs };
    });

    // 6. Collect image paths (uploads/{Eva_Mon_Year}/ImgImp/{Dep_Name}/{Dummy_NO}/)
    const imgDir = path.join(__dirname, '..', 'uploads', Eva_Mon_Year, 'ImgImp', mainRow.Dep_Name || Dep_Name || '', Dummy_NO);

    let imgFiles = [];
    for (let i = 1; i <= mainRow.ImgCnt; i++) {
        const imgPath = path.join(imgDir, Dummy_NO + '_' + String(i).padStart(2, '0') +  "_" + SubjectCode + '.jpg');
        if (fs.existsSync(imgPath)) {
            imgFiles.push(imgPath);
        } else {
            console.warn(`Image not found: ${imgPath}`);
        }
     }

    // if (fs.existsSync(imgDir)) {
    //     imgFiles = fs.readdirSync(imgDir)
    //         .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
    //         .sort()
    //         .map((f) => path.join(imgDir, f));
    // }

    // ── PDF Generation ────────────────────────────────────────────────────────
    const doc = new PDFDocument({ margin: 20, size: 'A4', layout: 'portrait', autoFirstPage: false });

    const filename = `${registerNo}_${SubjectCode}_${mainRow.Evaluator_Id}_${Dummy_NO}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    const PAGE_W = 595.28;
    const PAGE_H = 841.89;
    const ML = 20;          // left margin
    const MR = 20;          // right margin
    const CONTENT_W = PAGE_W - ML - MR;

    // Header row heights
    const HDR_TITLE_H   = 14;
    const HDR_SUBTITLE_H = 13;
    const HDR_META_H    = 10;
    const HDR_TOTAL_H   = HDR_TITLE_H + HDR_SUBTITLE_H + (HDR_META_H * 3) + 8; // ~65pt

    // Grid cell sizes
    const COL_COUNT  = 10;
    const CELL_W     = CONTENT_W / COL_COUNT;
    const CELL_QH    = 14;   // question label row height
    const CELL_MH    = 16;   // marks row height
    const CELL_H     = CELL_QH + CELL_MH;
    const PAPER_HDR  = 26;   // dummy-number header height
    const FOOTER_H   = 100;  // reserved height for acceptance / signature section

    // ── Draw page header (called on each new page) ───────────────────────────
    const drawPageHeader = () => {
        let y = 15;

        // Optional SRM logo
        const logoPath = path.join(__dirname, '..', 'uploads', 'template', 'srm.png');
        if (fs.existsSync(logoPath)) {
            try { doc.image(logoPath, ML + 10, y - 2, { width: 35 }); } catch (_) {}
        }

        doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000')
            .text('SRM INSTITUTE OF SCIENCE AND TECHNOLOGY', ML, y, { align: 'center', width: CONTENT_W, lineBreak: false });
        y += HDR_TITLE_H;

        
        doc.fontSize(8.5)
            .text('Paper Review Report', ML, y, { align: 'center', width: CONTENT_W, lineBreak: false });
        y += HDR_SUBTITLE_H;

        if(FACULTY_NAME){
        doc.fontSize(7.5)
            .text(`Evaluator Id : ${mainRow.Evaluator_Id} - ${ FACULTY_NAME}`, ML, y, { lineBreak: false });
        y += HDR_META_H;
        }else{
        doc.fontSize(7.5)
            .text(`Evaluator Id : ${mainRow.Evaluator_Id}`, ML, y, { lineBreak: false });
        y += HDR_META_H;
        }

        doc.text(`Subject Code with Name : ${SubjectCode} - ${subjectName}`, ML, y, { lineBreak: false });
        y += HDR_META_H;
        
        if(FACULTY_NAME){
        doc.text(`Student Register No : ${registerNo}`, ML, y, { lineBreak: false });
        y += HDR_META_H + 3;
        }else{
        // doc.text(`Student Register No : ${registerNo}`, ML, y, { lineBreak: false });
        // y += HDR_META_H + 3;
        }

        // separator line
        // doc.moveTo(ML, y).lineTo(PAGE_W - MR, y).strokeColor('#000000').lineWidth(0.5).stroke();
        return y + 5;
    };

    // ── Page 1 — evaluation grid ─────────────────────────────────────────────
    doc.addPage();
    let curY = drawPageHeader();

    const total      = parseFloat(mainRow.total) || 0;
    const totalRound = mainRow.tot_round !== null ? mainRow.tot_round : Math.round(total);

    const rowsNeeded  = Math.ceil(questions.length / COL_COUNT) || 1;
    const blockH      = PAPER_HDR + (rowsNeeded * CELL_H) + 4;

    // New page if block + footer won't fit
    if (curY + blockH + FOOTER_H > PAGE_H - 20) {
        doc.addPage();
        curY = drawPageHeader();
    }

    // Dummy-number header row
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#000000')
        .text(
            `Dummy No : ${Dummy_NO}     Total Marks : ${total}     Total Marks - Round Off : ${totalRound}`,
            ML, curY + 8, { width: CONTENT_W, align: 'center', lineBreak: false }
        );

    // Outer border for the entire block
    const blockStartY = curY;
    doc.rect(ML, blockStartY, CONTENT_W, blockH).lineWidth(0.5).stroke();
    curY += PAPER_HDR;

    // Draw question cells
    for (let r = 0; r < rowsNeeded; r++) {
        const rowY = curY + r * CELL_H;
        for (let c = 0; c < COL_COUNT; c++) {
            const qIdx = r * COL_COUNT + c;
            if (qIdx >= questions.length) break;

            const q    = questions[qIdx];
            const cellX = ML + c * CELL_W;

            // Question label cell (top)
            doc.rect(cellX, rowY, CELL_W, CELL_QH).lineWidth(0.3).stroke();
            doc.font('Helvetica-Bold').fontSize(8).fillColor('#000000')
                .text(q.questionLabel, cellX + 1, rowY + 3, { width: CELL_W - 2, align: 'center', lineBreak: false });

            // Marks cell (bottom)
            doc.rect(cellX, rowY + CELL_QH, CELL_W, CELL_MH).lineWidth(0.3).stroke();
            const markColor = q.valid_qbs === 'Y' ? '#155724' : '#c0392b';
            doc.font('Helvetica-Bold').fontSize(10).fillColor(markColor)
                .text(q.marksLabel, cellX + 1, rowY + CELL_QH + 3, { width: CELL_W - 2, align: 'center', lineBreak: false });
        }
    }

    curY += rowsNeeded * CELL_H + 12;

    // ── Acceptance / signature section ────────────────────────────────────────
    // Move to a safe Y (push to bottom third if needed)
    if(FACULTY_NAME){
    if (curY + FOOTER_H > PAGE_H - 20) {
        doc.addPage();
        curY = drawPageHeader();
    }

    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(7.5);
    doc.text(
        'I have reviewed my answer paper in the presence of evaluator and the marks awarded by them.',
        ML, curY, { width: CONTENT_W }
    );
    curY += 13;
    doc.text('I ACCEPT  /  I have NOT ACCEPTED the marks awarded.', ML, curY, { width: CONTENT_W });
    curY += 18;

    // Remarks box
    doc.text('Remarks if any :', ML, curY);
    curY += 8;
    doc.rect(ML, curY, CONTENT_W, 28).lineWidth(0.5).stroke();
    curY += 75;

    // Signatures row
    doc.text('Signature of the Student :', ML, curY);
    doc.text('Signature of the Evaluator / Reviewer', ML + 300, curY);
    curY += 12;
    doc.text('Date :', ML, curY);
    }
    // ── Page footer date (bottom-right) on current page ──────────────────────
    const tDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    doc.font('Helvetica').fontSize(7).fillColor('#000000')
        .text(`Date : ${tDate}     User : ${username || ''}     IP : ${clientIP}`, ML, 810, { align: 'right', width: CONTENT_W, lineBreak: false });

    // ── Answer-sheet image pages ──────────────────────────────────────────────
    for (const imgPath of imgFiles) {
        doc.addPage();
        try {
            doc.image(imgPath, 5, 5, { width: PAGE_W - 10, height: PAGE_H - 10, cover: [PAGE_W - 10, PAGE_H - 10] });
        } catch (e) {
            console.error(`Failed to embed image ${imgPath}:`, e.message);
            doc.font('Helvetica').fontSize(9).fillColor('red')
                .text(`[Image could not be loaded: ${path.basename(imgPath)}]`, ML, 40);
        }
        // Footer on every image page
        doc.font('Helvetica').fontSize(7).fillColor('#000000')
            .text(`Date : ${tDate}     User : ${username || ''}     IP : ${clientIP}`, ML, 810, { align: 'right', width: CONTENT_W, lineBreak: false });
    }

    doc.end();
});

const paperReviewZero = asyncHandler(async (req, res) => {

    const { Dep_Name, Valuation_Type } = req.query;

    let flname  = `import${Valuation_Type}`;

      const paperReviewData = await db[flname].findAll({
    where: {
      Dep_Name: Dep_Name,
      Checked: 'Yes',
      E_flg: 'Y',
      [Op.or]: [
        { tot_round: null },
        { tot_round: '' },
        Sequelize.where(
          Sequelize.cast(
            Sequelize.fn('NULLIF', Sequelize.fn('TRIM', Sequelize.col('tot_round')), ''),
            'INTEGER'
          ),
          { [Op.eq]: 0 }
        )
      ]
    },
    attributes: ['barcode', 'Evaluator_Id', 'subcode','tot_round','Dep_Name','Eva_Mon_Year','Camp_id','camp_offcer_id_examiner'],
   
  });

  const result = paperReviewData.map(item => ({
    ...item.toJSON(),
    Valuation_Type: item.Valuation_Type ?? Valuation_Type,
  }));

    res.status(200).json({ message: "Paper Review Zero endpoint is working!", data: result });

});

const paperReviewSearchBarcode = asyncHandler(async (req, res) => {
    const { barcode, Valuation_Type } = req.query;

    if (!barcode || !Valuation_Type) {
        return res.status(400).json({ message: 'barcode and Valuation_Type are required' });
    }

    const flname = `import${Valuation_Type}`;
    if (!db[flname]) {
        return res.status(400).json({ message: `Model not found for Valuation_Type: ${Valuation_Type}` });
    }

    const searchVal = barcode.trim();

    // Support comma-separated barcodes e.g. "82191134,82188454"
    const barcodeList = searchVal.split(',').map(b => b.trim()).filter(Boolean);

    let orClause;
    if (barcodeList.length > 1) {
        // Multiple comma-separated values — exact match on barcode only
        orClause = { barcode: { [Op.in]: barcodeList } };
    } else {
        // Single value — OR search across Dummy No, Subcode, Evaluator ID
        orClause = {
            [Op.or]: [
                { barcode:      { [Op.like]: `%${searchVal}%` } },
                { subcode:      { [Op.like]: `%${searchVal}%` } },
                { Evaluator_Id: { [Op.like]: `%${searchVal}%` } },
            ],
        };
    }

    const rows = await db[flname].findAll({
        where: {
            ...orClause,
            Checked: 'Yes',
            E_flg: 'Y',
        },
        attributes: ['barcode', 'Evaluator_Id', 'subcode', 'tot_round', 'Dep_Name', 'Eva_Mon_Year', 'Camp_id', 'camp_offcer_id_examiner'],
    });

    const result = rows.map(item => ({
        ...item.toJSON(),
        Valuation_Type: item.Valuation_Type ?? Valuation_Type,
    }));

    res.status(200).json({ data: result });
});

module.exports = { paperReviewZero, paperReview, paperReviewDownload, paperReviewSearchBarcode };