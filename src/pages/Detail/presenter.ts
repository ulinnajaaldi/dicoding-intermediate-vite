import { StoryMapper, storyMapper } from '../../data/api-mapper';
import { IStory } from '../../types/api';

interface DetailView {
  showLoading(): void;
  hideLoading(): void;
  initialMap(): Promise<void>;
  populateStoryError(message: string): void;
  populateStory(message: string, story: StoryMapper): void;
}

interface DetailModel {
  getDetailStory(storyId: string): Promise<{
    ok: boolean;
    message: string;
    story: IStory;
  }>;
}

export default class DetailPresenter {
  #storyId: string;
  #view: DetailView;
  #model: DetailModel;

  constructor(storyId: string, { view, model }: { view: DetailView; model: DetailModel }) {
    this.#storyId = storyId;
    this.#view = view;
    this.#model = model;
  }

  async initialStory() {
    this.#view.showLoading();
    try {
      const response = await this.#model.getDetailStory(this.#storyId);
      if (!response.ok) {
        console.error('initialStory: error:', response);
        this.#view.populateStoryError(response.message);
        return;
      }

      const story = await storyMapper(response.story);
      this.#view.populateStory(response.message, story);

      // Initialize map AFTER the story content (with map container) is populated
      await this.#view.initialMap();
    } catch (error) {
      console.log('initialStory: error:', error);
      this.#view.populateStoryError((error as Error).message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
