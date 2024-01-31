const APIPermissions = {
  cachedManifest: null,

  checkPermission: function (name: string) {
    if ((process && !navigator.userAgent.includes('OpenOrchid')) || location.protocol === 'orchid:') {
      return {};
    }

    // Check if the manifest is already cached
    if (this.cachedManifest) {
      return this.cachedManifest;
    }

    // Code to read and parse the /manifest.json file
    // Modify this function as per your specific implementation
    const manifestUrl = `${location.origin}/manifest.json`;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', manifestUrl, false); // The third parameter makes the request synchronous
    xhr.send();

    if (xhr.status === 200) {
      // Cache the result
      this.cachedManifest = JSON.parse(xhr.responseText);
      return this.cachedManifest;
    } else {
      throw new Error(`Request failed with status ${xhr.status}`);
    }
  }
};

export default APIPermissions;
