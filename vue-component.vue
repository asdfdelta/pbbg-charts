export default {
  data: () => ({
    interval: null,
  }),
  methods: {
    ping() {
      fetch('https://activity.pbbglite.com/telemetry', {
        mode: 'no-cors'
      });
    },
  },
  mounted() {
    // Make an initial request on load
    this.ping();

    // Repeat the request every 10 minutes
    this.interval = setInterval(() => {
      try {
        this.ping();
      } catch {}
      // Every 10 minutes
    }, 600000);
  },
  unmounted() {
    clearInterval(this.interval);
  },
};