react-displ simple breakpoints libs

```tsx
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
      {/* with provider to be adaptive */}
      <Display>
        <Display.mobile>display when mobile</Display.mobile>
        <Display.desktop>display when desktop</Display.desktop>
      </Display>

      <Display.mobile>display when mobile</Display.mobile>
      <Display.tablet>display when tablet</Display.tablet>
      <Display.desktop>display when desktop</Display.desktop>
    </div>
  );
}

export default App;
```
