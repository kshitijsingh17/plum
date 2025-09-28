

const fetch = require("node-fetch");

exports.extractEntities = async (rawText) => {
  try {
    // Guardrail: input validation
    if (!rawText || typeof rawText !== "string" || rawText.trim().length === 0) {
      return {
        status: "needs_clarification",
        message: "Missing or empty raw_text input",
      };
    }

    const text = rawText.trim();

    // --- Department extraction using BART zero-shot classification ---
    const hfApiUrl = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";
    const candidateLabels = ["dentist", "cardiology", "dermatology", "general", "pediatrics"];

    const response = await fetch(hfApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        parameters: { candidate_labels: candidateLabels },
      }),
    });

    const data = await response.json();

    // Guardrail: check BART output
    if (!data || !data.labels || !data.scores || data.labels.length === 0 || data.scores.length === 0) {
      return {
        status: "needs_clarification",
        message: "Department extraction failed: invalid BART output",
      };
    }

    const department = data.labels[0];
    const department_conf = data.scores[0];

    // --- Date and time phrase extraction (basic heuristics) ---
    const datePhraseMatch = text.match(/\b(next|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}\/\d{1,2}|\b\w+day)\b[^,\n]*/i);
    const timePhraseMatch = text.match(/(\d{1,2}:\d{2}\s?(am|pm)?)|(\d{1,2}\s?(am|pm))/i);

    const entities = {
      department,
      date_phrase: datePhraseMatch ? datePhraseMatch[0].trim() : null,
      time_phrase: timePhraseMatch ? timePhraseMatch[0].trim() : null,
    };

    return {
      entities,
      entities_confidence: department_conf
    };
  } catch (err) {
    return {
      status: "needs_clarification",
      message: `Entity extraction failed: ${err.message}`,
    };
  }
};

