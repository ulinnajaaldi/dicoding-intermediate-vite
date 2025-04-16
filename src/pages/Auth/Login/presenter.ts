interface LoginView {
  showSubmitLoadingButton(): void;
  hideSubmitLoadingButton(): void;
  loginFailed(message: string): void;
  loginSuccessfully(message: string): void;
}

interface LoginModel {
  getLogin(credentials: { email: string; password: string }): Promise<{
    ok: boolean;
    message: string;
    data: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJzLXMwZkhPY1VrX1M4RkM2cDIiLCJlbWFpbCI6InRlc3QyQGdtYWlsLmNvbSIsImlhdCI6MTc0NDgxNTAwM30.vZyoU4tF5-JrxFnMO3ooieZnT5BZ3Teg163iwkmlBkA';
    };
  }>;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthModel {
  putAccessToken(accessToken: string): void;
}

export default class LoginPresenter {
  #view: LoginView;
  #model: LoginModel;
  #authModel: AuthModel;

  constructor({
    view,
    model,
    authModel,
  }: {
    view: LoginView;
    model: LoginModel;
    authModel: AuthModel;
  }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  async getLogin({ email, password }: LoginCredentials): Promise<void> {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.getLogin({ email, password });

      if (!response.ok) {
        console.error('getLogin: response:', response);
        this.#view.loginFailed(response.message);
        return;
      }

      this.#authModel.putAccessToken(response.data.accessToken);

      this.#view.loginSuccessfully(response.message);
    } catch (error) {
      console.error('getLogin: error:', error);
      this.#view.loginFailed((error as Error).message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
