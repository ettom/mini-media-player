import { LitElement, html, css } from 'lit-element';

import getLabel from '../utils/getLabel';

class MiniMediaPlayerTts extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  get label() {
    return getLabel(this.hass, 'ui.card.media_player.text_to_speak', 'Say');
  }

  get input() {
    return this.shadowRoot.getElementById('tts-input');
  }

  get message() {
    return this.input.value;
  }

  render() {
    return html`
      <paper-input id="tts-input" class='mmp-tts__input'
        no-label-float
        placeholder=${this.label}...
        @click=${e => e.stopPropagation()}>
      </paper-input>
      <div>
        <mwc-button class='mmp-tts__button' @click=${this.handleTts}>
          SEND
        </mwc-button>
      </div>
    `;
  }

  handleTts(e) {
    const { config, message } = this;
    const opts = {
      message,
      entity_id: config.entity_id || this.entity,
    };
    if (config.language) opts.language = config.language;
    if (config.platform === 'alexa')
      this.hass.callService('notify', 'alexa_media', {
        message,
        data: { type: config.type || 'tts' },
        target: opts.entity_id,
      });
    else if (config.platform === 'sonos')
      this.hass.callService('script', 'sonos_say', {
        sonos_entity: opts.entity_id,
        volume: config.volume || 0.5,
        message,
      });
    else if (config.platform === 'ga')
      this.hass.callService('notify', 'ga_broadcast', { message });
    else
      this.hass.callService('tts', `${config.platform}_say`, opts);
    e.stopPropagation();
    this.reset();
  }

  reset() {
    this.input.value = '';
  }

  static get styles() {
    return css`
      :host {
        align-items: center;
        margin-left: 8px;
        display: flex;
      }
      .mmp-tts__input {
        cursor: text;
        flex: 1;
        margin-right: 8px;
        --paper-input-container-input: {
          font-size: 1em;
        };
      }
      ha-card[rtl] .mmp-tts__input {
        margin-right: auto;
        margin-left: 8px;
      }
      .mmp-tts__button {
        margin: 0;
        padding: .4em;
      }
      paper-input {
        opacity: .75;
        --paper-input-container-color: var(--primary-text-color);
        --paper-input-container-focus-color: var(--primary-text-color);
        --paper-input-container: {
          padding: 0;
        };
      }
      paper-input[focused] {
        opacity: 1;
      }

      ha-card[artwork*='cover'][has-artwork] paper-input {
        --paper-input-container-focus-color: #FFFFFF;
      }
      ha-card[artwork*='cover'][has-artwork] paper-input {
        --paper-input-container-color: #FFFFFF;
        --paper-input-container-input-color: #FFFFFF;
      }
    `;
  }
}

customElements.define('mmp-tts', MiniMediaPlayerTts);