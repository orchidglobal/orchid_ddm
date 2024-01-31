import child_process from 'child_process';

const ChildProcess = {
  exec: function (cli: string, args: string[] = []) {
    const command = `${cli} ${args.join(' ')}`;
    return child_process.exec(command);
  },

  execTerminal: function (cli: string, callback: any, exitCallback: any) {
    const command = `${cli}`;
    const process = child_process.exec(command, callback);
    process.on('close', exitCallback);
    return process;
  },

  spawn: function (cli: string, args: string[] = []) {
    const command = `${cli} ${args.join(' ')}`;
    return child_process.spawn(command);
  }
};

export default ChildProcess;
