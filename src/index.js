/**
 * Build styles
 */
require('./index.css').toString();

/**
 * SimpleVideo Tool for the Editor.js
 * Works only with pasted video URLs and requires no server-side uploader.
 *
 * @typedef {object} SimpleVideoData
 * @description Tool's input and output data format
 * @property {string} url — video URL
 * @property {string} caption — video caption
 * @property {boolean} withBorder - should video be rendered with border
 * @property {boolean} withBackground - should video be rendered with background
 * @property {boolean} stretched - should video be stretched to full width of container
 */
class SimpleVideo {
  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {{data: SimpleVideoData, config: object, api: object}}
   *   data — previously saved data
   *   config - user config for Tool
   *   api - Editor.js API
   */
  constructor({data, config, api}) {
    /**
     * Editor.js API
     */
    this.api = api;

    /**
     * When block is only constructing,
     * current block points to previous block.
     * So real block index will be +1 after rendering
     * @todo place it at the `rendered` event hook to get real block index without +1;
     * @type {number}
     */
    this.blockIndex = this.api.blocks.getCurrentBlockIndex() + 1;

    /**
     * Styles
     */
    this.CSS = {
      baseClass: this.api.styles.block,
      loading: this.api.styles.loader,
      input: this.api.styles.input,
      settingsButton: this.api.styles.settingsButton,
      settingsButtonActive: this.api.styles.settingsButtonActive,

      /**
       * Tool's classes
       */
      wrapper: 'cdx-simple-video',
      videoHolder: 'cdx-simple-video__picture',
      caption: 'cdx-simple-video__caption'
    };

    /**
     * Nodes cache
     */
    this.nodes = {
      wrapper: null,
      videoHolder: null,
      video: null,
      caption: null
    };

    /**
     * Tool's initial data
     */
    this.data = {
      url: data.url || '',
      caption: data.caption || '',
      controls: data.controls !== undefined ? data.controls : false,
      withBorder: data.withBorder !== undefined ? data.withBorder : false,
      withBackground: data.withBackground !== undefined ? data.withBackground : false,
      stretched: data.stretched !== undefined ? data.stretched : false,
    };

    /**
     * Available Video settings
     */
    this.settings = [
      {
        name: 'withBorder',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M15.8 10.592v2.043h2.35v2.138H15.8v2.232h-2.25v-2.232h-2.4v-2.138h2.4v-2.28h2.25v.237h1.15-1.15zM1.9 8.455v-3.42c0-1.154.985-2.09 2.2-2.09h4.2v2.137H4.15v3.373H1.9zm0 2.137h2.25v3.325H8.3v2.138H4.1c-1.215 0-2.2-.936-2.2-2.09v-3.373zm15.05-2.137H14.7V5.082h-4.15V2.945h4.2c1.215 0 2.2.936 2.2 2.09v3.42z"/></svg>`
      },
      {
        name: 'stretched',
        icon: `<svg width="17" height="10" viewBox="0 0 17 10" xmlns="http://www.w3.org/2000/svg"><path d="M13.568 5.925H4.056l1.703 1.703a1.125 1.125 0 0 1-1.59 1.591L.962 6.014A1.069 1.069 0 0 1 .588 4.26L4.38.469a1.069 1.069 0 0 1 1.512 1.511L4.084 3.787h9.606l-1.85-1.85a1.069 1.069 0 1 1 1.512-1.51l3.792 3.791a1.069 1.069 0 0 1-.475 1.788L13.514 9.16a1.125 1.125 0 0 1-1.59-1.591l1.644-1.644z"/></svg>`
      },
      {
        name: 'withBackground',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.043 8.265l3.183-3.183h-2.924L4.75 10.636v2.923l4.15-4.15v2.351l-2.158 2.159H8.9v2.137H4.7c-1.215 0-2.2-.936-2.2-2.09v-8.93c0-1.154.985-2.09 2.2-2.09h10.663l.033-.033.034.034c1.178.04 2.12.96 2.12 2.089v3.23H15.3V5.359l-2.906 2.906h-2.35zM7.951 5.082H4.75v3.201l3.201-3.2zm5.099 7.078v3.04h4.15v-3.04h-4.15zm-1.1-2.137h6.35c.635 0 1.15.489 1.15 1.092v5.13c0 .603-.515 1.092-1.15 1.092h-6.35c-.635 0-1.15-.489-1.15-1.092v-5.13c0-.603.515-1.092 1.15-1.092z"/></svg>`
      },
      {
        name: 'controls',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M15.54 5.54L13.77 7.3 12 5.54 10.23 7.3 8.46 5.54 12 2zm2.92 10l-1.76-1.77L18.46 12l-1.76-1.77 1.76-1.77L22 12zm-10 2.92l1.77-1.76L12 18.46l1.77-1.76 1.77 1.76L12 22zm-2.92-10l1.76 1.77L5.54 12l1.76 1.77-1.76 1.77L2 12z"/><circle cx="12" cy="12" r="3"/><path fill="none" d="M0 0h24v24H0z"/></svg>`
      }
    ];
  }

  /**
   * Creates a Block:
   *  1) Show preloader
   *  2) Start to load an video
   *  3) After loading, append video and caption input
   * @public
   */
  render() {
    let wrapper = this._make('div', [this.CSS.baseClass, this.CSS.wrapper]),
        loader = this._make('div', this.CSS.loading),
        videoHolder = this._make('div', this.CSS.videoHolder),
        video = this._make('video'),
        caption = this._make('div', [this.CSS.input, this.CSS.caption], {
          contentEditable: 'true',
          innerHTML: this.data.caption || ''
        });

    //caption.dataset.placeholder = 'Enter a caption';
    wrapper.appendChild(loader);

    if (this.data.url) {
      video.src = this.data.url;
      video.controls = this.data.controls;
    }

    video.onloadstart = () => {
      wrapper.classList.remove(this.CSS.loading);
      videoHolder.appendChild(video);
      wrapper.appendChild(videoHolder);
      wrapper.appendChild(caption);
      loader.remove();
      this._acceptTuneView();
    };

    video.onerror = (e) => {
      // @todo use api.Notifies.show() to show error notification
      console.log('Failed to load the video', e);
    };

    this.nodes.videoHolder = videoHolder;
    this.nodes.wrapper = wrapper;
    this.nodes.video = video;
    this.nodes.caption = caption;

    return wrapper;
  }

  /**
   * @public
   * Saving method
   * @param {Element} blockContent - Tool's wrapper
   * @return {SimpleVideoData}
   */
  save(blockContent) {
    let video = blockContent.querySelector('video'),
      caption = blockContent.querySelector('.' + this.CSS.input);

    if (!video) {
      return this.data;
    }

    return Object.assign(this.data, {
      url: video.src,
      caption: caption.innerHTML
    });
  }

  /**
   * Sanitizer rules
   */
  static get sanitize() {
    return {
      url: {},
      withBorder: {},
      withBackground: {},
      stretched: {},
      controls: {},
      caption: {
        br: true,
      },
    };
  }

  /**
   * Read pasted video and convert it to base64
   *
   * @static
   * @param {File} file
   * @returns {Promise<SimpleVideoData>}
   */
  onDropHandler(file) {
    return new Promise((resolve, reject) => {
      resolve({
        url: URL.createObjectURL(file),
        caption: file.name
      });
    });
  }

  /**
   * On paste callback that is fired from Editor.
   *
   * @param {PasteEvent} event - event with pasted config
   */
  onPaste(event) {
    switch (event.type) {
      case 'tag':
        const video = event.detail.data;

        this.data = {
          url: video.src,
        };
        break;

      case 'pattern':
        const {data: text} = event.detail;

        this.data = {
          url: text,
        };
        break;

      case 'file':
        const {file} = event.detail;

        this.onDropHandler(file)
          .then(data => {
            this.data = data;
          });

        break;
    }
  }

  /**
   * Returns video data
   * @return {SimpleVideoData}
   */
  get data() {
    return this._data;
  }

  /**
   * Set video data and update the view
   *
   * @param {SimpleVideoData} data
   */
  set data(data) {
    this._data = Object.assign({}, this.data, data);

    if (this.nodes.video) {
      this.nodes.video.src = this.data.url;
      this.nodes.video.controls = this.data.controls;
    }

    if (this.nodes.caption) {
      this.nodes.caption.innerHTML = this.data.caption;
    }
  }

  /**
   * Specify paste substitutes
   * @see {@link ../../../docs/tools.md#paste-handling}
   * @public
   */
  static get pasteConfig() {
    return {
      patterns: {
        video: /https?:\/\/\S+\.(mp4|webm)$/i
      },
      tags: [ 'video' ],
      files: {
        mimeTypes: [ 'video/*' ]
      },
    };
  }

  /**
   * Makes buttons with tunes: add background, add border, stretch video
   * @return {HTMLDivElement}
   */
  renderSettings() {
    let wrapper = document.createElement('div');

    this.settings.forEach( tune => {
      let el = document.createElement('div');

      el.classList.add(this.CSS.settingsButton);
      el.innerHTML = tune.icon;

      el.addEventListener('click', () => {
        this._toggleTune(tune.name);
        el.classList.toggle(this.CSS.settingsButtonActive);
      });

      el.classList.toggle(this.CSS.settingsButtonActive, this.data[tune.name]);

      wrapper.appendChild(el);
    });
    return wrapper;
  };

  /**
   * Helper for making Elements with attributes
   *
   * @param  {string} tagName           - new Element tag name
   * @param  {array|string} classNames  - list or name of CSS classname(s)
   * @param  {Object} attributes        - any attributes
   * @return {Element}
   */
  _make(tagName, classNames = null, attributes = {}) {
    let el = document.createElement(tagName);

    if ( Array.isArray(classNames) ) {
      el.classList.add(...classNames);
    } else if( classNames ) {
      el.classList.add(classNames);
    }

    for (let attrName in attributes) {
      el[attrName] = attributes[attrName];
    }

    return el;
  }

  /**
   * Click on the Settings Button
   * @private
   */
  _toggleTune(tune) {
    this.data[tune] = !this.data[tune];
    this._acceptTuneView();
  }

  /**
   * Add specified class corresponds with activated tunes
   * @private
   */
  _acceptTuneView() {
    this.settings.forEach( tune => {
      this.nodes.videoHolder.classList.toggle(this.CSS.videoHolder + '--' + tune.name.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`), !!this.data[tune.name]);

      if (tune.name === 'stretched') {
        this.api.blocks.stretchBlock(this.blockIndex, !!this.data.stretched);
      }

      if (tune.name === 'control') {
        this.nodes.video.controls = this.data.controls;
      }
    });
  }
}

module.exports = SimpleVideo;
