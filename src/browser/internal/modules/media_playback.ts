import { ipcRenderer } from 'electron';

const MediaPlayback = {
  mediaElements: null as NodeList | null,

  init: function () {
    this.mediaElements = document.querySelectorAll('audio, video');
    this.mediaElements.forEach(this.handleEachElement.bind(this));
  },

  convertToAbsoluteUrl: function (relativeUrl: string) {
    const baseUrl = window.location.origin;
    return new URL(relativeUrl, baseUrl).href;
  },

  getFileAsUint8Array: async function (url: string) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  },

  handleEachElement: function (mediaElement: any) {
    mediaElement.addEventListener('play', (event: Event) => {
      const url = this.convertToAbsoluteUrl(mediaElement.src);
      this.getFileAsUint8Array(url).then((data) => {
        // musicMetadata.parseBuffer(data, mime.getType(url)).then((metadata) => {
        //   const common = metadata.common;
        //   this.sendMediaPlayEvent(common);
        // });
      });
    });
    mediaElement.addEventListener('pause', (event: Event) => {
      ipcRenderer.send('mediapause', {});
    });
  },

  sendMediaPlayEvent: function (common: Record<string, any>) {
    ipcRenderer.send('mediaplay', {
      title: common.title,
      artist: common.artist,
      album: common.album,
      artwork: `data:${common.picture.format};base64,${common.picture.data.toString('base64')}`,
      date: common.date
    });
  }
};

export default MediaPlayback;
