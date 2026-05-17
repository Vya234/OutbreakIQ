import { generateWithGemma } from '../services/gemmaService.js';
import {
  formatOutbreaksForAI,
  getRelevantOutbreaks,
} from '../services/outbreakContextService.js';
import { outbreakRepo } from '../services/outbreakRepository.js';

export async function chat(req, res) {
  const { message, outbreakId } = req.body;

  if (!message?.trim()) {
    const err = new Error('message is required');
    err.statusCode = 400;
    throw err;
  }

  const outbreaks = await getRelevantOutbreaks(message, outbreakId);
  const contextText = formatOutbreaksForAI(outbreaks);
  const result = await generateWithGemma({
    userMessage: message.trim(),
    contextText,
    outbreaks,
    mode: 'chat',
  });

  res.json({
    success: true,
    data: {
      reply: result.text,
      provider: result.provider,
      fallback: result.fallback,
      contextCount: outbreaks.length,
    },
  });
}

export async function recommendations(req, res) {
  const { outbreakId, disease } = req.body;

  let outbreaks;
  if (outbreakId) {
    const one = await outbreakRepo.findById(outbreakId);
    outbreaks = one ? [one] : [];
  } else if (disease) {
    outbreaks = await outbreakRepo.find({ disease: new RegExp(disease, 'i') }, null, 5);
  } else {
    outbreaks = await outbreakRepo.find({ severity: 'high' }, null, 5);
  }

  if (!outbreaks.length) {
    const err = new Error('No matching outbreak found for recommendations');
    err.statusCode = 404;
    throw err;
  }

  const contextText = formatOutbreaksForAI(outbreaks);
  const target = outbreaks[0];
  const userMessage = `Provide prevention recommendations for ${target.disease} in ${target.location}.`;

  const result = await generateWithGemma({
    userMessage,
    contextText,
    outbreaks,
    mode: 'recommendations',
  });

  res.json({
    success: true,
    data: {
      outbreak: target,
      recommendations: result.text,
      provider: result.provider,
      fallback: result.fallback,
    },
  });
}
