import { createSlice } from "@reduxjs/toolkit";
import { logoutSuccess } from './authSlice';

if (localStorage.getItem("valuationData") === "undefined" || localStorage.getItem("valuationData") === "null") {
  localStorage.removeItem("valuationData");
}
const initialState = {
  valuationData: localStorage.getItem("valuationData") ? JSON.parse(localStorage.getItem("valuationData"))  : null,
  currentSubCode: localStorage.getItem("currentSubCode") ? localStorage.getItem("currentSubCode") : null,
  dashboardData: localStorage.getItem("dashboardData") ? JSON.parse(localStorage.getItem("dashboardData"))  : null,
  chiefValuationData: localStorage.getItem("chiefValuationData") ? JSON.parse(localStorage.getItem("chiefValuationData"))  : null,
  chiefValuationBarcodeData: localStorage.getItem("chiefValuationBarcodeData") ? JSON.parse(localStorage.getItem("chiefValuationBarcodeData"))  : null,
};
const valuationSlice = createSlice({
    name:"valuation",
    initialState,
    reducers:{
        setValuationData: (state, action) => {
            state.valuationData = action.payload
            localStorage.setItem('valuationData', JSON.stringify(action.payload)) 
        },
        clearValuationData: (state) => {
            state.valuationData = null
            localStorage.removeItem('valuationData')
        },
        setCurrentSubCode: (state, action) => {
            state.currentSubCode = action.payload
            localStorage.setItem('currentSubCode', action.payload)
        },
        clearCurrentSubCode: (state) => {
            state.currentSubCode = null
            localStorage.removeItem('currentSubCode')
        },
        setDashboardData: (state, action) => {
            state.dashboardData = action.payload
            localStorage.setItem('dashboardData', JSON.stringify(action.payload))
        },
        clearDashboardData: (state) => {
            state.dashboardData = null
            localStorage.removeItem('dashboardData')
        },
        setChiefValuationData: (state, action) => {
            state.chiefValuationData = action.payload
            localStorage.setItem('chiefValuationData', JSON.stringify(action.payload)) 
        },
        clearChiefValuationData: (state) => {
            state.chiefValuationData = null
            localStorage.removeItem('chiefValuationData')
        },
        setChiefValuationBarcodeData: (state, action) => {
            state.chiefValuationBarcodeData = action.payload
            localStorage.setItem('chiefValuationBarcodeData', JSON.stringify(action.payload)) 
        },
        clearChiefValuationBarcodeData: (state) => {
            state.chiefValuationBarcodeData = null
            localStorage.removeItem('chiefValuationBarcodeData')
        },        
    },
    extraReducers: (builder) => {
        builder.addCase(logoutSuccess, (state) => {
            state.valuationData = null;
            state.currentSubCode = null;
            state.dashboardData = null;
            state.chiefValuationData = null;
            state.chiefValuationBarcodeData = null;
            localStorage.removeItem('valuationData');
            localStorage.removeItem('currentSubCode');
            localStorage.removeItem('dashboardData');
            localStorage.removeItem('chiefValuationData');
            localStorage.removeItem('chiefValuationBarcodeData');
        });
    },
});
export const {setValuationData,clearValuationData,setCurrentSubCode,clearCurrentSubCode,setDashboardData,clearDashboardData,setChiefValuationData,clearChiefValuationData,setChiefValuationBarcodeData,clearChiefValuationBarcodeData} = valuationSlice.actions;
export default valuationSlice.reducer;
