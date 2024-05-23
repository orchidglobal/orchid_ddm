!(function (exports) {
  'use strict';

  const Permissions = {
    /**
     * Initializes the module.
     * Adds the event listener for permission-request events.
     */
    init: function () {
      window.addEventListener('permission-request', this.handlePermissionRequest.bind(this));
    },

    /**
     * Handles permission-request events.
     *
     * @param {Event} event - The event.
     */
    handlePermissionRequest: async function (event) {
      // The origin of the requesting web page.
      const url = new URL(event.detail.origin);
      const origin = url.origin;
      // The type of permission being requested.
      const permissionType = event.detail.type;

      // Get the stored permission value.
      const permissionValue = await OrchidJS.Settings.getValue(origin, 'permissions.json');
      // Get the decision for this permission type.
      const decision = permissionValue?.[permissionType];

      // If we have a stored decision, send it back to the requesting web page.
      if (decision !== undefined) {
        IPC.send('permission-request', {
          // The type of permission being requested.
          permission: permissionType,
          // The origin of the requesting web page.
          origin,
          // The decision for this permission type.
          decision
        });
      } else {
        // If we don't have a stored decision, load the modal_dialog.js script
        // and show the permission prompt.
        await LazyLoader.load('js/webapp/modal_dialog.js', () => {
          this.showPermissionRequestDialog(permissionType, origin);
        });
      }
    },

    /**
     * Shows the permission request dialog.
     *
     * @description
     * Shows the permission request dialog for the given `permissionType` and
     * `origin`. The dialog displays the permission title and detail, which are
     * obtained from the `permission-{permissionType}` and
     * `permissionDetail-{permissionType}` localization strings. If the user
     * grants the permission, the decision is saved using the `Settings` API.
     * Finally, the `permission-request` IPC message is sent to the requesting
     * web page with the user's decision.
     *
     * @param {string} permissionType - The type of permission being requested.
     * @param {string} origin - The origin of the requesting web page.
     */
    showPermissionRequestDialog: async function (permissionType, origin) {
      const permissionTitle = OrchidJS.L10n.get(`permission-${permissionType}`);
      const permissionDetail = OrchidJS.L10n.get(`permissionDetail-${permissionType}`);

      const permissionValue = await OrchidJS.Settings.getValue(origin, 'permissions.json');
      const decision = await ModalDialog.showPermissionRequest(permissionTitle, permissionDetail);
      const settingValue = {
        [permissionType]: decision
      };

      OrchidJS.Settings.setValue(origin, { ...permissionValue, ...settingValue }, 'permissions.json');

      IPC.send('permission-request', { permission: permissionType, origin, decision });
    }
  };

  Permissions.init();
})(window);
