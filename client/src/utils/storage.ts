// Simple in-memory storage for session data
class SessionStorage {
  private reports: any[] = [];
  private predictions: any[] = [
    {
      _id: 'pred_1',
      disease: 'Melanoma',
      confidence: 87,
      timestamp: new Date().toISOString(),
      imageUrl: 'https://via.placeholder.com/150'
    }
  ];

  addReport(report: any) {
    this.reports.push(report);
  }

  getReports() {
    return this.reports;
  }

  getPredictions() {
    return this.predictions;
  }

  addPrediction(prediction: any) {
    this.predictions.push(prediction);
  }
}

export const sessionStorage = new SessionStorage();