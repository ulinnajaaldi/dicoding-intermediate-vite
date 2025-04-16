export default class HomePage {
  async render() {
    return `
    <div class="container min-h-[100svh] flex items-center justify-center">
        <h1>HomePage</h1>
    </div>
        `;
  }

  async afterRender() {
    // TODO: Implement afterRender later
  }
}
