import { ipcRenderer } from 'electron';
import uuid from 'uuid';

class OrchidNotification extends Notification {
  public title: string;
  public options: Record<string, any>;
  public permission: string;
  public ID: string;

  constructor(title: string, options: Record<string, any>) {
    super(title);

    this.title = title;
    this.options = options;
    this.permission = 'granted';

    this.ID = uuid.v4();
    this.show();
  }

  requestPermission() {
    return new Promise((resolve, reject) => {
      resolve(this.permission);
    });
  }

  show() {
    ipcRenderer.send('message', {
      type: 'notification',
      action: 'show',
      name: this.title,
      options: this.options,
      href: location.href,
      origin: location.origin,
      title: document.title,
      id: this.ID
    });
  }

  close() {
    ipcRenderer.send('message', {
      type: 'notification',
      action: 'hide',
      id: this.ID
    });
  }
}

export default OrchidNotification;
