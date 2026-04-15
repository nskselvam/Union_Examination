import { createSlice } from "@reduxjs/toolkit";

// Clear invalid localStorage data
if (localStorage.getItem("userInfo") === "undefined" || localStorage.getItem("userInfo") === "null") {
  localStorage.removeItem("userInfo");
}

if (localStorage.getItem("degreeInfo") === "undefined" || localStorage.getItem("degreeInfo") === "null") {
  localStorage.removeItem("degreeInfo");
}
if (localStorage.getItem("monthyearInfo") === "undefined" || localStorage.getItem("monthyearInfo") === "null") {
  localStorage.removeItem("monthyearInfo");
}
 
const initialState = {
  userInfo: localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo"))  : null,
  degreeInfo: localStorage.getItem("degreeInfo") ? JSON.parse(localStorage.getItem("degreeInfo")) : null,
  monthyearInfo: localStorage.getItem("monthyearInfo") ? JSON.parse(localStorage.getItem("monthyearInfo")) : null,
  items: [],
  user_active_role: null
};

const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{
        newloginitemadd : (state, action) => {
            state.items.push(action.payload)
        },

        setUserActiveRole: (state, action) => {
            state.user_active_role = action.payload
        },

        loginSuccess: (state, action) => {
            state.userInfo = action.payload
            localStorage.setItem('userInfo', JSON.stringify(action.payload)) 
        },
        updateTerms: (state, action) => {
            if (state.userInfo) {
                state.userInfo = { ...state.userInfo, terms: action.payload }
                localStorage.setItem('userInfo', JSON.stringify(state.userInfo))
            }
        },
        degreeLoad: (state, action) => {
            state.degreeInfo = action.payload
            localStorage.setItem('degreeInfo', JSON.stringify(action.payload)) 
        },
        logoutSuccess: (state) => {
            state.userInfo = null
            state.user_active_role = null
            state.items = []
            localStorage.removeItem('userInfo')
            localStorage.removeItem('degreeInfo')
            localStorage.removeItem('monthyearInfo')
        },
        monthYearLoad: (state, action) => {
            state.monthyearInfo = action.payload
            localStorage.setItem('monthyearInfo', JSON.stringify(action.payload)) 
        },
        checkAuth: (state) => {
            state.isAuthenticated = !!localStorage.getItem('token');
        }
    },
});


export const {loginSuccess,logoutSuccess,checkAuth,newloginitemadd,setUserActiveRole,degreeLoad,monthYearLoad,updateTerms} = authSlice.actions;
export default authSlice.reducer
