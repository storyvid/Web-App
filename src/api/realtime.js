// Real-time API module
export default function createRealtimeAPI(firebaseService) {
  return {
    // Subscribe to real-time changes
    subscribeToChanges(collection, callback) {
      return firebaseService.subscribeToCollection(collection, callback);
    }
  };
}