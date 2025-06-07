module.exports = {
  devServer: {
    allowedHosts: "all",
    host: "localhost",
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
};
