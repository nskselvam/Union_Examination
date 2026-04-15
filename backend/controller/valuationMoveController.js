const asyncHandler = require("express-async-handler");
const db = require("../db/models");
const { Sequelize, Op } = require("sequelize");
const AppError = require("../utils/appError");
const { getCurrentISTDateTime } = require("../utils/formatDateTime");

const ValuationShiftExfel = asyncHandler(async (req, res) => {
    const { exceldata } = req.body;

    console.log("Received Excel data:", exceldata);
    let validRowCount = 0;

    if (!exceldata || !Array.isArray(exceldata) || exceldata.length === 0) {
        return res.status(400).json({ message: 'Invalid or empty Excel data' });
    }

    for (const row of exceldata) {
        try {
            const { Barcode, SubCode, ToValuation } = row;

            if (!Barcode || !SubCode || !ToValuation) {
                console.log(`Missing required fields in row:`, row);
                continue;
            }

            const ImportModel = await db.import1.findAll({
                where: {
                    barcode: String(Barcode),
                    subcode: String(SubCode)
                }
            });

            if (ImportModel.length === 0 || Number(ToValuation) === 1) {
                console.log(`No record found or ToValuation=1 for Barcode=${Barcode}, SubCode=${SubCode}`);
                continue; // Skip to next row
            }

            let flname = `import${ToValuation}`;
            if (!db[flname]) {
                console.log(`No model found for ${flname}`);
                continue;
            }

            await db[flname].create({
                barcode: ImportModel[0].barcode,
                subcode: ImportModel[0].subcode,
                batchname: ImportModel[0].batchname,
                Dep_Name: ImportModel[0].Dep_Name,
                R_No: ImportModel[0].R_No,
                Checked: 'NO',
                E_flg: 'N',
                ImgCnt: ImportModel[0].ImgCnt,
                ImpDate: getCurrentISTDateTime(),
                Implot: ToValuation,
                Eva_Mon_Year: ImportModel[0].Eva_Mon_Year,
                Chief_Flg: 'N',
                Chief_Checked: 'NO',
                Chief_E_flg: 'N',
            });
            validRowCount++;

            // Delete the original record from import1 after moving


            console.log(`Updated record for Barcode=${Barcode}, SubCode=${SubCode} to ToValuation=${ToValuation}`);
        } catch (err) {
            console.error(`Error processing row:`, row, err.message);
        }
    }

    res.status(200).json({
        message: 'Excel file processed successfully',
        validRowCount: validRowCount
    });
});


const ValuationMovegetdata = asyncHandler(async (req, res) => {
    const { fromValuation, toValuation, mark, subcodes } = req.query;

    console.log("ValuationMovegetdata query params:", req.query);

    if (!fromValuation) {
        return res.status(400).json({ message: 'fromValuation is required' });
    }
    if (!toValuation) {
        return res.status(400).json({ message: 'toValuation is required' });
    }
    if (mark === undefined || mark === '') {
        return res.status(400).json({ message: 'mark is required' });
    }

    const fromModelName = `import${fromValuation}`;
    const toModelName = `import${toValuation}`;

    const FromModel = db[fromModelName];
    const ToModel = db[toModelName];

    if (!FromModel) {
        return res.status(404).json({ message: `Model '${fromModelName}' not found` });
    }
    if (!ToModel) {
        return res.status(404).json({ message: `Model '${toModelName}' not found` });
    }

    const subcodeArray = subcodes
        ? [].concat(subcodes).flatMap(s => s.split(',').map(x => x.trim())).filter(Boolean)
        : [];

    // Build shared subcode filter — IN ('A','B','C') when codes are provided
    const subcodeFilter = subcodeArray.length > 0
        ? { subcode: { [Op.in]: subcodeArray } }
        : {};

    let data = [];

    if (parseInt(mark) !== 0) {
        // Fetch all records from both tables (filtered by subcodes if provided)
        const [fromRecords, toRecords] = await Promise.all([
            FromModel.findAll({ where: { ...subcodeFilter, Checked: 'Yes', E_flg: 'Y' } }),
            ToModel.findAll({ where: { ...subcodeFilter, Checked: 'Yes', E_flg: 'Y' } }),
        ]);

        if (fromRecords.length === 0) {
            return res.status(200).json({ data: [] });
        }

        // Build a lookup map for toValuation records: barcode -> tot_round
        const toMap = new Map();
        for (const r of toRecords) {
            toMap.set(r.barcode, parseFloat(r.tot_round) || 0);
        }

        const markThreshold = parseFloat(mark);

        // Match by barcode, compute difference, keep rows where difference > mark
        let sno = 1;
        for (const r of fromRecords) {
            // Only process barcodes that also exist in the toValuation table
            if (!toMap.has(r.barcode)) continue;

            const fromMark = parseFloat(r.tot_round) || 0;
            const toMark = toMap.get(r.barcode);
            const diff = fromMark - toMark;

            if (diff > markThreshold) {
                data.push({
                    SNo: sno++,
                    Barcode: r.barcode,
                    RegisterNo: r.R_No,
                    SubCode: r.subcode,
                    Dep_Name: r.Dep_Name,
                    Eva_Mon_Year: r.Eva_Mon_Year,
                    FromValuation: `Valuation ${fromValuation}`,
                    ToValuation: `Valuation ${toValuation}`,
                    V1_Marks: fromMark,
                    V2_Marks: toMark,
                    Difference: diff,
                    InputMark: markThreshold,
                    Status: 'Eligible',
                });
            }
        }
    } else {

        const [ZeroRecrod] = await Promise.all([
            FromModel.findAll({ where: { ...subcodeFilter, Checked: 'Yes', E_flg: 'Y' } }),
        ]);

        if (ZeroRecrod.length === 0) {
            return res.status(200).json({ data: [] });
        }

        data.push(...ZeroRecrod.map((r, index) => ({
            SNo: index + 1,
            Barcode: r.barcode,
            RegisterNo: r.R_No,
            SubCode: r.subcode,
            Dep_Name: r.Dep_Name,
            Eva_Mon_Year: r.Eva_Mon_Year,
            FromValuation: `Valuation ${fromValuation}`,
            ToValuation: `Valuation ${toValuation}`,
            V1_Marks: parseFloat(r.tot_round) || 0,
            V2_Marks: 0,
            Difference: parseFloat(r.tot_round) || 0,
            InputMark: 0,
            Status: 'Eligible',
        })));
    }

    res.status(200).json({ data });
})

const ValuationMoveUpdate = asyncHandler(async (req, res) => {

    const { payload } = req.body;
    const { fromValuation, toValuation, mark, records } = payload;

    const fromModelName = `import${fromValuation}`;
    const toModelName = `import${toValuation}`;
    const newModelName = `import${String(parseInt(toValuation) + 1)}`;

    if (!db[fromModelName]) {
        return res.status(404).json({ message: `Model '${fromModelName}' not found` });
    }
    if (!db[toModelName]) {
        return res.status(404).json({ message: `Model '${toModelName}' not found` });
    }
    if (parseInt(toValuation) === 4) {
        return res.status(400).json({ message: `Cannot move to Valuation ${toValuation} as it exceeds the maximum valuation round` });
    }

    let movedCount = 0;

    for (const record of records) {
        const { Barcode, SubCode } = record;

        if (parseInt(mark) === 0) {
            // Check if already exists in toModel
            const existing = await db[toModelName].findOne({
                where: { barcode: String(Barcode), subcode: String(SubCode) }
            });

            if (existing) continue; // already moved, skip

            // Fetch source record from fromModel
            const sourceRecord = await db[fromModelName].findOne({
                where: { barcode: String(Barcode), subcode: String(SubCode) }
            });

            if (!sourceRecord) {
                console.log(`Source record not found for Barcode=${Barcode}, SubCode=${SubCode}`);
                continue;
            }

            await db[toModelName].create({
                barcode: sourceRecord.barcode,
                subcode: sourceRecord.subcode,
                batchname: sourceRecord.batchname,
                Dep_Name: sourceRecord.Dep_Name,
                R_No: sourceRecord.R_No,
                Checked: 'NO',
                E_flg: 'N',
                ImgCnt: sourceRecord.ImgCnt,
                ImpDate: getCurrentISTDateTime(),
                Implot: toValuation,
                Eva_Mon_Year: sourceRecord.Eva_Mon_Year,
                Chief_Flg: 'N',
                Chief_Checked: 'NO',
                Chief_E_flg: 'N',
            });

            movedCount++;
        } else {
            const existing = await db[newModelName].findOne({
                where: { barcode: String(Barcode), subcode: String(SubCode) }
            });

            if (existing) continue; // already moved, skip

            // Fetch source record from fromModel
            const sourceRecord = await db[fromModelName].findOne({
                where: { barcode: String(Barcode), subcode: String(SubCode) }
            });

            if (!sourceRecord) {
                console.log(`Source record not found for Barcode=${Barcode}, SubCode=${SubCode}`);
                continue;
            }

            await db[newModelName].create({
                barcode: sourceRecord.barcode,
                subcode: sourceRecord.subcode,
                batchname: sourceRecord.batchname,
                Dep_Name: sourceRecord.Dep_Name,
                R_No: sourceRecord.R_No,
                Checked: 'NO',
                E_flg: 'N',
                ImgCnt: sourceRecord.ImgCnt,
                ImpDate: getCurrentISTDateTime(),
                Implot: toValuation,
                Eva_Mon_Year: sourceRecord.Eva_Mon_Year,
                Chief_Flg: 'N',
                Chief_Checked: 'NO',
                Chief_E_flg: 'N',
            });


        }

    }

    console.log("ValuationMoveUpdate processed:", movedCount, "record(s) moved");
    res.status(200).json({ message: `${movedCount} record(s) moved successfully` });
})
// for (const row of exceldata) {
//     const { Barcode, SubCode, ToValuation } = row;

//     // Validate required fields
//     if (!Barcode || !SubCode || !ToValuation) {
//         throw new AppError('Missing required fields in Excel data', 400);
//     }
//     console.log(`Processing row: Barcode=${Barcode}, SubCode=${SubCode}, ToValuation=${ToValuation}`);

//     let flname 

//     // Update the valuation move in the database}

// }


module.exports = { ValuationShiftExfel, ValuationMovegetdata, ValuationMoveUpdate };