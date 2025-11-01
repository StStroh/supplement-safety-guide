const validateEnv = (requiredVars) => {
  const missing = [];
  const found = {};

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      missing.push(varName);
    } else {
      found[varName] = value.substring(0, 20) + '...';
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    found
  };
};

const createEnvErrorResponse = (missing, functionName) => {
  const errorBody = {
    error: 'MISSING_ENV',
    missing,
    message: `Missing required environment variables in ${functionName}`,
    hint: 'Check Netlify Site Settings → Environment Variables'
  };

  console.error(`[${functionName}] MISSING_ENV:`, JSON.stringify(errorBody, null, 2));

  return {
    statusCode: 400,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(errorBody)
  };
};

const logPhase = (functionName, phase, data = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    function: functionName,
    phase,
    ...data
  };
  console.log(JSON.stringify(logEntry));
};

module.exports = {
  validateEnv,
  createEnvErrorResponse,
  logPhase
};
