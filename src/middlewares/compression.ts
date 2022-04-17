import compression from "compression";

const compressor = () =>
  compression({
    level: 6,
    filter: (req, res) => {
      // don't compress responses with this request header
      if (req.headers["x-no-compression"]) return false;
      // fallback to standard filter function
      return compression.filter(req, res);
    },
  });

export default compressor;
