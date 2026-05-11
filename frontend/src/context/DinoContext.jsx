import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import toast from 'react-hot-toast';

const DinoContext = createContext(null);

const initialState = {
  // Session
  sessionId: uuidv4(),
  customerPhone: null,
  customerName: null,

  // UI state
  screen: 'idle',          // idle | listening | processing | conversation | booking | history
  isListening: false,
  isProcessing: false,
  isSpeaking: false,
  isAwake: false,

  // Conversation
  messages: [],
  transcript: '',
  interimTranscript: '',

  // Data
  services: [],
  offers: [],
  currentBooking: null,
  bookingHistory: [],

  // Wake word
  wakeWordDetected: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN': return { ...state, screen: action.payload };
    case 'SET_LISTENING': return { ...state, isListening: action.payload };
    case 'SET_PROCESSING': return { ...state, isProcessing: action.payload };
    case 'SET_SPEAKING': return { ...state, isSpeaking: action.payload };
    case 'SET_AWAKE': return { ...state, isAwake: action.payload, wakeWordDetected: action.payload };
    case 'SET_TRANSCRIPT': return { ...state, transcript: action.payload };
    case 'SET_INTERIM': return { ...state, interimTranscript: action.payload };
    case 'ADD_MESSAGE': return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_MESSAGES': return { ...state, messages: action.payload };
    case 'SET_SERVICES': return { ...state, services: action.payload };
    case 'SET_OFFERS': return { ...state, offers: action.payload };
    case 'SET_BOOKING': return { ...state, currentBooking: action.payload };
    case 'SET_HISTORY': return { ...state, bookingHistory: action.payload };
    case 'SET_CUSTOMER': return { ...state, customerPhone: action.phone, customerName: action.name };
    case 'RESET_CONVERSATION':
      return {
        ...state,
        messages: [],
        transcript: '',
        interimTranscript: '',
        isAwake: false,
        wakeWordDetected: false,
        isListening: false,
        isProcessing: false,
        isSpeaking: false,
        screen: 'idle',
        currentBooking: null
      };
    default: return state;
  }
}

export function DinoProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const sendMessage = useCallback(async (message) => {
    if (!message.trim()) return;

    dispatch({ type: 'ADD_MESSAGE', payload: { role: 'user', content: message, ts: Date.now() } });
    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'SET_SCREEN', payload: 'processing' });

    try {
      const { data } = await axios.post('/api/conversation/chat', {
        sessionId: state.sessionId,
        message,
        customerPhone: state.customerPhone
      });

      dispatch({ type: 'ADD_MESSAGE', payload: { role: 'assistant', content: data.reply, ts: Date.now() } });
      dispatch({ type: 'SET_SCREEN', payload: 'conversation' });

      // Extract booking reference if mentioned
      const refMatch = data.reply.match(/UKL-[A-Z0-9]+/);
      if (refMatch) {
        const booking = await axios.get(`/api/bookings/${refMatch[0]}`).catch(() => null);
        if (booking) dispatch({ type: 'SET_BOOKING', payload: booking.data });
      }

      return data.reply;
    } catch (err) {
      const errMsg = "I'm having a moment — could you repeat that?";
      dispatch({ type: 'ADD_MESSAGE', payload: { role: 'assistant', content: errMsg, ts: Date.now() } });
      toast.error('Connection issue. Please try again.');
      return errMsg;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.sessionId, state.customerPhone]);

  const loadServices = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/services');
      dispatch({ type: 'SET_SERVICES', payload: data });
    } catch (err) {
      console.error('Failed to load services:', err);
    }
  }, []);

  const loadOffers = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/offers');
      dispatch({ type: 'SET_OFFERS', payload: data });
    } catch (err) {
      console.error('Failed to load offers:', err);
    }
  }, []);

  const loadHistory = useCallback(async (phone) => {
    if (!phone) return;
    try {
      const { data } = await axios.get(`/api/bookings/customer/${phone}`);
      dispatch({ type: 'SET_HISTORY', payload: data.bookings || [] });
      if (data.customer?.name) {
        dispatch({ type: 'SET_CUSTOMER', phone, name: data.customer.name });
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }, []);

  const resetConversation = useCallback(async () => {
    try {
      await axios.post('/api/conversation/reset', { sessionId: state.sessionId });
    } catch (err) { /* ignore */ }
    dispatch({ type: 'RESET_CONVERSATION' });
  }, [state.sessionId]);

  const wakeUp = useCallback(() => {
    dispatch({ type: 'SET_AWAKE', payload: true });
    dispatch({ type: 'SET_SCREEN', payload: 'listening' });
  }, []);

  return (
    <DinoContext.Provider value={{
      state,
      dispatch,
      sendMessage,
      loadServices,
      loadOffers,
      loadHistory,
      resetConversation,
      wakeUp
    }}>
      {children}
    </DinoContext.Provider>
  );
}

export const useDino = () => {
  const ctx = useContext(DinoContext);
  if (!ctx) throw new Error('useDino must be used within DinoProvider');
  return ctx;
};
