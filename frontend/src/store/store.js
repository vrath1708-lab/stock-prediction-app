import { createStore } from 'redux';

const initialState = {
  stocks: [],
  selectedStock: null,
  loading: false,
  error: null
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case 'SET_STOCKS':
      return { ...state, stocks: action.payload };
    case 'SET_SELECTED_STOCK':
      return { ...state, selectedStock: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const store = createStore(reducer);

export default store;
