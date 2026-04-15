import React, { useMemo, useState, useEffect } from 'react'
import DataTableBase from 'react-data-table-component';
import {
    useGetCommonDataQuery,
} from '../../redux-slice/getDataCommonRouterdata';
import { useSelector, useDispatch } from 'react-redux';
import { masterDataAdminDataSubcode } from '../../redux-slice/getDataCommonRouterSlice';
import { Button, Modal } from 'react-bootstrap';
import { useMcqMasterDataUpdateMutation, useReverteMcqDataFinalMutation, useEvaluatorDataFromTheBackQuery, useGetMcqDataBySubcodeFromTheBackQuery } from '../../redux-slice/mcqOperationSlice';
import McqAssignModal from '../../components/modals/McqAssignModal';
import { toast } from 'react-toastify';
import { McqAnswerKeyPdfDownload } from '../../utils/McqAnswerKeyPdfGenerator.jsx';
import * as XLSX from 'xlsx';
const DataTable = DataTableBase.default || DataTableBase;

// Component to fetch MCQ data for a subcode and optionally filter by a field
const McqDataFetcher = ({ subcode, evaId, filterField }) => {
    const { data: mcqData, isLoading, isError } = useGetMcqDataBySubcodeFromTheBackQuery(
        { Subcode: subcode, Eva_Id: evaId },
        { skip: !subcode || !evaId }
    );

    useEffect(() => {
        if (mcqData) {
            console.log('MCQ raw data for', subcode, evaId, mcqData);
            if (filterField) {
                const filtered = Array.isArray(mcqData.data) ? mcqData.data.filter(d => String(d[filterField]).toUpperCase() === 'Y') : [];
                console.log(`MCQ filtered by ${filterField}:`, filtered);
            }
        }
    }, [mcqData, subcode, evaId, filterField]);

    if (isLoading) return <Button size="sm" variant="secondary" disabled style={{ fontSize: '0.8rem' }}>Loading...</Button>;
    if (isError || !mcqData?.data || mcqData.data.length === 0) return <Button size="sm" variant="secondary" disabled style={{ fontSize: '0.8rem' }}>No Data</Button>;

    const filtered = filterField ? mcqData.data.filter(d => String(d[filterField]).toUpperCase() === 'Y') : mcqData.data;
    if (filtered.length === 0) return <Button size="sm" variant="secondary" disabled style={{ fontSize: '0.8rem' }}>No Data</Button>;

    console.log(`MCQ data for Subcode ${subcode} and Eva_Id ${evaId} after filtering by ${filterField}:`, filtered);
    return (
        null
    );
};

// Cell component: fetch MCQ data and render concatenated key (answers ordered by Qst_Number)
const McqKeyCell = ({ subcode, evaId, onKeyFetched }) => {
    const { data: mcqData, isLoading, isError } = useGetMcqDataBySubcodeFromTheBackQuery(
        { Subcode: subcode, Eva_Id: evaId },
        { skip: !subcode || !evaId }
    );

    useEffect(() => {
        if (mcqData?.data && mcqData.data.length > 0) {
            const sorted = [...mcqData.data].sort((a, b) => (Number(a.Qst_Number) || 0) - (Number(b.Qst_Number) || 0));
            const key = sorted.map((it) => String(it.Qst_Ans || '').trim()).join('');
            console.log(`McqKeyCell key for ${subcode}:`, key);
            if (onKeyFetched) {
                onKeyFetched(subcode, evaId, key);
            }
        }
    }, [mcqData, subcode, evaId, onKeyFetched]);

    if (isLoading) return <span style={{ color: '#666', fontSize: '0.9rem' }}>Loading...</span>;
    if (isError || !mcqData?.data || mcqData.data.length === 0) return <span>--</span>;

    // sort by Qst_Number and concatenate Qst_Ans
    const sorted = [...mcqData.data].sort((a, b) => (Number(a.Qst_Number) || 0) - (Number(b.Qst_Number) || 0));
    const key = sorted.map((it) => String(it.Qst_Ans || '').trim()).join('');
    return <span style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{key || '--'}</span>;
};

const McqExport = () => {
    const Dep_Name = useSelector((state) => state?.auth?.userInfo?.selected_course);
    const Eva_Id = useSelector((state) => state?.auth?.username);
    const dispatch = useDispatch();

    const { data: subMaster, error, isLoading, refetch } = useGetCommonDataQuery(
        { tableId: 'sub_master', Dep_Name },
        { skip: !Dep_Name }
    );

    const [filteredSubCode, setFilteredSubCode] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [mcqKeys, setMcqKeys] = useState({});

    const handleKeyFetched = (subcode, evaId, key) => {
        setMcqKeys(prev => ({
            ...prev,
            [`${subcode}_${evaId}`]: key
        }));
    };

    const filteredMcqData = useMemo(() => {
       if (!subMaster?.data || !Array.isArray(subMaster.data)) return [];
       return subMaster.data.filter(item =>
         item.mcq_flg === "Y" && item.mcq_updates  === "Y"
       );
     }, [subMaster, Eva_Id]);

    console.log('Filtered SubCode:', filteredMcqData);
    console.log('MCQ Keys:', mcqKeys);

    // Prepare table data with serial number and key
    const tableDataWithSno = filteredMcqData.map((r, i) => ({ 
        ...r, 
        __sno: i + 1,
        __key: mcqKeys[`${r.Subcode}_${r.Eva_Id}`] || ''
    }));

    const filteredBySearch = tableDataWithSno.filter(item => {
      if (!searchText) return true;
      console.log('Filtering item:', item, 'with search text:', searchText);
      const s = searchText.toLowerCase();
      return (item.Subcode || '').toLowerCase().includes(s) || 
      (item.SUBNAME || '').toLowerCase().includes(s) || 
      String(item.Eva_Id || '').toLowerCase().includes(s) ||
      String(item.__key || '').toLowerCase().includes(s);
    });

    const exportToExcel = () => {
        if (!filteredBySearch || filteredBySearch.length === 0) return;
        console.log('Exporting to Excel:', filteredBySearch);
        const exportData = filteredBySearch.map(row => ({
            'S.No': row.__sno,
            'Subname': row.SUBNAME || '',
            'Subcode': row.Subcode || '',
            'Answer Key': row.__key || ''

        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'MCQ Subcodes');
        XLSX.writeFile(workbook, `MCQ_Subcodes_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const columns = [
        { name: 'S.No', selector: row => row.__sno, sortable: true, width: '80px', center: true },
        { name: 'Subname', selector: row => row.SUBNAME || '--', sortable: true, grow: 2, wrap: true },
        { name: 'Evaluator ID', selector: row => row.Eva_Id || '--', sortable: true, width: '140px', center: true },
        { name: 'Subcode', selector: row => row.Subcode || '--', sortable: true, width: '160px', center: true },
        { name: 'Key', selector: row => row.__key || '--', sortable: false, grow: 1, cell: (row) => (
            <McqKeyCell subcode={row.Subcode} evaId={row.Eva_Id} onKeyFetched={handleKeyFetched} />
        ) },
    ];







    return (
        <div style={{ padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0 }}>MCQ Export</h4>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '320px' }}>
                            <input
                                type="text"
                                placeholder="Search subjects..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 40px 8px 12px',
                                    fontSize: '14px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    outline: 'none'
                                }}
                            />
                            {searchText && (
                                <button
                                    onClick={() => setSearchText('')}
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        color: '#999'
                                    }}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                        <button className="btn btn-success btn-sm" onClick={exportToExcel} disabled={tableDataWithSno.length === 0}>
                            Export to Excel
                        </button>
                    </div>
                </div>

            <DataTable
                columns={columns}
                data={filteredBySearch}
                pagination
                paginationPerPage={10}
                highlightOnHover
                pointerOnHover
                responsive
                noDataComponent={<div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>No MCQ subjects found.</div>}
            />
        </div>
    )
}

export default McqExport
