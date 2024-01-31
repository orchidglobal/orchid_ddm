import Settings from '../settings';

const TimeManager = {
  getCurrentTime: () => {
    return new Promise((resolve, reject) => {
      Settings.getValue('date.iso_timedate').then((data) => {
        const currentDate = new Date().getTime();
        const savedDate = new Date(data).getTime();

        const estimate = currentDate - savedDate;
        const resultIsoString = savedDate + estimate;

        resolve(resultIsoString);
      });
    });
  },

  setTime: (newTime: number) => {
    Settings.setValue('date.iso_timedate', newTime);
  }
};

export default TimeManager;
