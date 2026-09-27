# Asset and code provenance

Only the following third-party materials are distributed:

| Material | Source | Terms / local notice |
| --- | --- | --- |
| The Starry Night (1889), Vincent van Gogh | [Google Art Project reproduction on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg) | Public-domain painting and reproduction; local desktop/mobile WebP derivatives |
| Oak Veneer 01 color texture | [Poly Haven](https://polyhaven.com/a/oak_veneer_01) | CC0; compressed WebP color derivative |
| Flow direction field | [DomonJi/InteractiveStarryNight](https://github.com/DomonJi/InteractiveStarryNight) | MIT, copyright 2016 Domon; `assets/starry-gallery/INTERACTIVE-STARRY-NIGHT-LICENSE.txt` |
| Three.js | [mrdoob/three.js](https://github.com/mrdoob/three.js) | MIT; `assets/THREE-LICENSE.txt`; bundled into `assets/museum.js` |

`starry-flow-map.png` is an encoded derivative of the upstream flow direction field. The JavaScript shader uses that field to warp the complete painting, not to add particles on top. This is not Petros Vrellis's implementation.

The oak moulding geometry, frame/iframe projection, transitions, exhibit layout, CSS illustrations, icon and fictional content are template code. No user-branded raster illustrations, personal project screenshots, API application code, AGPL dialog components, custom fonts or tracking scripts are included.

Retain these notices when redistributing. Replacing assets requires checking the replacement asset's terms separately.
