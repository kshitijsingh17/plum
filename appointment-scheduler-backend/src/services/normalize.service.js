const chrono = require('chrono-node');
const moment = require('moment-timezone');
const APP_TZ = process.env.TZ || 'Asia/Kolkata';

// Heuristic confidence scoring
const scoreDatePhrase = (phrase, parsedDate) => {
  if (!parsedDate) return 0;
  // Numeric dates are very confident
  if (/\d{1,2}[\/\-]\d{1,2}([\/\-]\d{2,4})?/.test(phrase)) return 0.95;
  // Explicit weekday or relative term
  if (/next|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday/i.test(phrase)) return 0.85;
  // Anything else
  return 0.7;
};

const scoreTimePhrase = (phrase, parsedTime) => {
  if (!parsedTime) return 0;
  // Exact numeric time
  if (/\d{1,2}(:\d{2})?\s?(am|pm)?/i.test(phrase)) return 0.95;
  // Fuzzy words
  if (/morning|afternoon|evening|noon|night/i.test(phrase)) return 0.8;
  // Anything else
  return 0.7;
};

exports.normalize = async (entities) => {
  try {
    if (!entities || typeof entities !== 'object') {
      return {
        status: 'needs_clarification',
        message: 'Missing or invalid entities input'
      };
    }

    const { date_phrase, time_phrase } = entities;
    if (!date_phrase && !time_phrase) {
      return {
        status: 'needs_clarification',
        message: 'Missing date_phrase and time_phrase'
      };
    }

    let date = null;
    let time = null;
    let tz = APP_TZ;

    let dateConfidence = 0;
    let timeConfidence = 0;

    // Parse date
    if (date_phrase) {
      const parsedDate = chrono.parseDate(date_phrase);
      if (parsedDate) {
        date = parsedDate.toISOString().split('T')[0];
        dateConfidence = scoreDatePhrase(date_phrase, parsedDate);
      } else {
        return {
          status: 'needs_clarification',
          message: `Unable to parse date_phrase: "${date_phrase}"`
        };
      }
    }

    // Parse time
    if (time_phrase) {
      const parsedTime = chrono.parseDate(time_phrase);
      if (parsedTime) {
        const m = moment(parsedTime).tz(tz);
        time = m.format('HH:mm');
        timeConfidence = scoreTimePhrase(time_phrase, parsedTime);
      } else {
        return {
          status: 'needs_clarification',
          message: `Unable to parse time_phrase: "${time_phrase}"`
        };
      }
    }

    // Overall confidence: average of date and time
    const normalization_confidence = dateConfidence && timeConfidence
      ? (dateConfidence + timeConfidence) / 2
      : dateConfidence || timeConfidence;

    return {
      normalized: { date, time, tz },
      normalization_confidence
    };

  } catch (err) {
    return {
      status: 'needs_clarification',
      message: `Normalization failed: ${err.message}`
    };
  }
};
