import { createDisplay } from 'reactive';
import './App.css';

const Display = createDisplay(
  {
    mobile: 320,
    tablet: 768,
    desktop: 1024,
  },
  {
    isLazy: true,
  },
);

function App() {
  return (
    <div className="App">
      <Display>
        <Display.mobile>display with provider when mobile</Display.mobile>
        <Display.tablet>display with provider when tablet</Display.tablet>
        <Display.desktop>display with provider when desktop</Display.desktop>
      </Display>

      <Display.mobile>display when mobile</Display.mobile>
      <Display.tablet>display when tablet</Display.tablet>
      <Display.desktop>display when desktop</Display.desktop>
    </div>
  );
}

export default App;
