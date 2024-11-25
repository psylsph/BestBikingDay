import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

// Initialize root element for web
if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root');
  if (!rootTag) {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
  }
}

registerRootComponent(App);
