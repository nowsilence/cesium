import buildModuleUrl from "../Core/buildModuleUrl.js";
import Cartesian3 from "../Core/Cartesian3.js";
import Clock from "../Core/Clock.js";
import defaultValue from "../Core/defaultValue.js";
import defined from "../Core/defined.js";
import destroyObject from "../Core/destroyObject.js";
import DeveloperError from "../Core/DeveloperError.js";
import Ellipsoid from "../Core/Ellipsoid.js";
import FeatureDetection from "../Core/FeatureDetection.js";
import formatError from "../Core/formatError.js";
import getElement from "../DataSources/getElement.js";
import Globe from "../Scene/Globe.js";
import ImageryLayer from "../Scene/ImageryLayer.js";
import Moon from "../Scene/Moon.js";
import Scene from "../Scene/Scene.js";
import SceneMode from "../Scene/SceneMode.js";
import ScreenSpaceEventHandler from "../Core/ScreenSpaceEventHandler.js";
import ShadowMode from "../Scene/ShadowMode.js";
import SkyAtmosphere from "../Scene/SkyAtmosphere.js";
import SkyBox from "../Scene/SkyBox.js";
import Sun from "../Scene/Sun.js";

function getDefaultSkyBoxUrl(suffix) {
  return buildModuleUrl(`Assets/Textures/SkyBox/tycho2t3_80_${suffix}.jpg`);
}

function startRenderLoop(widget) {
  widget._renderLoopRunning = true;

  let lastFrameTime = 0;
  function render(frameTime) {
    if (widget.isDestroyed()) {
      return;
    }

    if (widget._useDefaultRenderLoop) {
      try {
        const targetFrameRate = widget._targetFrameRate;
        if (!defined(targetFrameRate)) {
          widget.resize();
          widget.render();
          requestAnimationFrame(render);
        } else {
          const interval = 1000.0 / targetFrameRate;
          const delta = frameTime - lastFrameTime;

          if (delta > interval) {
            widget.resize();
            widget.render();
            lastFrameTime = frameTime - (delta % interval);
          }
          requestAnimationFrame(render);
        }
      } catch (error) {
        widget._useDefaultRenderLoop = false;
        widget._renderLoopRunning = false;
        if (widget._showRenderLoopErrors) {
          const title =
            "An error occurred while rendering.  Rendering has stopped.";
          widget.showErrorPanel(title, undefined, error);
        }
      }
    } else {
      widget._renderLoopRunning = false;
    }
  }

  requestAnimationFrame(render);
}

function configurePixelRatio(widget) {
  let pixelRatio = widget._useBrowserRecommendedResolution
    ? 1.0
    : window.devicePixelRatio;
  pixelRatio *= widget._resolutionScale;
  if (defined(widget._scene)) {
    widget._scene.pixelRatio = pixelRatio;
  }

  return pixelRatio;
}

function configureCanvasSize(widget) {
  const canvas = widget._canvas;
  let width = canvas.clientWidth;
  let height = canvas.clientHeight;
  const pixelRatio = configurePixelRatio(widget);

  widget._canvasClientWidth = width;
  widget._canvasClientHeight = height;

  width *= pixelRatio;
  height *= pixelRatio;

  canvas.width = width;
  canvas.height = height;

  widget._canRender = width !== 0 && height !== 0;
  widget._lastDevicePixelRatio = window.devicePixelRatio;
}

function configureCameraFrustum(widget) {
  const canvas = widget._canvas;
  const width = canvas.width;
  const height = canvas.height;
  if (width !== 0 && height !== 0) {
    const frustum = widget._scene.camera.frustum;
    if (defined(frustum.aspectRatio)) {
      frustum.aspectRatio = width / height;
    } else {
      frustum.top = frustum.right * (height / width);
      frustum.bottom = -frustum.top;
    }
  }
}

/**
 * A widget containing a Cesium scene.
 *
 * @alias CesiumWidget
 * @constructor
 *
 * @param {Element|string} container The DOM element or ID that will contain the widget.
 * @param {object} [options] Object with the following properties:
 * @param {Clock} [options.clock=new Clock()] The clock to use to control current time.
 * @param {ImageryLayer|false} [options.baseLayer=ImageryLayer.fromWorldImagery()] The bottommost imagery layer applied to the globe. If set to <code>false</code>, no imagery provider will be added.
 * @param {TerrainProvider} [options.terrainProvider=new EllipsoidTerrainProvider] The terrain provider.
 * @param {Terrain} [options.terrain] A terrain object which handles asynchronous terrain provider. Can only specify if options.terrainProvider is undefined.
 * @param {SkyBox| false} [options.skyBox] The skybox used to render the stars.  When <code>undefined</code>, the default stars are used. If set to <code>false</code>, no skyBox, Sun, or Moon will be added.
 * @param {SkyAtmosphere | false} [options.skyAtmosphere] Blue sky, and the glow around the Earth's limb.  Set to <code>false</code> to turn it off.
 * @param {SceneMode} [options.sceneMode=SceneMode.SCENE3D] The initial scene mode.
 * @param {boolean} [options.scene3DOnly=false] When <code>true</code>, each geometry instance will only be rendered in 3D to save GPU memory.
 * @param {boolean} [options.orderIndependentTranslucency=true] If true and the configuration supports it, use order independent translucency.
 * @param {MapProjection} [options.mapProjection=new GeographicProjection()] The map projection to use in 2D and Columbus View modes.
 * @param {Globe | false} [options.globe=new Globe(mapProjection.ellipsoid)] The globe to use in the scene.  If set to <code>false</code>, no globe will be added and the sky atmosphere will be hidden by default.
 * @param {boolean} [options.useDefaultRenderLoop=true] True if this widget should control the render loop, false otherwise.
 * @param {boolean} [options.useBrowserRecommendedResolution=true] If true, render at the browser's recommended resolution and ignore <code>window.devicePixelRatio</code>.
 * @param {number} [options.targetFrameRate] The target frame rate when using the default render loop.
 * @param {boolean} [options.showRenderLoopErrors=true] If true, this widget will automatically display an HTML panel to the user containing the error, if a render loop error occurs.
 * @param {ContextOptions} [options.contextOptions] Context and WebGL creation properties passed to {@link Scene}.
 * @param {Element|string} [options.creditContainer] The DOM element or ID that will contain the {@link CreditDisplay}.  If not specified, the credits are added
 *        to the bottom of the widget itself.
 * @param {Element|string} [options.creditViewport] The DOM element or ID that will contain the credit pop up created by the {@link CreditDisplay}.  If not specified, it will appear over the widget itself.
 * @param {boolean} [options.shadows=false] Determines if shadows are cast by light sources.
 * @param {ShadowMode} [options.terrainShadows=ShadowMode.RECEIVE_ONLY] Determines if the terrain casts or receives shadows from light sources.
 * @param {MapMode2D} [options.mapMode2D=MapMode2D.INFINITE_SCROLL] Determines if the 2D map is rotatable or can be scrolled infinitely in the horizontal direction.
 * @param {boolean} [options.blurActiveElementOnCanvasFocus=true] If true, the active element will blur when the viewer's canvas is clicked. Setting this to false is useful for cases when the canvas is clicked only for retrieving position or an entity data without actually meaning to set the canvas to be the active element.
 * @param {boolean} [options.requestRenderMode=false] If true, rendering a frame will only occur when needed as determined by changes within the scene. Enabling improves performance of the application, but requires using {@link Scene#requestRender} to render a new frame explicitly in this mode. This will be necessary in many cases after making changes to the scene in other parts of the API. See {@link https://cesium.com/blog/2018/01/24/cesium-scene-rendering-performance/|Improving Performance with Explicit Rendering}.
 * @param {number} [options.maximumRenderTimeChange=0.0] If requestRenderMode is true, this value defines the maximum change in simulation time allowed before a render is requested. See {@link https://cesium.com/blog/2018/01/24/cesium-scene-rendering-performance/|Improving Performance with Explicit Rendering}.
 * @param {number} [options.msaaSamples=1] If provided, this value controls the rate of multisample antialiasing. Typical multisampling rates are 2, 4, and sometimes 8 samples per pixel. Higher sampling rates of MSAA may impact performance in exchange for improved visual quality. This value only applies to WebGL2 contexts that support multisample render targets.
 *
 * @exception {DeveloperError} Element with id "container" does not exist in the document.
 *
 * @demo {@link https://sandcastle.cesium.com/index.html?src=Cesium%20Widget.html|Cesium Sandcastle Cesium Widget Demo}
 *
 * @example
 * // For each example, include a link to CesiumWidget.css stylesheet in HTML head,
 * // and in the body, include: <div id="cesiumContainer"></div>
 *
 * // Widget with no terrain and default Bing Maps imagery provider.
 * const widget = new Cesium.CesiumWidget("cesiumContainer");
 *
 * // Widget with ion imagery and Cesium World Terrain.
 * const widget2 = new Cesium.CesiumWidget("cesiumContainer", {
 *     baseLayer: Cesium.ImageryLayer.fromWorldTerrain(),
 *     terrain: Cesium.Terrain.fromWorldTerrain()
 *     skyBox: new Cesium.SkyBox({
 *       sources: {
 *         positiveX: "stars/TychoSkymapII.t3_08192x04096_80_px.jpg",
 *         negativeX: "stars/TychoSkymapII.t3_08192x04096_80_mx.jpg",
 *         positiveY: "stars/TychoSkymapII.t3_08192x04096_80_py.jpg",
 *         negativeY: "stars/TychoSkymapII.t3_08192x04096_80_my.jpg",
 *         positiveZ: "stars/TychoSkymapII.t3_08192x04096_80_pz.jpg",
 *         negativeZ: "stars/TychoSkymapII.t3_08192x04096_80_mz.jpg"
 *       }
 *     }),
 *     // Show Columbus View map with Web Mercator projection
 *     sceneMode: Cesium.SceneMode.COLUMBUS_VIEW,
 *     mapProjection: new Cesium.WebMercatorProjection()
 * });
 */
function CesiumWidget(container, options) {
  //>>includeStart('debug', pragmas.debug);
  if (!defined(container)) {
    throw new DeveloperError("container is required.");
  }
  //>>includeEnd('debug');

  container = getElement(container);

  options = defaultValue(options, defaultValue.EMPTY_OBJECT);

  //Configure the widget DOM elements
  const element = document.createElement("div");
  element.className = "cesium-widget";
  container.appendChild(element);

  const canvas = document.createElement("canvas");
  const supportsImageRenderingPixelated = FeatureDetection.supportsImageRenderingPixelated();
  this._supportsImageRenderingPixelated = supportsImageRenderingPixelated;
  if (supportsImageRenderingPixelated) {
    canvas.style.imageRendering = FeatureDetection.imageRenderingValue();
  }

  canvas.oncontextmenu = function () {
    return false;
  };
  canvas.onselectstart = function () {
    return false;
  };

  // Interacting with a canvas does not automatically blur the previously focused element.
  // This leads to unexpected interaction if the last element was an input field.
  // For example, clicking the mouse wheel could lead to the value in  the field changing
  // unexpectedly. The solution is to blur whatever has focus as soon as canvas interaction begins.
  // Although in some cases the active element needs to stay active even after interacting with the canvas,
  // for example when clicking on it only for getting the data of a clicked position or an entity.
  // For this case, the `blurActiveElementOnCanvasFocus` can be passed with false to avoid blurring
  // the active element after interacting with the canvas.
  function blurActiveElement() {
    if (canvas !== canvas.ownerDocument.activeElement) {
      canvas.ownerDocument.activeElement.blur();
    }
  }

  const blurActiveElementOnCanvasFocus = defaultValue(
    options.blurActiveElementOnCanvasFocus,
    true
  );

  if (blurActiveElementOnCanvasFocus) {
    canvas.addEventListener("mousedown", blurActiveElement);
    canvas.addEventListener("pointerdown", blurActiveElement);
  }

  element.appendChild(canvas);

  const innerCreditContainer = document.createElement("div");
  innerCreditContainer.className = "cesium-widget-credits";

  const creditContainer = defined(options.creditContainer)
    ? getElement(options.creditContainer)
    : element;
  creditContainer.appendChild(innerCreditContainer);

  const creditViewport = defined(options.creditViewport)
    ? getElement(options.creditViewport)
    : element;

  const showRenderLoopErrors = defaultValue(options.showRenderLoopErrors, true);

  const useBrowserRecommendedResolution = defaultValue(
    options.useBrowserRecommendedResolution,
    true
  );

  this._element = element;
  this._container = container;
  this._canvas = canvas;
  this._canvasClientWidth = 0;
  this._canvasClientHeight = 0;
  this._lastDevicePixelRatio = 0;
  this._creditViewport = creditViewport;
  this._creditContainer = creditContainer;
  this._innerCreditContainer = innerCreditContainer;
  this._canRender = false;
  this._renderLoopRunning = false;
  this._showRenderLoopErrors = showRenderLoopErrors;
  this._resolutionScale = 1.0;
  this._useBrowserRecommendedResolution = useBrowserRecommendedResolution;
  this._forceResize = false;
  this._clock = defined(options.clock) ? options.clock : new Clock();

  configureCanvasSize(this);

  try {
    const scene = new Scene({
      canvas: canvas,
      contextOptions: options.contextOptions,
      creditContainer: innerCreditContainer,
      creditViewport: creditViewport,
      mapProjection: options.mapProjection,
      orderIndependentTranslucency: options.orderIndependentTranslucency,
      scene3DOnly: defaultValue(options.scene3DOnly, false),
      shadows: options.shadows,
      mapMode2D: options.mapMode2D,
      requestRenderMode: options.requestRenderMode,
      maximumRenderTimeChange: options.maximumRenderTimeChange,
      depthPlaneEllipsoidOffset: options.depthPlaneEllipsoidOffset,
      msaaSamples: options.msaaSamples,
    });
    this._scene = scene;

    scene.camera.constrainedAxis = Cartesian3.UNIT_Z;

    configurePixelRatio(this);
    configureCameraFrustum(this);

    const ellipsoid = defaultValue(
      scene.mapProjection.ellipsoid,
      Ellipsoid.WGS84
    );

    let globe = options.globe;
    if (!defined(globe)) {
      globe = new Globe(ellipsoid);
    }
    if (globe !== false) {
      scene.globe = globe;
      scene.globe.shadows = defaultValue(
        options.terrainShadows,
        ShadowMode.RECEIVE_ONLY
      );
    }

    let skyBox = options.skyBox;
    if (!defined(skyBox)) {
      skyBox = new SkyBox({
        sources: {
          positiveX: getDefaultSkyBoxUrl("px"),
          negativeX: getDefaultSkyBoxUrl("mx"),
          positiveY: getDefaultSkyBoxUrl("py"),
          negativeY: getDefaultSkyBoxUrl("my"),
          positiveZ: getDefaultSkyBoxUrl("pz"),
          negativeZ: getDefaultSkyBoxUrl("mz"),
        },
      });
    }
    if (skyBox !== false) {
      scene.skyBox = skyBox;
      scene.sun = new Sun();
      scene.moon = new Moon();
    }

    // Blue sky, and the glow around the Earth's limb.
    let skyAtmosphere = options.skyAtmosphere;
    if (!defined(skyAtmosphere)) {
      skyAtmosphere = new SkyAtmosphere(ellipsoid);
      skyAtmosphere.show = options.globe !== false && globe.show;
    }
    if (skyAtmosphere !== false) {
      scene.skyAtmosphere = skyAtmosphere;
    }

    // Set the base imagery layer
    let baseLayer = options.baseLayer;
    if (options.globe !== false && baseLayer !== false) {
      if (!defined(baseLayer)) {
        baseLayer = ImageryLayer.fromWorldImagery();
      }
      scene.imageryLayers.add(baseLayer);
    }

    // Set the terrain provider if one is provided.
    if (defined(options.terrainProvider) && options.globe !== false) {
      scene.terrainProvider = options.terrainProvider;
    }

    if (defined(options.terrain) && options.globe !== false) {
      //>>includeStart('debug', pragmas.debug);
      if (defined(options.terrainProvider)) {
        throw new DeveloperError(
          "Specify either options.terrainProvider or options.terrain."
        );
      }
      //>>includeEnd('debug')

      scene.setTerrain(options.terrain);
    }

    this._screenSpaceEventHandler = new ScreenSpaceEventHandler(canvas);

    if (defined(options.sceneMode)) {
      if (options.sceneMode === SceneMode.SCENE2D) {
        this._scene.morphTo2D(0);
      }
      if (options.sceneMode === SceneMode.COLUMBUS_VIEW) {
        this._scene.morphToColumbusView(0);
      }
    }

    this._useDefaultRenderLoop = undefined;
    this.useDefaultRenderLoop = defaultValue(
      options.useDefaultRenderLoop,
      true
    );

    this._targetFrameRate = undefined;
    this.targetFrameRate = options.targetFrameRate;

    const that = this;
    this._onRenderError = function (scene, error) {
      that._useDefaultRenderLoop = false;
      that._renderLoopRunning = false;
      if (that._showRenderLoopErrors) {
        const title =
          "An error occurred while rendering.  Rendering has stopped.";
        that.showErrorPanel(title, undefined, error);
      }
    };
    scene.renderError.addEventListener(this._onRenderError);
  } catch (error) {
    if (showRenderLoopErrors) {
      const title = "Error constructing CesiumWidget.";
      const message =
        'Visit <a href="http://get.webgl.org">http://get.webgl.org</a> to verify that your web browser and hardware support WebGL.  Consider trying a different web browser or updating your video drivers.  Detailed error information is below:';
      this.showErrorPanel(title, message, error);
    }
    throw error;
  }
}

Object.defineProperties(CesiumWidget.prototype, {
  /**
   * Gets the parent container.
   * @memberof CesiumWidget.prototype
   *
   * @type {Element}
   * @readonly
   */
  container: {
    get: function () {
      return this._container;
    },
  },

  /**
   * Gets the canvas.
   * @memberof CesiumWidget.prototype
   *
   * @type {HTMLCanvasElement}
   * @readonly
   */
  canvas: {
    get: function () {
      return this._canvas;
    },
  },

  /**
   * Gets the credit container.
   * @memberof CesiumWidget.prototype
   *
   * @type {Element}
   * @readonly
   */
  creditContainer: {
    get: function () {
      return this._creditContainer;
    },
  },

  /**
   * Gets the credit viewport
   * @memberof CesiumWidget.prototype
   *
   * @type {Element}
   * @readonly
   */
  creditViewport: {
    get: function () {
      return this._creditViewport;
    },
  },

  /**
   * Gets the scene.
   * @memberof CesiumWidget.prototype
   *
   * @type {Scene}
   * @readonly
   */
  scene: {
    get: function () {
      return this._scene;
    },
  },

  /**
   * Gets the collection of image layers that will be rendered on the globe.
   * @memberof CesiumWidget.prototype
   *
   * @type {ImageryLayerCollection}
   * @readonly
   */
  imageryLayers: {
    get: function () {
      return this._scene.imageryLayers;
    },
  },

  /**
   * The terrain provider providing surface geometry for the globe.
   * @memberof CesiumWidget.prototype
   *
   * @type {TerrainProvider}
   */
  terrainProvider: {
    get: function () {
      return this._scene.terrainProvider;
    },
    set: function (terrainProvider) {
      this._scene.terrainProvider = terrainProvider;
    },
  },

  /**
   * Manages the list of credits to display on screen and in the lightbox.
   * @memberof CesiumWidget.prototype
   *
   * @type {CreditDisplay}
   */
  creditDisplay: {
    get: function () {
      return this._scene.frameState.creditDisplay;
    },
  },

  /**
   * Gets the camera.
   * @memberof CesiumWidget.prototype
   *
   * @type {Camera}
   * @readonly
   */
  camera: {
    get: function () {
      return this._scene.camera;
    },
  },

  /**
   * Gets the clock.
   * @memberof CesiumWidget.prototype
   *
   * @type {Clock}
   * @readonly
   */
  clock: {
    get: function () {
      return this._clock;
    },
  },

  /**
   * Gets the screen space event handler.
   * @memberof CesiumWidget.prototype
   *
   * @type {ScreenSpaceEventHandler}
   * @readonly
   */
  screenSpaceEventHandler: {
    get: function () {
      return this._screenSpaceEventHandler;
    },
  },

  /**
   * Gets or sets the target frame rate of the widget when <code>useDefaultRenderLoop</code>
   * is true. If undefined, the browser's requestAnimationFrame implementation
   * determines the frame rate.  If defined, this value must be greater than 0.  A value higher
   * than the underlying requestAnimationFrame implementation will have no effect.
   * @memberof CesiumWidget.prototype
   *
   * @type {number}
   */
  targetFrameRate: {
    get: function () {
      return this._targetFrameRate;
    },
    set: function (value) {
      //>>includeStart('debug', pragmas.debug);
      if (value <= 0) {
        throw new DeveloperError(
          "targetFrameRate must be greater than 0, or undefined."
        );
      }
      //>>includeEnd('debug');
      this._targetFrameRate = value;
    },
  },

  /**
   * Gets or sets whether or not this widget should control the render loop.
   * If true the widget will use requestAnimationFrame to
   * perform rendering and resizing of the widget, as well as drive the
   * simulation clock. If set to false, you must manually call the
   * <code>resize</code>, <code>render</code> methods as part of a custom
   * render loop.  If an error occurs during rendering, {@link Scene}'s
   * <code>renderError</code> event will be raised and this property
   * will be set to false.  It must be set back to true to continue rendering
   * after the error.
   * @memberof CesiumWidget.prototype
   *
   * @type {boolean}
   */
  useDefaultRenderLoop: {
    get: function () {
      return this._useDefaultRenderLoop;
    },
    set: function (value) {
      if (this._useDefaultRenderLoop !== value) {
        this._useDefaultRenderLoop = value;
        if (value && !this._renderLoopRunning) {
          startRenderLoop(this);
        }
      }
    },
  },

  /**
   * Gets or sets a scaling factor for rendering resolution.  Values less than 1.0 can improve
   * performance on less powerful devices while values greater than 1.0 will render at a higher
   * resolution and then scale down, resulting in improved visual fidelity.
   * For example, if the widget is laid out at a size of 640x480, setting this value to 0.5
   * will cause the scene to be rendered at 320x240 and then scaled up while setting
   * it to 2.0 will cause the scene to be rendered at 1280x960 and then scaled down.
   * @memberof CesiumWidget.prototype
   *
   * @type {number}
   * @default 1.0
   */
  resolutionScale: {
    get: function () {
      return this._resolutionScale;
    },
    set: function (value) {
      //>>includeStart('debug', pragmas.debug);
      if (value <= 0) {
        throw new DeveloperError("resolutionScale must be greater than 0.");
      }
      //>>includeEnd('debug');
      if (this._resolutionScale !== value) {
        this._resolutionScale = value;
        this._forceResize = true;
      }
    },
  },

  /**
   * Boolean flag indicating if the browser's recommended resolution is used.
   * If true, the browser's device pixel ratio is ignored and 1.0 is used instead,
   * effectively rendering based on CSS pixels instead of device pixels. This can improve
   * performance on less powerful devices that have high pixel density. When false, rendering
   * will be in device pixels. {@link CesiumWidget#resolutionScale} will still take effect whether
   * this flag is true or false.
   * @memberof CesiumWidget.prototype
   *
   * @type {boolean}
   * @default true
   */
  useBrowserRecommendedResolution: {
    get: function () {
      return this._useBrowserRecommendedResolution;
    },
    set: function (value) {
      if (this._useBrowserRecommendedResolution !== value) {
        this._useBrowserRecommendedResolution = value;
        this._forceResize = true;
      }
    },
  },
});

/**
 * Show an error panel to the user containing a title and a longer error message,
 * which can be dismissed using an OK button.  This panel is displayed automatically
 * when a render loop error occurs, if showRenderLoopErrors was not false when the
 * widget was constructed.
 *
 * @param {string} title The title to be displayed on the error panel.  This string is interpreted as text.
 * @param {string} [message] A helpful, user-facing message to display prior to the detailed error information.  This string is interpreted as HTML.
 * @param {string} [error] The error to be displayed on the error panel.  This string is formatted using {@link formatError} and then displayed as text.
 */
CesiumWidget.prototype.showErrorPanel = function (title, message, error) {
  const element = this._element;
  const overlay = document.createElement("div");
  overlay.className = "cesium-widget-errorPanel";

  const content = document.createElement("div");
  content.className = "cesium-widget-errorPanel-content";
  overlay.appendChild(content);

  const errorHeader = document.createElement("div");
  errorHeader.className = "cesium-widget-errorPanel-header";
  errorHeader.appendChild(document.createTextNode(title));
  content.appendChild(errorHeader);

  const errorPanelScroller = document.createElement("div");
  errorPanelScroller.className = "cesium-widget-errorPanel-scroll";
  content.appendChild(errorPanelScroller);
  function resizeCallback() {
    errorPanelScroller.style.maxHeight = `${Math.max(
      Math.round(element.clientHeight * 0.9 - 100),
      30
    )}px`;
  }
  resizeCallback();
  if (defined(window.addEventListener)) {
    window.addEventListener("resize", resizeCallback, false);
  }

  const hasMessage = defined(message);
  const hasError = defined(error);

  if (hasMessage || hasError) {
    const errorMessage = document.createElement("div");
    errorMessage.className = "cesium-widget-errorPanel-message";
    errorPanelScroller.appendChild(errorMessage);

    if (hasError) {
      let errorDetails = formatError(error);
      if (!hasMessage) {
        if (typeof error === "string") {
          error = new Error(error);
        }

        message = formatError({
          name: error.name,
          message: error.message,
        });
        errorDetails = error.stack;
      }

      //IE8 does not have a console object unless the dev tools are open.
      if (typeof console !== "undefined") {
        console.error(`${title}\n${message}\n${errorDetails}`);
      }

      const errorMessageDetails = document.createElement("div");
      errorMessageDetails.className =
        "cesium-widget-errorPanel-message-details collapsed";

      const moreDetails = document.createElement("span");
      moreDetails.className = "cesium-widget-errorPanel-more-details";
      moreDetails.appendChild(document.createTextNode("See more..."));
      errorMessageDetails.appendChild(moreDetails);

      errorMessageDetails.onclick = function (e) {
        errorMessageDetails.removeChild(moreDetails);
        errorMessageDetails.appendChild(document.createTextNode(errorDetails));
        errorMessageDetails.className =
          "cesium-widget-errorPanel-message-details";
        content.className = "cesium-widget-errorPanel-content expanded";
        errorMessageDetails.onclick = undefined;
      };

      errorPanelScroller.appendChild(errorMessageDetails);
    }

    errorMessage.innerHTML = `<p>${message}</p>`;
  }

  const buttonPanel = document.createElement("div");
  buttonPanel.className = "cesium-widget-errorPanel-buttonPanel";
  content.appendChild(buttonPanel);

  const okButton = document.createElement("button");
  okButton.setAttribute("type", "button");
  okButton.className = "cesium-button";
  okButton.appendChild(document.createTextNode("OK"));
  okButton.onclick = function () {
    if (defined(resizeCallback) && defined(window.removeEventListener)) {
      window.removeEventListener("resize", resizeCallback, false);
    }
    element.removeChild(overlay);
  };

  buttonPanel.appendChild(okButton);

  element.appendChild(overlay);
};

/**
 * @returns {boolean} true if the object has been destroyed, false otherwise.
 */
CesiumWidget.prototype.isDestroyed = function () {
  return false;
};

/**
 * Destroys the widget.  Should be called if permanently
 * removing the widget from layout.
 */
CesiumWidget.prototype.destroy = function () {
  if (defined(this._scene)) {
    this._scene.renderError.removeEventListener(this._onRenderError);
    this._scene = this._scene.destroy();
  }
  this._container.removeChild(this._element);
  this._creditContainer.removeChild(this._innerCreditContainer);
  destroyObject(this);
};

/**
 * Updates the canvas size, camera aspect ratio, and viewport size.
 * This function is called automatically as needed unless
 * <code>useDefaultRenderLoop</code> is set to false.
 */
CesiumWidget.prototype.resize = function () {
  const canvas = this._canvas;
  if (
    !this._forceResize &&
    this._canvasClientWidth === canvas.clientWidth &&
    this._canvasClientHeight === canvas.clientHeight &&
    this._lastDevicePixelRatio === window.devicePixelRatio
  ) {
    return;
  }
  this._forceResize = false;

  configureCanvasSize(this);
  configureCameraFrustum(this);

  this._scene.requestRender();
};

/**
 * Renders the scene.  This function is called automatically
 * unless <code>useDefaultRenderLoop</code> is set to false;
 */
CesiumWidget.prototype.render = function () {
  if (this._canRender) {
    this._scene.initializeFrame();
    // 触发Viewer._onTick -> dataSourceDisplay.update(time)->更新每个datasource对应的visualizer;
    const currentTime = this._clock.tick();
    this._scene.render(currentTime);
  } else {
    this._clock.tick();
  }
};
export default CesiumWidget;
