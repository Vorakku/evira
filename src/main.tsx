import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import '@fontsource-variable/manrope';
import '@fontsource-variable/inter';
import '@fontsource-variable/kantumruy-pro';
import './styles.css';
import {App} from './App';
createRoot(document.getElementById('root')!).render(<BrowserRouter><App/></BrowserRouter>);
