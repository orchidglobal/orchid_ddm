!(function (exports) {
  'use strict';

  if (!('OrchidJS' in window)) {
    exports.OrchidJS = {};
  }

  const EasyRTC = {
    peer: null,
    localStream: null,
    remoteStreams: {},
    participants: [],

    servers: {
      iceServers: [
        'stun.stun1.l.google.com:19302',
        'stun.stun2.l.google.com:19302'
      ],
      iceCandidatePoolSize: 10
    },

    init: function () {
      this.peer = new RTCPeerConnection(this.servers);
    },

    startMediaStream: async function (audio, video) {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio, video });
      this.participants.forEach(participant => {
        this.remoteStreams[participant] = new MediaStream();
      });

      this.localStream.getTracks().forEach(track => {
        this.peer.addTrack(track, this.localStream);
      });

      this.peer.ontrack = (event) => {
        event.streams[0].getTracks().forEach(track => {
          this.participants.forEach(participant => {
            this.remoteStreams[participant].addTrack(track);
          });
        });
      };
    },

    joinCall: async function () {
      this.peer.onicecandidate = (event) => {
        if (event.candidate) {
          OrchidJS.enableFeature('uuid', () => {
            _os.realtime.set(`offer_candidates/${OrchidJS.UUIDv4()}`, event.candidate.toJSON());
          });
        }
      };

      const offerDescription = await this.peer.createOffer();
      await this.peer.setLocalDescription(offerDescription);

      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type
      };

      OrchidJS.enableFeature('uuid', () => {
        _os.realtime.set(`calls/${OrchidJS.UUIDv4()}`, { offer });

        _os.realtime.listen('answer_candidates', (data) => {
          if (!this.peer.currentRemoteDescription && data?.answer) {
            const answerDescription = new RTCSessionDescription(data.answer);
            this.peer.setRemoteDescription(answerDescription);
          }
        });
      });
    }
  };

  OrchidJS.EasyRTC = EasyRTC;
})(window);
