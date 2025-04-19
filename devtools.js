chrome.devtools.panels.create(
    'Performance HUD',
    null,
    'panel.html',
    panel => {
      console.log('DevTools panel created:', panel);
    }
  );
  