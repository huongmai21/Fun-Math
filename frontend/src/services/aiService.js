import axios from 'axios';

export const solveWithAI = async (image) => {
  try {
    const ocrResponse = await axios.post('https://vision.googleapis.com/v1/images:annotate', {
      requests: [
        {
          image: { content: image.split(',')[1] },
          features: [{ type: 'TEXT_DETECTION' }],
        },
      ],
    }, {
      headers: { Authorization: `Bearer YOUR_GOOGLE_VISION_API_KEY` },
    });
    const problemText = ocrResponse.data.responses[0].fullTextAnnotation.text;

    const wolframResponse = await axios.get('https://api.wolframalpha.com/v2/query', {
      params: {
        input: problemText,
        appid: 'YOUR_WOLFRAM_ALPHA_APP_ID',
        output: 'json',
      },
    });
    const solution = wolframResponse.data.queryresult.pods.find((pod) => pod.title === 'Solution')?.subpods[0]?.plaintext || 'Không tìm thấy kết quả';
    return solution;
  } catch (error) {
    throw new Error('Lỗi khi giải bài: ' + error.message);
  }
};