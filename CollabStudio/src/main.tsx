import { createRoot } from 'react-dom/client';
import '@/assets/styles/_variables.scss';
import { Provider } from 'react-redux';
import store from '@/store';
import App from '@/App.tsx';
import 'remixicon/fonts/remixicon.css';

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <App />
    </Provider>
);
