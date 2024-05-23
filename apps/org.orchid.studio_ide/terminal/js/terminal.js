!(function (exports) {
  'use strict';

  const term = new Terminal();
  const fitAddon = new FitAddon.FitAddon();

  term.loadAddon(fitAddon);
  term.open(document.getElementById('terminal-renderer'));
  fitAddon.fit();

  // term.write('Orchid Arch Terminal - 1.0.111\n');

  // Add a prompt
  term.prompt = '$ ';
  term.write(term.prompt);

  let currentInput = ''; // Variable to store the current input being typed

  term.onKey((e) => {
    handleInput(e.key);
  });

  async function handleInput(key) {
    // Handle backspace
    if (key.charCodeAt(0) === 127) {
      if (currentInput.length > 0) {
        term.write('\b \b');
        currentInput = currentInput.slice(0, -1);
      }
    } else if (key === '\r') {
      // Enter key pressed
      term.write('\n');
      await executeCommand(currentInput);
      currentInput = ''; // Clear the current input
      term.prompt = '$ ';
      term.write(term.prompt);
    } else {
      term.write(key);
      currentInput += key;
    }
  }

  function executeCommand(command) {
    return new Promise((resolve, reject) => {
      ChildProcess.execTerminal(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        if (stdout) {
          term.write(stdout.toString());
        }
        if (stderr) {
          term.write(`Error: ${stderr.toString()}\n`);
        }
      }, (code) => {
        if (code) {
          resolve(null);
        }
      });
    });
  }

  // Handle resize events
  window.addEventListener('resize', () => {
    fitAddon.fit();
  });
})(window);
