import { Reducer } from 'react';

export type SubmitButtonState = {
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
};

type SubmitButtonAction = { type: 'loading' | 'success' | 'error' };

const initialState: SubmitButtonState = {
    isLoading: false,
    isSuccess: false,
    isError: false
};

const submitButtonReducer: Reducer<SubmitButtonState, SubmitButtonAction> = (state = initialState, action) => {
    switch (action.type) {
        case 'loading': {
            return { isLoading: true, isSuccess: false, isError: false };
        }
        case 'success': {
            return { isLoading: false, isSuccess: true, isError: false };
        }
        case 'error': {
            return { isLoading: false, isSuccess: false, isError: true };
        }
        default: {
            return state;
        }
    }
};

export default submitButtonReducer;
