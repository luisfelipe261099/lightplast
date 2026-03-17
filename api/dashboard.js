const { execSync } = require('child_process');
const path = require('path');

module.exports = (req, res) => {
  try {
    const env = {
      ...process.env,
      TIDB_HOST: process.env.TIDB_HOST || 'gateway01us-east1prod.aws.tidbcloud.com',
      TIDB_PORT: process.env.TIDB_PORT || '4000',
      TIDB_USER: process.env.TIDB_USER || 'wYESZBLpQwYM5hn.root',
      TIDB_PASSWORD: process.env.TIDB_PASSWORD || 'GJlg4N2UHGauRmG7',
      TIDB_DATABASE: process.env.TIDB_DATABASE || 'test',
      REQUEST_METHOD: req.method,
      QUERY_STRING: Object.keys(req.query).map(k => `${k}=${req.query[k]}`).join('&'),
    };

    const phpFile = path.join(__dirname, 'dashboard.php');
    const result = execSync(`php ${phpFile}`, {
      env,
      cwd: __dirname,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(result);
  } catch (error) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ success: false, error: error.message });
  }
};
