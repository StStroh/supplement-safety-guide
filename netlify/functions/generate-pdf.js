const PDFDocument = require('pdfkit');
const { createClient } = require('@supabase/supabase-js');
const { validateEnv, createEnvErrorResponse, logPhase } = require('./_shared/env-validator');

const FUNCTION_NAME = 'generate-pdf';

const checkStarterMonthlyLimit = async (supabase, userEmail) => {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const { data: logs, error } = await supabase
    .from('pdf_logs')
    .select('id')
    .eq('user_email', userEmail)
    .gte('created_at', firstOfMonth.toISOString());

  if (error) {
    logPhase(FUNCTION_NAME, 'pdf_log_query_error', { error: error.message });
    return { allowed: true, count: 0 };
  }

  const count = logs?.length || 0;
  return {
    allowed: count < 5,
    count,
    limit: 5
  };
};

const logPdfGeneration = async (supabase, userEmail) => {
  const { error } = await supabase
    .from('pdf_logs')
    .insert({
      user_email: userEmail,
      created_at: new Date().toISOString()
    });

  if (error) {
    logPhase(FUNCTION_NAME, 'pdf_log_insert_error', { error: error.message });
  }
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    logPhase(FUNCTION_NAME, 'start');

    const requiredVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const validation = validateEnv(requiredVars);

    if (!validation.isValid) {
      return createEnvErrorResponse(validation.missing, FUNCTION_NAME);
    }

    logPhase(FUNCTION_NAME, 'validated_env', { found: Object.keys(validation.found) });

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    logPhase(FUNCTION_NAME, 'supabase_connect_ok');

    const authHeader = event.headers.authorization || event.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logPhase(FUNCTION_NAME, 'auth_failed', { reason: 'missing_bearer_token' });
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      logPhase(FUNCTION_NAME, 'auth_failed', { error: authError?.message });
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    logPhase(FUNCTION_NAME, 'user_authenticated', { userId: user.id, email: user.email });

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan, user_email')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      logPhase(FUNCTION_NAME, 'profile_query_error', { error: profileError.message });
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch user profile' }),
      };
    }

    if (!profile) {
      logPhase(FUNCTION_NAME, 'profile_not_found', { userId: user.id });
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User profile not found' }),
      };
    }

    if (profile.plan === 'starter') {
      const limitCheck = await checkStarterMonthlyLimit(supabase, profile.user_email);

      logPhase(FUNCTION_NAME, 'limit_check', {
        plan: 'starter',
        count: limitCheck.count,
        limit: limitCheck.limit,
        allowed: limitCheck.allowed
      });

      if (!limitCheck.allowed) {
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({
            error: 'Monthly PDF limit reached',
            limit: limitCheck.limit,
            used: limitCheck.count,
            plan: 'starter'
          }),
        };
      }
    }

    const { medications, supplements } = JSON.parse(event.body || '{}');

    if (!medications || !supplements || !Array.isArray(medications) || !Array.isArray(supplements)) {
      logPhase(FUNCTION_NAME, 'validation_failed', { reason: 'invalid_input' });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'medications and supplements arrays are required' }),
      };
    }

    logPhase(FUNCTION_NAME, 'generating_pdf', {
      medicationCount: medications.length,
      supplementCount: supplements.length
    });

    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    doc.fontSize(20).text('Supplement Safety Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(14).text('Medications:', { underline: true });
    medications.forEach(med => doc.fontSize(12).text(`• ${med}`));
    doc.moveDown();

    doc.fontSize(14).text('Supplements:', { underline: true });
    supplements.forEach(sup => doc.fontSize(12).text(`• ${sup}`));
    doc.moveDown();

    doc.fontSize(10).text('This report is for informational purposes only. Consult your healthcare provider.');

    doc.end();

    const pdfBuffer = await new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    if (profile.plan === 'starter') {
      await logPdfGeneration(supabase, profile.user_email);
    }

    logPhase(FUNCTION_NAME, 'done', { pdfSize: pdfBuffer.length, success: true });

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="supplement-report.pdf"',
      },
      body: pdfBuffer.toString('base64'),
      isBase64Encoded: true,
    };

  } catch (error) {
    logPhase(FUNCTION_NAME, 'uncaught_error', {
      error: error.message,
      stack: error.stack
    });

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
    };
  }
};
