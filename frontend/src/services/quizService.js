// Định nghĩa các hàm gọi API backend
export const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  };
  
  // Thêm các hàm khác như submitAnswers, getResults, etc.