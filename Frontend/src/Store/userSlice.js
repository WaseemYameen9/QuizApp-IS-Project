import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    studentAuth:false,
    teacherAuth:false
};


export const userSlice = createSlice({
    name:"user",
    initialState:initialState,
    reducers: {
        setUser: (state,action) => {
            const {studentAuth, teacherAuth} = action.payload
            state.studentAuth = studentAuth
            state.teacherAuth = teacherAuth

        },
        resetUser: (state)=>{
            state.studentAuth = false
            state.teacherAuth = false

        }
    }

})

export const {setUser, resetUser} = userSlice.actions;

export default userSlice.reducer;