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

    let storyData;

    try {
      const response = await this.#model.getDetailStory(this.#storyId);
      if (!response.ok) {
        console.error('initialStory: error:', response);
        this.#view.populateStoryError(response.message);
        return;
      }

      storyData = await storyMapper(response.story);

      // First populate the story - this creates the map container in the DOM
      this.#view.populateStory('Success', storyData);

      // Then initialize the map after the container exists
      await this.#view.initialMap();
    } catch (error) {
      console.error('initialStory: error:', error);
      this.#view.populateStoryError((error as Error).message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
