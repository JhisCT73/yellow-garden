import { mount } from 'svelte';
import App from './App.svelte';
import './theme/tokens.css';
import './theme/cinematic.css';

mount(App, { target: document.getElementById('app')! });
