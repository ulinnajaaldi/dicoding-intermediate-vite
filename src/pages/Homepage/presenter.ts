import { IStory } from '../../types/api';

type HomeView = {
  showLoading(): void;
  hideLoading(): void;
  populateStoriesListError(message: string): void;
  populateStoriesList(message: string, listStory: IStory[]): void;
};

type HomeModel = {
  getAllStories: () => Promise<{
    ok: boolean;
    message: string;
    listStory: IStory[];
  }>;
};

export default class HomePresenter {
  #view: HomeView;
  #model: HomeModel;

  constructor({ view, model }: { view: HomeView; model: HomeModel }) {
    this.#view = view;
    this.#model = model;
  }

  async initialStories() {
    this.#view.showLoading();
    try {
      const response = await this.#model.getAllStories();
      if (!response.ok) {
        this.#view.populateStoriesListError(response.message);
        return;
      }

      this.#view.populateStoriesList(response.message, response.listStory);
    } catch (error) {
      console.log('initialStories: error:', error);
      this.#view.populateStoriesListError((error as Error).message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
