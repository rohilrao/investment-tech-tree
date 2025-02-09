import { HfInference } from '@huggingface/inference';

export async function createEmbedding(
  inputs: string,
): Promise<number[] | null> {
  try {
    if (inputs.length === 0) return null;

    const inference = new HfInference(process.env.HUGGINGFACEHUB_API_TOKEN);

    const result = await inference.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs,
    });

    return result as number[];
  } catch (error) {
    throw new Error('Failed to embed text', { cause: error });
  }
}
