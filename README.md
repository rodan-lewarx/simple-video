![](https://badgen.net/badge/Editor.js/v2.0/blue)

# Simple Video Tool

Provides Video Blocks for the [Editor.js](https://editorjs.io).

Works only with pasted image URLs and requires no server-side uploader.

![](assets/image-uploading.gif)

## Installation

### Install via NPM

Get the package

```shell
npm i --save-dev simple-video
```

Include module at your application

```javascript
const SimpleImage = require('simple-video-editorjs');
```

### Download to your project's source dir

1. Upload folder `dist` from repository
2. Add `dist/bundle.js` file to your page.

### Load from CDN

You can load specific version of package from [jsDelivr CDN](https://www.jsdelivr.com/package/npm/simple-video-editorjs).

`https://cdn.jsdelivr.net/npm/@editorjs/simple-image@latest`

Then require this script on page with Editor.js.

```html
<script src="..."></script>
```

## Usage

Add a new Tool to the `tools` property of the Editor.js initial config.

```javascript
var editor = EditorJS({
  ...
  
  tools: {
    ...
    video: SimpleVideo,
  }
  
  ...
});
```

## Config Params

This Tool has no config params

## Tool's settings

![](https://capella.pics/c74cdeec-3405-48ac-a960-f784188cf9b4.jpg)

1. Add border

2. Stretch to full-width

3. Add background

## Output data

| Field          | Type      | Description                     |
| -------------- | --------- | ------------------------------- |
| url            | `string`  | video's url                     |
| caption        | `string`  | video's caption                 |
| withBorder     | `boolean` | add border to video             |
| withBackground | `boolean` | need to add background          |
| stretched      | `boolean` | stretch video to screen's width |


```json
{
    "type" : "video",
    "data" : {
        "url" : "https://www.tesla.com/tesla_theme/assets/img/_vehicle_redesign/roadster_and_semi/roadster/hero.jpg",
        "caption" : "Roadster // tesla.com",
        "withBorder" : false,
        "withBackground" : false,
        "stretched" : true
    }
}
```
