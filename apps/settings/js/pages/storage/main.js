!(function (exports) {
  'use strict';

  const Storage = {
    storageList: document.getElementById('storage-list'),
    usedSpaceProgress: document.getElementById('storage-used-space-progress'),

    usedStorage: 0,
    freeStorage: 10000000,
    calculatedStorage: {
      documents: { amount: 0, size: 0 },
      audio: { amount: 0, size: 0 },
      images: { amount: 0, size: 0 },
      videos: { amount: 0, size: 0 },
      others: { amount: 0, size: 0 }
    },

    FILE_TYPES: [
      'documents',
      'audio',
      'images',
      'videos',
      'others'
    ],
    FILE_TYPE_DOCUMENTS: 'text/',
    FILE_TYPE_AUDIO: 'audio/',
    FILE_TYPE_IMAGE: 'image/',
    FILE_TYPE_VIDEO: 'video/',
    FILE_TYPE_OTHER: 'application/',

    init: async function () {
      try {
        await this.indexFilesAt(this.FILE_TYPE_DOCUMENTS, 'documents');
        await this.indexFilesAt(this.FILE_TYPE_AUDIO, 'audio');
        await this.indexFilesAt(this.FILE_TYPE_IMAGE, 'images');
        await this.indexFilesAt(this.FILE_TYPE_VIDEO, 'videos');
        await this.indexFilesAt(this.FILE_TYPE_OTHER, 'others');

        this.displayUsage();
      } catch (error) {
        console.error('Error during initialization:', error);
      }
    },

    indexFilesAt: async function (mime, target) {
      try {
        const array = await FileIndexer('/', mime);
        for (let index = 0, length = array.length; index < length; index++) {
          const element = array[index];
          await this.calculateSize(element, target);
        }
      } catch (error) {
        console.error(`Error indexing ${mime} files:`, error);
      }
    },

    calculateSize: async function (path, target) {
      try {
        const stats = await SDCardManager.getStats(path);

        this.usedStorage += stats.size;
        this.calculatedStorage[target].amount += 1;
        this.calculatedStorage[target].size += stats.size;
      } catch (error) {
        console.error(`Error calculating size for ${path}:`, error);
      }
    },

    displayUsage: function () {
      try {
        this.storageList.innerHTML = '';

        let progressTotal = 0;
        const fragment = document.createDocumentFragment();
        this.FILE_TYPES.forEach((type, index) => {
          const fill = document.createElement('div');
          fill.classList.add('fill');
          fill.style.setProperty('--hue', (index / (this.FILE_TYPES.length - 1)) * 300);
          progressTotal += this.calculatedStorage[type].size / (this.usedStorage + this.freeStorage);
          fill.style.setProperty('--progress', progressTotal);
          fill.style.zIndex = this.FILE_TYPES.length - index;
          fragment.appendChild(fill);

          const item = document.createElement('li');
          item.classList.add('hbox', 'noclick');
          this.storageList.appendChild(item);

          const color = document.createElement('div');
          color.classList.add('color');
          color.style.setProperty('--hue', (index / (this.FILE_TYPES.length - 1)) * 300);
          item.appendChild(color);

          const textHolder = document.createElement('div');
          textHolder.classList.add('vbox');
          item.appendChild(textHolder);

          const name = document.createElement('p');
          name.textContent = OrchidJS.L10n.get('storageCategory-' + type);
          textHolder.appendChild(name);

          const sizeUnit = document.createElement('p');
          const [ size, unit ] = OrchidJS.convertBytes(this.calculatedStorage[type].size);
          sizeUnit.textContent = OrchidJS.L10n.get('storageUnit-' + unit, { size });
          textHolder.appendChild(sizeUnit);
        });
        this.usedSpaceProgress.appendChild(fragment);
      } catch (error) {
        console.error('Error displaying usage:', error);
      }
    }
  };

  SettingsApp.Storage = Storage;
})(window);
