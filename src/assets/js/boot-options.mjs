import {html, LitElement} from 'lit-element';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap';

import '../scss/style.scss';
import './components/sign-in-page.mjs';
import './components/signed-in-page.mjs';

export class OptionsPage extends LitElement {
  static properties = {
    signedIn: {type: Boolean},
  };

  constructor() {
    super();
    this.signedIn = false;
  }

  createRenderRoot() {
    return this;
  }

  signOut() {
    this.signedIn = false;
  }

  signIn() {
    this.signedIn = true;
  }

  render() {
    return html`
      <div class="container">
        <div class='container container-small'>
          <div class='mb-5 mt-5 text-center'>
            <img src='assets/images/screenly-logo-128.png' width='64'>
          </div>
          <sign-in
            ?hidden=${this.signedIn}
            @sign-in=${this.signIn}
          ></sign-in>
          <signed-in
            ?hidden=${!this.signedIn}
            @sign-out=${this.signOut}
          ></signed-in>
        </div>
      </div>
    `;
  }
}
customElements.define('options-root', OptionsPage);
