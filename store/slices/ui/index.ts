import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type UiState = {
    isDialogOpen: boolean;
};

const initialState: UiState = {
    isDialogOpen: false
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setIsDialogOpen: (state, action: PayloadAction<{ isDialogOpen: boolean }>) => {
            state.isDialogOpen = action.payload.isDialogOpen;
        }
    }
});

export const { setIsDialogOpen } = uiSlice.actions;

export default uiSlice.reducer;
