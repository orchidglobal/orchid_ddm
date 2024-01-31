import * as dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.secret' });

async function Translator (value, parameters) {
  const translateModule = await import('translate');
  const translate = translateModule.default;
  parameters.key = process.env.API_KEY_GTRANSLATE;
  return await translate(value, parameters);
};

export default Translator;
