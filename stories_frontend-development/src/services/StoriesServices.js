import apiClient from "./services";

export default {
  getStoryProperties() {
    return apiClient.get("storyProperties");
  },
  getStories() {
    return apiClient.get("stories");
  },
  getStoriesByUserId(userId) {
    return apiClient.get("stories/user/" + userId);
  },
  getStoryByStoryId(id) {
    return apiClient.get("stories/" + id);
  },
  addStory(story) {
    return apiClient.post("stories", story);
  },
  updateStory(storyId, story) {
    return apiClient.put("stories/" + storyId, story);
  },
  deleteStory(storyId) {
    return apiClient.delete("stories/" + storyId);
  },
  generateSequel(storyId) {
    return apiClient.get("stories/generateSequel/" + storyId);
  },
  characterSuggestions(userId) {
    return apiClient.get("stories/characterSuggestions/" + userId);
  },
};
